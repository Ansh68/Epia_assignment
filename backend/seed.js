/**
 * Seed script – populates patients.json with fictional demo data.
 * Run: node seed.js
 * Run with today flag: node seed.js --today  (adds extra patient due today)
 */

const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");

const DATA_FILE = path.join(__dirname, "patients.json");

function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function daysFromToday(n) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

const today = todayStr();

const patients = [
  {
    id: uuidv4(),
    name: "Sarah Mitchell",
    phone: "+1 555 101 2020",
    consultationDate: daysFromToday(-14),
    followUpDate: today,
    followUpStatus: "pending",
    createdAt: new Date().toISOString(),
  },
  {
    id: uuidv4(),
    name: "James Okonkwo",
    phone: "+1 555 202 3030",
    consultationDate: daysFromToday(-10),
    followUpDate: today,
    followUpStatus: "pending",
    createdAt: new Date().toISOString(),
  },
  {
    id: uuidv4(),
    name: "Maria Fernandez",
    phone: "+1 555 303 4040",
    consultationDate: daysFromToday(-21),
    followUpDate: daysFromToday(3),
    followUpStatus: "pending",
    createdAt: new Date().toISOString(),
  },
  {
    id: uuidv4(),
    name: "David Huang",
    phone: "+1 555 404 5050",
    consultationDate: daysFromToday(-30),
    followUpDate: daysFromToday(-5),
    followUpStatus: "pending",
    createdAt: new Date().toISOString(),
  },
  {
    id: uuidv4(),
    name: "Priya Nair",
    phone: "+91 98765 43210",
    consultationDate: daysFromToday(-7),
    followUpDate: daysFromToday(7),
    followUpStatus: "pending",
    createdAt: new Date().toISOString(),
  },
  {
    id: uuidv4(),
    name: "Tom Brennan",
    phone: "+44 7700 900123",
    consultationDate: daysFromToday(-45),
    followUpDate: daysFromToday(-15),
    followUpStatus: "completed",
    completedAt: new Date(Date.now() - 86400000 * 10).toISOString(),
    createdAt: new Date().toISOString(),
  },
];

fs.writeFileSync(DATA_FILE, JSON.stringify(patients, null, 2), "utf8");
console.log(`✅  Seeded ${patients.length} fictional patients to ${DATA_FILE}`);
console.log(`   Patients due today: ${patients.filter(p => p.followUpDate === today && p.followUpStatus === 'pending').length}`);

