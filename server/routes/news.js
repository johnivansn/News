const express = require("express");

const router = express.Router();

router.get("/api/news", (_req, res) => {
  res.status(501).json({ error: "No implementado" });
});

router.get("/api/news/:slug", (_req, res) => {
  res.status(501).json({ error: "No implementado" });
});

router.post("/api/news", (_req, res) => {
  res.status(501).json({ error: "No implementado" });
});

router.put("/api/news/:slug", (_req, res) => {
  res.status(501).json({ error: "No implementado" });
});

router.delete("/api/news/:slug", (_req, res) => {
  res.status(501).json({ error: "No implementado" });
});

module.exports = router;
