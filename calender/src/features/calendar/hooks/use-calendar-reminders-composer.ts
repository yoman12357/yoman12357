"use client";

import { useCallback, useMemo, useState } from "react";

import { useTransientFeedback } from "@/features/calendar/hooks/use-transient-feedback";
import {
  formatReminderSchedule,
  getReminderSelectionRange,
  getUpcomingCalendarReminders,
} from "@/features/calendar/utils/calendar-reminders";
import type {
  BrowserNotificationStatus,
  CalendarCompletedRange,
  CalendarRangeSelection,
  CalendarReminder,
  CalendarTimeZoneInfo,
} from "@/features/calendar/types/calendar";

type UseCalendarRemindersComposerParams = {
  localTimeZone: CalendarTimeZoneInfo;
  reminders: CalendarReminder[];
  selection: CalendarRangeSelection;
  notificationStatus: BrowserNotificationStatus;
  onCreateReminder: (
    range: CalendarCompletedRange,
    message: string,
  ) => Promise<BrowserNotificationStatus> | BrowserNotificationStatus;
};

export function useCalendarRemindersComposer({
  localTimeZone,
  reminders,
  selection,
  notificationStatus,
  onCreateReminder,
}: UseCalendarRemindersComposerParams) {
  const [message, setMessage] = useState("");
  const { feedback, showFeedback } = useTransientFeedback();

  const reminderRange = useMemo(
    () => getReminderSelectionRange(selection),
    [selection],
  );
  const schedule = useMemo(
    () =>
      reminderRange
        ? formatReminderSchedule(reminderRange, localTimeZone)
        : null,
    [localTimeZone, reminderRange],
  );
  const upcomingReminders = useMemo(
    () => getUpcomingCalendarReminders(reminders),
    [reminders],
  );
  const canSaveReminder = Boolean(reminderRange && message.trim().length > 0);
  const hasWhitespaceOnlyMessage =
    message.length > 0 && message.trim().length === 0;

  const notificationStatusLabel = useMemo(() => {
    switch (notificationStatus) {
      case "granted":
        return "Browser alerts on";
      case "denied":
        return "Using in-app alerts";
      case "unsupported":
        return "Notifications unsupported";
      default:
        return "Will ask when saved";
    }
  }, [notificationStatus]);

  const notificationFallbackMessage = useMemo(() => {
    switch (notificationStatus) {
      case "denied":
        return "Browser notifications are blocked for this site, so reminders will appear as in-app alerts instead.";
      case "unsupported":
        return "This browser doesn't support notifications, so reminders will appear as in-app alerts instead.";
      default:
        return null;
    }
  }, [notificationStatus]);

  const handleCreateReminder = useCallback(async () => {
    const trimmedMessage = message.trim();

    if (!reminderRange) {
      showFeedback(
        selection.startDate
          ? "Complete the range before setting a reminder."
          : "Choose a date or range before setting a reminder.",
        "error",
      );
      return;
    }

    if (!trimmedMessage) {
      showFeedback("Reminder message can't be empty.", "error");
      return;
    }

    try {
      const resultingStatus = await onCreateReminder(reminderRange, trimmedMessage);

      setMessage("");

      if (resultingStatus === "denied") {
        showFeedback(
          "Reminder saved. Browser notifications are blocked, so we'll use in-app alerts instead.",
        );
        return;
      }

      if (resultingStatus === "unsupported") {
        showFeedback(
          "Reminder saved. This browser doesn't support notifications, so we'll use in-app alerts instead.",
        );
        return;
      }

      if (resultingStatus === "default") {
        showFeedback(
          "Reminder saved. Notification access wasn't granted, so we'll keep using in-app alerts.",
        );
        return;
      }

      showFeedback("Reminder set");
    } catch {
      showFeedback("Reminder couldn't be saved. Try again.", "error");
    }
  }, [message, onCreateReminder, reminderRange, selection.startDate, showFeedback]);

  return {
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
  };
}
