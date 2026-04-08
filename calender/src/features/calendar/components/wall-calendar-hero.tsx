import { memo } from "react";
import Image from "next/image";

import type { CalendarShellData } from "@/features/calendar/types/calendar";
import { CALENDAR_HERO_IMAGE_SRC } from "@/features/calendar/utils/calendar-hero-image";

type WallCalendarHeroProps = {
  data: CalendarShellData;
  isCurrentMonth: boolean;
  onReturnToCurrentMonth: () => void;
};

export const WallCalendarHero = memo(function WallCalendarHero({
  data,
  isCurrentMonth,
  onReturnToCurrentMonth,
}: WallCalendarHeroProps) {
  return (
    <section className="theme-hero-surface relative flex h-full flex-col overflow-hidden rounded-[1.6rem] border p-4 sm:rounded-[1.9rem] sm:p-6 lg:p-7">
      <div
        aria-hidden="true"
        className="theme-hero-overlay pointer-events-none absolute inset-0"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-90"
        style={{ background: "var(--month-accent-hero-tint)" }}
      />

      <div className="relative space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="theme-pill inline-flex rounded-full border px-3 py-1 font-mono text-[0.68rem] uppercase tracking-[0.22em]">
            Wall Calendar
          </span>
          <span
            className="inline-flex rounded-full border px-3 py-1 font-mono text-[0.68rem] uppercase tracking-[0.22em] text-foreground/85"
            style={{
              borderColor: "var(--month-accent-border)",
              background: "var(--month-accent-soft)",
            }}
          >
            {data.seasonLabel}
          </span>
        </div>
        <h1 className="theme-section-title max-w-lg text-balance">
          A tactile month view with the calm feel of a physical calendar.
        </h1>
        <p className="theme-section-copy max-w-xl text-sm sm:text-base">
          A clean hero image and a structured month grid share the same visual
          rhythm, giving the layout a gallery-like balance on desktop and a
          relaxed stacked flow on mobile.
        </p>
      </div>

      <div className="relative mt-7 grow">
        <div className="relative mx-auto max-w-[28rem] sm:max-w-[31rem]">
          <div
            aria-hidden="true"
            className="theme-hero-glow absolute left-1/2 top-2 h-7 w-40 -translate-x-1/2 rounded-full blur-xl"
          />
          <div
            aria-hidden="true"
            className="absolute inset-x-14 top-4 flex items-center justify-between"
          >
            <span className="theme-hero-pin h-3.5 w-3.5 rounded-full border" />
            <span className="theme-hero-pin h-3.5 w-3.5 rounded-full border" />
          </div>
          <div className="theme-hero-frame overflow-hidden rounded-[1.45rem] border p-2.5 shadow-[0_30px_80px_rgba(15,23,42,0.16)] sm:rounded-[1.7rem] sm:p-3">
            <Image
              alt="Illustration of a hanging wall calendar with a scenic image and monthly layout."
              className="h-auto w-full rounded-[1.35rem]"
              height={960}
              priority
              sizes="(min-width: 1024px) 38vw, 100vw"
              style={{ filter: data.palette.imageFilter }}
              src={CALENDAR_HERO_IMAGE_SRC}
              width={800}
            />
          </div>
        </div>
      </div>

      <div className="relative mt-6 grid gap-3">
        <div className="grid gap-3 sm:grid-cols-[0.78fr_1.22fr]">
          <div className="theme-hero-info rounded-[1.4rem] border px-4 py-3">
            <p className="theme-eyebrow text-[0.65rem]">Showing</p>
            <p className="mt-2 text-lg font-semibold tracking-[-0.03em]">
              {data.focusLabel}
            </p>
          </div>
          <div className="theme-hero-info rounded-[1.4rem] border px-4 py-3">
            <p className="theme-eyebrow text-[0.65rem]">Current Date</p>
            <p className="mt-2 text-sm leading-6 text-foreground/80">
              {data.currentDateLabel}
            </p>
          </div>
        </div>

        <div
          className="rounded-[1.4rem] border px-4 py-4"
          style={{
            borderColor: "var(--month-accent-border)",
            background:
              "linear-gradient(180deg, var(--month-accent-soft), transparent 140%)",
          }}
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="theme-eyebrow text-[0.65rem]">Curated Mood</p>
              <p className="mt-2 text-base font-semibold tracking-[-0.03em]">
                {data.palette.name}
              </p>
            </div>

            {!isCurrentMonth ? (
              <button
                className="theme-secondary-button inline-flex min-h-10 items-center justify-center rounded-full border px-4 py-2 text-xs font-medium uppercase tracking-[0.16em]"
                onClick={onReturnToCurrentMonth}
                type="button"
              >
                Back To Today
              </button>
            ) : null}
          </div>

          <p className="mt-3 text-sm leading-6 text-foreground/80">
            {data.monthStory}
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
            {data.featuredDates.map((featuredDate) => (
              <div
                key={featuredDate.id}
                className="inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs text-foreground/85"
                style={{
                  borderColor: "var(--month-accent-border)",
                  background: "rgba(255,255,255,0.5)",
                }}
              >
                <span className="font-mono uppercase tracking-[0.18em] text-muted">
                  {featuredDate.dateLabel}
                </span>
                <span>{featuredDate.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
});
