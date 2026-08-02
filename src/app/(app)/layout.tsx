import { AppShell } from "@/components/app/app-shell";
import { requireWorkspace } from "@/lib/supabase/auth";

export const dynamic = "force-dynamic";

export default async function ProductLayout({ children }: { children: React.ReactNode }) {
  const { user, profile, workspace } = await requireWorkspace();
  return (
    <AppShell
      workspaceName={workspace.name}
      fullName={profile.full_name}
      email={user.email ?? ""}
    >
      {children}
    </AppShell>
  );
}
