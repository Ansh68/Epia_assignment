const express = require("express");
const router = express.Router();
const { generateDraft } = require("../controllers/aiController");

router.post("/generate-draft", generateDraft);

module.exports = router;

