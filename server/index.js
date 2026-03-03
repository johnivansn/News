const express = require("express");

require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });

const cors = require("cors");
const authRoutes = require("./routes/auth");
const newsRoutes = require("./routes/news");
const healthRoutes = require("./routes/health");
const uploadRoutes = require("./routes/upload");

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
app.listen(port, () => {
  console.log(`API listening on port ${port}`);
});
