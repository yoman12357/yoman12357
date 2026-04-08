"use client";

import { memo } from "react";
import { AnimatePresence, motion } from "framer-motion";

import { CalendarActionFeedback } from "@/features/calendar/components/shared/calendar-action-feedback";
import { CalendarPanelHeader } from "@/features/calendar/components/shared/calendar-panel-header";
import { useCalendarRemindersComposer } from "@/features/calendar/hooks/use-calendar-reminders-composer";
import {
  formatReminderSchedule,
  formatReminderTimestamp,
} from "@/features/calendar/utils/calendar-reminders";
import { premiumEase } from "@/features/calendar/utils/motion";
import type {
  BrowserNotificationStatus,
  CalendarCompletedRange,
  CalendarRangeSelection,
  CalendarReminder,
  CalendarTimeZoneInfo,
} from "@/features/calendar/types/calendar";

type CalendarRemindersPanelProps = {
  isCompactDesktop?: boolean;
  localTimeZone: CalendarTimeZoneInfo;
  reminders: CalendarReminder[];
  selection: CalendarRangeSelection;
  notificationStatus: BrowserNotificationStatus;
  onCreateReminder: (
    range: CalendarCompletedRange,
    message: string,
  ) => Promise<BrowserNotificationStatus> | BrowserNotificationStatus;
  onDeleteReminder: (reminderId: string) => void;
};

