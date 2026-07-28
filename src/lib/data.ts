import { addDays, endOfWeek, isAfter, isBefore, startOfDay } from "date-fns";
import { createClient } from "@/lib/supabase/server";
import type {
  Campaign,
  CampaignCreator,
  Creator,
  Payment,
  Tag,
} from "@/lib/supabase/database.types";
import { getPaymentStatus } from "@/lib/payment";
import { isDemoRequest, readDemoStore } from "@/lib/demo-store";

export type CreatorRow = Creator & {
  tags: Tag[];
  activeCampaigns: number;
  paymentStatus: ReturnType<typeof getPaymentStatus> | null;
};

export type CampaignRow = Campaign & {
  creatorCount: number;
  completedCount: number;
  agreedSpend: number;
  amountPaid: number;
  outstanding: number;
};

export type CollaborationRow = CampaignCreator & {
  creator: Creator;
  payment: Payment | null;
};

export type PaymentRow = Payment & {
  creator: Creator;
  campaign: Campaign;
  collaboration: CampaignCreator;
  displayStatus: ReturnType<typeof getPaymentStatus>;
  outstanding: number;
};

async function getBaseData() {
  if (await isDemoRequest()) {
    const store = readDemoStore();
    return {
      creators: store.creators,
      tags: store.tags,
      creatorTags: store.creatorTags,
      campaigns: store.campaigns,
      collaborations: store.collaborations,
      payments: store.payments,
    };
  }
  const supabase = await createClient();
  const [
    { data: creators, error: creatorsError },
    { data: tags, error: tagsError },
    { data: creatorTags, error: creatorTagsError },
    { data: campaigns, error: campaignsError },
    { data: collaborations, error: collaborationsError },
    { data: payments, error: paymentsError },
  ] = await Promise.all([
    supabase.from("creators").select("*").order("updated_at", { ascending: false }),
    supabase.from("tags").select("*").order("name"),
    supabase.from("creator_tags").select("*"),
    supabase.from("campaigns").select("*").order("updated_at", { ascending: false }),
    supabase.from("campaign_creators").select("*").order("updated_at", { ascending: false }),
    supabase.from("payments").select("*").order("due_date", { ascending: true }),
  ]);

  const error = creatorsError || tagsError || creatorTagsError || campaignsError || collaborationsError || paymentsError;
  if (error) throw new Error("Workspace data could not be loaded.");

  return {
    creators: (creators ?? []) as Creator[],
    tags: (tags ?? []) as Tag[],
    creatorTags: creatorTags ?? [],
    campaigns: (campaigns ?? []) as Campaign[],
    collaborations: (collaborations ?? []) as CampaignCreator[],
    payments: (payments ?? []) as Payment[],
  };
}

export async function getCreators(): Promise<CreatorRow[]> {
  const data = await getBaseData();
  return data.creators.map((creator) => {
    const collaborationRows = data.collaborations.filter((row) => row.creator_id === creator.id);
    const relatedPayments = collaborationRows
      .map((row) => data.payments.find((payment) => payment.campaign_creator_id === row.id))
      .filter(Boolean) as Payment[];
    const priorityPayment = relatedPayments.find((payment) => getPaymentStatus(payment) === "overdue")
      ?? relatedPayments.find((payment) => getPaymentStatus(payment) === "due")
      ?? relatedPayments[0];
    const tagIds = data.creatorTags
      .filter((link) => link.creator_id === creator.id)
      .map((link) => link.tag_id);
    return {
      ...creator,
      tags: data.tags.filter((tag) => tagIds.includes(tag.id)),
      activeCampaigns: collaborationRows.filter((row) => row.stage !== "paid").length,
      paymentStatus: priorityPayment ? getPaymentStatus(priorityPayment) : null,
    };
  });
}

export async function getCreator(id: string) {
  const data = await getBaseData();
  const creator = data.creators.find((row) => row.id === id);
  if (!creator) return null;
  const collaborations = data.collaborations.filter((row) => row.creator_id === id);
  const tagIds = data.creatorTags.filter((link) => link.creator_id === id).map((link) => link.tag_id);
  return {
    creator,
    tags: data.tags.filter((tag) => tagIds.includes(tag.id)),
    collaborations: collaborations.map((collaboration) => ({
      ...collaboration,
      campaign: data.campaigns.find((campaign) => campaign.id === collaboration.campaign_id)!,
      payment: data.payments.find((payment) => payment.campaign_creator_id === collaboration.id) ?? null,
    })),
  };
}

