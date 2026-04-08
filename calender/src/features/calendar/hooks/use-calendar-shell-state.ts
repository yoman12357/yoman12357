"use client";

import {
  type CSSProperties,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import {
  addMonths,
  endOfWeek,
  format,
  isSameMonth,
  parseISO,
  startOfWeek,
} from "date-fns";

import { useHeroImageAccent } from "@/features/calendar/hooks/use-hero-image-accent";
import { getCalendarShellData } from "@/features/calendar/utils/get-calendar-shell-data";
import {
  getCalendarNotesServerSnapshot,
  getCalendarNotesSnapshot,
  sortCalendarNotes,
  subscribeToCalendarNotes,
  writeCalendarNotes,
} from "@/features/calendar/utils/calendar-notes";
import {
  getBrowserNotificationStatus,
  getCalendarRemindersServerSnapshot,
  getCalendarRemindersSnapshot,
  getReminderTriggerDate,
  isReminderDue,
  requestCalendarNotificationPermission,
  showReminderNotification,
  sortCalendarReminders,
  subscribeToCalendarReminders,
  writeCalendarReminders,
} from "@/features/calendar/utils/calendar-reminders";
import { getLocalTimeZoneInfo } from "@/features/calendar/utils/calendar-time-zone";
import {
  getDragRangeSelection,
  getNextRangeSelection,
  isCalendarDateIdValid,
} from "@/features/calendar/utils/date-range-selection";
import { createUniqueId } from "@/features/calendar/utils/create-unique-id";
import { CALENDAR_HERO_IMAGE_SRC } from "@/features/calendar/utils/calendar-hero-image";
import { useTransientFeedback } from "@/features/calendar/hooks/use-transient-feedback";
import type {
  BrowserNotificationStatus,
  CalendarCompletedRange,
  CalendarNote,
  CalendarRangeSelection,
  CalendarReminder,
} from "@/features/calendar/types/calendar";

type UseCalendarShellStateParams = {
  initialReferenceDate: string;
};

const CALENDAR_WEEK_STARTS_ON = 0;

type DragSelectionState = {
  anchorDate: string;
  hoveredDate: string;
};

export function useCalendarShellState({
  initialReferenceDate,
}: UseCalendarShellStateParams) {
  const [selection, setSelection] = useState<CalendarRangeSelection>({
    startDate: null,
    endDate: null,
  });
  const [visibleMonth, setVisibleMonth] = useState(() =>
    parseISO(initialReferenceDate),
  );
  const [monthDirection, setMonthDirection] = useState(1);
  const [notificationStatus, setNotificationStatus] =
    useState<BrowserNotificationStatus>("unknown");
  const [activeReminderAlerts, setActiveReminderAlerts] = useState<
    CalendarReminder[]
  >([]);
  const [dragSelection, setDragSelection] = useState<DragSelectionState | null>(
    null,
  );
  const suppressNextClickSelectionRef = useRef(false);
  const { clearFeedback, feedback, showFeedback } = useTransientFeedback(2200);

  const notes = useSyncExternalStore(
    subscribeToCalendarNotes,
    getCalendarNotesSnapshot,
    getCalendarNotesServerSnapshot,
  );
  const reminders = useSyncExternalStore(
    subscribeToCalendarReminders,
    getCalendarRemindersSnapshot,
    getCalendarRemindersServerSnapshot,
  );

  const calendarData = useMemo(
    () => getCalendarShellData(visibleMonth),
    [visibleMonth],
  );
  const displaySelection = useMemo(() => {
    if (!dragSelection) {
      return selection;
    }

    return (
      getDragRangeSelection(dragSelection.anchorDate, dragSelection.hoveredDate) ??
      selection
    );
  }, [dragSelection, selection]);
  const isShowingCurrentMonth = useMemo(
    () => isSameMonth(visibleMonth, new Date()),
    [visibleMonth],
  );
  const isDraggingSelection = dragSelection !== null;
  const localTimeZone = useMemo(() => getLocalTimeZoneInfo(), []);
  const accentTokens = useHeroImageAccent({
    fallbackPalette: calendarData.palette,
    imageFilter: calendarData.palette.imageFilter,
    imageSource: CALENDAR_HERO_IMAGE_SRC,
  });
  const shellAccentStyle = useMemo(
    () =>
      ({
        "--month-accent-strong": accentTokens.accentStrong,
        "--month-accent-border": accentTokens.accentBorder,
        "--month-accent-soft": accentTokens.accentSoft,
        "--month-accent-glow": accentTokens.accentGlow,
        "--month-accent-shell-glow": accentTokens.shellGlow,
        "--month-accent-hero-tint": accentTokens.heroTint,
      }) as CSSProperties,
    [accentTokens],
  );

  const processDueReminders = useCallback((reminderList: CalendarReminder[]) => {
    const dueReminders = reminderList.filter((reminder) =>
      isReminderDue(reminder),
    );

    if (dueReminders.length === 0) {
      return;
    }

    const currentStatus = getBrowserNotificationStatus();
    const deliveredAt = new Date().toISOString();
    const dueReminderIds = new Set(dueReminders.map((reminder) => reminder.id));
    const fallbackAlerts: CalendarReminder[] = [];

    setNotificationStatus(currentStatus);

    dueReminders.forEach((reminder) => {
      const deliveredByBrowser =
        currentStatus === "granted" &&
        showReminderNotification(reminder, localTimeZone);

      if (!deliveredByBrowser) {
        fallbackAlerts.push(reminder);
      }
    });

    if (fallbackAlerts.length > 0) {
      setActiveReminderAlerts((currentAlerts) => {
        // Keep one visible fallback banner per reminder even across refreshes.
        const mergedAlerts = [
          ...currentAlerts.filter((alert) => !dueReminderIds.has(alert.id)),
          ...fallbackAlerts,
        ];

        return sortCalendarReminders(
          Array.from(
            new Map(mergedAlerts.map((alert) => [alert.id, alert])).values(),
          ),
        );
      });
    }

    writeCalendarReminders(
      reminderList.map((reminder) =>
        dueReminderIds.has(reminder.id)
          ? {
              ...reminder,
              notifiedAt: deliveredAt,
              updatedAt: deliveredAt,
            }
          : reminder,
      ),
    );
  }, [localTimeZone]);

  useEffect(() => {
    const syncStatusTimeout = window.setTimeout(() => {
      setNotificationStatus(getBrowserNotificationStatus());
    }, 0);
    const initialReminderCheck = window.setTimeout(() => {
      processDueReminders(reminders);
    }, 0);
    const reminderInterval = window.setInterval(() => {
      processDueReminders(reminders);
    }, 60_000);

    return () => {
      window.clearTimeout(syncStatusTimeout);
      window.clearTimeout(initialReminderCheck);
      window.clearInterval(reminderInterval);
    };
  }, [processDueReminders, reminders]);

  useEffect(() => {
    if (!dragSelection) {
      return;
    }

    // Finalize or clear drag selection even if the pointer is released outside the grid.
    const handlePointerUp = () => {
      const nextSelection = getDragRangeSelection(
        dragSelection.anchorDate,
        dragSelection.hoveredDate,
      );

      if (!nextSelection) {
        showFeedback(
          "Invalid date selection. Try starting again on a visible day.",
          "error",
        );
        setDragSelection(null);
        return;
      }

      if (nextSelection.startDate && nextSelection.endDate) {
        suppressNextClickSelectionRef.current = true;
        setSelection(nextSelection);

        const selectionFeedbackMessage = getSelectionCompletionFeedback(
          dragSelection.anchorDate,
          nextSelection,
        );

        if (selectionFeedbackMessage) {
          showFeedback(selectionFeedbackMessage);
        } else {
          clearFeedback();
        }
      }

      setDragSelection(null);
    };
    const handlePointerCancel = () => {
      setDragSelection(null);
    };

    window.addEventListener("pointerup", handlePointerUp);
    window.addEventListener("pointercancel", handlePointerCancel);

    return () => {
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("pointercancel", handlePointerCancel);
    };
  }, [clearFeedback, dragSelection, showFeedback]);

  const handleDateSelect = useCallback((dayId: string) => {
    if (!isCalendarDateIdValid(dayId)) {
      showFeedback(
        "Invalid date selection. Please choose a day from the month grid.",
        "error",
      );
      return;
    }

    if (suppressNextClickSelectionRef.current) {
      suppressNextClickSelectionRef.current = false;
      return;
    }

    const nextSelection = getNextRangeSelection(selection, dayId);
    const selectionFeedbackMessage =
      selection.startDate && !selection.endDate
        ? getSelectionCompletionFeedback(selection.startDate, nextSelection)
        : null;

    if (selectionFeedbackMessage) {
      showFeedback(selectionFeedbackMessage);
    } else {
      clearFeedback();
    }

    setSelection(nextSelection);
  }, [clearFeedback, selection, showFeedback]);

  const handleSelectionDragStart = useCallback((dayId: string) => {
    if (!isCalendarDateIdValid(dayId)) {
      showFeedback(
        "Invalid date selection. Please start from a visible day.",
        "error",
      );
      return;
    }

    clearFeedback();
    setDragSelection({
      anchorDate: dayId,
      hoveredDate: dayId,
    });
  }, [clearFeedback, showFeedback]);

  const handleSelectionDragEnter = useCallback((dayId: string) => {
    if (!isCalendarDateIdValid(dayId)) {
      showFeedback(
        "Invalid date selection. Drag across visible dates only.",
        "error",
      );
      return;
    }

    setDragSelection((currentDragSelection) => {
      if (!currentDragSelection || currentDragSelection.hoveredDate === dayId) {
        return currentDragSelection;
      }

      return {
        ...currentDragSelection,
        hoveredDate: dayId,
      };
    });
  }, [showFeedback]);

  const handleShowPreviousMonth = useCallback(() => {
    clearFeedback();
    setDragSelection(null);
    setMonthDirection(-1);
    setVisibleMonth((currentMonth) => addMonths(currentMonth, -1));
  }, [clearFeedback]);

  const handleShowNextMonth = useCallback(() => {
    clearFeedback();
    setDragSelection(null);
    setMonthDirection(1);
    setVisibleMonth((currentMonth) => addMonths(currentMonth, 1));
  }, [clearFeedback]);

  const handleReturnToCurrentMonth = useCallback(() => {
    const today = new Date();

    clearFeedback();
    setDragSelection(null);
    setMonthDirection(visibleMonth.getTime() > today.getTime() ? -1 : 1);
    setVisibleMonth(today);
  }, [clearFeedback, visibleMonth]);

  const handleClearSelection = useCallback(() => {
    clearFeedback();
    setDragSelection(null);
    suppressNextClickSelectionRef.current = false;
    setSelection({
      startDate: null,
      endDate: null,
    });
  }, [clearFeedback]);

  const handleSelectThisWeek = useCallback(() => {
    const today = new Date();
    const weekStart = startOfWeek(today, {
      weekStartsOn: CALENDAR_WEEK_STARTS_ON,
    });
    const weekEnd = endOfWeek(today, {
      weekStartsOn: CALENDAR_WEEK_STARTS_ON,
    });

    clearFeedback();
    setDragSelection(null);
    suppressNextClickSelectionRef.current = false;
    setMonthDirection(visibleMonth.getTime() > today.getTime() ? -1 : 1);
    setVisibleMonth(today);
    setSelection({
      startDate: format(weekStart, "yyyy-MM-dd"),
      endDate: format(weekEnd, "yyyy-MM-dd"),
    });
  }, [clearFeedback, visibleMonth]);

  const handleCreateNote = useCallback(
    (range: CalendarCompletedRange, content: string) => {
      const timestamp = new Date().toISOString();
      const nextNote: CalendarNote = {
        id: createUniqueId("note"),
        startDate: range.startDate,
        endDate: range.endDate,
        content,
        createdAt: timestamp,
        updatedAt: timestamp,
      };

      writeCalendarNotes(sortCalendarNotes([nextNote, ...notes]));
    },
    [notes],
  );

  const handleUpdateNote = useCallback(
    (noteId: string, content: string) => {
      const timestamp = new Date().toISOString();

      writeCalendarNotes(
        sortCalendarNotes(
          notes.map((note) =>
            note.id === noteId
              ? {
                  ...note,
                  content,
                  updatedAt: timestamp,
                }
              : note,
          ),
        ),
      );
    },
    [notes],
  );

  const handleDeleteNote = useCallback(
    (noteId: string) => {
      writeCalendarNotes(notes.filter((note) => note.id !== noteId));
    },
    [notes],
  );

  const handleCreateReminder = useCallback(
    async (range: CalendarCompletedRange, message: string) => {
      const timestamp = new Date().toISOString();
      const nextReminder: CalendarReminder = {
        id: createUniqueId("reminder"),
        startDate: range.startDate,
        endDate: range.endDate,
        triggerDate: getReminderTriggerDate(range),
        message,
        createdAt: timestamp,
        updatedAt: timestamp,
        notifiedAt: null,
        timeZoneId: localTimeZone.id,
        timeZoneLabel: localTimeZone.displayLabel,
        timeZoneOffsetMinutes: localTimeZone.offsetMinutes,
      };
      const nextReminders = sortCalendarReminders([...reminders, nextReminder]);

      writeCalendarReminders(nextReminders);

      const currentStatus = getBrowserNotificationStatus();
      setNotificationStatus(currentStatus);

      if (currentStatus === "default") {
        try {
          const permission = await requestCalendarNotificationPermission();

          setNotificationStatus(permission);
          window.setTimeout(() => {
            processDueReminders(nextReminders);
          }, 0);

          return permission;
        } catch {
          setNotificationStatus("unsupported");
          window.setTimeout(() => {
            processDueReminders(nextReminders);
          }, 0);

          return "unsupported" as const;
        }
      }

      window.setTimeout(() => {
        processDueReminders(nextReminders);
      }, 0);

      return currentStatus;
    },
    [localTimeZone, processDueReminders, reminders],
  );

  const handleDeleteReminder = useCallback(
    (reminderId: string) => {
      writeCalendarReminders(
        reminders.filter((reminder) => reminder.id !== reminderId),
      );
      setActiveReminderAlerts((currentAlerts) =>
        currentAlerts.filter((alert) => alert.id !== reminderId),
      );
    },
    [reminders],
  );

  const handleDismissReminderAlert = useCallback((reminderId: string) => {
    setActiveReminderAlerts((currentAlerts) =>
      currentAlerts.filter((alert) => alert.id !== reminderId),
    );
  }, []);

  return {
    activeReminderAlerts,
    calendarData,
    displaySelection,
    handleClearSelection,
    handleCreateNote,
    handleCreateReminder,
    handleDateSelect,
    handleDeleteNote,
    handleDeleteReminder,
    handleDismissReminderAlert,
    handleReturnToCurrentMonth,
    handleSelectionDragEnter,
    handleSelectionDragStart,
    handleSelectThisWeek,
    handleShowNextMonth,
    handleShowPreviousMonth,
    handleUpdateNote,
    hasSelection: Boolean(selection.startDate || dragSelection),
    isDraggingSelection,
    isShowingCurrentMonth,
    monthDirection,
    notes,
    notificationStatus,
    localTimeZone,
    reminders,
    selectionFeedback: feedback,
    selection,
    shellAccentStyle,
  };
}

function getSelectionCompletionFeedback(
  initialStartDate: string,
  selection: CalendarRangeSelection,
) {
  if (!selection.startDate || !selection.endDate) {
    return null;
  }

  if (selection.startDate === selection.endDate) {
    return `Single-day range selected for ${format(parseISO(selection.startDate), "MMM d, yyyy")}.`;
  }

  if (selection.startDate !== initialStartDate) {
    return "End date was before the start date, so the range was reordered automatically.";
  }

  return null;
}
