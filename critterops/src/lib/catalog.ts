export const JOB_TYPES = [
  { value: "inspection", label: "Inspection" },
  { value: "trapping", label: "Trapping" },
  { value: "exclusion", label: "Exclusion" },
  { value: "removal", label: "Removal" },
  { value: "cleanup", label: "Cleanup" },
  { value: "preventative", label: "Preventative" },
  { value: "recheck", label: "Recheck" },
  { value: "pest_treatment", label: "Pest treatment" },
] as const;

export const JOB_STATUSES = [
  { value: "intake", label: "Intake" },
  { value: "quoted", label: "Quoted" },
  { value: "scheduled", label: "Scheduled" },
  { value: "en_route", label: "En route" },
  { value: "on_site", label: "On site" },
  { value: "follow_up", label: "Follow-up" },
  { value: "completed", label: "Completed" },
  { value: "canceled", label: "Canceled" },
] as const;

export const VISIT_STATUSES = [
  { value: "scheduled", label: "Scheduled" },
  { value: "en_route", label: "En route" },
  { value: "on_site", label: "On site" },
  { value: "completed", label: "Completed" },
  { value: "canceled", label: "Canceled" },
] as const;

export const QUOTE_STATUSES = [
  { value: "draft", label: "Draft" },
  { value: "sent", label: "Sent" },
  { value: "approved", label: "Approved" },
  { value: "declined", label: "Declined" },
  { value: "expired", label: "Expired" },
] as const;

export const REQUEST_STATUSES = [
  { value: "new", label: "New" },
  { value: "assessing", label: "Assessing" },
  { value: "quoted", label: "Quoted" },
  { value: "converted", label: "Converted" },
  { value: "closed", label: "Closed" },
] as const;

export function labelFor(
  items: readonly { value: string; label: string }[],
  value: string
) {
  return items.find((item) => item.value === value)?.label ?? value;
}
