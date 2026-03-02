const express = require("express");

const router = express.Router();

router.post("/api/auth/login", (_req, res) => {
  res.status(501).json({ error: "No implementado" });
});

module.exports = router;
