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

  return (
    <section className="panel">
      <div className="card">
        <h1>Noticias</h1>
        <p>Últimas publicaciones del sitio.</p>
      </div>

      {error && <div className="card">{error}</div>}

      {news.map((item) => (
        <div className="card" key={item.slug}>
          <h2>{item.frontmatter?.title || "Sin título"}</h2>
          <p>{item.frontmatter?.date_published || ""}</p>
          <Link to={`/news/${item.slug}`}>Leer más</Link>
        </div>
      ))}
    </section>
  );
}

export default Home;
