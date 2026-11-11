const { readPatients } = require("../data/store");

/**
 * POST /api/ai/generate-draft
 *
 * Body: { patientId: string }
 *
 * Uses the Google Gemini API (or falls back to a mock) to generate a
 * personalised WhatsApp follow-up draft for a patient.
 * The draft is NEVER sent automatically – it is returned for staff review.
 */
async function generateDraft(req, res) {
  const { patientId } = req.body;

  if (!patientId) {
    return res.status(400).json({ error: "patientId is required." });
  }

  const patients = readPatients();
  const patient = patients.find((p) => p.id === patientId);
  if (!patient) {
    return res.status(404).json({ error: "Patient not found." });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({
      error: "GEMINI_API_KEY is missing in backend environment.",
    });
  }

  try {
    const prompt = buildPrompt(patient);
    const draft = await callGemini(prompt, apiKey);
    return res.json({ draft, source: "gemini", patient });
  } catch (err) {
    console.error("Gemini generation failed:", err.message);
    return res.status(502).json({
      error: "Failed to generate AI draft with Gemini: " + err.message,
    });
  }
}

// ─── helpers ──────────────────────────────────────────────────────────────────

function buildPrompt(patient) {
  return `You are a friendly and professional medical clinic assistant.
Write a short WhatsApp follow-up message for a patient.

Patient details:
- Name: ${patient.name}
- Consultation Date: ${patient.consultationDate}
- Follow-up Due: ${patient.followUpDate}

Requirements:
- Address the patient by first name only.
- Keep it under 80 words.
- Be warm, caring, and professional.
- Remind them of the follow-up appointment and ask them to confirm or reschedule.
- Include the clinic's name: "MedCare Clinic".
- Do NOT include any placeholders like [insert here].
- Output only the message text, no preamble.`;
}

async function callGemini(prompt, apiKey) {
  // Use gemini-3.5-flash-lite (fast, robust, supported across free tiers)
  const models = ["gemini-3.5-flash-lite", "gemini-flash-latest"];
  let lastError = null;

  for (const model of models) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const body = {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.7, maxOutputTokens: 200 },
      };

      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Model ${model} returned ${response.status}: ${errText}`);
      }

      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
      if (text) return text;
    } catch (err) {
      lastError = err;
      console.warn(`[Gemini] ${model} attempt failed, trying fallback:`, err.message);
    }
  }

  throw lastError || new Error("Gemini generation failed on all models.");
}

module.exports = { generateDraft };

