import { ClipboardList, Crown, ShieldAlert, StickyNote } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { ComingSoonPanel } from "@/components/layout/coming-soon-panel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const quickFields = [
  { icon: Crown, label: "Queen spotted", hint: "Toggle + mark color" },
  { icon: ShieldAlert, label: "Mite count", hint: "Alcohol wash / sugar roll" },
  { icon: StickyNote, label: "Brood pattern", hint: "Excellent → poor rating" },
  { icon: ClipboardList, label: "Temperament", hint: "Calm to aggressive" },
];

export default function InspectPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <PageHeader
        eyebrow="Field Work"
        title="Quick Log"
        description="Mobile-first inspection logging for use in the bee yard. Record queen status, mite counts, and notes in under a minute."
      />

      <div className="fade-up-delay-1 mb-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {quickFields.map(({ icon: Icon, label, hint }) => (
          <Card key={label} className="opacity-75">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-wax-200/80">
                  <Icon className="h-4 w-4 text-hive-700" />
                </div>
                <CardTitle className="text-base">{label}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-hive-500">{hint}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <ComingSoonPanel
        icon={ClipboardList}
        title="Field Inspection Form"
        description="The Quick Log form will save directly to Supabase — queen logs, mite counts, and inspection notes in one submission with optimistic updates."
        features={[
          {
            title: "Hive Selector",
            description: "Pick a colony from your apiary with large touch targets for gloved hands.",
          },
          {
            title: "Queen Cell Detection",
            description: "Log virgin queens, laying status, and swarm cell checks in one flow.",
          },
          {
            title: "Offline-Ready",
            description: "Queue inspections when cell service is spotty in rural Oklahoma yards.",
          },
          {
            title: "Auto Alerts",
            description: "High mite counts and missing queens trigger dashboard priority flags.",
          },
        ]}
      />
    </div>
  );
}
