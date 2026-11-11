const { readPatients, writePatients } = require("../data/store");
const { v4: uuidv4 } = require("uuid");

// ─── helpers ──────────────────────────────────────────────────────────────────

/** Normalise a date string to YYYY-MM-DD (strip time component if any) */
function toDateStr(value) {
  if (!value) return null;
  return String(value).slice(0, 10);
}

/** Return today's date as YYYY-MM-DD in local time */
function todayStr() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

// ─── controllers ──────────────────────────────────────────────────────────────

/** POST /api/patients */
function addPatient(req, res) {
  const { name, phone, consultationDate, followUpDate } = req.body;

  // Validation
  if (!name || typeof name !== "string" || name.trim().length < 2) {
    return res.status(400).json({ error: "name must be at least 2 characters." });
  }
  if (!phone || !/^\+?[\d\s\-().]{7,20}$/.test(phone.trim())) {
    return res.status(400).json({ error: "phone must be a valid phone number." });
  }
  if (!consultationDate || !/^\d{4}-\d{2}-\d{2}$/.test(toDateStr(consultationDate))) {
    return res.status(400).json({ error: "consultationDate must be YYYY-MM-DD." });
  }
  if (!followUpDate || !/^\d{4}-\d{2}-\d{2}$/.test(toDateStr(followUpDate))) {
    return res.status(400).json({ error: "followUpDate must be YYYY-MM-DD." });
  }

  const patients = readPatients();
  const patient = {
    id: uuidv4(),
    name: name.trim(),
    phone: phone.trim(),
    consultationDate: toDateStr(consultationDate),
    followUpDate: toDateStr(followUpDate),
    followUpStatus: "pending", // pending | completed
    createdAt: new Date().toISOString(),
  };
  patients.push(patient);
  writePatients(patients);

  return res.status(201).json(patient);
}

/** GET /api/patients */
function getAllPatients(req, res) {
  const patients = readPatients();
  return res.json(patients);
}

/** GET /api/patients/due-today */
function getDueToday(req, res) {
  const today = todayStr();
  const patients = readPatients().filter(
    (p) => p.followUpDate === today && p.followUpStatus === "pending"
  );
  return res.json(patients);
}

/** PATCH /api/patients/:id/complete */
function markComplete(req, res) {
  const { id } = req.params;
  const patients = readPatients();
  const idx = patients.findIndex((p) => p.id === id);

  if (idx === -1) {
    return res.status(404).json({ error: "Patient not found." });
  }
  patients[idx].followUpStatus = "completed";
  patients[idx].completedAt = new Date().toISOString();
  writePatients(patients);

  return res.json(patients[idx]);
}

/** DELETE /api/patients/:id */
function deletePatient(req, res) {
  const { id } = req.params;
  let patients = readPatients();
  const idx = patients.findIndex((p) => p.id === id);
  if (idx === -1) {
    return res.status(404).json({ error: "Patient not found." });
  }
  const removed = patients[idx];
  patients.splice(idx, 1);
  writePatients(patients);
  return res.json(removed);
}

module.exports = { addPatient, getAllPatients, getDueToday, markComplete, deletePatient };

