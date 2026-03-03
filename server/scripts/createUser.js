const fs = require("fs");
const path = require("path");
const readline = require("readline");
const bcrypt = require("bcrypt");

const USERS_PATH = path.join(__dirname, "..", "..", "auth", "users.json");
const SALT_ROUNDS = 10;

function ask(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise((resolve) =>
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim());
    })
  );
}

async function main() {
  const email = await ask("Email: ");
  const password = await ask("Password: ");

  if (!email || !password) {
    console.error("Email y password son obligatorios.");
    process.exit(1);
  }

  const hash = await bcrypt.hash(password, SALT_ROUNDS);
  const payload = { email, password: hash };

  fs.mkdirSync(path.dirname(USERS_PATH), { recursive: true });
  fs.writeFileSync(USERS_PATH, JSON.stringify(payload, null, 2), "utf8");

  console.log(`Usuario creado en ${USERS_PATH}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
