import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";

interface Crumb {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: Crumb[];
  projectId?: string;
}

export function Breadcrumbs({ items, projectId }: BreadcrumbsProps) {
  return (
    <nav aria-label="Breadcrumb" className="mb-3">
      <ol className="flex items-center gap-1.5 text-xs text-gray-500">
        <li>
          <Link href={projectId ? `/dashboard/${projectId}` : "/dashboard"}
            className="flex items-center gap-1 hover:text-navy-700 transition-colors" aria-label="Dashboard">
            <Home className="h-3 w-3" />
          </Link>
        </li>
        {items.map((item, i) => (
          <li key={i} className="flex items-center gap-1.5">
            <ChevronRight className="h-3 w-3 text-gray-300" />
            {item.href ? (
              <Link href={item.href} className="hover:text-navy-700 transition-colors">
                {item.label}
              </Link>
            ) : (
              <span className="text-navy-700 font-medium" aria-current="page">
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
