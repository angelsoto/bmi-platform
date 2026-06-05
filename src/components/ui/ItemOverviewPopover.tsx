"use client";

import { useState, useEffect, useRef, type ReactNode } from "react";
import { X } from "lucide-react";

interface ItemOverviewPopoverProps {
  trigger: ReactNode;
  title: string;
  fields: { label: string; value: ReactNode; color?: string }[];
}

export function ItemOverviewPopover({ trigger, title, fields }: ItemOverviewPopoverProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  return (
    <div ref={ref} className="relative inline-block">
      <button onClick={() => setOpen(!open)} className="cursor-pointer" aria-expanded={open}>
        {trigger}
      </button>

      {open && (
        <div className="absolute left-0 top-full z-50 mt-2 w-72 rounded-lg border border-gray-200 bg-white p-4 shadow-xl">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-semibold text-navy-900">{title}</h4>
            <button onClick={() => setOpen(false)} className="rounded p-0.5 text-gray-400 hover:text-gray-600">
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="space-y-2">
            {fields.map((f, i) => (
              <div key={i} className="flex items-start justify-between gap-2 text-xs">
                <span className="text-gray-500 shrink-0">{f.label}</span>
                <span className={`font-medium text-right ${f.color || "text-gray-900"}`}>{f.value}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
