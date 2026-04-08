"use client";

import { AnimatePresence, motion } from "framer-motion";

import { CalendarMonthGrid } from "@/features/calendar/components/calendar-month-grid";
import { CalendarNotesPanel } from "@/features/calendar/components/calendar-notes-panel";
import { CalendarReminderAlerts } from "@/features/calendar/components/calendar-reminder-alerts";
import { CalendarRemindersPanel } from "@/features/calendar/components/calendar-reminders-panel";
import { WallCalendarHero } from "@/features/calendar/components/wall-calendar-hero";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { useCalendarShellState } from "@/features/calendar/hooks/use-calendar-shell-state";
import { premiumEase } from "@/features/calendar/utils/motion";
import type { CalendarShellData } from "@/features/calendar/types/calendar";

type CalendarShellProps = {
  preview: CalendarShellData;
};

const shellPanelVariants = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.48, ease: premiumEase },
  },
};

const monthSurfaceVariants = {
  enter: (direction: number) => ({
    opacity: 0,
    x: direction > 0 ? 34 : -34,
    scale: 0.985,
  }),
  center: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: { duration: 0.42, ease: premiumEase },
  },
  exit: (direction: number) => ({
    opacity: 0,
    x: direction > 0 ? -28 : 28,
    scale: 0.988,
    transition: { duration: 0.28, ease: premiumEase },
  }),
};

export function CalendarShell({ preview }: CalendarShellProps) {
  const {
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
    hasSelection,
    isDraggingSelection,
    isShowingCurrentMonth,
    monthDirection,
    localTimeZone,
    notes,
    notificationStatus,
    reminders,
    selectionFeedback,
    selection,
    shellAccentStyle,
  } = useCalendarShellState({
    initialReferenceDate: preview.referenceDate,
  });

  return (
    <motion.section
      initial={{ opacity: 0, y: 28, scale: 0.985 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.72, ease: premiumEase }}
      style={shellAccentStyle}
      className="theme-shell-surface relative rounded-[1.8rem] border backdrop-blur-2xl sm:rounded-[2.3rem]"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden rounded-[1.8rem] sm:rounded-[2.3rem]"
      >
        <div className="theme-shell-overlay absolute inset-0" />
        <div
          className="absolute inset-0 opacity-90"
          style={{ background: "var(--month-accent-shell-glow)" }}
        />
        <div
          className="absolute -left-20 bottom-10 h-52 w-52 rounded-full blur-3xl"
          style={{ background: "var(--month-accent-glow)" }}
        />
        <div
          className="absolute -right-20 top-20 h-56 w-56 rounded-full blur-3xl"
          style={{ background: "var(--month-accent-glow)" }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.18, duration: 0.42, ease: premiumEase }}
        className="absolute right-4 top-4 z-20 sm:right-5 sm:top-5"
      >
        <ThemeToggle />
      </motion.div>

      <div className="relative grid gap-4 p-3.5 pt-[4.7rem] sm:gap-5 sm:p-6 sm:pt-[5rem] lg:grid-cols-[0.92fr_1.08fr] lg:gap-6 lg:p-7 lg:pt-[5.15rem] lg:items-start">
        <motion.div
          initial={{ opacity: 0, x: -24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.08, duration: 0.55, ease: premiumEase }}
          className="min-w-0"
        >
          <AnimatePresence mode="wait" initial={false} custom={monthDirection}>
            <motion.div
              key={`hero-${calendarData.monthKey}`}
              custom={monthDirection}
              variants={monthSurfaceVariants}
              initial="enter"
              animate="center"
              exit="exit"
            >
              <WallCalendarHero
                data={calendarData}
                isCurrentMonth={isShowingCurrentMonth}
                onReturnToCurrentMonth={handleReturnToCurrentMonth}
              />
            </motion.div>
          </AnimatePresence>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.14, duration: 0.55, ease: premiumEase }}
          className="min-w-0 lg:col-start-2"
        >
          <motion.div
            initial="hidden"
            animate="visible"
            transition={{ staggerChildren: 0.08, delayChildren: 0.08 }}
            className="grid min-w-0 gap-5"
          >
            {activeReminderAlerts.length > 0 ? (
              <motion.div variants={shellPanelVariants}>
                <CalendarReminderAlerts
                  alerts={activeReminderAlerts}
                  onDismiss={handleDismissReminderAlert}
                />
              </motion.div>
            ) : null}

            <motion.div variants={shellPanelVariants}>
              <CalendarMonthGrid
                data={calendarData}
                hasSelection={hasSelection}
                isShowingCurrentMonth={isShowingCurrentMonth}
                isDraggingSelection={isDraggingSelection}
                monthDirection={monthDirection}
                notes={notes}
                reminders={reminders}
                selection={displaySelection}
                selectionFeedback={selectionFeedback}
                onClearSelection={handleClearSelection}
                onDateSelect={handleDateSelect}
                onDateSelectionDragEnter={handleSelectionDragEnter}
                onDateSelectionDragStart={handleSelectionDragStart}
                onReturnToCurrentMonth={handleReturnToCurrentMonth}
                onSelectThisWeek={handleSelectThisWeek}
                onShowNextMonth={handleShowNextMonth}
                onShowPreviousMonth={handleShowPreviousMonth}
              />
            </motion.div>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18, duration: 0.55, ease: premiumEase }}
          className="min-w-0 lg:col-span-2"
        >
          <motion.div variants={shellPanelVariants}>
            <CalendarNotesPanel
              notes={notes}
              selection={selection}
              onCreateNote={handleCreateNote}
              onDeleteNote={handleDeleteNote}
              onUpdateNote={handleUpdateNote}
            />
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.55, ease: premiumEase }}
          className="min-w-0 lg:col-span-2"
        >
          <motion.div variants={shellPanelVariants}>
            <CalendarRemindersPanel
              localTimeZone={localTimeZone}
              reminders={reminders}
              selection={selection}
              notificationStatus={notificationStatus}
              onCreateReminder={handleCreateReminder}
              onDeleteReminder={handleDeleteReminder}
            />
          </motion.div>
        </motion.div>
      </div>
    </motion.section>
  );
}
