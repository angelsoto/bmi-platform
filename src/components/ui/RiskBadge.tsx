import { clsx } from "clsx";

const riskStyles: Record<string, string> = {
  low: "bg-green-100 text-green-800",
  medium: "bg-amber-100 text-amber-800",
  high: "bg-orange-100 text-orange-800",
  critical: "bg-red-100 text-red-800",
};

interface RiskBadgeProps {
  level: string;
  className?: string;
}

export function RiskBadge({ level, className }: RiskBadgeProps) {
  const style = riskStyles[level] || "bg-gray-100 text-gray-600";
  return (
    <span className={clsx("inline-block rounded-full px-2 py-0.5 text-xs font-medium", style, className)}>
      {level}
    </span>
  );
}
