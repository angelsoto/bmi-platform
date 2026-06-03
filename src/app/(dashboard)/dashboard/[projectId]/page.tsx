import { prisma } from "@/lib/db/prisma";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  Lightbulb, Target, FlaskConical, Globe, Gauge, Shield, RefreshCw, ArrowRight, ChevronRight
} from "lucide-react";
import { TourPopover } from "@/components/onboarding-tour/TourPopover";
import { StatusBadge } from "@/components/ui/StatusBadge";

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  const session = await auth();
  if (!session?.user) redirect("/auth/signin");

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      _count: { select: { hypotheses: true, experiments: true, evidenceItems: true, learningLoops: true, landingPages: true } },
      hypotheses: { include: { riskRanks: true }, orderBy: { updatedAt: "desc" }, take: 3 },
      experiments: { orderBy: { updatedAt: "desc" }, take: 3 },
      landingPages: { where: { status: { in: ["measuring", "deployed", "live"] } }, take: 3 },
      pmfAssessments: { orderBy: { createdAt: "desc" }, take: 1 },
    },
  });

  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <h2 className="text-lg font-semibold text-gray-700">Project not found</h2>
        <Link href="/dashboard" className="mt-2 text-sm text-indigo-600 hover:text-indigo-800">Back to dashboard</Link>
      </div>
    );
  }

  const pmf = project.pmfAssessments[0];
  const topHypotheses = project.hypotheses
    .filter((h) => h.riskRanks[0])
    .sort((a, b) => (b.riskRanks[0]?.validationPriorityScore ?? 0) - (a.riskRanks[0]?.validationPriorityScore ?? 0))
    .slice(0, 3);
  const activeExps = project.experiments.filter((e) => ["running", "analyzing"].includes(e.status));

  return (
    <div className="space-y-6">
      <TourPopover projectId={projectId} />

      {/* ── Section 1: Project Header ──────────────────────────── */}
      <div className="flex items-center justify-between" data-tour="project-header">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">{project.name}</h1>
          {project.description && <p className="mt-1 text-sm text-gray-500">{project.description}</p>}
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <span className="rounded-full bg-blueprint-100 px-2 py-1 capitalize">{project.businessType.replace(/_/g, " ")}</span>
          <span className="rounded-full bg-blueprint-100 px-2 py-1 capitalize">{project.currentStage}</span>
        </div>
      </div>

      {/* ── Section 2: KPI Stats (top — sets context) ──────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4" data-tour="validation-spine">
        {[
          { icon: Target, count: project._count.hypotheses, label: "Hypotheses", color: "text-navy-500" },
          { icon: FlaskConical, count: project._count.experiments, label: "Experiments", color: "text-cyan-500" },
          { icon: Shield, count: project._count.evidenceItems, label: "Evidence Items", color: "text-indigo-500" },
          { icon: RefreshCw, count: project._count.learningLoops, label: "Learning Loops", color: "text-teal-500" },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="rounded-md border bg-white p-3 text-center shadow-sm">
              <Icon className={`mx-auto h-4 w-4 ${s.color} mb-1`} />
              <div className="text-lg font-bold text-navy-900">{s.count}</div>
              <div className="text-[10px] text-gray-400">{s.label}</div>
            </div>
          );
        })}
      </div>

      {/* ── Section 3: Hypotheses + Active Experiments (test-design surface) ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Riskiest Hypotheses — takes 2 cols */}
        <div className="md:col-span-2 rounded-lg border bg-white p-4 shadow-widget" data-tour="hypotheses">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-navy-700" />
              <h2 className="text-sm font-semibold text-navy-900">Riskiest Hypotheses</h2>
            </div>
            <Link href={`/dashboard/${projectId}/hypotheses`} className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800">
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          {topHypotheses.length === 0 ? (
            <p className="text-sm text-gray-400">No hypotheses ranked yet. Start with concept intake.</p>
          ) : (
            <div className="space-y-2">
              {topHypotheses.map((h) => (
                <Link key={h.id} href={`/dashboard/${projectId}/hypotheses`}
                  className="flex items-center justify-between rounded-md bg-gray-50 p-2 hover:bg-gray-100 transition-colors group">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="truncate text-sm font-medium text-gray-900 group-hover:text-navy-700">{h.title}</span>
                      <StatusBadge status={h.evidenceStrength} />
                    </div>
                    <span className="text-xs text-gray-500">{h.type} · Priority: {h.riskRanks[0]?.validationPriorityScore ?? "?"}</span>
                  </div>
                  <ChevronRight className="ml-2 h-4 w-4 shrink-0 text-gray-300 group-hover:text-navy-500" />
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Active Experiments — 1 col, moved up next to hypotheses */}
        <Link href={`/dashboard/${projectId}/experiments`} data-tour="experiments"
          className="rounded-lg border bg-white p-4 shadow-widget hover:shadow-md hover:border-navy-300 transition-all group">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <FlaskConical className="h-4 w-4 text-navy-700" />
              <h2 className="text-sm font-semibold text-navy-900">Experiments</h2>
            </div>
            <ChevronRight className="h-4 w-4 text-gray-300 group-hover:text-navy-500" />
          </div>
          {activeExps.length > 0 ? (
            <div className="space-y-2">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-navy-900">{activeExps.length}</span>
                <span className="text-xs text-gray-500">active</span>
              </div>
              {activeExps.map((e) => (
                <div key={e.id} className="flex items-center gap-2 text-xs">
                  <span className="inline-block h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
                  <span className="text-gray-700">{e.name}</span>
                  <StatusBadge status={e.status} />
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center gap-1 py-4 text-sm text-gray-400">
              <FlaskConical className="h-6 w-6 text-gray-200" />
              <span>No active experiments</span>
              <span className="text-xs">Total: {project._count.experiments}</span>
            </div>
          )}
        </Link>
      </div>

      {/* ── Section 4: Evidence → PMF → Learning Loops (validation spine) ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Evidence — first in the second row */}
        <Link href={`/dashboard/${projectId}/evidence`} data-tour="evidence"
          className="rounded-lg border bg-white p-4 shadow-widget hover:shadow-md hover:border-navy-300 transition-all group">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-navy-700" />
              <h2 className="text-sm font-semibold text-navy-900">Evidence</h2>
            </div>
            <ChevronRight className="h-4 w-4 text-gray-300 group-hover:text-navy-500" />
          </div>
          {project._count.evidenceItems > 0 ? (
            <div className="space-y-2">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-navy-900">{project._count.evidenceItems}</span>
                <span className="text-xs text-gray-500">items</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Target className="h-3 w-3" />
                <span>{project._count.hypotheses} hypotheses with evidence</span>
              </div>
              <div className="flex items-center gap-1 text-xs text-indigo-600">
                Review evidence <ArrowRight className="h-3 w-3" />
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-1 py-4 text-sm text-gray-400">
              <Shield className="h-6 w-6 text-gray-200" />
              <span>No evidence collected</span>
            </div>
          )}
        </Link>

        {/* PMF Readiness — second, derived from evidence */}
        <Link href={`/dashboard/${projectId}/pmf`} data-tour="pmf"
          className="rounded-lg border bg-white p-4 shadow-widget hover:shadow-md hover:border-navy-300 transition-all group">
          <div className="flex items-center gap-2 mb-3">
            <Gauge className="h-4 w-4 text-navy-700" />
            <h2 className="text-sm font-semibold text-navy-900">PMF Readiness</h2>
          </div>
          {pmf ? (
            <div className="space-y-3">
              <div className="flex items-center justify-center">
                <div className="relative flex h-24 w-24 items-center justify-center">
                  <svg className="h-24 w-24 -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="42" fill="none" stroke="#e5e7eb" strokeWidth="8" />
                    <circle cx="50" cy="50" r="42" fill="none"
                      stroke={pmf.pmfScore && pmf.pmfScore >= 0.6 ? "#16a34a" : pmf.pmfScore && pmf.pmfScore >= 0.3 ? "#f59e0b" : "#dc2626"}
                      strokeWidth="8" strokeDasharray={`${(pmf.pmfScore ?? 0) * 264} 264`} strokeLinecap="round" />
                  </svg>
                  <span className="absolute text-lg font-bold text-navy-900">{pmf.pmfScore ? `${Math.round(pmf.pmfScore * 100)}%` : "N/A"}</span>
                </div>
              </div>
              <div className="text-center">
                <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${pmf.readinessState === "strong_signal" || pmf.readinessState === "scale_ready" ? "bg-teal-100 text-teal-700" : pmf.readinessState === "emerging" ? "bg-amber-100 text-amber-700" : "bg-gray-100 text-gray-500"}`}>
                  {pmf.readinessState.replace(/_/g, " ")}
                </span>
              </div>
              <div className="flex items-center justify-center gap-1 text-xs text-indigo-600">
                View details <ArrowRight className="h-3 w-3" />
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 py-4 text-sm text-gray-400">
              <Gauge className="h-8 w-8 text-gray-200" />
              <span>Assess PMF readiness</span>
            </div>
          )}
        </Link>

        {/* Learning Loops — third in the row */}
        <Link href={`/dashboard/${projectId}/loops`} data-tour="loops"
          className="rounded-lg border bg-white p-4 shadow-widget hover:shadow-md hover:border-navy-300 transition-all group">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4 text-navy-700" />
              <h2 className="text-sm font-semibold text-navy-900">Learning Loops</h2>
            </div>
            <ChevronRight className="h-4 w-4 text-gray-300 group-hover:text-navy-500" />
          </div>
          {project._count.learningLoops > 0 ? (
            <div className="space-y-2">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-navy-900">{project._count.learningLoops}</span>
                <span className="text-xs text-gray-500">loops</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Globe className="h-3 w-3" />
                <span>{project._count.landingPages} surfaces deployed</span>
              </div>
              <div className="flex items-center gap-1 text-xs text-indigo-600">
                View loops <ArrowRight className="h-3 w-3" />
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-1 py-4 text-sm text-gray-400">
              <RefreshCw className="h-6 w-6 text-gray-200" />
              <span>No learning loops</span>
            </div>
          )}
        </Link>
      </div>

      {/* ── Section 5: Deployed Surfaces (conditional) ─────────── */}
      {project._count.landingPages > 0 && (
        <div className="rounded-lg border bg-white p-4 shadow-widget" data-tour="surfaces">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-navy-700" />
              <h2 className="text-sm font-semibold text-navy-900">Deployed Surfaces</h2>
            </div>
            <Link href={`/dashboard/${projectId}/surfaces`} className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800">
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {project.landingPages.map((lp) => (
              <Link key={lp.id} href={`/dashboard/${projectId}/surfaces`}
                className="rounded-md border bg-gray-50 p-3 hover:bg-gray-100 transition-colors">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-navy-900">{lp.name}</span>
                  <StatusBadge status={lp.status} />
                </div>
                <div className="mt-1 text-xs text-gray-500 capitalize">/{lp.slug}</div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* ── Section 6: Quick Actions (bottom — what to do next) ── */}
      <div className="rounded-lg border bg-white p-5 shadow-widget" data-tour="quick-actions">
        <h2 className="text-sm font-semibold text-navy-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Link href={`/dashboard/${projectId}/concept`}
            className="flex items-center gap-3 rounded-md bg-navy-900 px-4 py-3 text-sm font-medium text-white hover:bg-navy-800 transition-colors">
            <Lightbulb className="h-4 w-4 shrink-0 text-cyan-400" />
            Concept Intake
          </Link>
          <Link href={`/dashboard/${projectId}/hypotheses`}
            className="flex items-center gap-3 rounded-md border border-indigo-200 bg-indigo-50 px-4 py-3 text-sm font-medium text-indigo-700 hover:bg-indigo-100 transition-colors">
            <Target className="h-4 w-4 shrink-0" />
            Review Hypotheses
          </Link>
          <Link href={`/dashboard/${projectId}/experiments`}
            className="flex items-center gap-3 rounded-md border border-cyan-200 bg-cyan-50 px-4 py-3 text-sm font-medium text-cyan-700 hover:bg-cyan-100 transition-colors">
            <FlaskConical className="h-4 w-4 shrink-0" />
            View Experiments
          </Link>
          <Link href={`/dashboard/${projectId}/pmf`}
            className="flex items-center gap-3 rounded-md border border-teal-200 bg-teal-50 px-4 py-3 text-sm font-medium text-teal-700 hover:bg-teal-100 transition-colors">
            <Gauge className="h-4 w-4 shrink-0" />
            PMF Dashboard
          </Link>
        </div>
      </div>

      {/* ── Section 7: Onboarding suggestion (bottom — only for new projects) ── */}
      {project._count.hypotheses === 0 && (
        <div className="rounded-lg border-2 border-dashed border-indigo-200 bg-indigo-50 p-5 text-center">
          <Lightbulb className="mx-auto mb-2 h-6 w-6 text-indigo-400" />
          <h3 className="text-sm font-semibold text-indigo-700">Ready to start validating?</h3>
          <p className="mt-1 text-sm text-indigo-600">
            Run a concept intake with your business idea to generate structured assumptions, hypotheses, and a draft persona and offer.
          </p>
          <Link href={`/dashboard/${projectId}/concept`}
            className="mt-3 inline-flex items-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700">
            <Lightbulb className="h-4 w-4" /> Start Concept Intake
          </Link>
        </div>
      )}
    </div>
  );
}
