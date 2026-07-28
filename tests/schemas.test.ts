import test from "node:test";
import assert from "node:assert/strict";
import { campaignSchema, creatorSchema, paymentSchema } from "../src/lib/schemas.ts";

test("creator validation rejects a negative follower count", () => {
  const result = creatorSchema.safeParse({
    full_name: "Maya Kapoor",
    handle: "@maya",
    platform: "Instagram",
    profile_url: "",
    email: "",
    phone: "",
    location: "",
    niche: "",
    follower_count: -1,
    engagement_rate: "",
    expected_rate: "",
    notes: "",
    tags: [],
  });
  assert.equal(result.success, false);
});

test("campaign validation rejects an end date before its start date", () => {
  const result = campaignSchema.safeParse({
    name: "Launch",
    brand_name: "Northstar",
    description: "",
    objective: "",
    start_date: "2026-08-10",
    end_date: "2026-08-01",
    status: "active",
    budget: "",
    notes: "",
  });
  assert.equal(result.success, false);
});

test("payment validation rejects overpayment", () => {
  const result = paymentSchema.safeParse({
    payment_id: "807e6d8f-8e08-48b2-9c36-bb6fd80f3f3c",
    agreed_amount: 1000,
    amount_paid: 1200,
    currency: "INR",
    status: "paid",
    due_date: "2026-08-01",
    paid_at: "2026-07-25T12:00:00.000Z",
    payment_method: "",
    reference_number: "",
    notes: "",
  });
  assert.equal(result.success, false);
});
