"use client";

import { useCallback, useMemo, useState } from "react";

import { useTransientFeedback } from "@/features/calendar/hooks/use-transient-feedback";
import {
  formatCalendarRange,
  getCompletedRangeSelection,
  noteMatchesRange,
} from "@/features/calendar/utils/calendar-notes";
import type {
  CalendarCompletedRange,
  CalendarNote,
  CalendarRangeSelection,
} from "@/features/calendar/types/calendar";

type UseCalendarNotesComposerParams = {
  notes: CalendarNote[];
  selection: CalendarRangeSelection;
  onCreateNote: (range: CalendarCompletedRange, content: string) => void;
  onDeleteNote: (noteId: string) => void;
  onUpdateNote: (noteId: string, content: string) => void;
};

export function useCalendarNotesComposer({
  notes,
  selection,
  onCreateNote,
  onDeleteNote,
  onUpdateNote,
}: UseCalendarNotesComposerParams) {
  const [draft, setDraft] = useState("");
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const { feedback, clearFeedback, showFeedback } = useTransientFeedback();

  const activeSelectionRange = useMemo(
    () => getCompletedRangeSelection(selection),
    [selection],
  );

  const editingNote = useMemo(
    () => notes.find((note) => note.id === editingNoteId) ?? null,
    [editingNoteId, notes],
  );

  const composerRange = useMemo<CalendarCompletedRange | null>(() => {
    if (editingNote) {
      return {
        startDate: editingNote.startDate,
        endDate: editingNote.endDate,
      };
    }

    return activeSelectionRange;
  }, [activeSelectionRange, editingNote]);

  const composerRangeLabel = useMemo(() => {
    if (composerRange) {
      return formatCalendarRange(composerRange);
    }

    return selection.startDate
      ? "Choose an end date to complete the note range."
      : "Select a date range on the calendar to begin.";
  }, [composerRange, selection.startDate]);

  const canSave = Boolean(composerRange && draft.trim().length > 0);
  const hasWhitespaceOnlyDraft = draft.length > 0 && draft.trim().length === 0;

  const handleCancelEdit = useCallback(() => {
    clearFeedback();
    setEditingNoteId(null);
    setDraft("");
  }, [clearFeedback]);

  const handleDeleteNote = useCallback(
    (noteId: string) => {
      onDeleteNote(noteId);

      if (editingNoteId === noteId) {
        handleCancelEdit();
      }
    },
    [editingNoteId, handleCancelEdit, onDeleteNote],
  );

  const handleEditNote = useCallback(
    (note: CalendarNote) => {
      clearFeedback();
      setEditingNoteId(note.id);
      setDraft(note.content);
    },
    [clearFeedback],
  );

  const handleSubmit = useCallback(() => {
    const content = draft.trim();

    if (editingNoteId && !editingNote) {
      handleCancelEdit();
      showFeedback("That note is no longer available.", "error");
      return;
    }

    if (!composerRange) {
      showFeedback(
        selection.startDate
          ? "Choose an end date before saving a note."
          : "Select a date range before saving a note.",
        "error",
      );
      return;
    }

    if (!content) {
      showFeedback("Notes can't be empty.", "error");
      return;
    }

    if (editingNote) {
      onUpdateNote(editingNote.id, content);
      showFeedback("Note updated");
    } else {
      onCreateNote(composerRange, content);
      showFeedback("Note saved");
    }

    setDraft("");
    setEditingNoteId(null);
  }, [
    composerRange,
    draft,
    editingNote,
    editingNoteId,
    handleCancelEdit,
    onCreateNote,
    onUpdateNote,
    selection.startDate,
    showFeedback,
  ]);

  const isNoteInActiveRange = useCallback(
    (note: CalendarNote) => noteMatchesRange(note, activeSelectionRange),
    [activeSelectionRange],
  );

  return {
    canSave,
    composerRange,
    composerRangeLabel,
    draft,
    editingNoteId,
    feedback,
    hasWhitespaceOnlyDraft,
    isNoteInActiveRange,
    setDraft,
    handleCancelEdit,
    handleDeleteNote,
    handleEditNote,
    handleSubmit,
  };
}
