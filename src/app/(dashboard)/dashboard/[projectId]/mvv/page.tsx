import { prisma } from "@/lib/db/prisma";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { EmptyState } from "@/components/ui/EmptyState";
import { Target, Plus } from "lucide-react";

function Section({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-lg border bg-white p-4 shadow-widget">
      <h2 className="text-sm font-semibold text-navy-900">{title}</h2>
      <p className="mt-1 text-sm text-gray-600 whitespace-pre-wrap">{text}</p>
    </div>
  );
}

export default async function MVVPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  const session = await auth();
  if (!session?.user) redirect("/auth/signin");

  const mvv = await prisma.mVVStatement.findFirst({ where: { projectId } });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Breadcrumbs items={[{ label: "Mission, Vision & Values" }]} projectId={projectId} />
          <h1 className="text-2xl font-bold text-navy-900">Mission, Vision & Values</h1>
          <p className="text-sm text-gray-500">Define why your venture exists and where it is headed.</p>
        </div>
        {mvv && (
          <Link href={`/dashboard/${projectId}/mvv/edit`}
            className="flex items-center gap-2 rounded-md bg-navy-900 px-4 py-2 text-sm font-medium text-white hover:bg-navy-800">
            Edit MVV
          </Link>
        )}
      </div>
      {!mvv ? (
        <EmptyState
          icon={Target}
          title="No MVV statement yet"
          description="Define your mission, vision, and values to guide your validation process."
          action={
            <Link href={`/dashboard/${projectId}/mvv/edit`}
              className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700">
              <Plus className="h-4 w-4 inline mr-1" /> Create MVV
            </Link>
          }
        />
      ) : (
        <div className="grid gap-4">
          <Section title="Mission" text={mvv.mission} />
          <Section title="Vision" text={mvv.vision} />
          <Section title="Values" text={JSON.parse(mvv.values || "[]").join(", ")} />
          <Section title="Founder Assumptions" text={JSON.parse(mvv.founderAssumptions || "[]").join(", ")} />
          <Section title="Unresolved Tensions" text={JSON.parse(mvv.unresolvedTensions || "[]").join(", ")} />
          <p className="text-xs text-gray-400">Version {mvv.versionNumber} &middot; Created {mvv.createdAt.toLocaleDateString()}</p>
        </div>
      )}
    </div>
  );
}
