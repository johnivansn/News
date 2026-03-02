const fs = require("fs/promises");
const path = require("path");

async function writeFileAtomic(targetPath, contents) {
  const dir = path.dirname(targetPath);
  const tempPath = path.join(
    dir,
    `.${path.basename(targetPath)}.${Date.now()}.tmp`
  );

  await fs.writeFile(tempPath, contents, "utf8");
  await fs.rename(tempPath, targetPath);
}

module.exports = { writeFileAtomic };
