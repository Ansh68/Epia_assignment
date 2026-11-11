# MedCare – Patient Follow-up System

A full-stack patient follow-up system built for the EPIA assessment. It demonstrates a RESTful backend API and an AI-powered WhatsApp draft workflow.

---

## Tech Stack

| Layer     | Technology                                     |
|-----------|------------------------------------------------|
| Backend   | Node.js · Express · JSON file store            |
| Frontend  | Next.js 15 (App Router) · TypeScript           |
| UI        | Tailwind CSS v4 · shadcn/ui · Lucide icons     |
| AI        | Google Gemini 2.0 Flash (falls back to mock)   |

---

## Project Structure

```
epia_assignment/
├── backend/
│   ├── index.js                  # Express entry point
│   ├── seed.js                   # Demo data seeder
│   ├── patients.json             # Auto-created data store
│   ├── .env                      # GEMINI_API_KEY, PORT
│   └── src/
│       ├── controllers/
│       │   ├── patientController.js
│       │   └── aiController.js
│       ├── routes/
│       │   ├── patientRoutes.js
│       │   └── aiRoutes.js
│       └── data/
│           └── store.js
└── frontend/
    ├── src/
    │   ├── app/
    │   │   ├── layout.tsx
    │   │   └── page.tsx          # Main dashboard
    │   ├── components/
    │   │   ├── AddPatientForm.tsx
    │   │   ├── DraftModal.tsx
    │   │   └── PatientTable.tsx
    │   ├── lib/
    │   │   └── api.ts            # Typed API client
    │   └── types/
    │       └── index.ts
    └── .env.local                # NEXT_PUBLIC_API_URL
```

---

## Setup & Running

### Prerequisites
- Node.js ≥ 18
- npm ≥ 9

### 1 · Backend

```bash
cd backend
npm install
# (Optional) add your Gemini key – leave blank to use mock drafts
# Edit .env → GEMINI_API_KEY=your_key_here

# Seed demo data (fictional patients, 2 due today)
node seed.js

# Start the server
npm start          # production
npm run dev        # with --watch auto-reload
```

The API runs on **http://localhost:4000**

### 2 · Frontend

```bash
cd frontend
npm install
npm run dev
```

Open **http://localhost:3000**

---

## API Endpoints

Base URL: `http://localhost:4000/api`

### Patients

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/patients` | List all patients |
| `POST` | `/patients` | Add a new patient |
| `GET` | `/patients/due-today` | Patients with follow-up due today (pending) |
| `PATCH` | `/patients/:id/complete` | Mark follow-up as completed |
| `DELETE` | `/patients/:id` | Remove a patient |
| `GET` | `/health` | Health check |

#### POST `/patients` – Request Body

```json
{
  "name": "Sarah Mitchell",
  "phone": "+1 555 101 2020",
  "consultationDate": "2026-10-28",
  "followUpDate": "2026-11-11"
}
```

#### POST `/patients` – Response (201)

```json
{
  "id": "uuid-v4",
  "name": "Sarah Mitchell",
  "phone": "+1 555 101 2020",
  "consultationDate": "2026-10-28",
  "followUpDate": "2026-11-11",
  "followUpStatus": "pending",
  "createdAt": "2026-11-11T14:30:00.000Z"
}
```

### AI Draft

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/ai/generate-draft` | Generate a WhatsApp follow-up draft |

#### POST `/ai/generate-draft` – Request Body

```json
{ "patientId": "uuid-v4" }
```

#### Response

```json
{
  "draft": "Hi Sarah! 👋 This is MedCare Clinic...",
  "source": "gemini",
  "patient": { ... }
}
```

> When `GEMINI_API_KEY` is not set, `source` will be `"mock"` and a `notice` field explains the limitation.

---

## Validation Rules

| Field | Rule |
|-------|------|
| `name` | Required, minimum 2 characters |
| `phone` | Required, matches `/^\+?[\d\s\-(). ]{7,20}$/` |
| `consultationDate` | Required, `YYYY-MM-DD` format |
| `followUpDate` | Required, `YYYY-MM-DD` format |

---

## Testing the API with curl

```bash
# Health check
curl http://localhost:4000/api/health

# Add a patient
curl -X POST http://localhost:4000/api/patients \
  -H "Content-Type: application/json" \
  -d '{"name":"Alex Turner","phone":"+1 555 999 0001","consultationDate":"2026-11-01","followUpDate":"2026-11-11"}'

# Get all patients
curl http://localhost:4000/api/patients

# Get patients due today
curl http://localhost:4000/api/patients/due-today

# Mark complete (replace ID)
curl -X PATCH http://localhost:4000/api/patients/<id>/complete

# Generate AI draft
curl -X POST http://localhost:4000/api/ai/generate-draft \
  -H "Content-Type: application/json" \
  -d '{"patientId":"<id>"}'
```

---

## AI Workflow (Task 2)

1. The dashboard shows a **"Due Today"** banner listing all pending patients whose `followUpDate` is today.
2. Staff clicks **"Draft Message"** next to a patient.
3. The frontend calls `POST /api/ai/generate-draft` → the backend sends a crafted prompt to **Gemini 2.0 Flash**.
4. The generated WhatsApp message is shown in a **review modal** (green bubble, WhatsApp-style).
5. Staff can **Approve & Mark Complete** (triggers `PATCH /patients/:id/complete`) or **Discard**.
6. No message is ever sent automatically.

If `GEMINI_API_KEY` is missing or Gemini is unreachable, the backend gracefully falls back to a deterministic mock message and flags `source: "mock"` in the response so the UI can display a notice banner.

---

## Environment Variables

### Backend (`backend/.env`)

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `4000` | HTTP port |
| `GEMINI_API_KEY` | _(empty)_ | Google Gemini API key |

### Frontend (`frontend/.env.local`)

| Variable | Default | Description |
|----------|---------|-------------|
| `NEXT_PUBLIC_API_URL` | `http://localhost:4000/api` | Backend base URL |

---

## Design Decisions

See [`DECISIONS.md`](./DECISIONS.md) for a full log of every technical decision and rationale.

