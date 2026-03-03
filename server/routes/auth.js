const express = require("express");
const fs = require("fs/promises");
const path = require("path");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const rateLimiter = require("../middleware/rateLimiter");

const router = express.Router();
const USERS_PATH = path.join(__dirname, "..", "..", "auth", "users.json");

router.post("/api/auth/login", rateLimiter, async (req, res) => {
  const { email, password } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({ error: "Email y password requeridos" });
  }

  let user;
  try {
    const raw = await fs.readFile(USERS_PATH, "utf8");
    user = JSON.parse(raw);
  } catch (_err) {
    return res.status(500).json({ error: "Usuario no configurado" });
  }

  const ok = await bcrypt.compare(password, user.password || "");
  if (!ok || user.email !== email) {
    return res.status(401).json({ error: "Credenciales inválidas" });
  }

  const token = jwt.sign(
    { email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "8h" }
  );

  return res.json({ token });
});

module.exports = router;
