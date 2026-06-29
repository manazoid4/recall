import { DashboardView } from './components/RouteViews';
import { RecallShell } from './components/RecallShell';

export default function Page() {
  return (
    <RecallShell>
      <DashboardView />
    </RecallShell>
  );
}
