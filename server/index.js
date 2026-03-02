const express = require("express");

const authRoutes = require("./routes/auth");
const newsRoutes = require("./routes/news");
const healthRoutes = require("./routes/health");

const app = express();

app.use(express.json());
app.use(healthRoutes);
app.use(authRoutes);
app.use(newsRoutes);

const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log(`API listening on port ${port}`);
});
