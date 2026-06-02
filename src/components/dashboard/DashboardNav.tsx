"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FlaskConical,
  Lightbulb,
  Target,
  ClipboardList,
  Gauge,
  RefreshCw,
  Shield,
  Users,
  Gift,
} from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Command Center", icon: LayoutDashboard, key: "dashboard" },
  { href: "/dashboard/concept", label: "Concept Intake", icon: Lightbulb, key: "concept" },
  { href: "/dashboard/personas", label: "Personas & Offers", icon: Users, key: "personas" },
  { href: "/dashboard/hypotheses", label: "Hypotheses", icon: Target, key: "hypotheses" },
  { href: "/dashboard/evidence", label: "Evidence & Bias", icon: Shield, key: "evidence" },
  { href: "/dashboard/experiments", label: "Experiments", icon: FlaskConical, key: "experiments" },
  { href: "/dashboard/surfaces", label: "Surfaces", icon: Gift, key: "surfaces" },
  { href: "/dashboard/pmf", label: "PMF Readiness", icon: Gauge, key: "pmf" },
  { href: "/dashboard/loops", label: "Learning Loops", icon: RefreshCw, key: "loops" },
];

export function DashboardNav() {
  const pathname = usePathname();

  // Extract the section key from pathname.
  // Handles: /dashboard, /dashboard/section, /dashboard/{projectId}/section
  const validKeys = navItems.map((i) => i.key);
  const segments = pathname.split("/").filter(Boolean);
  const rawSection = segments.length >= 3 ? segments[2] : segments.length >= 2 ? segments[1] : "dashboard";
  const currentSection = validKeys.includes(rawSection) ? rawSection : "dashboard";

  return (
    <nav className="flex w-60 flex-col border-r border-gray-200 bg-white">
      <div className="flex h-14 items-center border-b border-gray-200 px-4">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-navy-900 text-white text-xs font-bold">
            BMI
          </div>
          <span className="text-sm font-semibold text-navy-900">Platform</span>
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        <div className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || currentSection === item.key;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${
                  isActive
                    ? "bg-navy-900 text-white"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                }`}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>

      <div className="border-t border-gray-200 p-3">
        <div className="rounded-md bg-blueprint-50 p-2 text-xs text-gray-500">
          <div className="font-medium text-navy-700">Core Loop MVP</div>
          <div className="mt-1">v1.2 — Track A</div>
        </div>
      </div>
    </nav>
  );
}
