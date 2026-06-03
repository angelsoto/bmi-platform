"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { X, ChevronLeft, ChevronRight, RotateCcw } from "lucide-react";

interface TourStep {
  id: string;
  key: string;
  title: string;
  body: string;
  targetSelector?: string;
  orderIndex: number;
  actionType: string;
}

interface UserState {
  hasSeenMainTour?: boolean;
  currentTourStep?: string | null;
  skippedMainTourAt?: string | null;
  mainTourCompletedAt?: string | null;
  completedStepIds?: string;
}

interface TourPopoverProps {
  projectId?: string;
}

export function TourPopover({ projectId }: TourPopoverProps) {
  const [steps, setSteps] = useState<TourStep[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userState, setUserState] = useState<UserState | null>(null);
  const [position, setPosition] = useState({ top: 120, left: 0, arrowTop: 20 });
  const [anchorRight, setAnchorRight] = useState(true);
  const panelRef = useRef<HTMLDivElement>(null);

  const patchState = useCallback(async (patch: Partial<UserState>) => {
    try {
      await fetch("/api/users/me/onboarding", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
    } catch {}
  }, []);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/users/me/onboarding");
        if (!res.ok) return;
        const data = await res.json();
        setUserState(data.state);
        if (data.state?.currentTourStep && !data.state?.hasSeenMainTour) {
          const savedIndex = (data.tourSteps || []).findIndex(
            (s: TourStep) => s.key === data.state.currentTourStep
          );
          if (savedIndex >= 0) setCurrentIndex(savedIndex);
        }
        if (data.state?.hasSeenMainTour || data.state?.skippedMainTourAt) {
          setVisible(false); setLoading(false); return;
        }
        setSteps(data.tourSteps || []);
        if ((data.tourSteps || []).length > 0) setVisible(true);
      } catch {
      } finally { setLoading(false); }
    }
    load();
  }, []);

  const reposition = useCallback(() => {
    const isMobile = window.innerWidth < 768;
    const step = steps[currentIndex];
    const panelWidth = 380;
    const gap = 16;

    if (isMobile) {
      setAnchorRight(false);
      setPosition({ top: window.innerHeight - 280, left: 0, arrowTop: 0 });
      return;
    }

    if (!step?.targetSelector) {
      setPosition({ top: 120, left: 16, arrowTop: 20 });
      setAnchorRight(false);
      return;
    }

    const el = document.querySelector(step.targetSelector);
    if (!el) {
      setPosition({ top: 120, left: 16, arrowTop: 20 });
      setAnchorRight(false);
      return;
    }

    // Scroll target into view before measuring
    el.scrollIntoView({ behavior: "smooth", block: "center" });

    // Measure after a brief settle for scroll
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const rect = el.getBoundingClientRect();
        const elCenterY = rect.top + rect.height / 2;
        const fitsRight = rect.right + panelWidth + gap < window.innerWidth;
        const fitsBelow = rect.bottom + 280 < window.innerHeight;
        const fitsAbove = rect.top - 280 > 0;

        let newTop: number;
        let newLeft: number;
        let newArrowTop: number;
        let isRight: boolean;

        if (fitsRight) {
          // Place to the right — arrow points left toward target center
          isRight = true;
          newTop = Math.max(80, Math.min(elCenterY - 60, window.innerHeight - 320));
          newLeft = rect.right + gap;
          newArrowTop = Math.min(60, Math.max(20, elCenterY - newTop));
        } else if (fitsBelow) {
          // Place below — arrow points up toward target bottom
          isRight = false;
          newTop = rect.bottom + gap;
          newLeft = Math.max(16, Math.min(rect.left, window.innerWidth - panelWidth - 16));
          newArrowTop = 0; // at the top
        } else if (fitsAbove) {
          // Place above — arrow points down toward target top
          isRight = false;
          newTop = rect.top - 280;
          newLeft = Math.max(16, Math.min(rect.left, window.innerWidth - panelWidth - 16));
          newArrowTop = 260; // at the bottom of the panel
        } else {
          // Fallback: top-right corner
          isRight = true;
          newTop = 80;
          newLeft = window.innerWidth - panelWidth - 16;
          newArrowTop = 20;
        }

        setAnchorRight(isRight);
        setPosition({ top: newTop, left: newLeft, arrowTop: newArrowTop });
      });
    });
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
    await patchState({ hasSeenMainTour: true, mainTourCompletedAt: new Date().toISOString(), currentTourStep: null });
    setVisible(false);
  }, [patchState]);

  const skipTour = useCallback(async () => {
    await patchState({ hasSeenMainTour: true, skippedMainTourAt: new Date().toISOString(), currentTourStep: null });
    setVisible(false);
  }, [patchState]);

  const restartTour = useCallback(async () => {
    await patchState({ hasSeenMainTour: false, currentTourStep: null, skippedMainTourAt: null, mainTourCompletedAt: null, completedStepIds: "[]" });
    setCurrentIndex(0);
    setVisible(true);
    setTimeout(reposition, 50);
  }, [patchState, reposition]);

  if (loading) return null;

  if (!visible && userState?.hasSeenMainTour) {
    return (
      <div className="flex justify-end">
        <button onClick={restartTour} className="flex items-center gap-1 text-xs text-gray-400 hover:text-navy-700 transition-colors" title="Restart the onboarding tour">
          <RotateCcw className="h-3 w-3" /> Tour
        </button>
      </div>
    );
  }

  if (!visible || steps.length === 0) return null;

  const currentStep = steps[currentIndex];
  if (!currentStep) return null;

  const isLast = currentIndex === steps.length - 1;

  const handleNext = async () => {
    if (isLast) { completeTour(); return; }
    const nextStep = steps[currentIndex + 1];
    const completedIds = JSON.parse(userState?.completedStepIds || "[]");
    completedIds.push(currentStep.key);
    await patchState({ currentTourStep: nextStep?.key || null, completedStepIds: JSON.stringify(completedIds) });
    setCurrentIndex(currentIndex + 1);
    setTimeout(reposition, 100);
  };

  const handleBack = () => {
    if (currentIndex === 0) return;
    setCurrentIndex(currentIndex - 1);
    setTimeout(reposition, 100);
  };

  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

  return (
    <>
      {/* Target highlight — desktop only */}
      {currentStep.targetSelector && !isMobile && (
        <TargetHighlight selector={currentStep.targetSelector} />
      )}

      {/* Desktop: anchored panel */}
      {!isMobile && (
        <div ref={panelRef} className="fixed z-[100] transition-all duration-300 ease-out"
          style={{ top: position.top, left: anchorRight ? position.left : Math.max(16, Math.min(position.left, window.innerWidth - 396)), maxWidth: "min(380px, calc(100vw - 32px))" }}>
          <div className="relative rounded-xl border-2 border-navy-900 bg-white p-5 shadow-xl">
            {/* Arrow pointing to target — dynamically positioned */}
            <div className={`absolute w-3 h-3 rotate-45 border-l border-t bg-white border-navy-900 ${
              anchorRight ? "right-auto -left-[7px]" : "left-4"
            }`} style={{ top: position.arrowTop }} />
            <TourContent step={currentStep} steps={steps} currentIndex={currentIndex} isLast={isLast}
              onBack={handleBack} onNext={handleNext} onSkip={skipTour} />
          </div>
        </div>
      )}

      {/* Mobile: bottom sheet */}
      {isMobile && (
        <div className="fixed inset-0 z-[100] md:hidden">
          <div className="absolute inset-0 bg-black/20" onClick={skipTour} />
          <div ref={panelRef} className="absolute bottom-0 left-0 right-0 rounded-t-xl border-2 border-navy-900 bg-white p-5 shadow-xl animate-slide-up">
            <TourContent step={currentStep} steps={steps} currentIndex={currentIndex} isLast={isLast}
              onBack={handleBack} onNext={handleNext} onSkip={skipTour} />
          </div>
        </div>
      )}
    </>
  );
}

