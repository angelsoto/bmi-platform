"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  FlaskConical,
  Lightbulb,
  Target,
  Gauge,
  RefreshCw,
  Shield,
  Users,
  Gift,
  ChevronDown,
} from "lucide-react";

const navItems = [
  { key: "concept", label: "Concept Intake", icon: Lightbulb },
  { key: "personas", label: "Personas & Offers", icon: Users },
  { key: "hypotheses", label: "Hypotheses", icon: Target },
  { key: "evidence", label: "Evidence & Bias", icon: Shield },
  { key: "experiments", label: "Experiments", icon: FlaskConical },
  { key: "surfaces", label: "Surfaces", icon: Gift },
  { key: "pmf", label: "PMF Readiness", icon: Gauge },
  { key: "loops", label: "Learning Loops", icon: RefreshCw },
];

interface Project {
  id: string;
  name: string;
  currentStage: string;
  proofCaseMode?: boolean;
}

export function DashboardNav() {
  const pathname = usePathname();
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
  const [projectOpen, setProjectOpen] = useState(false);

  // Extract the current project ID from the pathname
  useEffect(() => {
    const segments = pathname.split("/").filter(Boolean);
    // Paths: /dashboard/{projectId}/section
    if (segments.length >= 3 && segments[0] === "dashboard") {
      setCurrentProjectId(segments[1]);
    } else {
      setCurrentProjectId(null);
    }
  }, [pathname]);

  // Fetch projects on mount
  useEffect(() => {
    fetch("/api/projects")
      .then((res) => res.ok ? res.json() : [])
      .then((data: Project[]) => setProjects(data))
      .catch((err) => console.error("DashboardNav: failed to load projects", err));
  }, []);

  const currentProject = projects.find((p) => p.id === currentProjectId);
  const validKeys = navItems.map((i) => i.key);
  const segments = pathname.split("/").filter(Boolean);

  // Determine which section is active
  let currentSection = "dashboard";
  if (segments.length >= 3 && validKeys.includes(segments[2])) {
    currentSection = segments[2];
  } else if (segments.length === 2 && segments[1] !== "[projectId]" && validKeys.includes(segments[1])) {
    currentSection = segments[1];
  }

  // Build href for a nav item — uses project ID when available
  const navHref = (key: string) => {
    if (key === "dashboard") return "/dashboard";
    if (currentProjectId) return `/dashboard/${currentProjectId}/${key}`;
    return `/dashboard/${key}`;
  };

  return (
    <nav className="flex w-64 flex-col border-r border-gray-200 bg-white">
      {/* Brand */}
      <div className="flex h-14 items-center border-b border-gray-200 px-4">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-navy-900 text-white text-xs font-bold">
            BMI
          </div>
          <span className="text-sm font-semibold text-navy-900">Platform</span>
        </Link>
      </div>

      {/* Project Selector */}
      <div className="border-b border-gray-200 px-3 py-2">
        <button
          onClick={() => setProjectOpen(!projectOpen)}
          className="flex w-full items-center justify-between rounded-md bg-gray-50 px-3 py-2 text-left hover:bg-gray-100"
        >
          <div className="min-w-0 flex-1">
            {currentProject ? (
              <>
                <div className="truncate text-sm font-medium text-navy-900">{currentProject.name}</div>
                <div className="text-xs text-gray-400 capitalize">{currentProject.currentStage}</div>
              </>
            ) : (
              <div className="text-sm text-gray-500">All Projects</div>
            )}
          </div>
          <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${projectOpen ? "rotate-180" : ""}`} />
        </button>

        {projectOpen && (
          <div className="mt-1 max-h-48 space-y-0.5 overflow-y-auto rounded-md border bg-white p-1 shadow-lg">
            {projects.map((p) => (
              <Link
                key={p.id}
                href={`/dashboard/${p.id}`}
                onClick={() => setProjectOpen(false)}
                className={`block rounded-md px-3 py-2 text-sm ${
                  p.id === currentProjectId
                    ? "bg-navy-900 text-white"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <div className="truncate font-medium">{p.name}</div>
                <div className="text-xs opacity-70 capitalize">{p.currentStage}</div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Navigation Items */}
      <div className="flex-1 overflow-y-auto p-3">
        {/* Home */}
        <Link
          href="/dashboard"
          className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${
            pathname === "/dashboard"
              ? "bg-navy-900 text-white"
              : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
          }`}
        >
          <LayoutDashboard className="h-4 w-4" />
          Command Center
        </Link>

        {/* Section divider */}
        {currentProjectId && (
          <div className="mt-4 mb-1 px-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
            {currentProject?.name || "Project"}
          </div>
        )}

        <div className="mt-2 space-y-1">
          {navItems.map((item) => {
            const isActive = currentSection === item.key;
            const Icon = item.icon;
            return (
              <Link
                key={item.key}
                href={navHref(item.key)}
                className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${
                  isActive
                    ? "bg-navy-900 text-white"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>

        {!currentProjectId && projects.length > 0 && (
          <div className="mt-4 border-t pt-3">
            <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
              Projects
            </p>
            <div className="space-y-1">
              {projects.map((p) => (
                <Link
                  key={p.id}
                  href={`/dashboard/${p.id}`}
                  className="block rounded-md px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                >
                  <div className="flex items-center justify-between">
                    <span className="truncate font-medium">{p.name}</span>
                    {p.proofCaseMode && (
                      <span className="ml-2 shrink-0 rounded-full bg-amber-100 px-1.5 py-0.5 text-xs text-amber-700">
                        Demo
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-gray-400 capitalize">{p.currentStage}</div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-gray-200 p-3">
        <div className="rounded-md bg-blueprint-50 p-2 text-xs text-gray-500">
          <div className="font-medium text-navy-700">Core Loop MVP</div>
          <div className="mt-1">v1.2 — Track A</div>
        </div>
      </div>
    </nav>
  );
}
