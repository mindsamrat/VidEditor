import { TopBar } from "@/components/dashboard/TopBar";
import { CreateSeriesWizard } from "./WizardClient";

export default function CreateSeriesPage() {
  return (
    <>
      <TopBar title="Create new series" subtitle="One theme. We post on it forever." />
      <CreateSeriesWizard />
    </>
  );
}
