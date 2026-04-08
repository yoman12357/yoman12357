import {
  addDays,
  endOfMonth,
  format,
  isWithinInterval,
  parseISO,
  startOfMonth,
  subDays,
} from "date-fns";

import type {
  CalendarMonthPalette,
  CalendarSpecialDate,
} from "@/features/calendar/types/calendar";

type CalendarSeasonPresentation = {
  months: number[];
  seasonLabel: string;
  palette: CalendarMonthPalette;
  monthStory: string;
};

type CalendarSpecialDateDefinition = {
  id: string;
  label: string;
  shortLabel: string;
  kind: CalendarSpecialDate["kind"];
  resolveDate: (year: number) => Date;
};

const SEASON_PRESENTATIONS: CalendarSeasonPresentation[] = [
  {
    months: [2, 3, 4],
    seasonLabel: "Spring editorial",
    monthStory:
      "Soft greens and sun-washed neutrals give the wall-calendar layout a fresh, gallery-like calm.",
    palette: {
      name: "Studio spring",
      accentStrong: "#14b8a6",
      accentBorder: "rgba(20, 184, 166, 0.26)",
      accentSoft: "rgba(20, 184, 166, 0.12)",
      accentGlow: "rgba(45, 212, 191, 0.22)",
      shellGlow:
        "radial-gradient(circle at top right, rgba(45, 212, 191, 0.16), transparent 32%), radial-gradient(circle at bottom left, rgba(251, 191, 36, 0.08), transparent 28%)",
      heroTint:
        "linear-gradient(180deg, rgba(255, 255, 255, 0.05), rgba(20, 184, 166, 0.12))",
      imageFilter: "saturate(1.04) hue-rotate(-6deg)",
    },
  },
  {
    months: [5, 6, 7],
    seasonLabel: "Summer glow",
    monthStory:
      "Warmer highlights and brighter contrast make the calendar feel sunlit without losing its restraint.",
    palette: {
      name: "Gallery summer",
      accentStrong: "#f97316",
      accentBorder: "rgba(249, 115, 22, 0.26)",
      accentSoft: "rgba(249, 115, 22, 0.13)",
      accentGlow: "rgba(251, 146, 60, 0.22)",
      shellGlow:
        "radial-gradient(circle at top right, rgba(251, 146, 60, 0.16), transparent 34%), radial-gradient(circle at bottom left, rgba(56, 189, 248, 0.08), transparent 26%)",
      heroTint:
        "linear-gradient(180deg, rgba(255, 255, 255, 0.04), rgba(249, 115, 22, 0.12))",
      imageFilter: "saturate(1.08) hue-rotate(4deg)",
    },
  },
  {
    months: [8, 9, 10],
    seasonLabel: "Autumn studio",
    monthStory:
      "Amber edges and deeper paper shadows give the wall calendar a richer, collector-print presence.",
    palette: {
      name: "Editorial autumn",
      accentStrong: "#b45309",
      accentBorder: "rgba(180, 83, 9, 0.26)",
      accentSoft: "rgba(245, 158, 11, 0.13)",
      accentGlow: "rgba(245, 158, 11, 0.22)",
      shellGlow:
        "radial-gradient(circle at top right, rgba(245, 158, 11, 0.16), transparent 34%), radial-gradient(circle at bottom left, rgba(217, 119, 6, 0.1), transparent 28%)",
      heroTint:
        "linear-gradient(180deg, rgba(255, 255, 255, 0.04), rgba(180, 83, 9, 0.12))",
      imageFilter: "saturate(1.02) sepia(0.08) hue-rotate(-10deg)",
    },
  },
  {
    months: [11, 0, 1],
    seasonLabel: "Winter light",
    monthStory:
      "Cooler blue accents make the paper surfaces feel crisp and premium, like a winter editorial spread.",
    palette: {
      name: "Quiet winter",
      accentStrong: "#3b82f6",
      accentBorder: "rgba(59, 130, 246, 0.26)",
      accentSoft: "rgba(59, 130, 246, 0.12)",
      accentGlow: "rgba(96, 165, 250, 0.22)",
      shellGlow:
        "radial-gradient(circle at top right, rgba(96, 165, 250, 0.16), transparent 34%), radial-gradient(circle at bottom left, rgba(59, 130, 246, 0.08), transparent 26%)",
      heroTint:
        "linear-gradient(180deg, rgba(255, 255, 255, 0.04), rgba(59, 130, 246, 0.12))",
      imageFilter: "saturate(0.98) hue-rotate(10deg)",
    },
  },
];

