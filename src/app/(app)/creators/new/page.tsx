import { CreatorForm } from "@/components/creators/creator-form";
import { PageHeader } from "@/components/app/page-header";

export default function NewCreatorPage() {
  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader eyebrow="Creator CRM" title="Add creator" description="Start a reusable relationship record with contact, audience, rate, product fit, and working preferences." />
      <CreatorForm />
    </div>
  );
}
