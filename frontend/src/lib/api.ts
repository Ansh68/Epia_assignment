import { Patient, DraftResult } from "@/types";

const BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Request failed");
  return data as T;
}

export const api = {
  // ── Patients ──────────────────────────────────────────────────────────────
  getPatients: () => request<Patient[]>("/patients"),

  getDueToday: () => request<Patient[]>("/patients/due-today"),

  addPatient: (body: {
    name: string;
    phone: string;
    consultationDate: string;
    followUpDate: string;
  }) =>
    request<Patient>("/patients", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  markComplete: (id: string) =>
    request<Patient>(`/patients/${id}/complete`, { method: "PATCH" }),

  deletePatient: (id: string) =>
    request<Patient>(`/patients/${id}`, { method: "DELETE" }),

  // ── AI ────────────────────────────────────────────────────────────────────
  generateDraft: (patientId: string) =>
    request<DraftResult>("/ai/generate-draft", {
      method: "POST",
      body: JSON.stringify({ patientId }),
    }),
};

