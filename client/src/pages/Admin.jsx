import { useState } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

function Admin() {
  const [token, setToken] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [image, setImage] = useState("");
  const [pdfUrl, setPdfUrl] = useState("");
  const [message, setMessage] = useState("");

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
    setMessage("Sesión iniciada");
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
          Iniciar sesión
        </button>
      </form>

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
        </div>
        <div className="field">
          <label>URL PDF</label>
          <input value={pdfUrl} onChange={(e) => setPdfUrl(e.target.value)} />
        </div>
        <div className="actions">
          <button className="btn" type="submit" disabled={!token}>
            Publicar
          </button>
          <button
            className="btn secondary"
            type="button"
            onClick={() => {
              setTitle("");
              setContent("");
              setImage("");
              setPdfUrl("");
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
