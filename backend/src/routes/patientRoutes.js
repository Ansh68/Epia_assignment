const express = require("express");
const router = express.Router();
const {
  addPatient,
  getAllPatients,
  getDueToday,
  markComplete,
  deletePatient,
} = require("../controllers/patientController");

router.post("/", addPatient);
router.get("/", getAllPatients);
router.get("/due-today", getDueToday);
router.patch("/:id/complete", markComplete);
router.delete("/:id", deletePatient);

module.exports = router;

