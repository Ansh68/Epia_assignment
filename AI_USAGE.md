# Note on AI Usage & Personal Implementation

## 1. AI Tools Used
- **Google Gemini 2.0 Flash (`gemini-2.0-flash`)**:
  - Integrated via REST API in the backend (`/api/ai/generate-draft`).
  - Used dynamically to generate personalized, empathetic, and concise WhatsApp follow-up messages tailored to each patient's name, last consultation date, and follow-up date.
  - Configured with a fallback mock system to demonstrate the complete workflow even when an API key is absent or network requests fail.
- **Antigravity Coding Assistant**:
  - Used for rapid scaffolding of the Next.js 15 app, shadcn/ui components, Express routes, and test data generation.

## 2. Personally Implemented & Supervised
- **System Architecture & REST Design**:
  - Designed the Express API structure, resource separation (patients vs. AI automation), and JSON persistence logic (`store.js`).
  - Implemented the date filtering logic for the `/due-today` endpoint based on local machine date.
- **Human-in-the-Loop Safeguards (Task 2 Requirement)**:
  - Ensured strictly **no automatic sending** of WhatsApp messages.
  - Designed the review and approval flow inside `DraftModal.tsx` where staff must explicitly inspect the message preview and approve it before the patient's record transitions to "completed".
- **Prompt Engineering**:
  - Crafted the system prompt for Gemini: enforces address by first name, under 80 words, warm professional tone, clinic branding ("MedCare Clinic"), and zero placeholder text.
- **Frontend & UX**:
  - Built a clean, non-AI aesthetic dashboard using Tailwind CSS v4, Lucide icons, and shadcn/ui components (cards, badges, tables, modals, tabs).
  - Designed status badges for `Overdue`, `Due Today`, `Pending`, and `Completed`.
- **Validation & Error Handling**:
  - Implemented phone number regex validation, minimum character bounds, ISO date validation, and API error messaging.

