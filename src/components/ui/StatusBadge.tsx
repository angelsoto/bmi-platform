import { clsx } from "clsx";

const statusStyles: Record<string, string> = {
  // Hypothesis statuses
  draft: "bg-gray-100 text-gray-700",
  active: "bg-blue-100 text-blue-700",
  testing: "bg-amber-100 text-amber-700",
  supported: "bg-green-100 text-green-700",
  weakened: "bg-orange-100 text-orange-700",
  invalidated: "bg-red-100 text-red-700",
  archived: "bg-gray-100 text-gray-500",
  // Experiment statuses
  proposed: "bg-gray-100 text-gray-600",
  designed: "bg-blue-100 text-blue-700",
  ready: "bg-indigo-100 text-indigo-700",
  running: "bg-cyan-100 text-cyan-700",
  analyzing: "bg-amber-100 text-amber-700",
  decision_made: "bg-green-100 text-green-700",
  applied: "bg-teal-100 text-teal-700",
  stopped: "bg-red-100 text-red-700",
  // Evidence strength
  none: "bg-gray-100 text-gray-400",
  weak: "bg-amber-100 text-amber-700",
  moderate: "bg-blue-100 text-blue-700",
  strong: "bg-green-100 text-green-700",
};

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const style = statusStyles[status] || "bg-gray-100 text-gray-600";
  return (
    <span
      className={clsx(
        "inline-block rounded-full px-2 py-0.5 text-xs font-medium",
        style,
        className
      )}
    >
      {status.replace(/_/g, " ")}
    </span>
  );
}
