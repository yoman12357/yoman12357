"use client";

import { memo } from "react";
import { AnimatePresence, motion } from "framer-motion";

import { CalendarActionFeedback } from "@/features/calendar/components/shared/calendar-action-feedback";
import { CalendarPanelHeader } from "@/features/calendar/components/shared/calendar-panel-header";
import { useCalendarNotesComposer } from "@/features/calendar/hooks/use-calendar-notes-composer";
import {
  formatCalendarRange,
  formatNoteTimestamp,
} from "@/features/calendar/utils/calendar-notes";
import { premiumEase } from "@/features/calendar/utils/motion";
import type {
  CalendarCompletedRange,
  CalendarNote,
  CalendarRangeSelection,
} from "@/features/calendar/types/calendar";

type CalendarNotesPanelProps = {
  isDesktopSticky?: boolean;
  notes: CalendarNote[];
  selection: CalendarRangeSelection;
  onCreateNote: (range: CalendarCompletedRange, content: string) => void;
  onDeleteNote: (noteId: string) => void;
  onUpdateNote: (noteId: string, content: string) => void;
};

export const CalendarNotesPanel = memo(function CalendarNotesPanel({
  isDesktopSticky = false,
  notes,
  selection,
  onCreateNote,
  onDeleteNote,
  onUpdateNote,
}: CalendarNotesPanelProps) {
  const {
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
  } = useCalendarNotesComposer({
    notes,
    selection,
    onCreateNote,
    onDeleteNote,
    onUpdateNote,
  });

  return (
    <motion.section
      layout
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.52, ease: premiumEase }}
      className={[
        "theme-panel-surface relative rounded-[1.6rem] border p-4 sm:rounded-[1.9rem] sm:p-6 lg:p-7",
        isDesktopSticky
          ? "xl:sticky xl:top-6 xl:max-h-[calc(100vh-8rem)] xl:overflow-y-auto"
          : "",
      ].join(" ")}
    >
      <CalendarPanelHeader
        eyebrow="Range Notes"
        title="Notes for selected dates"
        description="Keep short notes tied to the active range, then revisit, edit, or remove them as plans change."
        aside={
          <motion.div
            key={notes.length}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.24, ease: premiumEase }}
            className="theme-pill rounded-full border px-4 py-2 font-mono text-[0.72rem] uppercase tracking-[0.18em]"
          >
            {notes.length} saved
          </motion.div>
        }
      />

      <div
        className={[
          "mt-6 grid gap-4",
          isDesktopSticky ? "2xl:grid-cols-[0.94fr_1.06fr]" : "lg:grid-cols-[0.94fr_1.06fr]",
        ].join(" ")}
      >
        <motion.div
          layout
          className="theme-panel-inner rounded-[1.55rem] border p-4 sm:p-5"
        >
          <div className="flex flex-wrap items-center gap-2">
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={editingNoteId ? "editing-note" : "new-note"}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2, ease: premiumEase }}
                className="theme-pill-strong rounded-full border px-3 py-1 font-mono text-[0.68rem] uppercase tracking-[0.22em]"
              >
                {editingNoteId ? "Editing note" : "New note"}
              </motion.span>
            </AnimatePresence>
            <motion.span
              layout
              className="theme-pill rounded-full border px-3 py-1 font-mono text-[0.68rem] uppercase tracking-[0.18em]"
            >
              {composerRange ? "Range ready" : "Waiting for selection"}
            </motion.span>
          </div>

          <div className="theme-soft-card mt-4 rounded-[1.25rem] border px-4 py-3">
            <p className="font-mono text-[0.64rem] uppercase tracking-[0.22em] text-muted">
              Selected Dates
            </p>
            <AnimatePresence mode="wait" initial={false}>
              <motion.p
                key={composerRangeLabel}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.22, ease: premiumEase }}
                className="mt-2 text-sm leading-6 text-foreground/85"
              >
                {composerRangeLabel}
              </motion.p>
            </AnimatePresence>
          </div>

          <label className="mt-4 block">
            <span className="font-mono text-[0.64rem] uppercase tracking-[0.22em] text-muted">
              Note
            </span>
            <motion.textarea
              layout
              aria-describedby={
                hasWhitespaceOnlyDraft ? "calendar-note-validation" : undefined
              }
              aria-invalid={hasWhitespaceOnlyDraft}
              className="theme-field mt-3 min-h-40 w-full rounded-[1.25rem] border px-4 py-3 text-base leading-6 outline-none transition disabled:cursor-not-allowed sm:text-sm"
              disabled={!composerRange}
              onChange={(event) => setDraft(event.target.value)}
              placeholder={
                composerRange
                  ? "Write a note for this date range..."
                  : "Select a complete range to unlock note editing."
              }
              value={draft}
            />
          </label>

          {hasWhitespaceOnlyDraft ? (
            <p
              id="calendar-note-validation"
              role="alert"
              className="mt-2 text-xs leading-5"
              style={{ color: "var(--danger-text)" }}
            >
              Notes can&apos;t be empty.
            </p>
          ) : null}

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button
              className="theme-primary-button inline-flex min-h-11 w-full items-center justify-center rounded-full px-4 py-2.5 text-sm font-medium transition disabled:cursor-not-allowed sm:w-auto"
              disabled={!canSave}
              onClick={handleSubmit}
              type="button"
            >
              {editingNoteId ? "Update note" : "Save note"}
            </button>

            {editingNoteId ? (
              <motion.button
                layout
                className="theme-secondary-button inline-flex min-h-11 w-full items-center justify-center rounded-full border px-4 py-2.5 text-sm font-medium transition sm:w-auto"
                onClick={handleCancelEdit}
                type="button"
              >
                Cancel edit
              </motion.button>
            ) : null}
          </div>

          <p className="theme-copy-muted mt-3 text-xs leading-5">
            Notes save instantly in this browser and remain attached to the
            selected date range.
          </p>
        </motion.div>

        <motion.div
          layout
          className="theme-panel-inner rounded-[1.55rem] border p-4 sm:p-5"
        >
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-lg font-semibold tracking-[-0.03em]">
              Saved Notes
            </h3>
            <span className="theme-copy-muted font-mono text-[0.66rem] uppercase tracking-[0.2em]">
              Persistent
            </span>
          </div>

          <div className="mt-4 space-y-3">
            <AnimatePresence mode="popLayout" initial={false}>
              {notes.length === 0 ? (
                <motion.div
                  key="empty-notes"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.24, ease: premiumEase }}
                  className="theme-empty-state rounded-[1.2rem] border border-dashed px-4 py-6 text-sm leading-6"
                >
                  No notes yet. Select a range on the calendar, then add the
                  first one here.
                </motion.div>
              ) : (
                notes.map((note) => {
                  const isEditingNote = note.id === editingNoteId;
                  const isActiveRangeNote = isNoteInActiveRange(note);

                  return (
                    <motion.article
                      key={note.id}
                      layout
                      initial={{ opacity: 0, y: 12, scale: 0.985 }}
                      animate={{
                        opacity: 1,
                        y: isEditingNote ? -2 : 0,
                        scale: isEditingNote ? 1.01 : 1,
                      }}
                      exit={{ opacity: 0, y: -10, scale: 0.98 }}
                      transition={{
                        duration: 0.28,
                        ease: premiumEase,
                        layout: { duration: 0.24, ease: premiumEase },
                      }}
                      className={[
                        "rounded-[1.2rem] border px-4 py-4 transition",
                        isEditingNote
                          ? "theme-note-edit"
                          : isActiveRangeNote
                            ? "theme-note-active"
                            : "theme-list-card",
                      ].join(" ")}
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className="font-mono text-[0.64rem] uppercase tracking-[0.22em] text-muted">
                            {formatCalendarRange({
                              startDate: note.startDate,
                              endDate: note.endDate,
                            })}
                          </p>
                          <p className="mt-2 text-xs leading-5 text-muted">
                            {formatNoteTimestamp(note)}
                          </p>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <button
                            className="theme-secondary-button inline-flex min-h-10 flex-1 items-center justify-center rounded-full border px-3 py-2 text-sm font-medium transition sm:flex-none sm:text-xs"
                            onClick={() => handleEditNote(note)}
                            type="button"
                          >
                            Edit
                          </button>
                          <button
                            className="theme-danger-button inline-flex min-h-10 flex-1 items-center justify-center rounded-full border px-3 py-2 text-sm font-medium transition sm:flex-none sm:text-xs"
                            onClick={() => handleDeleteNote(note.id)}
                            type="button"
                          >
                            Delete
                          </button>
                        </div>
                      </div>

                      <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-foreground/85">
                        {note.content}
                      </p>
                    </motion.article>
                  );
                })
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>

      <CalendarActionFeedback feedback={feedback} floating />
    </motion.section>
  );
});
