export type Role = "consumer" | "admin" | "worker";
export type Status = "Submitted" | "Under Review" | "Assigned" | "In Progress" | "Resolved";
export type Priority = "Emergency" | "High" | "Normal";
export type Category =
  | "Damaged Meter"
  | "Fallen Pole"
  | "Broken Wire"
  | "Transformer Issue"
  | "Connection Issue"
  | "Power Outage"
  | "Other";

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: Role;
  area?: string;
  active: boolean;
}

export interface HistoryEntry {
  status: Status;
  at: string;
  by: string;
  note?: string;
}

export interface WorkNote {
  at: string;
  by: string;
  text: string;
}

export interface Complaint {
  id: string;
  title: string;
  description: string;
  category: Category;
  priority: Priority;
  status: Status;
  address: string;
  consumerId: string;
  workerId?: string;
  createdAt: string;
  updatedAt: string;
  images: string[];
  evidence: { before: string[]; after: string[] };
  history: HistoryEntry[];
  notes: WorkNote[];
  progress: number;
  duplicateOf?: string;
  duplicateDismissed?: boolean;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  at: string;
  read: boolean;
  complaintId?: string;
}
