import { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-white p-8 text-center">
      {Icon && <Icon className="mb-3 h-8 w-8 text-gray-300" />}
      <h3 className="text-sm font-semibold text-gray-700">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-gray-500">{description}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
