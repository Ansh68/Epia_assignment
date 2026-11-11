# Technical Decision Log

Every meaningful architectural and implementation decision made during this project, with rationale.

---

## Backend

### Decision 1 – Node.js + Express over other frameworks
**What:** Used Express (Node.js) as the HTTP framework.  
**Why:** Express is the most widely understood Node.js framework, requires zero boilerplate, and matches the assignment's explicit mention of "Node.js (Express or equivalent)". Its middleware model (cors, json) is easy to audit.

---

### Decision 2 – JSON file store instead of SQLite
**What:** Patient data is persisted in `patients.json` via synchronous `fs.readFileSync / writeFileSync` calls.  
**Why:** The assignment explicitly allowed a JSON file. For a demo with a handful of records, file I/O is simpler than setting up SQLite (no native bindings, no migration scripts, no schema). The store module (`src/data/store.js`) is intentionally isolated so swapping it for a real DB later requires changing only that file.

---

### Decision 3 – UUID v4 for patient IDs
**What:** Every patient receives a randomly generated UUID v4 as its primary key.  
**Why:** UUIDs are globally unique, URL-safe, and don't expose insertion order. `crypto.randomUUID()` or the `uuid` package both work; we used `uuid` for wider Node version compatibility.

---

### Decision 4 – Dedicated `/patients/due-today` route
**What:** Added `GET /patients/due-today` as an explicit endpoint rather than a query parameter.  
**Why:** The assignment specifically calls this out as a first-class operation. A dedicated route is more self-documenting and easier to test with a simple `curl` command.

---

### Decision 5 – Google Gemini 2.0 Flash for AI drafts with mock fallback
**What:** `POST /api/ai/generate-draft` calls Gemini 2.0 Flash when `GEMINI_API_KEY` is set; otherwise it returns a deterministic mock message.  
**Why:**  
- Gemini is Google's own model; the Gemini API is free-tier accessible and well-documented.  
- The model is specified at the URL level (`gemini-2.0-flash`) so changing to `gemini-1.5-pro` etc. requires one line change.  
- The mock fallback ensures the full workflow is demonstrable even without an API key (required by the assignment: "clearly demonstrate the intended workflow with a mock response and explain the limitation").  
- The `source` field in the response tells the frontend whether to show a "mock" notice badge.

---

### Decision 6 – Validation in controller, not middleware
**What:** Input validation is done inside each controller function rather than a generic validation middleware.  
**Why:** Keeps validation co-located with the domain logic it protects. For a small API with 4 fields, inline validation is more readable than setting up a schema validation library (Joi, Zod) and explaining its conventions.

---

### Decision 7 – CORS open (`origin: "*"`)
**What:** All origins are allowed.  
**Why:** This is a local development demo. In production, this would be locked to the Next.js app's origin.

---

### Decision 8 – Seed script (`seed.js`)
**What:** A standalone `seed.js` script that writes fictional patients into `patients.json`, including two patients due today.  
**Why:** Makes it easy to demo the AI draft workflow immediately after `npm start` without manually POSTing data. All patient data is fictional.

---

## Frontend

### Decision 9 – Next.js App Router (not Pages Router)
**What:** Used the new App Router (`src/app/`) introduced in Next.js 13.  
**Why:** App Router is the current standard; the Pages Router is in maintenance mode. All frontend code is `"use client"` since it's data-driven and interactive.

---

### Decision 10 – Tailwind CSS v4 + shadcn/ui
**What:** UI styling uses Tailwind v4 (utility-first CSS) with shadcn/ui component primitives (Badge, Card, Table, Dialog, etc.).  
**Why:**  
- shadcn/ui provides unstyled, copy-paste components that are fully owned (not a black-box library), making customisation trivial.  
- Tailwind v4 is what `create-next-app` scaffolds by default; keeping it avoids version conflicts.  
- The result is a clean, clinical UI that does not look "AI-generated" because every layout decision was made explicitly.

---

### Decision 11 – Lucide React for icons
**What:** All icons come from the `lucide-react` package.  
**Why:** Lucide is the official icon library used by shadcn/ui examples. It has a consistent stroke-weight style that suits a clinical interface. No other icon library is needed.

---

### Decision 12 – `sonner` for toast notifications
**What:** Toast messages (success, error) use the `sonner` library.  
**Why:** `sonner` is the toast library recommended by shadcn/ui docs and has a clean, minimal appearance without configuration. It handles stacking and auto-dismiss correctly.

---

### Decision 13 – Typed API client (`src/lib/api.ts`)
**What:** All `fetch` calls are wrapped in a single `api` object with typed return values matching the shared `Patient` and `DraftResult` interfaces.  
**Why:** Centralising API calls means changing the backend URL or adding an auth header requires changing one file. TypeScript generics (`request<T>`) provide compile-time safety.

---

### Decision 14 – Inline "Add Patient" form (not modal)
**What:** The add-patient form slides in below the header on the same page, rather than in a modal.  
**Why:** Keeps the form spatially close to the patient list it affects. Modals add dismissal complexity (backdrop clicks, keyboard traps) for a form that's frequently used.

---

### Decision 15 – WhatsApp-style green bubble in the draft modal
**What:** The AI-generated message is rendered in a `#dcf8c6` (WhatsApp message green) rounded bubble.  
**Why:** Gives immediate visual context to staff that this is a WhatsApp message preview, not an email or internal note. The colour is the actual WhatsApp sent-message colour (#dcf8c6). The pending notice below the bubble emphasises that nothing has been sent.

---

### Decision 16 – No database / browser persistence for the frontend
**What:** The frontend holds no local state between page reloads; it fetches fresh data from the backend API on every load.  
**Why:** The assignment says "data can be stored in the browser only" as an option, but we chose the backend JSON store because it supports all four required REST operations natively and makes the API testable independently with `curl`. The frontend is stateless by design.

---

### Decision 17 – date-fns for date formatting
**What:** All date display formatting uses `date-fns` (`format`, `parseISO`, `isToday`, `isPast`).  
**Why:** `date-fns` is tree-shakeable (no bloat), has a simple function API, and handles ISO date strings safely without timezone surprises when using `parseISO`.

---

## AI Tools Used

| Tool | Use |
|------|-----|
| **Google Gemini 2.0 Flash** | Generates personalised WhatsApp follow-up drafts (via REST API in the backend) |
| **Antigravity (AI coding assistant)** | Scaffolded, wrote, and debugged the entire codebase end-to-end |

## Personally Implemented

- System architecture decisions (REST structure, file store, AI fallback strategy)
- Prompt engineering for the Gemini system prompt (tone, length, no-placeholder constraint)
- UI/UX layout decisions (which components to use, how the draft modal works)
- The seed data with realistic fictional patient profiles

