// Shared types used across the frontend
export type FollowUpStatus = "pending" | "completed";

export interface Patient {
  id: string;
  name: string;
  phone: string;
  consultationDate: string; // YYYY-MM-DD
  followUpDate: string; // YYYY-MM-DD
  followUpStatus: FollowUpStatus;
  createdAt: string;
  completedAt?: string;
}

export interface DraftResult {
  draft: string;
  source: "gemini" | "mock";
  notice?: string;
  patient: Patient;
}

