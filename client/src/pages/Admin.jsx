import { useEffect, useState } from "react";
import {
  Image as ImageIcon,
  Eye,
  EyeOff,
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
  const [rememberEmail, setRememberEmail] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [news, setNews] = useState([]);
  const [selectedSlug, setSelectedSlug] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [image, setImage] = useState("");
  const [pdfUrl, setPdfUrl] = useState("");
  const [pdfName, setPdfName] = useState("");
  const [pdfEmbed, setPdfEmbed] = useState(false);
  const [message, setMessage] = useState("");
  const [uploading, setUploading] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [confirmLabel, setConfirmLabel] = useState("");
  const maxImageMb = Number(import.meta.env.VITE_MAX_IMAGE_MB || 5);
  const maxPdfMb = Number(import.meta.env.VITE_MAX_PDF_MB || 20);
  const tokenStorageKey = "flatcms_token";
  const emailStorageKey = "flatcms_email";

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
    const savedEmail = localStorage.getItem(emailStorageKey);
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberEmail(true);
    }
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
    if (rememberEmail) {
      localStorage.setItem(emailStorageKey, email);
    } else {
      localStorage.removeItem(emailStorageKey);
    }
    setMessage("");
    await loadNews();
  }

  function handleLogout() {
    setToken("");
    localStorage.removeItem(tokenStorageKey);
    setMessage("");
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
        pdf_show: pdfEmbed,
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
    setPdfEmbed(false);
    setSelectedSlug("");
    setIsEditing(false);
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
        pdf_show: pdfEmbed,
        status: "published",
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setMessage(data.error || "No se pudo actualizar");
      return;
    }
    setMessage("Noticia actualizada");
    setIsEditing(false);
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
    setPdfEmbed(false);
    setSelectedSlug("");
    setIsEditing(false);
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

  function formatDate(value) {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleString("es-ES", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return (
    <section className="panel">


      <div className="admin-grid">
        <aside className="card panel admin-side">
          <h2 className="section-title">Sesión</h2>
          <p className="section-hint">
            Acceso exclusivo para el administrador.
          </p>
          {!token ? (
            <form className="panel" onSubmit={handleLogin}>
              <div className="field">
                <label>Email</label>
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <label className="remember-line">
                <input
                  type="checkbox"
                  checked={rememberEmail}
                  onChange={(e) => setRememberEmail(e.target.checked)}
                />
                Recordar email
              </label>
              <div className="field">
                <label>Password</label>
                <div className="field-inline">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    className="icon-btn"
                    type="button"
                    aria-label={
                      showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
                    }
                    onClick={() => setShowPassword((prev) => !prev)}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <div className="actions">
                <button className="btn" type="submit">
                  <LogIn size={16} />
                  Iniciar sesión
                </button>
              </div>
            </form>
          ) : (
            <div className="actions">
              <button
                className="btn secondary"
                type="button"
                onClick={handleLogout}
              >
                <LogOut size={16} />
                Cerrar sesión
              </button>
            </div>
          )}
        </aside>

        {token ? (
          <div className="card panel">
            <h2 className="section-title">Publicaciones</h2>
            <p className="section-hint">Selecciona una para editar o eliminar.</p>
            <div className="news-list">
              {news.length === 0 && <p>No hay noticias todavía.</p>}
              {news.map((item) => (
                <button
                  key={item.slug}
                  className={`news-item ${
                    selectedSlug === item.slug ? "active" : ""
                  }`}
                  type="button"
                  onClick={() => {
                    setSelectedSlug(item.slug);
                    setTitle(item.frontmatter?.title || "");
                    setContent(item.content || "");
                    setImage(item.frontmatter?.image || "");
                    setPdfUrl(item.frontmatter?.pdf_url || "");
                    setPdfName(item.frontmatter?.pdf_name || "");
                    setPdfEmbed(Boolean(item.frontmatter?.pdf_show));
                    setIsEditing(true);
                  }}
                >
                  <span className="news-title">
                    {item.frontmatter?.title || item.slug}
                  </span>
                  <span className="news-meta">
                    {formatDate(item.frontmatter?.date_published)}
                  </span>
                </button>
              ))}
            </div>
            <button
              className="btn"
              type="button"
              onClick={() => {
                setSelectedSlug("");
                setTitle("");
            setContent("");
            setImage("");
            setPdfUrl("");
            setPdfName("");
            setPdfEmbed(false);
            setIsEditing(true);
          }}
            >
              <Plus size={16} />
              Crear publicación
            </button>
          </div>
        ) : (
          <div className="card panel">
            <h2 className="section-title">Publicaciones</h2>
            <p className="section-hint">
              Inicia sesión para ver y gestionar publicaciones.
            </p>
          </div>
        )}
      </div>

      {token && isEditing && (
        <form
          className="card panel"
          onSubmit={selectedSlug ? handleUpdate : handleCreate}
        >
        <h2 className="section-title">Edición</h2>
        <p className="section-hint">
          Crea nuevas publicaciones o actualiza las existentes.
        </p>
        <div className="field">
          <label>Título</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
        <div className="field">
          <label>Contenido (opcional)</label>
          <textarea
            rows="6"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        </div>
        <div className="field">
          <label>Imagen</label>
          {image && (
            <div className="media-preview">
              <img src={image} alt="Imagen actual" />
              <button
                className="btn secondary"
                type="button"
                onClick={() => {
                  setConfirmLabel("Quitar imagen");
                  setConfirmAction(() => () => setImage(""));
                }}
              >
                Quitar imagen
              </button>
            </div>
          )}
          {!image && (
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
          )}
          <small>
            <ImageIcon size={14} /> Máximo {maxImageMb} MB
          </small>
        </div>
        <div className="field">
          <label>PDF</label>
          {pdfUrl && (
            <div className="media-preview">
              <div>
                <div className="media-name">
                  {pdfName ? `${pdfName}.pdf` : "Documento PDF"}
                </div>
                <a
                  className="media-link"
                  href={pdfUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  Ver PDF actual
                </a>
              </div>
              <button
                className="btn secondary"
                type="button"
                onClick={() => {
                  setConfirmLabel("Quitar PDF");
                  setConfirmAction(
                    () => () => {
                      setPdfUrl("");
                      setPdfName("");
                    }
                  );
                }}
              >
                Quitar PDF
              </button>
            </div>
          )}
          {!pdfUrl && (
            <>
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
            </>
          )}
          {pdfUrl && (
            <label className="remember-line">
              <input
                type="checkbox"
                checked={pdfEmbed}
                onChange={(e) => setPdfEmbed(e.target.checked)}
              />
              Mostrar PDF embebido en la noticia
            </label>
          )}
          <small>
            <FileText size={14} /> Máximo {maxPdfMb} MB
          </small>
        </div>
        <div className="actions">
          <button className="btn" type="submit" disabled={!token}>
            <Save size={16} />
            {selectedSlug ? "Guardar cambios" : "Publicar"}
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
          <button
            className="btn secondary"
            type="button"
            onClick={() => {
    setTitle("");
    setContent("");
    setImage("");
    setPdfUrl("");
    setPdfName("");
    setPdfEmbed(false);
    setSelectedSlug("");
    setIsEditing(false);
            }}
          >
            Cancelar
          </button>
        </div>
        {uploading && <div className="uploading-note">Subiendo...</div>}
      </form>
      )}

      {message && <div className="card">{message}</div>}

      {confirmAction && (
        <div className="modal-backdrop">
          <div className="modal">
            <h3>Confirmar acción</h3>
            <p>Esta acción eliminará el archivo de forma permanente.</p>
            <div className="actions">
              <button
                className="btn secondary"
                type="button"
                onClick={() => {
                  setConfirmAction(null);
                  setConfirmLabel("");
                }}
              >
                Cancelar
              </button>
              <button
                className="btn"
                type="button"
                onClick={() => {
                  confirmAction();
                  setConfirmAction(null);
                  setConfirmLabel("");
                }}
              >
                {confirmLabel || "Confirmar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default Admin;