export async function getCampaigns(): Promise<CampaignRow[]> {
  const data = await getBaseData();
  return data.campaigns.map((campaign) => {
    const collaborations = data.collaborations.filter((row) => row.campaign_id === campaign.id);
    const payments = collaborations
      .map((row) => data.payments.find((payment) => payment.campaign_creator_id === row.id))
      .filter(Boolean) as Payment[];
    const agreedSpend = collaborations.reduce((sum, row) => sum + Number(row.agreed_fee), 0);
    const amountPaid = payments.reduce((sum, row) => sum + Number(row.amount_paid), 0);
    return {
      ...campaign,
      creatorCount: collaborations.length,
      completedCount: collaborations.filter((row) => row.stage === "paid").length,
      agreedSpend,
      amountPaid,
      outstanding: Math.max(0, agreedSpend - amountPaid),
    };
  });
}

export async function getCampaign(id: string) {
  const data = await getBaseData();
  const campaign = data.campaigns.find((row) => row.id === id);
  if (!campaign) return null;
  const collaborators = data.collaborations
    .filter((row) => row.campaign_id === id)
    .map((row) => ({
      ...row,
      creator: data.creators.find((creator) => creator.id === row.creator_id)!,
      payment: data.payments.find((payment) => payment.campaign_creator_id === row.id) ?? null,
    }));
  return { campaign, collaborations: collaborators, creators: data.creators };
}

export async function getPayments(): Promise<PaymentRow[]> {
  const data = await getBaseData();
  return data.payments.flatMap((payment) => {
    const collaboration = data.collaborations.find((row) => row.id === payment.campaign_creator_id);
    if (!collaboration) return [];
    const creator = data.creators.find((row) => row.id === collaboration.creator_id);
    const campaign = data.campaigns.find((row) => row.id === collaboration.campaign_id);
    if (!creator || !campaign) return [];
    return [{
      ...payment,
      creator,
      campaign,
      collaboration,
      displayStatus: getPaymentStatus(payment),
      outstanding: Math.max(0, Number(payment.agreed_amount) - Number(payment.amount_paid)),
    }];
  });
}

export async function getDashboard() {
  const data = await getBaseData();
  const campaigns = await getCampaigns();
  const today = startOfDay(new Date());
  const threeDays = addDays(today, 3);
  const weekEnd = endOfWeek(today, { weekStartsOn: 1 });
  const activeCampaigns = data.campaigns.filter((campaign) => campaign.status === "active");
  const activeCollaborations = data.collaborations.filter((row) => row.stage !== "paid");
  const dueThisWeek = activeCollaborations.filter((row) => {
    const due = new Date(`${row.deliverable_due_date}T00:00:00`);
    return !isBefore(due, today) && !isAfter(due, weekEnd);
  });
  const outstanding = data.payments.reduce(
    (sum, payment) => sum + Math.max(0, Number(payment.agreed_amount) - Number(payment.amount_paid)),
    0,
  );

  const attention = activeCollaborations.flatMap((collaboration) => {
    const creator = data.creators.find((row) => row.id === collaboration.creator_id);
    const campaign = data.campaigns.find((row) => row.id === collaboration.campaign_id);
    const payment = data.payments.find((row) => row.campaign_creator_id === collaboration.id);
    if (!creator || !campaign) return [];
    const deliverableDue = new Date(`${collaboration.deliverable_due_date}T00:00:00`);
    const inactiveSince = new Date(collaboration.last_activity_at);
    let reason: "Overdue content" | "Payment overdue" | "Due within 3 days" | "No update for 7 days" | null = null;
    if (isBefore(deliverableDue, today) && !["posted", "paid"].includes(collaboration.stage)) reason = "Overdue content";
    else if (payment && getPaymentStatus(payment) === "overdue") reason = "Payment overdue";
    else if (!isBefore(deliverableDue, today) && !isAfter(deliverableDue, threeDays)) reason = "Due within 3 days";
    else if (isBefore(inactiveSince, addDays(today, -7))) reason = "No update for 7 days";
    return reason ? [{ collaboration, creator, campaign, payment: payment ?? null, reason }] : [];
  });

  return {
    summary: {
      activeCampaigns: activeCampaigns.length,
      activeCollaborations: activeCollaborations.length,
      dueThisWeek: dueThisWeek.length,
      outstanding,
    },
    attention,
    campaigns: campaigns.filter((campaign) => campaign.status !== "archived").slice(0, 6),
  };
}
