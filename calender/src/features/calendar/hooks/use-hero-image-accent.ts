"use client";

import { useEffect, useMemo, useState } from "react";

import {
  extractCalendarImageAccent,
  getCalendarAccentTokens,
} from "@/features/calendar/utils/calendar-image-accent";
import type { CalendarMonthPalette } from "@/features/calendar/types/calendar";

type UseHeroImageAccentParams = {
  fallbackPalette: CalendarMonthPalette;
  imageFilter?: string;
  imageSource: string;
};

export function useHeroImageAccent({
  fallbackPalette,
  imageFilter,
  imageSource,
}: UseHeroImageAccentParams) {
  const [imageAccentHex, setImageAccentHex] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    void extractCalendarImageAccent({ imageFilter, imageSource }).then((accent) => {
      if (isMounted) {
        setImageAccentHex(accent);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [imageFilter, imageSource]);

  return useMemo(
    () => getCalendarAccentTokens(fallbackPalette, imageAccentHex),
    [fallbackPalette, imageAccentHex],
  );
}
