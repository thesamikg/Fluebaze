"use client";

import { useState, useTransition } from "react";
import { KeyRound, LoaderCircle, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { removeSampleData, sendPasswordReset, updateSettings } from "@/app/(app)/settings/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function SettingsForm({
  fullName,
  workspaceName,
  email,
  hasSampleData,
}: {
  fullName: string;
  workspaceName: string;
  email: string;
  hasSampleData: boolean;
}) {
  const [pending, startTransition] = useTransition();
  const [samplePresent, setSamplePresent] = useState(hasSampleData);

  return (
    <div className="grid gap-5">
      <Card>
        <CardHeader><CardTitle>Profile and workspace</CardTitle><CardDescription>These details appear in your workspace navigation.</CardDescription></CardHeader>
        <CardContent>
          <form
            className="grid gap-5 sm:grid-cols-2"
            action={(formData) => startTransition(async () => {
              const result = await updateSettings({
                fullName: formData.get("full_name"),
                workspaceName: formData.get("workspace_name"),
              });
              if (result.ok) toast.success(result.message);
              else toast.error(result.message);
              if (result.ok) window.location.reload();
            })}
          >
            <Field label="Full name"><Input name="full_name" defaultValue={fullName} required /></Field>
            <Field label="Workspace / brand name"><Input name="workspace_name" defaultValue={workspaceName} required /></Field>
            <Field label="Account email"><Input value={email} disabled /><p className="text-xs text-[#8b9188]">Email changes are not available during the pilot.</p></Field>
            <div className="flex items-end justify-end"><Button type="submit" variant="primary" disabled={pending}>{pending ? <LoaderCircle className="animate-spin" size={15} /> : <Save size={15} />} Save settings</Button></div>
          </form>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Account security</CardTitle><CardDescription>We’ll send a secure link to your account email.</CardDescription></CardHeader>
        <CardContent>
          <Button variant="outline" disabled={pending} onClick={() => startTransition(async () => {
            const result = await sendPasswordReset();
            if (result.ok) toast.success(result.message);
            else toast.error(result.message);
          })}><KeyRound size={15} /> Send password reset email</Button>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Plan</CardTitle><CardDescription>Fluebaze is currently in its early pilot.</CardDescription></CardHeader>
        <CardContent><span className="inline-flex rounded-full bg-[#edffc5] px-3 py-1.5 text-xs font-semibold text-[#4d7307]">Plan: Pilot</span><p className="mt-3 text-sm text-[#737970]">No billing is connected to this workspace.</p></CardContent>
      </Card>
      <Card className="border-[#ead7d3]">
        <CardHeader><CardTitle>Sample data</CardTitle><CardDescription>Remove the clearly marked sample campaign, creators, collaborations and payments.</CardDescription></CardHeader>
        <CardContent>
          {samplePresent ? (
            <Button variant="destructive" disabled={pending} onClick={() => {
              if (!window.confirm("Remove all sample data? Your own campaigns and creators will not be affected.")) return;
              startTransition(async () => {
                const result = await removeSampleData();
                if (result.ok) {
                  setSamplePresent(false);
                  toast.success(result.message);
                } else toast.error(result.message);
              });
            }}><Trash2 size={15} /> Remove sample data</Button>
          ) : <p className="text-sm text-[#737970]">No sample data remains in this workspace.</p>}
        </CardContent>
      </Card>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="grid content-start gap-2"><Label>{label}</Label>{children}</div>;
}
