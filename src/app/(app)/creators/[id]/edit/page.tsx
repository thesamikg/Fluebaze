import { notFound } from "next/navigation";
import { CreatorForm } from "@/components/creators/creator-form";
import { PageHeader } from "@/components/app/page-header";
import { getCreator } from "@/lib/data";

export default async function EditCreatorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await getCreator(id);
  if (!data) notFound();
  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader eyebrow="Creator CRM" title={`Edit ${data.creator.full_name}`} description="Update their contact, audience, rate, product fit, relationship history, and working notes." />
      <CreatorForm creator={data.creator} tags={data.tags.map((tag) => tag.name)} />
    </div>
  );
}
