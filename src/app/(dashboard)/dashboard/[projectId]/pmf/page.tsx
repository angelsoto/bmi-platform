import { prisma } from "@/lib/db/prisma";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Gauge } from "lucide-react";

export default async function PMFPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  const session = await auth();
  if (!session?.user) redirect("/auth/signin");

  const latestPmf = await prisma.pMFReadinessAssessment.findFirst({
    where: { projectId },
    orderBy: { createdAt: "desc" },
  });

  const stateColors: Record<string, string> = {
    not_ready: "text-red-600 bg-red-50 border-red-200",
    emerging: "text-amber-600 bg-amber-50 border-amber-200",
    strong_signal: "text-teal-600 bg-teal-50 border-teal-200",
    scale_ready: "text-green-600 bg-green-50 border-green-200",
  };

  const gaugeColor = (score: number) => {
    if (score >= 0.8) return "#16a34a";
    if (score >= 0.6) return "#0d9488";
    if (score >= 0.3) return "#f59e0b";
    return "#dc2626";
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy-900">PMF Readiness Lite</h1>
        <p className="text-sm text-gray-500">An objective, explainable signal of whether you have enough validated evidence to scale.</p>
      </div>

      {!latestPmf ? (
        <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed bg-white p-12 text-center">
          <Gauge className="mb-3 h-8 w-8 text-gray-300" />
          <h3 className="text-sm font-semibold text-gray-700">No PMF assessment yet</h3>
          <p className="mt-1 text-sm text-gray-500">Run experiments and collect evidence to generate your first assessment.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Gauge */}
          <div className="rounded-lg border bg-white p-6 shadow-widget">
            <div className="flex items-center justify-center gap-8">
              <div className="relative flex h-36 w-36 items-center justify-center">
                <svg className="h-36 w-36 -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="42" fill="none" stroke="#e5e7eb" strokeWidth="8" />
                  <circle
                    cx="50" cy="50" r="42"
                    fill="none"
                    stroke={gaugeColor(latestPmf.pmfScore ?? 0)}
                    strokeWidth="8"
                    strokeDasharray={`${(latestPmf.pmfScore ?? 0) * 264} 264`}
                    strokeLinecap="round"
                    className="transition-all duration-1000"
                  />
                </svg>
                <span className="absolute text-3xl font-bold text-navy-900">
                  {latestPmf.pmfScore ? `${Math.round(latestPmf.pmfScore * 100)}%` : "N/A"}
                </span>
              </div>

              <div className="space-y-2">
                <div className={`rounded-md border px-4 py-2 text-center text-lg font-bold ${stateColors[latestPmf.readinessState] || "text-gray-600"}`}>
                  {latestPmf.readinessState.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                </div>
                <div className="text-sm text-gray-500">
                  <div className="flex justify-between gap-4">
                    <span>Coverage:</span><span className="font-medium">{latestPmf.totalHighRiskHypotheses > 0 ? `${Math.round(((latestPmf.totalHighRiskHypotheses - latestPmf.unvalidatedHighRiskHypotheses) / latestPmf.totalHighRiskHypotheses) * 100)}%` : "0%"}</span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span>Distortion:</span><span className="font-medium">{latestPmf.evidenceDistortionCoefficient != null ? `${Math.round(latestPmf.evidenceDistortionCoefficient * 100)}%` : "N/A"}</span>
                  </div>
                  {latestPmf.validationVelocity != null && (
                    <div className="flex justify-between gap-4">
                      <span>Velocity:</span><span className="font-medium">{latestPmf.validationVelocity.toFixed(1)} loops/2wk</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Formula decomposition */}
          <div className="engine-panel">
            <h3 className="text-sm font-semibold text-cyan-400 mb-3">PMF Score Formula</h3>
            <div className="space-y-2 font-mono text-sm text-white/80">
              <p>Base Score = 0.6 × Coverage + 0.4 × Disappointment Score</p>
              <p>PMF Score = Base × (1 − Distortion Coefficient)</p>
              {latestPmf.customerDisappointmentScore != null && (
                <p className="text-white/60 text-xs mt-3">
                  Customer Disappointment Score: {(latestPmf.customerDisappointmentScore * 100).toFixed(0)}% (Sean Ellis &quot;very disappointed&quot;)
                </p>
              )}
            </div>
          </div>

          {/* Explanation */}
          <div className="rounded-lg border bg-white p-4 shadow-widget">
            <h3 className="text-sm font-semibold text-navy-900 mb-2">Explanation</h3>
            <p className="text-sm text-gray-600">{latestPmf.explanation}</p>
          </div>

          {/* Blockers */}
          {(() => {
            const ids: string[] = JSON.parse(latestPmf.blockingHypothesisIds || "[]");
            if (ids.length === 0) return null;
            return (
              <div className="rule-box rule-box--blocker">
                <h3 className="text-sm font-semibold text-red-700 mb-1">
                  Blocking Hypotheses ({ids.length})
                </h3>
                <p className="text-xs text-red-600 mb-2">
                  These hypotheses are holding your PMF score down:
                </p>
                <HypothesisList ids={ids} />
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}

async function HypothesisList({ ids }: { ids: string[] }) {
  const { prisma } = await import("@/lib/db/prisma");
  const hypotheses = await prisma.hypothesis.findMany({
    where: { id: { in: ids } },
    select: { id: true, title: true, evidenceStrength: true },
  });
  if (hypotheses.length === 0) return <p className="text-xs text-gray-500">Loading...</p>;
  return (
    <ul className="space-y-1">
      {hypotheses.map((h) => (
        <li key={h.id} className="flex items-center justify-between text-xs text-red-700">
          <span>{h.title}</span>
          <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium">
            {h.evidenceStrength}
          </span>
        </li>
      ))}
    </ul>
  );
}
