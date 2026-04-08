import { format } from "date-fns";

import type { CalendarTimeZoneInfo } from "@/features/calendar/types/calendar";

const FALLBACK_TIME_ZONE_ID = "UTC";

export function getLocalTimeZoneInfo(
  referenceDate = new Date(),
): CalendarTimeZoneInfo {
  const timeZoneId =
    typeof Intl !== "undefined"
      ? Intl.DateTimeFormat().resolvedOptions().timeZone || FALLBACK_TIME_ZONE_ID
      : FALLBACK_TIME_ZONE_ID;
  const offsetMinutes = -referenceDate.getTimezoneOffset();
  const offsetLabel = formatUtcOffset(offsetMinutes);

  return {
    id: timeZoneId,
    offsetMinutes,
    offsetLabel,
    displayLabel: `${timeZoneId.replaceAll("_", " ")} · ${offsetLabel}`,
  };
}

export function getLocalCalendarDateId(referenceDate = new Date()) {
  return format(referenceDate, "yyyy-MM-dd");
}

function formatUtcOffset(offsetMinutes: number) {
  const direction = offsetMinutes >= 0 ? "+" : "-";
  const absoluteMinutes = Math.abs(offsetMinutes);
  const hours = Math.floor(absoluteMinutes / 60)
    .toString()
    .padStart(2, "0");
  const minutes = (absoluteMinutes % 60).toString().padStart(2, "0");

  return `UTC${direction}${hours}:${minutes}`;
}
