import "server-only";
import { randomUUID } from "node:crypto";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { cookies } from "next/headers";
import type {
  Campaign,
  CampaignCreator,
  Creator,
  Payment,
  Profile,
  Tag,
  Workspace,
} from "@/lib/supabase/database.types";

export const DEMO_COOKIE = "fluebaze-local-demo";
export const DEMO_USER_ID = "00000000-0000-4000-8000-000000000001";

export type DemoStore = {
  profile: Profile;
  workspace: Workspace;
  creators: Creator[];
  tags: Tag[];
  creatorTags: Array<{ creator_id: string; tag_id: string }>;
  campaigns: Campaign[];
  collaborations: CampaignCreator[];
  payments: Payment[];
};

const storePath = join(tmpdir(), "fluebaze-local-demo-store.json");

export async function isDemoRequest() {
  if (process.env.NODE_ENV !== "development") return false;
  const cookieStore = await cookies();
  return cookieStore.get(DEMO_COOKIE)?.value === "1";
}

export function readDemoStore(): DemoStore {
  if (!existsSync(storePath)) {
    const initial = createInitialStore();
    writeFileSync(storePath, JSON.stringify(initial, null, 2), "utf8");
    return initial;
  }
  try {
    return JSON.parse(readFileSync(storePath, "utf8")) as DemoStore;
  } catch {
    const initial = createInitialStore();
    writeFileSync(storePath, JSON.stringify(initial, null, 2), "utf8");
    return initial;
  }
}

export function mutateDemoStore(mutator: (store: DemoStore) => void) {
  const store = readDemoStore();
  mutator(store);
  writeFileSync(storePath, JSON.stringify(store, null, 2), "utf8");
  return store;
}

export function resetDemoStore() {
  const store = createInitialStore();
  writeFileSync(storePath, JSON.stringify(store, null, 2), "utf8");
  return store;
}

export function createDemoId() {
  return randomUUID();
}

