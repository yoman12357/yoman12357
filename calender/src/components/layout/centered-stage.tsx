import type { ReactNode } from "react";

type CenteredStageProps = {
  children: ReactNode;
};

export function CenteredStage({ children }: CenteredStageProps) {
  return (
    <main className="relative flex min-h-screen items-start justify-center overflow-x-hidden px-3 py-5 sm:px-6 sm:py-8 lg:items-center lg:px-8 xl:px-10">
      <div
        aria-hidden="true"
        className="theme-stage-overlay pointer-events-none absolute inset-0"
      />
      <div
        aria-hidden="true"
        className="theme-stage-line pointer-events-none absolute inset-x-0 top-0 h-px"
      />
      <div className="relative w-full max-w-[96rem]">{children}</div>
    </main>
  );
}
