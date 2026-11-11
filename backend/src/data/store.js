/**
 * In-memory data store with JSON file persistence.
 * Patients are stored in a JSON file so data survives server restarts
 * during a demo session, but no heavy database is required.
 */

const fs = require("fs");
const path = require("path");

// Store at backend root so seed.js and the server use the same file
const DATA_FILE = path.join(__dirname, "..", "..", "patients.json");

function readPatients() {
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify([]), "utf8");
    return [];
  }
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
  } catch {
    return [];
  }
}

function writePatients(patients) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(patients, null, 2), "utf8");
}

module.exports = { readPatients, writePatients };
