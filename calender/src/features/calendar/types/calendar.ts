export type CalendarWeekday = {
  id: string;
  label: string;
  compactLabel: string;
};

export type CalendarSpecialDate = {
  id: string;
  dateId: string;
  label: string;
  shortLabel: string;
  dateLabel: string;
  kind: "holiday" | "observance";
};

export type CalendarMonthPalette = {
  name: string;
  accentStrong: string;
  accentBorder: string;
  accentSoft: string;
  accentGlow: string;
  shellGlow: string;
  heroTint: string;
  imageFilter: string;
};

export type CalendarDayCell = {
  id: string;
  dateNumber: string;
  ariaLabel: string;
  isCurrentMonth: boolean;
  isToday: boolean;
  specialDate: CalendarSpecialDate | null;
};

export type CalendarRangeSelection = {
  startDate: string | null;
  endDate: string | null;
};

export type CalendarDayRangeState = {
  isRangeStart: boolean;
  isRangeEnd: boolean;
  isInRange: boolean;
  isSingleDayRange: boolean;
};

export type CalendarCompletedRange = {
  startDate: string;
  endDate: string;
};

export type CalendarTimeZoneInfo = {
  id: string;
  offsetMinutes: number;
  offsetLabel: string;
  displayLabel: string;
};

export type CalendarNote = {
  id: string;
  startDate: string;
  endDate: string;
  content: string;
  createdAt: string;
  updatedAt: string;
};

export type CalendarReminder = {
  id: string;
  startDate: string;
  endDate: string;
  triggerDate: string;
  message: string;
  createdAt: string;
  updatedAt: string;
  notifiedAt: string | null;
  timeZoneId?: string;
  timeZoneLabel?: string;
  timeZoneOffsetMinutes?: number;
};

export type BrowserNotificationStatus =
  | "default"
  | "denied"
  | "granted"
  | "unsupported"
  | "unknown";

export type CalendarFeedbackTone = "success" | "error";

export type CalendarFeedback = {
  message: string;
  tone: CalendarFeedbackTone;
};

export type CalendarShellData = {
  referenceDate: string;
  monthKey: string;
  currentDateLabel: string;
  monthLabel: string;
  focusLabel: string;
  seasonLabel: string;
  monthStory: string;
  featuredDates: CalendarSpecialDate[];
  palette: CalendarMonthPalette;
  weekdays: CalendarWeekday[];
  days: CalendarDayCell[];
};
