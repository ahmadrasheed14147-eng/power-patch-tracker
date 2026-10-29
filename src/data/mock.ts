import type { Complaint, Notification, User, Status, HistoryEntry } from "@/types";

export const SEED_USERS: User[] = [
  { id: "u-c1", name: "Sara Khan", email: "consumer@powertrack.demo", phone: "+1 555 0101", role: "consumer", area: "Green Park", active: true },
  { id: "u-c2", name: "Bilal Ahmed", email: "bilal@example.com", phone: "+1 555 0102", role: "consumer", area: "Riverside", active: true },
  { id: "u-c3", name: "Maria Lopez", email: "maria@example.com", phone: "+1 555 0103", role: "consumer", area: "Old Town", active: true },
  { id: "u-a1", name: "Daniel Reed", email: "admin@powertrack.demo", phone: "+1 555 0200", role: "admin", active: true },
  { id: "u-w1", name: "Omar Farooq", email: "worker@powertrack.demo", phone: "+1 555 0301", role: "worker", area: "Green Park", active: true },
  { id: "u-w2", name: "Lena Brooks", email: "lena@powertrack.demo", phone: "+1 555 0302", role: "worker", area: "Riverside", active: true },
  { id: "u-w3", name: "Hassan Ali", email: "hassan@powertrack.demo", phone: "+1 555 0303", role: "worker", area: "Old Town", active: false },
];

const day = 86400000;
const BASE = Date.UTC(2026, 9, 28, 9, 0);
const ago = (d: number, h = 0) => new Date(BASE - d * day - h * 3600000).toISOString();

function hist(statuses: Status[], start: number, by = "System"): HistoryEntry[] {
  return statuses.map((s, i) => ({
    status: s,
    at: ago(start - i * 0.5),
    by: s === "Submitted" ? "Consumer" : s === "In Progress" || s === "Resolved" ? "Field Worker" : by,
  }));
}

const IMG = (q: string) => `https://images.unsplash.com/${q}?w=600&q=60`;

type Seed = Omit<Complaint, "history" | "notes" | "evidence" | "images" | "progress" | "updatedAt"> &
  Partial<Complaint>;

const seeds: Seed[] = [
  { id: "PT-2026-1001", title: "Live wire hanging over street", description: "A wire snapped during last night's storm and is hanging just above the road near the bus stop. Sparks visible.", category: "Broken Wire", priority: "Emergency", status: "In Progress", address: "14 Elm Street, Green Park", consumerId: "u-c1", workerId: "u-w1", createdAt: ago(3) },
  { id: "PT-2026-1002", title: "Meter display blank", description: "My electricity meter display has been blank for two days.", category: "Damaged Meter", priority: "Normal", status: "Resolved", address: "22 Oak Avenue, Green Park", consumerId: "u-c1", workerId: "u-w1", createdAt: ago(12) },
  { id: "PT-2026-1003", title: "Frequent voltage drops", description: "Lights dim several times per evening and appliances switch off.", category: "Connection Issue", priority: "Normal", status: "Under Review", address: "14 Elm Street, Green Park", consumerId: "u-c1", createdAt: ago(1) },
  { id: "PT-2026-1004", title: "Transformer smoking", description: "The transformer at the corner is emitting smoke and a loud humming noise.", category: "Transformer Issue", priority: "High", status: "Assigned", address: "Riverside Market, Block B", consumerId: "u-c2", workerId: "u-w2", createdAt: ago(2) },
  { id: "PT-2026-1005", title: "Whole block without power", description: "No electricity in the entire block since 6 AM.", category: "Power Outage", priority: "High", status: "Submitted", address: "Old Town, Lane 7", consumerId: "u-c3", createdAt: ago(0, 5) },
  { id: "PT-2026-1006", title: "Pole leaning after accident", description: "A truck hit the pole and it is now leaning toward houses.", category: "Fallen Pole", priority: "Emergency", status: "Assigned", address: "Riverside Road 3", consumerId: "u-c2", workerId: "u-w1", createdAt: ago(1, 4) },
  { id: "PT-2026-1007", title: "No power on Lane 7", description: "Power is out in our lane, neighbours are affected too.", category: "Power Outage", priority: "High", status: "Submitted", address: "Old Town, Lane 7", consumerId: "u-c1", createdAt: ago(0, 3), duplicateOf: "PT-2026-1005" },
  { id: "PT-2026-1008", title: "Sparking cable at junction box", description: "Junction box sparks when it rains.", category: "Broken Wire", priority: "High", status: "Resolved", address: "Green Park Phase 2", consumerId: "u-c3", workerId: "u-w1", createdAt: ago(20) },
  { id: "PT-2026-1009", title: "Wrong meter reading", description: "My bill shows a reading far higher than the meter.", category: "Damaged Meter", priority: "Normal", status: "In Progress", address: "Riverside Apartments 12", consumerId: "u-c2", workerId: "u-w2", createdAt: ago(5) },
  { id: "PT-2026-1010", title: "Street transformer humming", description: "Constant loud hum from the transformer at night.", category: "Transformer Issue", priority: "Normal", status: "Resolved", address: "Old Town Square", consumerId: "u-c3", workerId: "u-w2", createdAt: ago(25) },
  { id: "PT-2026-1011", title: "New connection not activated", description: "Applied for a connection 3 weeks ago; still inactive.", category: "Connection Issue", priority: "Normal", status: "Under Review", address: "Green Park, House 88", consumerId: "u-c2", createdAt: ago(4) },
  { id: "PT-2026-1012", title: "Transformer smoke at market", description: "Smoke rising from transformer near the market.", category: "Transformer Issue", priority: "High", status: "Submitted", address: "Riverside Market, Block B", consumerId: "u-c3", createdAt: ago(1, 2), duplicateOf: "PT-2026-1004" },
];

