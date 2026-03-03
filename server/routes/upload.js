const express = require("express");
const multer = require("multer");
const { v2: cloudinary } = require("cloudinary");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const imageLimitMb = Number(process.env.MAX_IMAGE_SIZE_MB || 5);
const pdfLimitMb = Number(process.env.MAX_PDF_SIZE_MB || 20);

const upload = multer({
  storage: multer.memoryStorage(),
});

function uploadBuffer(buffer, options) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(options, (err, result) => {
      if (err) return reject(err);
      return resolve(result);
    });
    stream.end(buffer);
  });
}

router.post(
  "/api/upload/image",
  authMiddleware,
  upload.single("file"),
  async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ error: "Archivo requerido" });
    }
    if (!req.file.mimetype.startsWith("image/")) {
      return res.status(400).json({ error: "Formato de imagen inválido" });
    }
    if (req.file.size > imageLimitMb * 1024 * 1024) {
      return res.status(413).json({ error: "Imagen supera el límite" });
    }

    try {
      const result = await uploadBuffer(req.file.buffer, {
        folder: "news/images",
        resource_type: "image",
      });
      return res.json({ url: result.secure_url });
    } catch (_err) {
      return res.status(500).json({ error: "No se pudo subir imagen" });
    }
  }
);

router.post(
  "/api/upload/pdf",
  authMiddleware,
  upload.single("file"),
  async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ error: "Archivo requerido" });
    }
    if (req.file.mimetype !== "application/pdf") {
      return res.status(400).json({ error: "Formato de PDF inválido" });
    }
    if (req.file.size > pdfLimitMb * 1024 * 1024) {
      return res.status(413).json({ error: "PDF supera el límite" });
    }

    try {
      const result = await uploadBuffer(req.file.buffer, {
        folder: "news/pdfs",
        resource_type: "raw",
      });
      return res.json({ url: result.secure_url });
    } catch (_err) {
      return res.status(500).json({ error: "No se pudo subir PDF" });
    }
  }
);

module.exports = router;