export const CalendarRemindersPanel = memo(function CalendarRemindersPanel({
  isCompactDesktop = false,
  localTimeZone,
  reminders,
  selection,
  notificationStatus,
  onCreateReminder,
  onDeleteReminder,
}: CalendarRemindersPanelProps) {
  const {
    canSaveReminder,
    feedback,
    handleCreateReminder,
    hasWhitespaceOnlyMessage,
    message,
    notificationFallbackMessage,
    notificationStatusLabel,
    schedule,
    setMessage,
    upcomingReminders,
  } = useCalendarRemindersComposer({
    localTimeZone,
    reminders,
    selection,
    notificationStatus,
    onCreateReminder,
  });

  return (
    <motion.section
      layout
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.48, ease: premiumEase }}
      className="theme-panel-surface relative rounded-[1.6rem] border p-4 sm:rounded-[1.9rem] sm:p-6 lg:p-7"
    >
      <CalendarPanelHeader
        eyebrow="Reminders"
        title="Set reminders for important dates"
        description="Reminders trigger when the selected date arrives, or when the start of a selected range is reached."
        aside={
          <div className="grid gap-2 sm:justify-items-end">
            <span className="theme-pill rounded-full border px-4 py-2 font-mono text-[0.72rem] uppercase tracking-[0.18em]">
              {upcomingReminders.length} upcoming
            </span>
            <span className="theme-status-chip rounded-full border px-4 py-2 font-mono text-[0.68rem] uppercase tracking-[0.18em]">
              {notificationStatusLabel}
            </span>
            <span className="theme-pill rounded-full border px-4 py-2 text-xs text-muted">
              {localTimeZone.displayLabel}
            </span>
          </div>
        }
      />

      <div
        className={[
          "mt-6 grid gap-4",
          isCompactDesktop
            ? "2xl:grid-cols-[0.92fr_1.08fr]"
            : "lg:grid-cols-[0.92fr_1.08fr]",
        ].join(" ")}
      >
        <div className="theme-panel-inner rounded-[1.55rem] border p-4 sm:p-5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="theme-pill-strong rounded-full border px-3 py-1 font-mono text-[0.68rem] uppercase tracking-[0.22em]">
              Reminder composer
            </span>
            <span className="theme-pill rounded-full border px-3 py-1 font-mono text-[0.68rem] uppercase tracking-[0.18em]">
              {schedule ? "Selection ready" : "Choose dates first"}
            </span>
          </div>

          <div className="theme-soft-card mt-4 rounded-[1.25rem] border px-4 py-3">
            <p className="font-mono text-[0.64rem] uppercase tracking-[0.22em] text-muted">
              Reminder target
            </p>
            <p className="mt-2 text-sm leading-6 text-foreground/85">
              {schedule
                ? `${schedule.rangeLabel}. Reminder triggers on ${schedule.triggerLabel} in ${schedule.timeZoneLabel}.`
                : "Select a date or complete a range, then add a reminder message."}
            </p>
            <p className="mt-2 text-xs leading-5 text-muted">
              Reminders follow your browser&apos;s local timezone.
            </p>
            {notificationFallbackMessage ? (
              <p
                role="status"
                className="mt-2 text-xs leading-5"
                style={{ color: "var(--status-text)" }}
              >
                {notificationFallbackMessage}
              </p>
            ) : null}
          </div>

          <label className="mt-4 block">
            <span className="font-mono text-[0.64rem] uppercase tracking-[0.22em] text-muted">
              Reminder message
            </span>
            <textarea
              aria-describedby={
                hasWhitespaceOnlyMessage
                  ? "calendar-reminder-validation"
                  : undefined
              }
              aria-invalid={hasWhitespaceOnlyMessage}
              className="theme-field mt-3 min-h-36 w-full rounded-[1.25rem] border px-4 py-3 text-base leading-6 outline-none transition disabled:cursor-not-allowed sm:text-sm"
              disabled={!schedule}
              onChange={(event) => setMessage(event.target.value)}
              placeholder={
                schedule
                  ? "Write a reminder message..."
                  : "Choose a date or range to unlock reminders."
              }
              value={message}
            />
          </label>

          {hasWhitespaceOnlyMessage ? (
            <p
              id="calendar-reminder-validation"
              role="alert"
              className="mt-2 text-xs leading-5"
              style={{ color: "var(--danger-text)" }}
            >
              Reminder message can&apos;t be empty.
            </p>
          ) : null}

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button
              className="theme-primary-button inline-flex min-h-11 w-full items-center justify-center rounded-full px-4 py-2.5 text-sm font-medium transition disabled:cursor-not-allowed sm:w-auto"
              disabled={!canSaveReminder}
              onClick={handleCreateReminder}
              type="button"
            >
              Set Reminder
            </button>
          </div>

          <p className="theme-copy-muted mt-3 text-xs leading-5">
            Saving a reminder will use browser notifications when available,
            otherwise the app shows an in-page alert.
          </p>
        </div>

        <div className="theme-panel-inner rounded-[1.55rem] border p-4 sm:p-5">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-lg font-semibold tracking-[-0.03em]">
              Upcoming reminders
            </h3>
            <span className="theme-copy-muted font-mono text-[0.66rem] uppercase tracking-[0.2em]">
              Local
            </span>
          </div>

          <div className="mt-4 space-y-3">
            <AnimatePresence mode="popLayout" initial={false}>
              {upcomingReminders.length === 0 ? (
                <motion.div
                  key="empty-reminders"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.22, ease: premiumEase }}
                  className="theme-empty-state rounded-[1.2rem] border border-dashed px-4 py-6 text-sm leading-6"
                >
                  No upcoming reminders yet. Select a date or range and save
                  one to start receiving alerts.
                </motion.div>
              ) : (
                upcomingReminders.map((reminder) => {
                  const scheduleLabel = formatReminderSchedule({
                    startDate: reminder.startDate,
                    endDate: reminder.endDate,
                  });

                  return (
                    <motion.article
                      key={reminder.id}
                      layout
                      initial={{ opacity: 0, y: 12, scale: 0.985 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.98 }}
                      transition={{
                        duration: 0.26,
                        ease: premiumEase,
                        layout: { duration: 0.22, ease: premiumEase },
                      }}
                      className="theme-list-card rounded-[1.2rem] border px-4 py-4"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className="font-mono text-[0.64rem] uppercase tracking-[0.22em] text-muted">
                            {scheduleLabel.rangeLabel}
                          </p>
                          <p className="mt-2 text-xs leading-5 text-muted">
                            {formatReminderTimestamp(reminder, localTimeZone)}
                          </p>
                        </div>

                        <button
                          className="theme-danger-button inline-flex min-h-10 w-full items-center justify-center rounded-full border px-3 py-2 text-sm font-medium transition sm:w-auto sm:text-xs"
                          onClick={() => onDeleteReminder(reminder.id)}
                          type="button"
                        >
                          Remove
                        </button>
                      </div>

                      <p className="mt-3 text-sm leading-6 text-foreground/85">
                        {reminder.message}
                      </p>
                    </motion.article>
                  );
                })
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <CalendarActionFeedback feedback={feedback} floating />
    </motion.section>
  );
});