function createInitialStore(): DemoStore {
  const now = new Date().toISOString();
  const workspaceId = "00000000-0000-4000-8000-000000000010";
  const campaignId = "00000000-0000-4000-8000-000000000020";
  const mayaId = "00000000-0000-4000-8000-000000000030";
  const rohanId = "00000000-0000-4000-8000-000000000031";
  const mayaCollaboration = "00000000-0000-4000-8000-000000000040";
  const rohanCollaboration = "00000000-0000-4000-8000-000000000041";
  const beautyTag = "00000000-0000-4000-8000-000000000050";
  const reviewsTag = "00000000-0000-4000-8000-000000000051";

  return {
    profile: {
      id: DEMO_USER_ID,
      full_name: "Local Demo User",
      onboarding_completed: true,
      created_at: now,
      updated_at: now,
    },
    workspace: {
      id: workspaceId,
      owner_id: DEMO_USER_ID,
      name: "Aster & Bloom · Sample Store",
      collaboration_volume: "11–25",
      current_workflow: "Spreadsheet",
      created_at: now,
      updated_at: now,
    },
    creators: [
      {
        id: mayaId,
        workspace_id: workspaceId,
        full_name: "Maya Kapoor · Sample",
        handle: "@mayamakes",
        platform: "Instagram",
        profile_url: "https://instagram.com/mayamakes",
        email: "maya@example.test",
        phone: null,
        location: "Mumbai, India",
        niche: "Skincare routines & ingredient education",
        follower_count: 28400,
        engagement_rate: 4.8,
        expected_rate: 12000,
        notes: "Repeat partner. Best-performing angle: simple morning routines. Ships to Mumbai; prefers weekday briefs.",
        is_sample: true,
        created_at: now,
        updated_at: now,
      },
      {
        id: rohanId,
        workspace_id: workspaceId,
        full_name: "Rohan Mehta · Sample",
        handle: "@rohanreviews",
        platform: "YouTube",
        profile_url: "https://youtube.com/@rohanreviews",
        email: "rohan@example.test",
        phone: null,
        location: "Bengaluru, India",
        niche: "DTC product reviews",
        follower_count: 51600,
        engagement_rate: 3.6,
        expected_rate: 18000,
        notes: "Strong at conversion-led product reviews. Assign a unique promo code before briefing.",
        is_sample: true,
        created_at: now,
        updated_at: now,
      },
    ],
    tags: [
      { id: beautyTag, workspace_id: workspaceId, name: "repeat partner", created_at: now },
      { id: reviewsTag, workspace_id: workspaceId, name: "product reviewer", created_at: now },
    ],
    creatorTags: [
      { creator_id: mayaId, tag_id: beautyTag },
      { creator_id: rohanId, tag_id: reviewsTag },
    ],
    campaigns: [
      {
        id: campaignId,
        workspace_id: workspaceId,
        name: "Glow Reset launch · Sample",
        brand_name: "Aster & Bloom · Glow Reset Set",
        description: "Seed the Glow Reset Set, launch creator content, and drive trackable first-time orders with unique promo codes.",
        objective: "Generate product trial, reusable UGC, and attributed revenue",
        start_date: dateFromToday(0),
        end_date: dateFromToday(21),
        status: "active",
        budget: 45000,
        notes: "Sample SKUs: Cleanser + Barrier Serum. Offer: 20% off first order. Capture shipping, code, live link, rights, and payout details in collaboration notes.",
        archived_at: null,
        is_sample: true,
        created_at: now,
        updated_at: now,
      },
    ],
    collaborations: [
      {
        id: mayaCollaboration,
        workspace_id: workspaceId,
        campaign_id: campaignId,
        creator_id: mayaId,
        stage: "content_due",
        agreed_fee: 12000,
        currency: "INR",
        deliverable_type: "Instagram reel",
        deliverable_count: 1,
        deliverable_description: "One 30–45 second morning-routine reel featuring the Cleanser + Barrier Serum; code MAYAGLOW20",
        deliverable_due_date: dateFromToday(3),
        post_url: null,
        posted_at: null,
        notes: null,
        last_activity_at: now,
        is_sample: true,
        created_at: now,
        updated_at: now,
      },
      {
        id: rohanCollaboration,
        workspace_id: workspaceId,
        campaign_id: campaignId,
        creator_id: rohanId,
        stage: "posted",
        agreed_fee: 18000,
        currency: "INR",
        deliverable_type: "YouTube video",
        deliverable_count: 1,
        deliverable_description: "Integrated Glow Reset Set review with tracked link and code ROHANRESET",
        deliverable_due_date: dateFromToday(-2),
        post_url: null,
        posted_at: now,
        notes: null,
        last_activity_at: now,
        is_sample: true,
        created_at: now,
        updated_at: now,
      },
    ],
    payments: [
      {
        id: "00000000-0000-4000-8000-000000000060",
        workspace_id: workspaceId,
        campaign_creator_id: mayaCollaboration,
        agreed_amount: 12000,
        amount_paid: 0,
        currency: "INR",
        status: "not_due",
        due_date: dateFromToday(10),
        paid_at: null,
        payment_method: null,
        reference_number: null,
        notes: null,
        is_sample: true,
        created_at: now,
        updated_at: now,
      },
      {
        id: "00000000-0000-4000-8000-000000000061",
        workspace_id: workspaceId,
        campaign_creator_id: rohanCollaboration,
        agreed_amount: 18000,
        amount_paid: 0,
        currency: "INR",
        status: "due",
        due_date: dateFromToday(-1),
        paid_at: null,
        payment_method: null,
        reference_number: null,
        notes: null,
        is_sample: true,
        created_at: now,
        updated_at: now,
      },
    ],
  };
}

function dateFromToday(offset: number) {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() + offset);
  return date.toISOString().slice(0, 10);
}