const SPECIAL_DATE_DEFINITIONS: CalendarSpecialDateDefinition[] = [
  {
    id: "new-years-day",
    label: "New Year's Day",
    shortLabel: "New",
    kind: "holiday",
    resolveDate: (year) => new Date(year, 0, 1),
  },
  {
    id: "mlk-day",
    label: "Martin Luther King Jr. Day",
    shortLabel: "MLK",
    kind: "observance",
    resolveDate: (year) => getNthWeekdayOfMonth(year, 0, 1, 3),
  },
  {
    id: "valentines-day",
    label: "Valentine's Day",
    shortLabel: "Love",
    kind: "observance",
    resolveDate: (year) => new Date(year, 1, 14),
  },
  {
    id: "presidents-day",
    label: "Presidents' Day",
    shortLabel: "USA",
    kind: "holiday",
    resolveDate: (year) => getNthWeekdayOfMonth(year, 1, 1, 3),
  },
  {
    id: "spring-equinox",
    label: "Spring Equinox",
    shortLabel: "Vern",
    kind: "observance",
    resolveDate: (year) => new Date(year, 2, 20),
  },
  {
    id: "earth-day",
    label: "Earth Day",
    shortLabel: "Earth",
    kind: "observance",
    resolveDate: (year) => new Date(year, 3, 22),
  },
  {
    id: "mothers-day",
    label: "Mother's Day",
    shortLabel: "Mom",
    kind: "observance",
    resolveDate: (year) => getNthWeekdayOfMonth(year, 4, 0, 2),
  },
  {
    id: "memorial-day",
    label: "Memorial Day",
    shortLabel: "Honor",
    kind: "holiday",
    resolveDate: (year) => getLastWeekdayOfMonth(year, 4, 1),
  },
  {
    id: "summer-solstice",
    label: "Summer Solstice",
    shortLabel: "Sun",
    kind: "observance",
    resolveDate: (year) => new Date(year, 5, 21),
  },
  {
    id: "independence-day",
    label: "Independence Day",
    shortLabel: "USA",
    kind: "holiday",
    resolveDate: (year) => new Date(year, 6, 4),
  },
  {
    id: "perseid-peak",
    label: "Perseid Meteor Peak",
    shortLabel: "Sky",
    kind: "observance",
    resolveDate: (year) => new Date(year, 7, 12),
  },
  {
    id: "labor-day",
    label: "Labor Day",
    shortLabel: "Work",
    kind: "holiday",
    resolveDate: (year) => getNthWeekdayOfMonth(year, 8, 1, 1),
  },
  {
    id: "autumn-equinox",
    label: "Autumn Equinox",
    shortLabel: "Fall",
    kind: "observance",
    resolveDate: (year) => new Date(year, 8, 22),
  },
  {
    id: "halloween",
    label: "Halloween",
    shortLabel: "Night",
    kind: "holiday",
    resolveDate: (year) => new Date(year, 9, 31),
  },
  {
    id: "veterans-day",
    label: "Veterans Day",
    shortLabel: "Honor",
    kind: "holiday",
    resolveDate: (year) => new Date(year, 10, 11),
  },
  {
    id: "thanksgiving",
    label: "Thanksgiving",
    shortLabel: "THX",
    kind: "holiday",
    resolveDate: (year) => getNthWeekdayOfMonth(year, 10, 4, 4),
  },
  {
    id: "christmas-eve",
    label: "Christmas Eve",
    shortLabel: "Eve",
    kind: "holiday",
    resolveDate: (year) => new Date(year, 11, 24),
  },
  {
    id: "christmas-day",
    label: "Christmas Day",
    shortLabel: "Xmas",
    kind: "holiday",
    resolveDate: (year) => new Date(year, 11, 25),
  },
  {
    id: "new-years-eve",
    label: "New Year's Eve",
    shortLabel: "NYE",
    kind: "holiday",
    resolveDate: (year) => new Date(year, 11, 31),
  },
];

export function getCalendarMonthPresentation(referenceDate: Date) {
  return (
    SEASON_PRESENTATIONS.find((presentation) =>
      presentation.months.includes(referenceDate.getMonth()),
    ) ?? SEASON_PRESENTATIONS[0]
  );
}

export function getCalendarSpecialDateMap(interval: {
  start: Date;
  end: Date;
}) {
  const years = Array.from(
    new Set([interval.start.getFullYear(), interval.end.getFullYear()]),
  );
  const specialDates = years.flatMap((year) =>
    SPECIAL_DATE_DEFINITIONS.map((definition) =>
      buildCalendarSpecialDate(definition, year),
    ),
  ).filter((specialDate) =>
    isWithinInterval(parseISO(specialDate.dateId), interval),
  );

  return new Map(specialDates.map((specialDate) => [specialDate.dateId, specialDate]));
}

function buildCalendarSpecialDate(
  definition: CalendarSpecialDateDefinition,
  year: number,
): CalendarSpecialDate {
  const date = definition.resolveDate(year);
  const dateId = format(date, "yyyy-MM-dd");

  return {
    id: `${definition.id}-${dateId}`,
    dateId,
    label: definition.label,
    shortLabel: definition.shortLabel,
    dateLabel: format(date, "MMM d"),
    kind: definition.kind,
  };
}

function getNthWeekdayOfMonth(
  year: number,
  monthIndex: number,
  weekday: number,
  occurrence: number,
) {
  const monthStart = startOfMonth(new Date(year, monthIndex, 1));
  const weekdayOffset = (weekday - monthStart.getDay() + 7) % 7;

  return addDays(monthStart, weekdayOffset + (occurrence - 1) * 7);
}

function getLastWeekdayOfMonth(
  year: number,
  monthIndex: number,
  weekday: number,
) {
  const monthEnd = endOfMonth(new Date(year, monthIndex, 1));
  const weekdayOffset = (monthEnd.getDay() - weekday + 7) % 7;

  return subDays(monthEnd, weekdayOffset);
}
