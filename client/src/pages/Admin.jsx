import { useEffect, useState } from "react";
import {
  Image as ImageIcon,
  FileText,
  LogIn,
  LogOut,
  Plus,
  Save,
  Trash2,
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

function Admin() {
  const [token, setToken] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [news, setNews] = useState([]);
  const [selectedSlug, setSelectedSlug] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [image, setImage] = useState("");
  const [pdfUrl, setPdfUrl] = useState("");
  const [pdfName, setPdfName] = useState("");
  const [message, setMessage] = useState("");
  const [uploading, setUploading] = useState(false);
  const maxImageMb = Number(import.meta.env.VITE_MAX_IMAGE_MB || 5);
  const maxPdfMb = Number(import.meta.env.VITE_MAX_PDF_MB || 20);
  const tokenStorageKey = "flatcms_token";

  async function loadNews() {
    try {
      const res = await fetch(`${API_URL}/api/news`);
      const data = await res.json();
      setNews(Array.isArray(data) ? data : []);
    } catch (_err) {
      setNews([]);
    }
  }

  useEffect(() => {
    const savedToken = localStorage.getItem(tokenStorageKey);
    if (savedToken) setToken(savedToken);
    loadNews();
  }, []);

  async function handleLogin(e) {
    e.preventDefault();
    setMessage("");
    const res = await fetch(`${API_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) {
      setMessage(data.error || "Error al iniciar sesión");
      return;
    }
    setToken(data.token);
    localStorage.setItem(tokenStorageKey, data.token);
    setMessage("Sesión iniciada");
    await loadNews();
  }

  function handleLogout() {
    setToken("");
    localStorage.removeItem(tokenStorageKey);
    setMessage("Sesión cerrada");
  }

  async function handleCreate(e) {
    e.preventDefault();
    setMessage("");
    const res = await fetch(`${API_URL}/api/news`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        title,
        content,
        image,
        pdf_url: pdfUrl,
        pdf_name: pdfName,
        status: "published",
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setMessage(data.error || "No se pudo crear");
      return;
    }
    setMessage(`Noticia creada: ${data.slug}`);
    setTitle("");
    setContent("");
    setImage("");
    setPdfUrl("");
    setPdfName("");
    setSelectedSlug("");
    await loadNews();
  }

  async function handleUpdate(e) {
    e.preventDefault();
    if (!selectedSlug) {
      setMessage("Selecciona una noticia para editar");
      return;
    }
    setMessage("");
    const res = await fetch(`${API_URL}/api/news/${selectedSlug}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        title,
        content,
        image,
        pdf_url: pdfUrl,
        pdf_name: pdfName,
        status: "published",
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setMessage(data.error || "No se pudo actualizar");
      return;
    }
    setMessage("Noticia actualizada");
    await loadNews();
  }

  async function handleDelete() {
    if (!selectedSlug) {
      setMessage("Selecciona una noticia para eliminar");
      return;
    }
    setMessage("");
    const res = await fetch(`${API_URL}/api/news/${selectedSlug}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await res.json();
    if (!res.ok) {
      setMessage(data.error || "No se pudo eliminar");
      return;
    }
    setMessage("Noticia eliminada");
    setTitle("");
    setContent("");
    setImage("");
    setPdfUrl("");
    setPdfName("");
    setSelectedSlug("");
    await loadNews();
  }

  async function uploadFile(file, type) {
    if (!token) {
      setMessage("Inicia sesión para subir archivos");
      return null;
    }
    if (type === "image" && file.size > maxImageMb * 1024 * 1024) {
      setMessage(`La imagen supera ${maxImageMb} MB`);
      return null;
    }
    if (type === "pdf" && file.size > maxPdfMb * 1024 * 1024) {
      setMessage(`El PDF supera ${maxPdfMb} MB`);
      return null;
    }
    setUploading(true);
    setMessage("");
    const form = new FormData();
    form.append("file", file);
    const res = await fetch(`${API_URL}/api/upload/${type}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: form,
    });
    const data = await res.json();
    setUploading(false);
    if (!res.ok) {
      setMessage(data.error || "No se pudo subir");
      return null;
    }
    return data;
  }

  return (
    <section className="panel">
      <div className="card">
        <h1>Admin</h1>
        <p>Inicia sesión y publica noticias.</p>
      </div>

      <form className="card panel" onSubmit={handleLogin}>
        <div className="field">
          <label>Email</label>
          <input value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className="field">
          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <button className="btn" type="submit">
          <LogIn size={16} />
          Iniciar sesión
        </button>
        <button
          className="btn secondary"
          type="button"
          onClick={handleLogout}
          disabled={!token}
        >
          <LogOut size={16} />
          Cerrar sesión
        </button>
      </form>

      <div className="card panel">
        <h2>Noticias</h2>
        {news.length === 0 && <p>No hay noticias todavía.</p>}
        {news.map((item) => (
          <button
            key={item.slug}
            className="btn secondary"
            type="button"
            onClick={() => {
              setSelectedSlug(item.slug);
              setTitle(item.frontmatter?.title || "");
              setContent(item.content || "");
              setImage(item.frontmatter?.image || "");
              setPdfUrl(item.frontmatter?.pdf_url || "");
              setPdfName(item.frontmatter?.pdf_name || "");
            }}
          >
            {item.frontmatter?.title || item.slug}
          </button>
        ))}
      </div>

      <form className="card panel" onSubmit={handleCreate}>
        <div className="field">
          <label>Título</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
        <div className="field">
          <label>Contenido</label>
          <textarea
            rows="6"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        </div>
        <div className="field">
          <label>URL Imagen</label>
          <input value={image} onChange={(e) => setImage(e.target.value)} />
          <input
            type="file"
            accept="image/*"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              const result = await uploadFile(file, "image");
              if (result?.url) setImage(result.url);
            }}
          />
          <small>
            <ImageIcon size={14} /> Máximo {maxImageMb} MB
          </small>
        </div>
        <div className="field">
          <label>URL PDF</label>
          <input value={pdfUrl} onChange={(e) => setPdfUrl(e.target.value)} />
          <input
            placeholder="Nombre del PDF"
            value={pdfName}
            onChange={(e) => setPdfName(e.target.value)}
          />
          <input
            type="file"
            accept="application/pdf"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              const result = await uploadFile(file, "pdf");
              if (result?.url) setPdfUrl(result.url);
              if (result?.filename) setPdfName(result.filename);
            }}
          />
          <small>
            <FileText size={14} /> Máximo {maxPdfMb} MB
          </small>
        </div>
        <div className="actions">
          <button className="btn" type="submit" disabled={!token}>
            <Plus size={16} />
            Publicar
          </button>
          <button
            className="btn secondary"
            type="button"
            onClick={handleUpdate}
            disabled={!token}
          >
            <Save size={16} />
            Guardar cambios
          </button>
          <button
            className="btn secondary"
            type="button"
            onClick={handleDelete}
            disabled={!token}
          >
            <Trash2 size={16} />
            Eliminar
          </button>
          {uploading && <span>Subiendo...</span>}
          <button
            className="btn secondary"
            type="button"
            onClick={() => {
              setTitle("");
              setContent("");
              setImage("");
              setPdfUrl("");
              setPdfName("");
              setSelectedSlug("");
            }}
          >
            Limpiar
          </button>
        </div>
      </form>

      {message && <div className="card">{message}</div>}
    </section>
  );
}

export default Admin;