/** Shared tour content: header, body, progress, buttons */
function TourContent({ step, steps, currentIndex, isLast, onBack, onNext, onSkip }: {
  step: TourStep; steps: TourStep[]; currentIndex: number; isLast: boolean;
  onBack: () => void; onNext: () => void; onSkip: () => void;
}) {
  return (
    <>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-navy-900 text-xs font-bold text-white">{currentIndex + 1}</span>
          <h3 className="text-sm font-semibold text-navy-900">{step.title}</h3>
        </div>
        <button onClick={onSkip} className="rounded-full p-1 text-gray-400 hover:text-gray-600"><X className="h-4 w-4" /></button>
      </div>
      <p className="text-sm text-gray-600 leading-relaxed">{step.body}</p>
      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          {steps.map((_, i) => (
            <div key={i} className={`h-1.5 rounded-full transition-all ${i === currentIndex ? "w-5 bg-navy-900" : i < currentIndex ? "w-1.5 bg-navy-300" : "w-1.5 bg-gray-200"}`} />
          ))}
        </div>
        <div className="flex items-center gap-2">
          <button onClick={onBack} disabled={currentIndex === 0}
            className="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-gray-500 hover:text-gray-700 disabled:opacity-30">
            <ChevronLeft className="h-3 w-3" /> Back
          </button>
          <button onClick={onNext}
            className="flex items-center gap-1 rounded-md bg-navy-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-navy-800">
            {isLast ? "Done" : "Next"} {!isLast && <ChevronRight className="h-3 w-3" />}
          </button>
        </div>
      </div>
    </>
  );
}

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
    return () => { window.removeEventListener("scroll", update, true); window.removeEventListener("resize", update); };
  }, [selector]);
  if (!rect) return null;
  return (
    <div className="fixed z-[99] pointer-events-none" style={{ top: rect.top - 4, left: rect.left - 4, width: rect.width + 8, height: rect.height + 8 }}>
      <div className="absolute inset-0 rounded-lg border-2 border-navy-500/50 animate-pulse" />
    </div>
  );
}
