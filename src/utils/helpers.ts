import type { Category, Priority, Status } from "@/types";

export const STATUSES: Status[] = ["Submitted", "Under Review", "Assigned", "In Progress", "Resolved"];
export const PRIORITIES: Priority[] = ["Emergency", "High", "Normal"];
export const CATEGORIES: Category[] = [
  "Damaged Meter",
  "Fallen Pole",
  "Broken Wire",
  "Transformer Issue",
  "Connection Issue",
  "Power Outage",
  "Other",
];

export const DEFAULT_PRIORITY: Record<Category, Priority> = {
  "Damaged Meter": "Normal",
  "Fallen Pole": "Emergency",
  "Broken Wire": "Emergency",
  "Transformer Issue": "High",
  "Connection Issue": "Normal",
  "Power Outage": "High",
  Other: "Normal",
};

export function generateComplaintId(existing: string[]): string {
  const year = new Date().getFullYear();
  let n = existing.length + 1001;
  let id = `PT-${year}-${n}`;
  while (existing.includes(id)) id = `PT-${year}-${++n}`;
  return id;
}

export function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}
export function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

const KEYWORDS: [Category, string[]][] = [
  ["Fallen Pole", ["pole", "fell", "fallen", "leaning"]],
  ["Broken Wire", ["wire", "cable", "spark", "hanging", "snapped"]],
  ["Transformer Issue", ["transformer", "explosion", "humming", "smoke"]],
  ["Damaged Meter", ["meter", "reading", "bill", "display"]],
  ["Power Outage", ["outage", "no power", "blackout", "no electricity", "power cut"]],
  ["Connection Issue", ["connection", "voltage", "fluctuat", "flicker"]],
];

/** Frontend-only simulation of an AI category suggestion. */
export function suggestCategory(text: string): Category | null {
  const t = text.toLowerCase();
  for (const [cat, words] of KEYWORDS) if (words.some((w) => t.includes(w))) return cat;
  return null;
}

export function suggestDescription(category: Category, address: string): string {
  const where = address ? ` near ${address}` : "";
  const map: Record<Category, string> = {
    "Damaged Meter": `The electricity meter${where} appears damaged and is not displaying readings correctly. Please inspect and replace if needed.`,
    "Fallen Pole": `An electric pole${where} has fallen or is leaning dangerously, posing a safety risk to pedestrians and vehicles.`,
    "Broken Wire": `A power line${where} is broken or hanging low. It may be live and is a hazard to residents.`,
    "Transformer Issue": `The local transformer${where} is making unusual noise / emitting smoke and supply in the area is unstable.`,
    "Connection Issue": `Our household connection${where} is experiencing voltage fluctuations and frequent flickering.`,
    "Power Outage": `There has been no electricity${where} for several hours. Neighbouring houses are also affected.`,
    Other: `I would like to report an electricity-related issue${where}. Details are as follows: `,
  };
  return map[category];
}
