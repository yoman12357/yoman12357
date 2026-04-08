import {
  compareAsc,
  format,
  isSameDay,
  isWithinInterval,
  parseISO,
} from "date-fns";

import {
  formatCalendarRange,
  getCompletedRangeSelection,
  normalizeCalendarCompletedRange,
} from "@/features/calendar/utils/calendar-notes";
import {
  getLocalCalendarDateId,
  getLocalTimeZoneInfo,
} from "@/features/calendar/utils/calendar-time-zone";
import { createLocalStorageArrayStore } from "@/features/calendar/utils/create-local-storage-array-store";
import type {
  BrowserNotificationStatus,
  CalendarCompletedRange,
  CalendarRangeSelection,
  CalendarReminder,
} from "@/features/calendar/types/calendar";

export const CALENDAR_REMINDERS_STORAGE_KEY = "calendar-range-reminders";
const calendarRemindersStore = createLocalStorageArrayStore<CalendarReminder>({
  storageKey: CALENDAR_REMINDERS_STORAGE_KEY,
  isItem: isCalendarReminder,
  sortItems: sortCalendarReminders,
});

export function getReminderSelectionRange(
  selection: CalendarRangeSelection,
): CalendarCompletedRange | null {
  const completedRange = getCompletedRangeSelection(selection);

  if (completedRange) {
    return completedRange;
  }

  if (!selection.startDate) {
    return null;
  }

  return {
    startDate: selection.startDate,
    endDate: selection.startDate,
  };
}

export function getReminderTriggerDate(range: CalendarCompletedRange) {
  return normalizeCalendarCompletedRange(range)?.startDate ?? range.startDate;
}

export function formatReminderSchedule(
  range: CalendarCompletedRange,
  timeZoneInfo = getLocalTimeZoneInfo(),
) {
  const triggerDate = parseISO(getReminderTriggerDate(range));

  return {
    rangeLabel: formatCalendarRange(range),
    triggerLabel: format(triggerDate, "MMMM d, yyyy"),
    timeZoneLabel: timeZoneInfo.displayLabel,
  };
}

export function formatReminderTimestamp(
  reminder: CalendarReminder,
  fallbackTimeZoneInfo = getLocalTimeZoneInfo(),
) {
  return `Triggers on ${format(parseISO(reminder.triggerDate), "MMM d, yyyy")} in ${getReminderTimeZoneLabel(reminder, fallbackTimeZoneInfo)}`;
}

export function getUpcomingCalendarReminders(reminders: CalendarReminder[]) {
  return sortCalendarReminders(
    reminders.filter((reminder) => reminder.notifiedAt === null),
  );
}

export function isReminderDue(
  reminder: CalendarReminder,
  referenceDate = new Date(),
) {
  if (reminder.notifiedAt) {
    return false;
  }

  // Compare local calendar dates directly so reminders follow the user's local day.
  return reminder.triggerDate <= getLocalCalendarDateId(referenceDate);
}

export function countRemindersForDate(
  reminders: CalendarReminder[],
  dayId: string,
) {
  const day = parseISO(dayId);

  return reminders.reduce((count, reminder) => {
    const normalizedRange = normalizeCalendarCompletedRange({
      startDate: reminder.startDate,
      endDate: reminder.endDate,
    });

    if (!normalizedRange) {
      return count;
    }

    const start = parseISO(normalizedRange.startDate);
    const end = parseISO(normalizedRange.endDate);

    return isWithinInterval(day, { start, end }) ? count + 1 : count;
  }, 0);
}

export function sortCalendarReminders(reminders: CalendarReminder[]) {
  return [...reminders].sort((firstReminder, secondReminder) => {
    const triggerOrder = compareAsc(
      parseISO(firstReminder.triggerDate),
      parseISO(secondReminder.triggerDate),
    );

    if (triggerOrder !== 0) {
      return triggerOrder;
    }

    return compareAsc(
      parseISO(firstReminder.updatedAt),
      parseISO(secondReminder.updatedAt),
    );
  });
}

export function getBrowserNotificationStatus(): BrowserNotificationStatus {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return "unsupported";
  }

  return window.Notification.permission;
}

export async function requestCalendarNotificationPermission() {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return "unsupported" as const;
  }

  return window.Notification.requestPermission();
}

export function showReminderNotification(
  reminder: CalendarReminder,
  fallbackTimeZoneInfo = getLocalTimeZoneInfo(),
) {
  if (
    typeof window === "undefined" ||
    !("Notification" in window) ||
    window.Notification.permission !== "granted"
  ) {
    return false;
  }

  const range: CalendarCompletedRange = {
    startDate: reminder.startDate,
    endDate: reminder.endDate,
  };

  const { rangeLabel } = formatReminderSchedule(range);
  const reminderTitle = isSameDay(
    parseISO(reminder.startDate),
    parseISO(reminder.endDate),
  )
    ? "Calendar reminder"
      : "Calendar range reminder";

  new window.Notification(reminderTitle, {
    body: `${reminder.message}\n${rangeLabel}\n${getReminderTimeZoneLabel(reminder, fallbackTimeZoneInfo)}`,
    tag: `calendar-reminder-${reminder.id}`,
  });

  return true;
}

export function getCalendarRemindersSnapshot() {
  return calendarRemindersStore.getSnapshot();
}

export function getCalendarRemindersServerSnapshot() {
  return calendarRemindersStore.getServerSnapshot();
}

export function subscribeToCalendarReminders(listener: () => void) {
  return calendarRemindersStore.subscribe(listener);
}

export function writeCalendarReminders(reminders: CalendarReminder[]) {
  calendarRemindersStore.write(reminders);
}

function isCalendarReminder(value: unknown): value is CalendarReminder {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidateReminder = value as Record<string, unknown>;

  return (
    typeof candidateReminder.id === "string" &&
    typeof candidateReminder.startDate === "string" &&
    typeof candidateReminder.endDate === "string" &&
    typeof candidateReminder.triggerDate === "string" &&
    typeof candidateReminder.message === "string" &&
    typeof candidateReminder.createdAt === "string" &&
    typeof candidateReminder.updatedAt === "string" &&
    (typeof candidateReminder.timeZoneId === "string" ||
      candidateReminder.timeZoneId === undefined) &&
    (typeof candidateReminder.timeZoneLabel === "string" ||
      candidateReminder.timeZoneLabel === undefined) &&
    (typeof candidateReminder.timeZoneOffsetMinutes === "number" ||
      candidateReminder.timeZoneOffsetMinutes === undefined) &&
    (typeof candidateReminder.notifiedAt === "string" ||
      candidateReminder.notifiedAt === null)
  );
}

export function getReminderTimeZoneLabel(
  reminder: CalendarReminder,
  fallbackTimeZoneInfo = getLocalTimeZoneInfo(),
) {
  return reminder.timeZoneLabel ?? fallbackTimeZoneInfo.displayLabel;
}
