"use client";

import {
  type KeyboardEvent,
  useCallback,
  useMemo,
  useRef,
  useState,
} from "react";
import { AnimatePresence, motion } from "framer-motion";

import { CalendarActionFeedback } from "@/features/calendar/components/shared/calendar-action-feedback";
import { MonthNavigation } from "@/features/calendar/components/shared/month-navigation";
import { countNotesForDate } from "@/features/calendar/utils/calendar-notes";
import { countRemindersForDate } from "@/features/calendar/utils/calendar-reminders";
import {
  formatRangeSummary,
  getDayRangeState,
} from "@/features/calendar/utils/date-range-selection";
import { premiumEase } from "@/features/calendar/utils/motion";
import type {
  CalendarFeedback,
  CalendarNote,
  CalendarRangeSelection,
  CalendarReminder,
  CalendarShellData,
} from "@/features/calendar/types/calendar";

type CalendarMonthGridProps = {
  data: CalendarShellData;
  hasSelection: boolean;
  isDraggingSelection: boolean;
  monthDirection: number;
  notes: CalendarNote[];
  reminders: CalendarReminder[];
  selection: CalendarRangeSelection;
  selectionFeedback: CalendarFeedback | null;
  onClearSelection: () => void;
  onDateSelect: (dayId: string) => void;
  onDateSelectionDragEnter: (dayId: string) => void;
  onDateSelectionDragStart: (dayId: string) => void;
  onShowPreviousMonth: () => void;
  onShowNextMonth: () => void;
  onReturnToCurrentMonth: () => void;
  onSelectThisWeek: () => void;
  isShowingCurrentMonth: boolean;
};

const dayBaseClass =
  "group relative flex aspect-square min-h-[4.4rem] min-w-[3.15rem] select-none touch-manipulation flex-col justify-between overflow-hidden rounded-[1rem] border px-2 py-2.5 text-left shadow-[var(--day-inset-shadow)] transition-[transform,box-shadow,border-color,background-color,color] duration-200 ease-out hover:shadow-[var(--day-hover-shadow)] focus-visible:z-10 focus-visible:shadow-[var(--day-hover-shadow)] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--field-focus)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--panel-inner-bg)] sm:min-h-[5.8rem] sm:min-w-0 sm:rounded-[1.15rem] sm:px-3 sm:py-3";

const dayStateClasses = {
  single:
    "border-[color:var(--day-single-border)] bg-[var(--day-single-bg)] text-[color:var(--day-selected-text)] shadow-[var(--day-single-shadow)]",
  start:
    "border-[color:var(--day-start-border)] bg-[var(--day-start-bg)] text-[color:var(--day-selected-text)] shadow-[var(--day-start-shadow)]",
  end:
    "border-[color:var(--day-end-border)] bg-[var(--day-end-bg)] text-[color:var(--day-selected-text)] shadow-[var(--day-end-shadow)]",
  range:
    "border-[color:var(--day-range-border)] bg-[var(--day-range-bg)] text-[color:var(--day-range-text)]",
  today:
    "border-[color:var(--day-today-border)] bg-[var(--day-today-bg)] text-[color:var(--day-today-text)] shadow-[var(--day-today-shadow)]",
  current:
    "border-[color:var(--day-border)] bg-[var(--day-bg)] text-foreground",
  outside:
    "border-[color:var(--day-muted-border)] bg-[var(--day-muted-bg)] text-[color:var(--day-muted-text)]",
};

const selectedChipClass =
  "bg-[var(--day-selected-pill-bg)] text-[color:var(--day-selected-pill-text)]";
const rangeChipClass =
  "bg-[var(--day-range-pill-bg)] text-[color:var(--day-range-pill-text)]";
const todayChipClass =
  "bg-[var(--day-today-pill-bg)] text-[color:var(--day-today-pill-text)]";

const monthContentVariants = {
  enter: (direction: number) => ({
    opacity: 0,
    x: direction > 0 ? 34 : -34,
  }),
  center: {
    opacity: 1,
    x: 0,
    transition: {
      opacity: { duration: 0.24, ease: premiumEase },
      x: { duration: 0.38, ease: premiumEase },
    },
  },
  exit: (direction: number) => ({
    opacity: 0,
    x: direction > 0 ? -26 : 26,
    transition: {
      opacity: { duration: 0.18, ease: premiumEase },
      x: { duration: 0.22, ease: premiumEase },
    },
  }),
};

