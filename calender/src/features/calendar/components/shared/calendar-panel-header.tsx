import type { ReactNode } from "react";

type CalendarPanelHeaderProps = {
  eyebrow: string;
  title: string;
  description: string;
  aside?: ReactNode;
};

export function CalendarPanelHeader({
  eyebrow,
  title,
  description,
  aside,
}: CalendarPanelHeaderProps) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div className="space-y-3">
        <p className="theme-eyebrow">{eyebrow}</p>
        <h2 className="theme-section-title max-w-2xl text-balance">{title}</h2>
        <p className="theme-section-copy max-w-2xl text-sm sm:text-[0.96rem]">
          {description}
        </p>
      </div>
      {aside ? aside : null}
    </div>
  );
}
