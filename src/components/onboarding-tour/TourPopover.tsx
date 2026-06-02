"use client";

import { useState, useEffect, useCallback } from "react";
import { X, ChevronLeft, ChevronRight, MapPin } from "lucide-react";

interface TourStep {
  id: string;
  key: string;
  title: string;
  body: string;
  targetSelector?: string;
  orderIndex: number;
  actionType: string;
}

interface TourPopoverProps {
  projectId?: string;
}

export function TourPopover({ projectId }: TourPopoverProps) {
  const [steps, setSteps] = useState<TourStep[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [position, setPosition] = useState({ top: 120, left: 0 });
  const [anchorRight, setAnchorRight] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/users/me/onboarding");
        if (!res.ok) return;
        const data = await res.json();
        if (data.state?.hasSeenMainTour || data.state?.skippedMainTourAt) {
          setVisible(false); setLoading(false); return;
        }
        setSteps(data.tourSteps || []);
        if ((data.tourSteps || []).length > 0) setVisible(true);
      } catch {} finally { setLoading(false); }
    }
    load();
  }, []);

  // Position the tour panel near the target element
  const reposition = useCallback(() => {
    const step = steps[currentIndex];
    if (!step?.targetSelector) {
      setPosition({ top: 120, left: 0 });
      setAnchorRight(false);
      return;
    }
    const el = document.querySelector(step.targetSelector);
    if (el) {
      const rect = el.getBoundingClientRect();
      const viewportW = window.innerWidth;
      // Place panel to the right if there's space, otherwise below
      if (rect.right + 380 < viewportW) {
        setPosition({ top: Math.max(80, rect.top - 10), left: rect.right + 16 });
        setAnchorRight(true);
      } else {
        setPosition({ top: rect.bottom + 12, left: Math.max(16, rect.left) });
        setAnchorRight(false);
      }
    } else {
      setPosition({ top: 120, left: 0 });
      setAnchorRight(false);
    }
  }, [currentIndex, steps]);

  useEffect(() => { reposition(); }, [reposition]);
  useEffect(() => {
    window.addEventListener("scroll", reposition, true);
    window.addEventListener("resize", reposition);
    return () => {
      window.removeEventListener("scroll", reposition, true);
      window.removeEventListener("resize", reposition);
    };
  }, [reposition]);

  const completeTour = useCallback(async () => {
    await fetch("/api/users/me/onboarding", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ hasSeenMainTour: true, mainTourCompletedAt: new Date().toISOString() }),
    });
    setVisible(false);
  }, []);

  const skipTour = useCallback(async () => {
    await fetch("/api/users/me/onboarding", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ hasSeenMainTour: true, skippedMainTourAt: new Date().toISOString() }),
    });
    setVisible(false);
  }, []);

  if (loading || !visible || steps.length === 0) return null;

  const currentStep = steps[currentIndex];
  if (!currentStep) return null;

  const isLast = currentIndex === steps.length - 1;

  const handleNext = () => {
    if (isLast) { completeTour(); return; }
    setCurrentIndex(currentIndex + 1);
    // Reposition after render
    setTimeout(reposition, 50);
  };

  const handleBack = () => {
    if (currentIndex === 0) return;
    setCurrentIndex(currentIndex - 1);
    setTimeout(reposition, 50);
  };

  return (
    <>
      {/* Overlay highlight around target */}
      {currentStep.targetSelector && (
        <TargetHighlight selector={currentStep.targetSelector} />
      )}

      {/* Tour panel — anchored or centered on mobile */}
      <div
        className="fixed z-[100] transition-all duration-300 ease-out"
        style={{
          top: position.top,
          ...(anchorRight
            ? { left: position.left }
            : { left: Math.max(16, Math.min(position.left, window.innerWidth - 360)) }),
          maxWidth: "min(360px, calc(100vw - 32px))",
        }}
      >
        <div className="rounded-xl border-2 border-navy-900 bg-white p-5 shadow-xl">
          {/* Arrow pointing to target */}
          <div className={`absolute top-4 w-3 h-3 rotate-45 border-l border-t bg-white border-navy-900 ${
            anchorRight ? "-left-[7px]" : "left-4 -top-[7px]"
          }`} />

          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-navy-900 text-xs font-bold text-white">
                {currentIndex + 1}
              </span>
              <h3 className="text-sm font-semibold text-navy-900">{currentStep.title}</h3>
            </div>
            <button onClick={skipTour} className="rounded-full p-1 text-gray-400 hover:text-gray-600">
              <X className="h-4 w-4" />
            </button>
          </div>

          <p className="text-sm text-gray-600 leading-relaxed">{currentStep.body}</p>

          {/* Progress dots */}
          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              {steps.map((_, i) => (
                <div key={i} className={`h-1.5 rounded-full transition-all ${
                  i === currentIndex ? "w-5 bg-navy-900" :
                  i < currentIndex ? "w-1.5 bg-navy-300" : "w-1.5 bg-gray-200"
                }`} />
              ))}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleBack}
                disabled={currentIndex === 0}
                className="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-gray-500 hover:text-gray-700 disabled:opacity-30"
              >
                <ChevronLeft className="h-3 w-3" /> Back
              </button>
              <button
                onClick={handleNext}
                className="flex items-center gap-1 rounded-md bg-navy-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-navy-800"
              >
                {isLast ? "Done" : "Next"}
                {!isLast && <ChevronRight className="h-3 w-3" />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

/** Highlights the target element with a pulsing ring */
function TargetHighlight({ selector }: { selector: string }) {
  const [rect, setRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    const update = () => {
      const el = document.querySelector(selector);
      if (el) setRect(el.getBoundingClientRect());
    };
    update();
    window.addEventListener("scroll", update, true);
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update, true);
      window.removeEventListener("resize", update);
    };
  }, [selector]);

  if (!rect) return null;

  return (
    <div
      className="fixed z-[99] pointer-events-none"
      style={{
        top: rect.top - 4,
        left: rect.left - 4,
        width: rect.width + 8,
        height: rect.height + 8,
      }}
    >
      <div className="absolute inset-0 rounded-lg border-2 border-navy-500/50 animate-pulse" />
    </div>
  );
}
