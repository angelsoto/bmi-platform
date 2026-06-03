"use client";

import { useEffect, useState } from "react";

interface DataFreshnessProps {
  timestamp?: Date | string | null;
  label?: string;
}

export function DataFreshness({ timestamp, label = "Data" }: DataFreshnessProps) {
  const [display, setDisplay] = useState("");

  useEffect(() => {
    if (!timestamp) {
      setDisplay("Up to date");
      return;
    }
    const d = new Date(timestamp);
    const mins = Math.round((Date.now() - d.getTime()) / 60000);
    if (mins < 1) setDisplay("Just now");
    else if (mins < 60) setDisplay(`${mins}m ago`);
    else if (mins < 1440) setDisplay(`${Math.round(mins / 60)}h ago`);
    else setDisplay(`${Math.round(mins / 1440)}d ago`);
  }, [timestamp]);

  return (
    <span className="inline-flex items-center gap-1.5 text-[10px] text-gray-400">
      <span className="inline-block h-1.5 w-1.5 rounded-full bg-green-500" />
      {label} · {display}
    </span>
  );
}
