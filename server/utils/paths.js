const path = require("path");

const BASE_DIR = process.env.DATA_DIR || path.join(__dirname, "..", "..");
const CONTENT_DIR = path.join(BASE_DIR, "content");
const NEWS_DIR = path.join(CONTENT_DIR, "news");
const AUTH_DIR = path.join(BASE_DIR, "auth");
const USERS_PATH = path.join(AUTH_DIR, "users.json");

module.exports = {
  BASE_DIR,
  CONTENT_DIR,
  NEWS_DIR,
  AUTH_DIR,
  USERS_PATH,
};
