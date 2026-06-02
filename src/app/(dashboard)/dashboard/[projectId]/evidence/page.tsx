import { prisma } from "@/lib/db/prisma";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Shield, Flag } from "lucide-react";

export default async function EvidencePage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  const session = await auth();
  if (!session?.user) redirect("/auth/signin");

  const evidenceItems = await prisma.evidenceItem.findMany({
    where: { projectId },
    include: {
      qualityReviews: { include: { biasFlags: true }, take: 1 },
      hypothesis: { select: { title: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy-900">Evidence & Bias</h1>
        <p className="text-sm text-gray-500">Digital Devil&apos;s Advocate — evidence quality review and bias detection.</p>
      </div>

      {evidenceItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed bg-white p-12 text-center">
          <Shield className="mb-3 h-8 w-8 text-gray-300" />
          <h3 className="text-sm font-semibold text-gray-700">No evidence collected</h3>
          <p className="mt-1 text-sm text-gray-500">Evidence is auto-created when you record experiment results.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {evidenceItems.map((item) => {
            const review = item.qualityReviews[0];
            const biasCount = review?.biasFlags?.length ?? 0;

            return (
              <div key={item.id} className="rounded-lg border bg-white p-4 shadow-widget">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <StatusBadge status={item.evidenceStrength} />
                      <span className="text-xs text-gray-400">{item.sourceType.replace(/_/g, " ")}</span>
                      {item.hypothesis && (
                        <span className="text-xs text-gray-400">for &quot;{item.hypothesis.title}&quot;</span>
                      )}
                    </div>
                    <p className="mt-2 text-sm text-gray-900">{item.summary}</p>
                  </div>

                  {biasCount > 0 && (
                    <div className="flex shrink-0 items-center gap-1 rounded-full bg-amber-100 px-2 py-1 text-xs font-medium text-amber-700">
                      <Flag className="h-3 w-3" />
                      {biasCount} flag{biasCount !== 1 ? "s" : ""}
                    </div>
                  )}
                </div>

                {review && review.biasFlags.length > 0 && (
                  <div className="mt-3 space-y-1 border-t pt-2">
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
