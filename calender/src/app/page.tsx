import { CenteredStage } from "@/components/layout/centered-stage";
import { CalendarShell } from "@/features/calendar/components/calendar-shell";
import { getCalendarShellData } from "@/features/calendar/utils/get-calendar-shell-data";

export default function Home() {
  const preview = getCalendarShellData();

  return (
    <CenteredStage>
      <CalendarShell preview={preview} />
    </CenteredStage>
  );
}
