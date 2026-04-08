"use client";

import { useCallback, useEffect, useState } from "react";

import type {
  CalendarFeedback,
  CalendarFeedbackTone,
} from "@/features/calendar/types/calendar";

const DEFAULT_FEEDBACK_DURATION_MS = 1800;

export function useTransientFeedback(
  durationMs = DEFAULT_FEEDBACK_DURATION_MS,
) {
  const [feedback, setFeedback] = useState<CalendarFeedback | null>(null);

  useEffect(() => {
    if (!feedback) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setFeedback(null);
    }, durationMs);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [durationMs, feedback]);

  const clearFeedback = useCallback(() => {
    setFeedback(null);
  }, []);

  const showFeedback = useCallback(
    (message: string, tone: CalendarFeedbackTone = "success") => {
      setFeedback({
        message,
        tone,
      });
    },
    [],
  );

  return {
    feedback,
    clearFeedback,
    showFeedback,
  };
}