const FLOW: Status[] = ["Submitted", "Under Review", "Assigned", "In Progress", "Resolved"];
const PROG: Record<Status, number> = { Submitted: 0, "Under Review": 10, Assigned: 25, "In Progress": 60, Resolved: 100 };
const imgs = [IMG("photo-1473341304170-971dccb5ac1e"), IMG("photo-1509391366360-2e959784a276"), IMG("photo-1621905251189-08b45d6a269e")];

export function buildSeedComplaints(): Complaint[] {
  return seeds.map((s, i) => {
    const idx = FLOW.indexOf(s.status);
    const days = (Date.UTC(2026, 9, 28, 9) - new Date(s.createdAt).getTime()) / day;
    const history = hist(FLOW.slice(0, idx + 1), days, "Admin");
    return {
      ...s,
      images: [imgs[i % 3]],
      evidence: s.status === "Resolved" ? { before: [imgs[(i + 1) % 3]], after: [imgs[(i + 2) % 3]] } : { before: [], after: [] },
      history,
      notes:
        idx >= 3
          ? [{ at: history[history.length - 1].at, by: "Field Worker", text: "Site inspected. Required parts identified and work started." }]
          : [],
      progress: PROG[s.status],
      updatedAt: history[history.length - 1].at,
    } as Complaint;
  });
}

export const SEED_NOTIFICATIONS: Notification[] = [
  { id: "n1", userId: "u-c1", title: "Worker assigned", message: "Omar Farooq has been assigned to PT-2026-1001.", at: ago(2), read: false, complaintId: "PT-2026-1001" },
  { id: "n2", userId: "u-c1", title: "Complaint resolved", message: "PT-2026-1002 has been marked as resolved.", at: ago(10), read: true, complaintId: "PT-2026-1002" },
  { id: "n3", userId: "u-c1", title: "Under review", message: "PT-2026-1003 is now under review.", at: ago(0, 20), read: false, complaintId: "PT-2026-1003" },
  { id: "n4", userId: "u-a1", title: "New emergency complaint", message: "PT-2026-1006 was reported as Emergency.", at: ago(1, 4), read: false, complaintId: "PT-2026-1006" },
  { id: "n5", userId: "u-a1", title: "Possible duplicate", message: "PT-2026-1007 looks similar to PT-2026-1005.", at: ago(0, 3), read: false, complaintId: "PT-2026-1007" },
  { id: "n6", userId: "u-w1", title: "New assignment", message: "You were assigned PT-2026-1006 (Emergency).", at: ago(1, 3), read: false, complaintId: "PT-2026-1006" },
  { id: "n7", userId: "u-w1", title: "Priority raised", message: "PT-2026-1001 priority set to Emergency.", at: ago(2, 5), read: true, complaintId: "PT-2026-1001" },
];
