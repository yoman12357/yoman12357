type MonthNavigationProps = {
  hasSelection: boolean;
  isShowingCurrentMonth: boolean;
  seasonLabel: string;
  onClearSelection: () => void;
  onSelectThisWeek: () => void;
  onShowPreviousMonth: () => void;
  onShowNextMonth: () => void;
  onReturnToCurrentMonth: () => void;
};

export function MonthNavigation({
  hasSelection,
  isShowingCurrentMonth,
  seasonLabel,
  onClearSelection,
  onSelectThisWeek,
  onShowPreviousMonth,
  onShowNextMonth,
  onReturnToCurrentMonth,
}: MonthNavigationProps) {
  return (
    <div
      role="toolbar"
      aria-label="Calendar month controls"
      className="grid gap-2.5 sm:justify-items-end"
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className="theme-pill rounded-full border px-4 py-2 font-mono text-[0.7rem] uppercase tracking-[0.18em] text-muted">
          {seasonLabel}
        </span>
        <div className="flex items-center gap-2">
          <button
            aria-label="Show previous month"
            className="theme-secondary-button inline-flex h-10 w-10 items-center justify-center rounded-full border"
            onClick={onShowPreviousMonth}
            type="button"
          >
            <ChevronLeftIcon />
          </button>
          <button
            className="theme-secondary-button inline-flex min-h-10 items-center justify-center rounded-full border px-4 py-2 text-xs font-medium uppercase tracking-[0.16em] disabled:opacity-55"
            disabled={isShowingCurrentMonth}
            onClick={onReturnToCurrentMonth}
            type="button"
          >
            Today
          </button>
          <button
            aria-label="Show next month"
            className="theme-secondary-button inline-flex h-10 w-10 items-center justify-center rounded-full border"
            onClick={onShowNextMonth}
            type="button"
          >
            <ChevronRightIcon />
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 sm:justify-end">
        <button
          className="theme-secondary-button inline-flex min-h-10 items-center justify-center rounded-full border px-4 py-2 text-xs font-medium uppercase tracking-[0.16em]"
          onClick={onSelectThisWeek}
          type="button"
        >
          Select This Week
        </button>
        <button
          className="theme-secondary-button inline-flex min-h-10 items-center justify-center rounded-full border px-4 py-2 text-xs font-medium uppercase tracking-[0.16em] disabled:opacity-55"
          disabled={!hasSelection}
          onClick={onClearSelection}
          type="button"
        >
          Clear Selection
        </button>
      </div>
    </div>
  );
}

function ChevronLeftIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-4 w-4"
      fill="none"
      viewBox="0 0 24 24"
    >
      <path
        d="M14.5 5.75 8.25 12l6.25 6.25"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}

function ChevronRightIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-4 w-4"
      fill="none"
      viewBox="0 0 24 24"
    >
      <path
        d="M9.5 5.75 15.75 12 9.5 18.25"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}
