import { Shield, ShieldCheck, ShieldX } from "lucide-react";

interface EvidenceStrengthProps {
  strength: string;
  size?: number;
  showLabel?: boolean;
}

const STRENGTH_CONFIG: Record<string, { icon: typeof Shield; color: string; label: string }> = {
  strong: { icon: ShieldCheck, color: "text-evidence-strong", label: "Strong evidence" },
  moderate: { icon: Shield, color: "text-evidence-moderate", label: "Moderate evidence" },
  weak: { icon: ShieldX, color: "text-evidence-weak", label: "Weak evidence" },
  none: { icon: Shield, color: "text-gray-300", label: "No evidence" },
};

export function EvidenceStrength({ strength, size = 4, showLabel = false }: EvidenceStrengthProps) {
  const config = STRENGTH_CONFIG[strength] || STRENGTH_CONFIG.none;
  const Icon = config.icon;

  return (
    <span className="inline-flex items-center gap-1" aria-label={config.label}>
      <Icon className={`h-${size} w-${size} ${config.color}`} />
      {showLabel && <span className={`text-xs font-medium ${config.color}`}>{config.label}</span>}
    </span>
  );
}
