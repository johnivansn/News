const express = require("express");
const fs = require("fs/promises");
const path = require("path");
const matter = require("gray-matter");
const slugify = require("slugify");
const authMiddleware = require("../middleware/authMiddleware");
const { writeFileAtomic } = require("../utils/fileWriter");

const router = express.Router();
const NEWS_DIR = path.join(__dirname, "..", "..", "content", "news");

function buildFilename(title) {
  const date = new Date().toISOString().slice(0, 10);
  const slug = slugify(title || "sin-titulo", { lower: true, strict: true });
  return `${date}-${slug}.md`;
}

async function ensureNewsDir() {
  await fs.mkdir(NEWS_DIR, { recursive: true });
}

function parseFile(file, raw) {
  const parsed = matter(raw);
  return {
    slug: path.basename(file, ".md"),
    frontmatter: parsed.data || {},
    content: parsed.content || "",
  };
}

router.get("/api/news", async (_req, res) => {
  try {
    await ensureNewsDir();
    const files = (await fs.readdir(NEWS_DIR)).filter((f) => f.endsWith(".md"));
    const items = await Promise.all(
      files.map(async (file) => {
        const raw = await fs.readFile(path.join(NEWS_DIR, file), "utf8");
        return parseFile(file, raw);
      })
    );
    return res.json(items);
  } catch (_err) {
    return res.status(500).json({ error: "No se pudo leer noticias" });
  }
});

router.get("/api/news/:slug", async (req, res) => {
  const target = path.join(NEWS_DIR, `${req.params.slug}.md`);
  try {
    const raw = await fs.readFile(target, "utf8");
    return res.json(parseFile(`${req.params.slug}.md`, raw));
  } catch (_err) {
    return res.status(404).json({ error: "Noticia no encontrada" });
  }
});

router.get("/api/news/:slug/pdf", async (req, res) => {
  const target = path.join(NEWS_DIR, `${req.params.slug}.md`);
  try {
    const raw = await fs.readFile(target, "utf8");
    const parsed = matter(raw);
    const pdfUrl = parsed.data?.pdf_url;
    if (!pdfUrl) {
      return res.status(404).json({ error: "PDF no encontrado" });
    }

    const pdfName = parsed.data?.pdf_name || "documento";
    const response = await fetch(pdfUrl);
    if (!response.ok) {
      return res.status(502).json({ error: "No se pudo descargar el PDF" });
    }

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${pdfName}.pdf"`
    );
    if (!response.body) {
      return res.status(502).json({ error: "Respuesta inválida del PDF" });
    }
    const { Readable } = require("stream");
    Readable.fromWeb(response.body).pipe(res);
  } catch (_err) {
    return res.status(404).json({ error: "PDF no encontrado" });
  }
});

router.post("/api/news", authMiddleware, async (req, res) => {
  const { title, content, image, pdf_url, pdf_name, status } = req.body || {};
  if (!title) {
    return res.status(400).json({ error: "Título requerido" });
  }

  const now = new Date().toISOString();
  const frontmatter = {
    title,
    date_published: now,
    date_updated: now,
    status: status || "published",
    image: image || "",
    pdf_url: pdf_url || "",
    pdf_name: pdf_name || "",
  };

  const file = buildFilename(title);
  const fullPath = path.join(NEWS_DIR, file);
  const body = matter.stringify(content || "", frontmatter);

  try {
    await ensureNewsDir();
    await writeFileAtomic(fullPath, body);
    return res.status(201).json({ slug: path.basename(file, ".md") });
  } catch (_err) {
    return res.status(500).json({ error: "No se pudo guardar noticia" });
  }
});

router.put("/api/news/:slug", authMiddleware, async (req, res) => {
  const target = path.join(NEWS_DIR, `${req.params.slug}.md`);
  const { title, content, image, pdf_url, pdf_name, status } = req.body || {};

  try {
    const raw = await fs.readFile(target, "utf8");
    const parsed = matter(raw);
    const updated = {
      ...parsed.data,
      title: title || parsed.data.title,
      image: image ?? parsed.data.image,
      pdf_url: pdf_url ?? parsed.data.pdf_url,
      pdf_name: pdf_name ?? parsed.data.pdf_name,
      status: status || parsed.data.status,
      date_updated: new Date().toISOString(),
    };

    const body = matter.stringify(content ?? parsed.content, updated);
    await writeFileAtomic(target, body);
    return res.json({ ok: true });
  } catch (_err) {
    return res.status(404).json({ error: "Noticia no encontrada" });
  }
});

router.delete("/api/news/:slug", authMiddleware, async (req, res) => {
  const target = path.join(NEWS_DIR, `${req.params.slug}.md`);
  try {
    await fs.unlink(target);
    return res.json({ ok: true });
  } catch (_err) {
    return res.status(404).json({ error: "Noticia no encontrada" });
  }
});

module.exports = router;
