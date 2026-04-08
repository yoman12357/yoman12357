import { memo } from "react";
import { AnimatePresence, motion } from "framer-motion";

import { formatCalendarRange } from "@/features/calendar/utils/calendar-notes";
import { premiumEase } from "@/features/calendar/utils/motion";
import type { CalendarReminder } from "@/features/calendar/types/calendar";

type CalendarReminderAlertsProps = {
  alerts: CalendarReminder[];
  onDismiss: (reminderId: string) => void;
};

export const CalendarReminderAlerts = memo(function CalendarReminderAlerts({
  alerts,
  onDismiss,
}: CalendarReminderAlertsProps) {
  if (alerts.length === 0) {
    return null;
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.32, ease: premiumEase }}
      className="theme-alert-surface rounded-[1.45rem] border p-4 sm:rounded-[1.7rem] sm:p-5"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-2">
          <p className="theme-alert-text font-mono text-[0.68rem] uppercase tracking-[0.22em]">
            In-app Alerts
          </p>
          <h2 className="theme-alert-heading text-lg font-semibold tracking-[-0.03em]">
            Reminder reached
          </h2>
        </div>
        <span className="theme-alert-chip rounded-full border px-3 py-1 font-mono text-[0.66rem] uppercase tracking-[0.18em]">
          Fallback
        </span>
      </div>

      <div className="mt-4 space-y-3">
        <AnimatePresence mode="popLayout" initial={false}>
          {alerts.map((alert) => (
            <motion.article
              key={alert.id}
              layout
              initial={{ opacity: 0, y: 12, scale: 0.985 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.98 }}
              transition={{
                duration: 0.24,
                ease: premiumEase,
                layout: { duration: 0.2, ease: premiumEase },
              }}
              className="theme-alert-card rounded-[1.25rem] border px-4 py-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="theme-alert-text font-mono text-[0.64rem] uppercase tracking-[0.22em]">
                    {formatCalendarRange({
                      startDate: alert.startDate,
                      endDate: alert.endDate,
                    })}
                  </p>
                  <p className="theme-alert-heading mt-2 text-sm leading-6">
                    {alert.message}
                  </p>
                </div>

                <button
                  className="theme-alert-button inline-flex min-h-10 w-full items-center justify-center rounded-full border px-3 py-2 text-sm font-medium transition sm:w-auto sm:text-xs"
                  onClick={() => onDismiss(alert.id)}
                  type="button"
                >
                  Dismiss
                </button>
              </div>
            </motion.article>
          ))}
        </AnimatePresence>
      </div>
    </motion.section>
  );
});
