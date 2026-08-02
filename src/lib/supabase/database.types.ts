export type Profile = {
  id: string;
  full_name: string;
  onboarding_completed: boolean;
  created_at: string;
  updated_at: string;
};

export type Workspace = {
  id: string;
  owner_id: string;
  name: string;
  collaboration_volume: "1–5" | "6–10" | "11–25" | "26–40" | "40+";
  current_workflow: "Spreadsheet" | "WhatsApp" | "Instagram DMs" | "Email" | "Other";
  created_at: string;
  updated_at: string;
};

export type Creator = {
  id: string;
  workspace_id: string;
  full_name: string;
  handle: string;
  platform: "Instagram" | "TikTok" | "YouTube" | "X" | "LinkedIn" | "Other";
  profile_url: string | null;
  email: string | null;
  phone: string | null;
  location: string | null;
  niche: string | null;
  follower_count: number;
  engagement_rate: number | null;
  expected_rate: number | null;
  notes: string | null;
  is_sample: boolean;
  created_at: string;
  updated_at: string;
};

export type Tag = {
  id: string;
  workspace_id: string;
  name: string;
  created_at: string;
};

export type Campaign = {
  id: string;
  workspace_id: string;
  name: string;
  brand_name: string;
  description: string | null;
  objective: string | null;
  start_date: string;
  end_date: string;
  status: "draft" | "active" | "completed" | "archived";
  budget: number | null;
  notes: string | null;
  archived_at: string | null;
  is_sample: boolean;
  created_at: string;
  updated_at: string;
};

export type CollaborationStage =
  | "contacted"
  | "confirmed"
  | "content_due"
  | "posted"
  | "paid";

export type CampaignCreator = {
  id: string;
  workspace_id: string;
  campaign_id: string;
  creator_id: string;
  stage: CollaborationStage;
  agreed_fee: number;
  currency: string;
  deliverable_type:
    | "Instagram post"
    | "Instagram reel"
    | "Instagram story"
    | "TikTok video"
    | "YouTube video"
    | "UGC asset"
    | "Other";
  deliverable_count: number;
  deliverable_description: string;
  deliverable_due_date: string;
  post_url: string | null;
  posted_at: string | null;
  notes: string | null;
  last_activity_at: string;
  is_sample: boolean;
  created_at: string;
  updated_at: string;
};

export type Payment = {
  id: string;
  workspace_id: string;
  campaign_creator_id: string;
  agreed_amount: number;
  amount_paid: number;
  currency: string;
  status: "not_due" | "due" | "paid" | "overdue";
  due_date: string | null;
  paid_at: string | null;
  payment_method: string | null;
  reference_number: string | null;
  notes: string | null;
  is_sample: boolean;
  created_at: string;
  updated_at: string;
};

type Table<Row> = {
  Row: Row;
  Insert: Partial<Row>;
  Update: Partial<Row>;
  Relationships: [];
};

export type Database = {
  public: {
    Tables: {
      profiles: Table<Profile>;
      workspaces: Table<Workspace>;
      creators: Table<Creator>;
      tags: Table<Tag>;
      creator_tags: Table<{ creator_id: string; tag_id: string }>;
      campaigns: Table<Campaign>;
      campaign_creators: Table<CampaignCreator>;
      payments: Table<Payment>;
      waitlist_signups: Table<{
        id: string;
        full_name: string;
        email: string;
        company_name: string;
        business_type: string;
        monthly_collaborations: string;
        biggest_challenge: string | null;
        referral_source: string | null;
        created_at: string;
        status: string;
      }>;
    };
    Views: Record<string, never>;
    Functions: {
      complete_onboarding: {
        Args: {
          p_full_name: string;
          p_workspace_name: string;
          p_collaboration_volume: string;
          p_current_workflow: string;
        };
        Returns: string;
      };
      remove_sample_data: { Args: Record<PropertyKey, never>; Returns: undefined };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
