"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

interface TourStep {
  id: string;
  key: string;
  title: string;
  body: string;
  targetSelector?: string;
  route?: string;
  orderIndex: number;
  actionType: string;
}

interface TourPopoverProps {
  projectId?: string;
}

export function TourPopover({ projectId }: TourPopoverProps) {
  const router = useRouter();
  const [steps, setSteps] = useState<TourStep[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/users/me/onboarding");
        if (!res.ok) return;
        const data = await res.json();

        if (data.state?.hasSeenMainTour || data.state?.skippedMainTourAt) {
          setVisible(false);
          setLoading(false);
          return;
        }

        setSteps(data.tourSteps || []);
        if ((data.tourSteps || []).length > 0) {
          setVisible(true);
        }
      } catch {
        // Silently fail — tour is non-critical
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

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
    if (isLast) {
      completeTour();
      return;
    }

    const nextStep = steps[currentIndex + 1];
    if (nextStep?.route) {
      router.push(nextStep.route);
    }
    setCurrentIndex(currentIndex + 1);
  };

  const handleBack = () => {
    if (currentIndex === 0) return;
    const prevStep = steps[currentIndex - 1];
    if (prevStep?.route) {
      router.push(prevStep.route);
    }
    setCurrentIndex(currentIndex - 1);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20">
      <div className="mx-4 w-full max-w-md rounded-lg border bg-white p-6 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-navy-900 px-2 py-0.5 text-xs font-medium text-white">
              {currentIndex + 1}/{steps.length}
            </span>
            <h3 className="text-sm font-semibold text-navy-900">{currentStep.title}</h3>
          </div>
          <button
            onClick={skipTour}
            className="rounded-full p-1 text-gray-400 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <p className="text-sm text-gray-600">{currentStep.body}</p>

        <div className="mt-6 flex items-center justify-between">
          <button
            onClick={handleBack}
            disabled={currentIndex === 0}
            className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 disabled:opacity-30"
          >
            <ChevronLeft className="h-4 w-4" /> Back
          </button>

          <div className="flex items-center gap-2">
            {!isLast && (
              <button
                onClick={skipTour}
                className="text-xs text-gray-400 hover:text-gray-600"
              >
                Skip
              </button>
            )}
            <button
              onClick={handleNext}
              className="rounded-md bg-navy-900 px-4 py-1.5 text-sm font-medium text-white hover:bg-navy-800"
            >
              {isLast ? "Get Started" : "Next"}
              {!isLast && <ChevronRight className="ml-1 inline h-4 w-4" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
