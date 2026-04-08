import {
  compareDesc,
  format,
  isAfter,
  isSameDay,
  isValid,
  isWithinInterval,
  parseISO,
} from "date-fns";

import { createLocalStorageArrayStore } from "@/features/calendar/utils/create-local-storage-array-store";
import type {
  CalendarCompletedRange,
  CalendarNote,
  CalendarRangeSelection,
} from "@/features/calendar/types/calendar";

export const CALENDAR_NOTES_STORAGE_KEY = "calendar-range-notes";
const calendarNotesStore = createLocalStorageArrayStore<CalendarNote>({
  storageKey: CALENDAR_NOTES_STORAGE_KEY,
  isItem: isCalendarNote,
  sortItems: sortCalendarNotes,
});

export function getCompletedRangeSelection(
  selection: CalendarRangeSelection,
): CalendarCompletedRange | null {
  if (!selection.startDate || !selection.endDate) {
    return null;
  }

  return normalizeCalendarCompletedRange({
    startDate: selection.startDate,
    endDate: selection.endDate,
  });
}

export function formatCalendarRange(range: CalendarCompletedRange) {
  const normalizedRange = normalizeCalendarCompletedRange(range);

  if (!normalizedRange) {
    return "Invalid date range";
  }

  const start = parseISO(normalizedRange.startDate);
  const end = parseISO(normalizedRange.endDate);

  if (isSameDay(start, end)) {
    return format(start, "MMMM d, yyyy");
  }

  return `${format(start, "MMM d, yyyy")} - ${format(end, "MMM d, yyyy")}`;
}

export function countNotesForDate(notes: CalendarNote[], dayId: string) {
  const day = parseISO(dayId);

  return notes.reduce((count, note) => {
    const normalizedRange = normalizeCalendarCompletedRange({
      startDate: note.startDate,
      endDate: note.endDate,
    });

    if (!normalizedRange) {
      return count;
    }

    const start = parseISO(normalizedRange.startDate);
    const end = parseISO(normalizedRange.endDate);

    return isWithinInterval(day, { start, end }) ? count + 1 : count;
  }, 0);
}

export function formatNoteTimestamp(note: CalendarNote) {
  return `Updated ${format(parseISO(note.updatedAt), "MMM d, yyyy 'at' h:mm a")}`;
}

export function noteMatchesRange(
  note: CalendarNote,
  range: CalendarCompletedRange | null,
) {
  if (!range) {
    return false;
  }

  const normalizedNoteRange = normalizeCalendarCompletedRange({
    startDate: note.startDate,
    endDate: note.endDate,
  });
  const normalizedSelectionRange = normalizeCalendarCompletedRange(range);

  if (!normalizedNoteRange || !normalizedSelectionRange) {
    return false;
  }

  return (
    normalizedNoteRange.startDate === normalizedSelectionRange.startDate &&
    normalizedNoteRange.endDate === normalizedSelectionRange.endDate
  );
}

export function normalizeCalendarCompletedRange(
  range: CalendarCompletedRange,
): CalendarCompletedRange | null {
  const start = parseISO(range.startDate);
  const end = parseISO(range.endDate);

  if (!isValid(start) || !isValid(end)) {
    return null;
  }

  if (isAfter(start, end)) {
    return {
      startDate: range.endDate,
      endDate: range.startDate,
    };
  }

  return range;
}

export function sortCalendarNotes(notes: CalendarNote[]) {
  return [...notes].sort((firstNote, secondNote) =>
    compareDesc(
      parseISO(firstNote.updatedAt),
      parseISO(secondNote.updatedAt),
    ),
  );
}

export function getCalendarNotesSnapshot() {
  return calendarNotesStore.getSnapshot();
}

export function getCalendarNotesServerSnapshot() {
  return calendarNotesStore.getServerSnapshot();
}

export function subscribeToCalendarNotes(listener: () => void) {
  return calendarNotesStore.subscribe(listener);
}

export function writeCalendarNotes(notes: CalendarNote[]) {
  calendarNotesStore.write(notes);
}

function isCalendarNote(value: unknown): value is CalendarNote {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidateNote = value as Record<string, unknown>;

  return (
    typeof candidateNote.id === "string" &&
    typeof candidateNote.startDate === "string" &&
    typeof candidateNote.endDate === "string" &&
    typeof candidateNote.content === "string" &&
    typeof candidateNote.createdAt === "string" &&
    typeof candidateNote.updatedAt === "string"
  );
}
