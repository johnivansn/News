import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

function Home() {
  const [news, setNews] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`${API_URL}/api/news`)
      .then((res) => res.json())
      .then((data) => setNews(Array.isArray(data) ? data : []))
      .catch(() => setError("No se pudieron cargar las noticias"));
  }, []);

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
      <div className="card hero-compact" id="acerca">
        <h1>Noticias</h1>
        <p>Últimas publicaciones del sitio.</p>
      </div>

      {error && <div className="card">{error}</div>}

      <div className="news-grid">
        {news.map((item) => (
          <Link
            key={item.slug}
            className="news-card"
            to={`/news/${item.slug}`}
          >
            {item.frontmatter?.image && (
              <div className="news-image">
                <img
                  src={item.frontmatter.image}
                  alt={item.frontmatter?.title || "Imagen"}
                />
              </div>
            )}
            <div className="news-body">
              <h2 className="news-heading">
                {item.frontmatter?.title || "Sin título"}
              </h2>
              <p className="news-date">
                {formatDate(item.frontmatter?.date_published)}
              </p>
              {item.frontmatter?.pdf_url && (
                <span className="news-badge">PDF</span>
              )}
              <p className="news-excerpt">{item.content}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

export default Home;
