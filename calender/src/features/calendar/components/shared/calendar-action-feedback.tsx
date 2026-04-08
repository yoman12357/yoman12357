import { AnimatePresence, motion } from "framer-motion";

import { premiumEase } from "@/features/calendar/utils/motion";
import type { CalendarFeedback } from "@/features/calendar/types/calendar";

type CalendarActionFeedbackProps = {
  feedback: CalendarFeedback | null;
  floating?: boolean;
};

export function CalendarActionFeedback({
  feedback,
  floating = false,
}: CalendarActionFeedbackProps) {
  const toneStyle =
    feedback?.tone === "error"
      ? {
          borderColor: "var(--danger-border)",
          background:
            "linear-gradient(180deg, var(--danger-bg), rgba(255, 255, 255, 0.94))",
          color: "var(--danger-text)",
        }
      : {
          borderColor: "var(--status-border)",
          background:
            "linear-gradient(180deg, var(--status-bg), rgba(255, 255, 255, 0.94))",
          color: "var(--status-text)",
        };

  return (
    <AnimatePresence initial={false}>
      {feedback ? (
        <motion.p
          key={`${feedback.tone}-${feedback.message}`}
          role={feedback.tone === "error" ? "alert" : "status"}
          aria-live={feedback.tone === "error" ? "assertive" : "polite"}
          initial={{ opacity: 0, y: 10, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.96 }}
          transition={{ duration: 0.24, ease: premiumEase }}
          style={toneStyle}
          className={[
            "pointer-events-auto inline-flex min-h-11 items-center gap-2 rounded-[1rem] border px-4 py-3 text-sm font-medium leading-5 shadow-[0_18px_40px_rgba(15,23,42,0.12)] backdrop-blur-xl",
            floating
              ? "absolute bottom-4 right-4 z-20 max-w-[calc(100%-2rem)] sm:bottom-5 sm:right-5 sm:max-w-sm"
              : "",
          ].join(" ")}
        >
          <span
            aria-hidden="true"
            className="h-2.5 w-2.5 rounded-full"
            style={{
              background:
                feedback.tone === "error"
                  ? "var(--danger-text)"
                  : "var(--status-text)",
            }}
          />
          {feedback.message}
        </motion.p>
      ) : null}
    </AnimatePresence>
  );
}
