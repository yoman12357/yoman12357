import {
  format,
  isAfter,
  isBefore,
  isSameDay,
  isValid,
  isWithinInterval,
  parseISO,
} from "date-fns";

import type {
  CalendarDayRangeState,
  CalendarRangeSelection,
} from "@/features/calendar/types/calendar";

export function getNextRangeSelection(
  currentSelection: CalendarRangeSelection,
  clickedDate: string,
): CalendarRangeSelection {
  if (!isCalendarDateIdValid(clickedDate)) {
    return currentSelection;
  }

  if (!currentSelection.startDate || currentSelection.endDate) {
    return {
      startDate: clickedDate,
      endDate: null,
    };
  }

  const nextRangeSelection = getDragRangeSelection(
    currentSelection.startDate,
    clickedDate,
  );

  if (!nextRangeSelection) {
    return {
      startDate: clickedDate,
      endDate: null,
    };
  }

  return nextRangeSelection;
}

export function getDragRangeSelection(
  anchorDate: string,
  hoveredDate: string,
): CalendarRangeSelection | null {
  const start = parseCalendarDateId(anchorDate);
  const end = parseCalendarDateId(hoveredDate);

  if (!start || !end) {
    return null;
  }

  if (isBefore(end, start)) {
    return {
      startDate: hoveredDate,
      endDate: anchorDate,
    };
  }

  return {
    startDate: anchorDate,
    endDate: hoveredDate,
  };
}

export function isCalendarDateIdValid(dateId: string) {
  return parseCalendarDateId(dateId) !== null;
}

export function getDayRangeState(
  dayId: string,
  selection: CalendarRangeSelection,
): CalendarDayRangeState {
  if (!selection.startDate) {
    return {
      isRangeStart: false,
      isRangeEnd: false,
      isInRange: false,
      isSingleDayRange: false,
    };
  }

  const day = parseISO(dayId);
  const start = parseISO(selection.startDate);
  const end = selection.endDate ? parseISO(selection.endDate) : null;

  if (!end) {
    return {
      isRangeStart: isSameDay(day, start),
      isRangeEnd: false,
      isInRange: false,
      isSingleDayRange: false,
    };
  }

  const isRangeStart = isSameDay(day, start);
  const isRangeEnd = isSameDay(day, end);
  const isSingleDayRange = isSameDay(start, end);
  const isInRange =
    !isSingleDayRange &&
    isWithinInterval(day, { start, end }) &&
    !isRangeStart &&
    !isRangeEnd;

  return {
    isRangeStart,
    isRangeEnd,
    isInRange,
    isSingleDayRange,
  };
}

export function formatRangeSummary(
  selection: CalendarRangeSelection,
  options?: {
    isPreview?: boolean;
  },
) {
  if (!selection.startDate) {
    return "Choose a start date, then an end date.";
  }

  const start = parseCalendarDateId(selection.startDate);

  if (!start) {
    return "Choose a valid start date to begin selecting a range.";
  }

  if (!selection.endDate) {
    return `Start date: ${format(start, "MMM d, yyyy")}. Choose an end date.`;
  }

  const end = parseCalendarDateId(selection.endDate);

  if (!end) {
    return `Start date: ${format(start, "MMM d, yyyy")}. Choose an end date.`;
  }

  if (isSameDay(start, end)) {
    if (options?.isPreview) {
      return `Start date: ${format(start, "MMM d, yyyy")}. Drag across the calendar to extend the range, or release to keep a single day.`;
    }

    return `Single-day range: ${format(start, "MMM d, yyyy")}. Click again to start a new range.`;
  }

  const orderedRange = isAfter(start, end)
    ? `${format(end, "MMM d")} - ${format(start, "MMM d, yyyy")}`
    : `${format(start, "MMM d")} - ${format(end, "MMM d, yyyy")}`;

  if (options?.isPreview) {
    return `Release to confirm: ${orderedRange}.`;
  }

  return `Selected range: ${orderedRange}. Click any date to start over.`;
}

function parseCalendarDateId(dateId: string) {
  const parsedDate = parseISO(dateId);

  return isValid(parsedDate) ? parsedDate : null;
}
