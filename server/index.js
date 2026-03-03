const express = require("express");
const fs = require("fs/promises");
const path = require("path");
const bcrypt = require("bcrypt");

require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

const cors = require("cors");
const authRoutes = require("./routes/auth");
const newsRoutes = require("./routes/news");
const healthRoutes = require("./routes/health");
const uploadRoutes = require("./routes/upload");

const { USERS_PATH, AUTH_DIR } = require("./utils/paths");

async function ensureUsersFile() {
  try {
    await fs.access(USERS_PATH);
    return;
  } catch (_) {
    // File does not exist yet
  }

  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) {
    console.warn(
      "ADMIN_EMAIL/ADMIN_PASSWORD no configurados: users.json no creado."
    );
    return;
  }

  await fs.mkdir(AUTH_DIR, { recursive: true });
  const hashed = await bcrypt.hash(password, 10);
  const payload = { email, password: hashed };
  await fs.writeFile(USERS_PATH, JSON.stringify(payload, null, 2), "utf8");
  console.log("users.json creado desde variables de entorno.");
}

const app = express();

app.use(express.json());
app.use(
  cors({
    origin:
      process.env.ALLOWED_ORIGIN?.split(",").map((o) => o.trim()) || [
        "http://localhost:5173",
        "http://localhost:3000",
      ],
  })
);
app.use(healthRoutes);
app.use(authRoutes);
app.use(newsRoutes);
app.use(uploadRoutes);

const port = process.env.PORT || 3001;
ensureUsersFile().finally(() => {
  app.listen(port, () => {
    console.log(`API listening on port ${port}`);
  });
});
