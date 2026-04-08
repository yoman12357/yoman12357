import {
  addDays,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameMonth,
  isToday,
  startOfMonth,
  startOfWeek,
} from "date-fns";

import {
  getCalendarMonthPresentation,
  getCalendarSpecialDateMap,
} from "@/features/calendar/utils/calendar-month-presentation";
import type { CalendarShellData } from "@/features/calendar/types/calendar";

const WEEK_STARTS_ON = 0;

export function getCalendarShellData(
  referenceDate = new Date(),
): CalendarShellData {
  const monthStart = startOfMonth(referenceDate);
  const monthEnd = endOfMonth(referenceDate);
  const gridStart = startOfWeek(monthStart, { weekStartsOn: WEEK_STARTS_ON });
  const gridEnd = endOfWeek(monthEnd, { weekStartsOn: WEEK_STARTS_ON });
  const monthPresentation = getCalendarMonthPresentation(referenceDate);
  const specialDatesById = getCalendarSpecialDateMap({
    start: gridStart,
    end: gridEnd,
  });

  const weekdays = Array.from({ length: 7 }, (_, index) => {
    const day = addDays(gridStart, index);

    return {
      id: format(day, "EEEE"),
      label: format(day, "EEE"),
      compactLabel: format(day, "EEEEE"),
    };
  });

  const days = eachDayOfInterval({ start: gridStart, end: gridEnd }).map(
    (day) => ({
      id: format(day, "yyyy-MM-dd"),
      dateNumber: format(day, "d"),
      ariaLabel: format(day, "MMMM d, yyyy"),
      isCurrentMonth: isSameMonth(day, referenceDate),
      isToday: isToday(day),
      specialDate: specialDatesById.get(format(day, "yyyy-MM-dd")) ?? null,
    }),
  );
  const featuredDates = days
    .flatMap((day) =>
      day.isCurrentMonth && day.specialDate ? [day.specialDate] : [],
    )
    .slice(0, 3);

  return {
    referenceDate: format(referenceDate, "yyyy-MM-dd"),
    monthKey: format(referenceDate, "yyyy-MM"),
    currentDateLabel: format(new Date(), "'Today -' EEEE, MMMM d"),
    monthLabel: format(referenceDate, "MMMM yyyy"),
    focusLabel: format(referenceDate, "MMMM yyyy"),
    seasonLabel: monthPresentation.seasonLabel,
    monthStory: monthPresentation.monthStory,
    featuredDates,
    palette: monthPresentation.palette,
    weekdays,
    days,
  };
}
