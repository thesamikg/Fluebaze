import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const migration = readFileSync(
  new URL("../supabase/migrations/002_fluebaze_mvp.sql", import.meta.url),
  "utf8",
).toLowerCase();

for (const table of [
  "profiles",
  "workspaces",
  "creators",
  "tags",
  "creator_tags",
  "campaigns",
  "campaign_creators",
  "payments",
]) {
  test(`${table} has row level security enabled`, () => {
    assert.match(migration, new RegExp(`alter table public\\.${table} enable row level security`));
  });
}

test("child-table policies resolve ownership from the authenticated user", () => {
  assert.match(migration, /workspace_id = public\.current_user_workspace_id\(\)/);
  assert.match(migration, /owner_id = auth\.uid\(\)/);
});

test("a creator cannot be associated with the same campaign twice", () => {
  assert.match(migration, /unique\(campaign_id, creator_id\)/);
});
