import { clsx, type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function clientName(client: {
  firstName: string;
  lastName: string;
  companyName?: string | null;
}) {
  const person = `${client.firstName} ${client.lastName}`.trim();
  return client.companyName ? `${client.companyName} · ${person}` : person;
}

export function propertyLine(property: {
  address1: string;
  city: string;
  state: string;
  zip: string;
}) {
  return `${property.address1}, ${property.city}, ${property.state} ${property.zip}`;
}

export function formatDateTime(value: Date | string) {
  const date = typeof value === "string" ? new Date(value) : value;
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

export function formatDate(value: Date | string) {
  const date = typeof value === "string" ? new Date(value) : value;
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}