const monthGridBodyVariants = {
  hidden: {
    opacity: 0,
    y: 8,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.32,
      ease: premiumEase,
      delay: 0.04,
    },
  },
};

const DAY_GRID_COLUMN_COUNT = 7;
const calendarArrowKeyOffsets: Record<string, number> = {
  ArrowLeft: -1,
  ArrowRight: 1,
  ArrowUp: -DAY_GRID_COLUMN_COUNT,
  ArrowDown: DAY_GRID_COLUMN_COUNT,
};

export function CalendarMonthGrid({
  data,
  hasSelection,
  isShowingCurrentMonth,
  isDraggingSelection,
  monthDirection,
  notes,
  reminders,
  selection,
  selectionFeedback,
  onClearSelection,
  onDateSelect,
  onDateSelectionDragEnter,
  onDateSelectionDragStart,
  onShowPreviousMonth,
  onShowNextMonth,
  onReturnToCurrentMonth,
  onSelectThisWeek,
}: CalendarMonthGridProps) {
  const selectionSummary = formatRangeSummary(selection, {
    isPreview: isDraggingSelection,
  });
  const monthHeadingId = `${data.monthKey}-month-heading`;
  const keyboardInstructionsId = `${data.monthKey}-keyboard-instructions`;
  const selectionSummaryId = `${data.monthKey}-selection-summary`;
  const dayButtonRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const preferredKeyboardFocusDateId = useMemo(
    () => getPreferredGridFocusDateId(data.days, selection),
    [data.days, selection],
  );
  const dayIndexById = useMemo(
    () => new Map(data.days.map((day, index) => [day.id, index])),
    [data.days],
  );
  const [keyboardFocusState, setKeyboardFocusState] = useState(() => ({
    dayId: preferredKeyboardFocusDateId,
    monthKey: data.monthKey,
  }));
  const keyboardFocusedDateId =
    keyboardFocusState.monthKey === data.monthKey &&
    keyboardFocusState.dayId &&
    data.days.some((day) => day.id === keyboardFocusState.dayId)
      ? keyboardFocusState.dayId
      : preferredKeyboardFocusDateId;

  const moveKeyboardFocus = useCallback(
    (currentDayId: string, offset: number) => {
      const currentIndex = dayIndexById.get(currentDayId);

      if (currentIndex === undefined) {
        return;
      }

      const nextIndex = clamp(currentIndex + offset, 0, data.days.length - 1);
      const nextDayId = data.days[nextIndex]?.id;
      const nextDayButton = nextDayId ? dayButtonRefs.current[nextDayId] : null;

      if (!nextDayId || !nextDayButton) {
        return;
      }

      setKeyboardFocusState({
        dayId: nextDayId,
        monthKey: data.monthKey,
      });
      nextDayButton.focus();
      nextDayButton.scrollIntoView({
        block: "nearest",
        inline: "nearest",
      });
    },
    [data.days, data.monthKey, dayIndexById],
  );

  const handleDayKeyDown = useCallback(
    (event: KeyboardEvent<HTMLButtonElement>, dayId: string) => {
      const navigationOffset = calendarArrowKeyOffsets[event.key];

      if (navigationOffset) {
        event.preventDefault();
        moveKeyboardFocus(dayId, navigationOffset);
      }
    },
    [moveKeyboardFocus],
  );

  return (
    <motion.section
      aria-label={`Month view for ${data.monthLabel}`}
      aria-describedby={`${keyboardInstructionsId} ${selectionSummaryId}`}
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: premiumEase }}
      className="theme-panel-surface relative overflow-hidden rounded-[1.6rem] border p-4 sm:rounded-[1.9rem] sm:p-6 lg:p-7"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-[linear-gradient(180deg,var(--panel-top-glow),transparent)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-8 top-0 h-4 w-12 rounded-b-full border-x border-b border-[color:var(--panel-border)] bg-[var(--panel-inner-bg)] sm:left-12 sm:h-5 sm:w-14"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute right-8 top-0 h-4 w-12 rounded-b-full border-x border-b border-[color:var(--panel-border)] bg-[var(--panel-inner-bg)] sm:right-12 sm:h-5 sm:w-14"
      />

      <AnimatePresence mode="wait" initial={false} custom={monthDirection}>
        <motion.div
          key={data.monthKey}
          custom={monthDirection}
          variants={monthContentVariants}
          initial="enter"
          animate="center"
          exit="exit"
          className="relative"
        >
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-3">
              <p className="theme-eyebrow">Month View</p>
              <h2
                id={monthHeadingId}
                className="theme-section-title max-w-md text-balance"
              >
                {data.monthLabel}
              </h2>
              <AnimatePresence mode="wait" initial={false}>
                <motion.p
                  key={selectionSummary}
                  id={selectionSummaryId}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.24, ease: premiumEase }}
                  aria-live={isDraggingSelection ? "off" : "polite"}
                  className="theme-section-copy max-w-md text-sm sm:text-[0.96rem]"
                >
                  {selectionSummary}
                </motion.p>
              </AnimatePresence>
              <AnimatePresence initial={false}>
                {isDraggingSelection ? (
                  <motion.span
                    key="drag-selection-active"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.2, ease: premiumEase }}
                    className="theme-pill-strong inline-flex w-fit rounded-full border px-3 py-1 font-mono text-[0.68rem] uppercase tracking-[0.2em]"
                  >
                    Dragging selection
                  </motion.span>
                ) : null}
              </AnimatePresence>
              <p id={keyboardInstructionsId} className="sr-only">
                Use the arrow keys to move between visible dates in the calendar.
                Press Enter or Space to select the focused date. Use Tab to move
                between the calendar controls, date grid, notes, reminders, and
                form inputs.
              </p>
            </div>

            <div className="grid gap-2 sm:justify-items-end">
              <MonthNavigation
                hasSelection={hasSelection}
                isShowingCurrentMonth={isShowingCurrentMonth}
                seasonLabel={data.seasonLabel}
                onClearSelection={onClearSelection}
                onReturnToCurrentMonth={onReturnToCurrentMonth}
                onSelectThisWeek={onSelectThisWeek}
                onShowNextMonth={onShowNextMonth}
                onShowPreviousMonth={onShowPreviousMonth}
              />

              <div className="flex flex-wrap gap-2 font-mono">
                <span className="inline-flex items-center gap-2 rounded-full border border-[color:var(--legend-start-border)] bg-[var(--legend-start-bg)] px-3 py-1 text-[color:var(--legend-start-text)]">
                  <span className="h-2.5 w-2.5 rounded-full bg-[var(--legend-start-dot)]" />
                  Start
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-[color:var(--legend-end-border)] bg-[var(--legend-end-bg)] px-3 py-1 text-[color:var(--legend-end-text)]">
                  <span className="h-2.5 w-2.5 rounded-full bg-[var(--legend-end-dot)]" />
                  End
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-[color:var(--legend-range-border)] bg-[var(--legend-range-bg)] px-3 py-1 text-[color:var(--legend-range-text)]">
                  <span className="h-2.5 w-2.5 rounded-full bg-[var(--legend-range-dot)]" />
                  Range
                </span>
                <span
                  className="inline-flex items-center gap-2 rounded-full border px-3 py-1"
                  style={{
                    borderColor: "var(--day-today-border)",
                    background: "var(--day-today-bg)",
                    color: "var(--day-today-text)",
                  }}
                >
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ background: "var(--day-today-pill-text)" }}
                  />
                  Today
                </span>
                <span
                  className="inline-flex items-center gap-2 rounded-full border px-3 py-1"
                  style={{
                    borderColor: "var(--day-note-indicator)",
                    background: "var(--day-note-badge-bg)",
                    color: "var(--day-note-badge-text)",
                  }}
                >
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ background: "var(--day-note-indicator)" }}
                  />
                  Notes
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-[color:var(--legend-reminder-border)] bg-[var(--legend-reminder-bg)] px-3 py-1 text-[color:var(--legend-reminder-text)]">
                  <span className="h-2.5 w-2.5 rounded-full bg-[var(--legend-reminder-dot)]" />
                  Reminder
                </span>
                <span
                  className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-foreground/80"
                  style={{
                    borderColor: "var(--month-accent-border)",
                    background: "var(--month-accent-soft)",
                  }}
                >
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ background: "var(--month-accent-strong)" }}
                  />
                  Special
                </span>
              </div>
            </div>
          </div>

          <p className="theme-copy-muted mt-5 text-xs leading-5 sm:hidden">
            Swipe horizontally if you need a little more room for the month grid.
          </p>

          <motion.div
            variants={monthGridBodyVariants}
            initial="hidden"
            animate="visible"
            className="-mx-1 mt-3 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:mx-0 sm:mt-7 sm:overflow-visible sm:pb-0"
          >
            <div
              role="group"
              aria-labelledby={monthHeadingId}
              className="min-w-[22.5rem] sm:min-w-0"
            >
              <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
                {data.weekdays.map((weekday, index) => (
                  <motion.div
                    key={weekday.id}
                    aria-label={weekday.label}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      delay: 0.08 + index * 0.02,
                      duration: 0.32,
                      ease: premiumEase,
                    }}
                    className="theme-weekday rounded-[1rem] px-1.5 py-2.5 text-center text-[0.62rem] font-medium uppercase tracking-[0.16em] sm:rounded-2xl sm:px-2 sm:py-3 sm:text-xs sm:tracking-[0.18em]"
                  >
                    <span className="hidden sm:inline">{weekday.label}</span>
                    <span className="sm:hidden">{weekday.compactLabel}</span>
                  </motion.div>
                ))}
              </div>

              <div className="mt-1.5 grid grid-cols-7 gap-1.5 sm:mt-2 sm:gap-2">
                {data.days.map((day, index) => {
                  const rangeState = getDayRangeState(day.id, selection);
                  const noteCount = countNotesForDate(notes, day.id);
                  const reminderCount = countRemindersForDate(reminders, day.id);
                  const hasSpecialDate = Boolean(day.specialDate);
                  const isSelected =
                    rangeState.isRangeStart ||
                    rangeState.isRangeEnd ||
                    rangeState.isInRange;
                  const isRangeEdge =
                    rangeState.isSingleDayRange ||
                    rangeState.isRangeStart ||
                    rangeState.isRangeEnd;
                  const animatedScale = isRangeEdge
                    ? 1.028
                    : rangeState.isInRange || day.isToday
                      ? 1.01
                      : 1;
                  const animatedY =
                    isRangeEdge ? -2 : rangeState.isInRange ? -1 : 0;
                  const idleMarkerClass = [
                    "relative h-2.5 w-2.5 rounded-full transition-colors duration-200 group-hover:bg-[var(--day-note-indicator)]",
                    noteCount > 0
                      ? "bg-[var(--day-note-indicator)]"
                      : day.isCurrentMonth
                        ? "bg-[var(--day-idle-dot)]"
                        : "bg-[var(--day-idle-muted-dot)]",
                  ].join(" ");
                  const noteBadgeClass =
                    rangeState.isSingleDayRange ||
                    rangeState.isRangeStart ||
                    rangeState.isRangeEnd
                      ? selectedChipClass
                      : rangeState.isInRange
                        ? "bg-[var(--day-note-badge-inrange-bg)] text-[color:var(--day-note-badge-inrange-text)]"
                        : "bg-[var(--day-note-badge-bg)] text-[color:var(--day-note-badge-text)]";
                  const reminderBadgeClass =
                    rangeState.isSingleDayRange ||
                    rangeState.isRangeStart ||
                    rangeState.isRangeEnd
                      ? selectedChipClass
                      : rangeState.isInRange
                        ? rangeChipClass
                        : day.isToday
                          ? todayChipClass
                          : "bg-[var(--legend-reminder-bg)] text-[color:var(--legend-reminder-text)]";
                  const dayAppearanceClass =
                    rangeState.isSingleDayRange && rangeState.isRangeStart
                      ? dayStateClasses.single
                      : rangeState.isRangeStart
                        ? dayStateClasses.start
                        : rangeState.isRangeEnd
                          ? dayStateClasses.end
                          : rangeState.isInRange
                            ? dayStateClasses.range
                            : day.isToday
                              ? dayStateClasses.today
                              : day.isCurrentMonth
                                ? dayStateClasses.current
                                : dayStateClasses.outside;
                  const specialDayClass =
                    hasSpecialDate && !isSelected && !day.isToday
                      ? "border-[color:var(--month-accent-border)]"
                      : "";
                  const hasAuxiliaryMarkers =
                    noteCount > 0 || reminderCount > 0 || hasSpecialDate;
                  const auxiliaryHighlightStyle =
                    !isSelected && !day.isToday && (noteCount > 0 || reminderCount > 0)
                      ? {
                          borderColor:
                            reminderCount > 0
                              ? "var(--day-reminder-dot)"
                              : "var(--day-note-indicator)",
                        }
                      : null;

                  return (
                    <motion.button
                      key={day.id}
                      layout
                      type="button"
                      aria-current={day.isToday ? "date" : undefined}
                      aria-label={`${day.ariaLabel}${day.isToday ? ", today" : ""}${day.specialDate ? `, special date: ${day.specialDate.label}` : ""}${isSelected ? ", selected range" : ""}${noteCount > 0 ? `, ${noteCount} note${noteCount === 1 ? "" : "s"}` : ""}${reminderCount > 0 ? `, ${reminderCount} reminder${reminderCount === 1 ? "" : "s"}` : ""}`}
                      aria-pressed={isSelected}
                      aria-keyshortcuts="ArrowLeft ArrowRight ArrowUp ArrowDown Enter Space"
                      initial={{ opacity: 0, y: 12, scale: 0.985 }}
                      animate={{ opacity: 1, y: animatedY, scale: animatedScale }}
                      transition={{
                        opacity: {
                          delay: 0.14 + index * 0.012,
                          duration: 0.28,
                          ease: premiumEase,
                        },
                        y: {
                          type: "spring",
                          stiffness: 320,
                          damping: 26,
                          mass: 0.82,
                        },
                        scale: {
                          type: "spring",
                          stiffness: 320,
                          damping: 24,
                          mass: 0.8,
                        },
                        layout: { duration: 0.24, ease: premiumEase },
                      }}
                      whileHover={{
                        y: animatedY - (day.isCurrentMonth ? 2 : 1),
                        scale:
                          animatedScale + (day.isCurrentMonth ? 0.018 : 0.01),
                      }}
                      whileTap={{ scale: animatedScale * 0.985 }}
                    onPointerDown={(event) => {
                      if (event.pointerType === "mouse" && event.button !== 0) {
                        return;
                      }

                      onDateSelectionDragStart(day.id);
                    }}
                      onFocus={() =>
                        setKeyboardFocusState({
                          dayId: day.id,
                          monthKey: data.monthKey,
                        })
                      }
                      onKeyDown={(event) => handleDayKeyDown(event, day.id)}
                      onPointerEnter={() => onDateSelectionDragEnter(day.id)}
                      onClick={() => onDateSelect(day.id)}
                      ref={(button) => {
                        dayButtonRefs.current[day.id] = button;
                      }}
                      tabIndex={day.id === keyboardFocusedDateId ? 0 : -1}
                      className={[
                        dayBaseClass,
                        dayAppearanceClass,
                        specialDayClass,
                      ].join(" ")}
                    >
                      {auxiliaryHighlightStyle ? (
                        <span
                          aria-hidden="true"
                          className="pointer-events-none absolute inset-[0.3rem] rounded-[0.82rem] border opacity-35 sm:inset-[0.4rem] sm:rounded-[0.95rem]"
                          style={auxiliaryHighlightStyle}
                        />
                      ) : null}

                      {rangeState.isInRange ? (
                        <span
                          aria-hidden="true"
                          className="absolute inset-x-0 top-1/2 h-8 -translate-y-1/2 bg-[var(--day-range-strip)]"
                        />
                      ) : null}

                      <span className="relative text-sm font-semibold tracking-[-0.04em] transition-transform duration-200 group-hover:translate-y-[-1px] sm:text-base">
                        {day.dateNumber}
                      </span>

                      {rangeState.isSingleDayRange && rangeState.isRangeStart ? (
                        <motion.span
                          layout
                          className={`relative self-start rounded-full px-2 py-1 font-mono text-[0.58rem] uppercase tracking-[0.22em] sm:text-[0.62rem] ${selectedChipClass}`}
                        >
                          Start + End
                        </motion.span>
                      ) : rangeState.isRangeStart ? (
                        <motion.span
                          layout
                          className={`relative self-start rounded-full px-2 py-1 font-mono text-[0.58rem] uppercase tracking-[0.22em] sm:text-[0.62rem] ${selectedChipClass}`}
                        >
                          Start
                        </motion.span>
                      ) : rangeState.isRangeEnd ? (
                        <motion.span
                          layout
                          className={`relative self-start rounded-full px-2 py-1 font-mono text-[0.58rem] uppercase tracking-[0.22em] sm:text-[0.62rem] ${selectedChipClass}`}
                        >
                          End
                        </motion.span>
                      ) : rangeState.isInRange ? (
                        <motion.span
                          layout
                          className={`relative self-start rounded-full px-2 py-1 font-mono text-[0.58rem] uppercase tracking-[0.22em] sm:text-[0.62rem] ${rangeChipClass}`}
                        >
                          Range
                        </motion.span>
                      ) : day.isToday ? (
                        <motion.span
                          layout
                          className={`relative self-start rounded-full px-2 py-1 font-mono text-[0.58rem] uppercase tracking-[0.22em] sm:text-[0.62rem] ${todayChipClass}`}
                        >
                          Today
                        </motion.span>
                      ) : null}

                      <motion.div
                        layout
                        className="relative mt-2 flex min-h-5 items-center gap-1.5"
                      >
                        {noteCount > 0 ? (
                          <motion.span
                            layout
                            aria-hidden="true"
                            className={[
                              "inline-flex min-h-5 items-center gap-1 rounded-full px-1.5 py-0.5 font-mono text-[0.54rem]",
                              noteBadgeClass,
                            ].join(" ")}
                          >
                            <span className="h-2 w-2 rounded-full bg-[var(--day-note-indicator)]" />
                            {noteCount > 1 ? <span>{noteCount}</span> : null}
                          </motion.span>
                        ) : null}

                        {reminderCount > 0 ? (
                          <motion.span
                            layout
                            aria-hidden="true"
                            className={[
                              "inline-flex min-h-5 items-center gap-1 rounded-full px-1.5 py-0.5 font-mono text-[0.54rem]",
                              reminderBadgeClass,
                            ].join(" ")}
                          >
                            <span className="h-2 w-2 rounded-full bg-[var(--day-reminder-dot)] shadow-[0_0_0_2px_var(--day-reminder-ring)]" />
                            {reminderCount > 1 ? <span>{reminderCount}</span> : null}
                          </motion.span>
                        ) : null}

                        {day.specialDate && !isSelected && !day.isToday ? (
                          <motion.span
                            layout
                            aria-hidden="true"
                            className="inline-flex min-h-5 items-center gap-1 rounded-full border px-1.5 py-0.5 font-mono text-[0.54rem] text-foreground/80 sm:text-[0.58rem]"
                            style={{
                              borderColor: "var(--month-accent-border)",
                              background: "var(--month-accent-soft)",
                            }}
                          >
                            <span
                              className="h-2 w-2 rounded-full"
                              style={{ background: "var(--month-accent-strong)" }}
                            />
                          </motion.span>
                        ) : null}

                        {!hasAuxiliaryMarkers ? (
                          <motion.span
                            layout
                            aria-hidden="true"
                            className={idleMarkerClass}
                          />
                        ) : null}
                      </motion.div>
                    </motion.button>
                  );
                })}
              </div>
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>

      <CalendarActionFeedback feedback={selectionFeedback} floating />
    </motion.section>
  );
}

function getPreferredGridFocusDateId(
  days: CalendarShellData["days"],
  selection: CalendarRangeSelection,
) {
  const selectedDateId = selection.endDate ?? selection.startDate;

  if (selectedDateId && days.some((day) => day.id === selectedDateId)) {
    return selectedDateId;
  }

  return (
    days.find((day) => day.isToday)?.id ??
    days.find((day) => day.isCurrentMonth)?.id ??
    days[0]?.id ??
    null
  );
}

function clamp(value: number, minimumValue: number, maximumValue: number) {
  return Math.min(Math.max(value, minimumValue), maximumValue);
}
