import { prisma } from "@/lib/db/prisma";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Shield, Flag, ChevronRight } from "lucide-react";

const SOURCE_TYPES = ["interview", "survey", "experiment_result", "manual_note", "analytics"];
const STRENGTH_LEVELS = ["weak", "moderate", "strong"];

export default async function EvidencePage({
  params,
  searchParams,
}: {
  params: Promise<{ projectId: string }>;
  searchParams?: Promise<{ source?: string; strength?: string }>;
}) {
  const { projectId } = await params;
  const sp = await searchParams;
  const session = await auth();
  if (!session?.user) redirect("/auth/signin");

  const sourceFilter = SOURCE_TYPES.includes(sp?.source as any) ? sp!.source : undefined;
  const strengthFilter = STRENGTH_LEVELS.includes(sp?.strength as any) ? sp!.strength : undefined;

  const evidenceItems = await prisma.evidenceItem.findMany({
    where: {
      projectId,
      ...(sourceFilter ? { sourceType: sourceFilter } : {}),
      ...(strengthFilter ? { evidenceStrength: strengthFilter } : {}),
    },
    include: { qualityReviews: { include: { biasFlags: true }, take: 1 }, hypothesis: { select: { title: true, id: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <Breadcrumbs items={[{ label: "Evidence & Bias" }]} />
          <h1 className="text-2xl font-bold text-navy-900">Evidence & Bias</h1>
        <p className="text-sm text-gray-500">Digital Devil&apos;s Advocate — evidence quality review and bias detection.</p>
      </div>

      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-2">
        <Link href={`/dashboard/${projectId}/evidence`}
          className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
            !sourceFilter && !strengthFilter ? "bg-navy-900 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}>All</Link>
        {SOURCE_TYPES.map((s) => (
          <Link key={s} href={`/dashboard/${projectId}/evidence?source=${s}`}
            className={`rounded-md px-3 py-1.5 text-xs font-medium capitalize transition-colors ${
              sourceFilter === s ? "bg-navy-900 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}>{s.replace(/_/g, " ")}</Link>
        ))}
      </div>

      {evidenceItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed bg-white p-12 text-center">
          <Shield className="mb-3 h-8 w-8 text-gray-300" />
          <h3 className="text-sm font-semibold text-gray-700">No evidence collected</h3>
          <p className="mt-1 text-sm text-gray-500">Evidence is auto-created when you record experiment results.</p>
          <Link href={`/dashboard/${projectId}/experiments`}
            className="mt-4 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700">
            View Active Experiments
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {evidenceItems.map((item) => {
            const review = item.qualityReviews[0];
            const biasCount = review?.biasFlags?.length ?? 0;

            return (
              <div key={item.id} className="rounded-lg border bg-white shadow-widget">
                <Link
                  href={item.relatedHypothesisId ? `/dashboard/${projectId}/hypotheses/${item.relatedHypothesisId}` : `/dashboard/${projectId}/evidence`}
                  className="group flex items-start justify-between gap-4 p-4 hover:bg-gray-50 transition-colors border-b border-gray-100"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <StatusBadge status={item.evidenceStrength} />
                      <span className="text-xs text-gray-400">{item.sourceType.replace(/_/g, " ")}</span>
                      {item.hypothesis && (
                        <span className="text-xs text-gray-400">for &ldquo;{item.hypothesis.title}&rdquo;</span>
                      )}
                    </div>
                    <p className="mt-2 text-sm text-gray-900 line-clamp-2">{item.summary}</p>
                    {item.collectedAt && (
                      <p className="mt-1 text-[10px] text-gray-400">
                        Collected {new Date(item.collectedAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>

                  <div className="flex shrink-0 items-center gap-2">
                    {biasCount > 0 && (
                      <div className="flex items-center gap-1 rounded-full bg-amber-100 px-2 py-1 text-xs font-medium text-amber-700">
                        <Flag className="h-3 w-3" />
                        {biasCount}
                      </div>
                    )}
                    <ChevronRight className="h-4 w-4 text-gray-300 group-hover:text-navy-500" />
                  </div>
                </Link>

                {review && review.biasFlags.length > 0 && (
                  <div className="px-4 py-3 space-y-1">
                    <p className="text-xs font-medium text-amber-700">Bias Flags</p>
                    {review.biasFlags.map((flag, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs text-gray-600">
                        <span className={`mt-0.5 shrink-0 rounded px-1.5 py-0.5 font-medium ${
                          flag.severity === "high" ? "bg-red-100 text-red-700" :
                          flag.severity === "medium" ? "bg-amber-100 text-amber-700" :
                          "bg-gray-100 text-gray-600"
                        }`}>{flag.severity}</span>
                        <span className="font-medium capitalize">{flag.type.replace(/_/g, " ")}</span>
                        <span>{flag.explanation}</span>
                      </div>
                    ))}
                    {review.recommendedDisconfirmationTest && (
                      <div className="rule-box mt-2">
                        <p className="text-xs font-medium">Recommended Disconfirmation Test</p>
                        <p className="text-xs text-gray-600">{review.recommendedDisconfirmationTest}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
