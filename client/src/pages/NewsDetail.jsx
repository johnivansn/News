import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

function NewsDetail() {
  const { slug } = useParams();
  const [item, setItem] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`${API_URL}/api/news/${slug}`)
      .then((res) => res.json())
      .then((data) => setItem(data))
      .catch(() => setError("No se pudo cargar la noticia"));
  }, [slug]);

  if (error) return <div className="card">{error}</div>;
  if (!item) return <div className="card">Cargando...</div>;

  return (
    <article className="card">
      <h1>{item.frontmatter?.title || "Sin título"}</h1>
      <p>{item.frontmatter?.date_published || ""}</p>
      {item.frontmatter?.image && (
        <img
          src={item.frontmatter.image}
          alt={item.frontmatter.title || "Imagen"}
          style={{ maxWidth: "100%", borderRadius: 8 }}
        />
      )}
      <p style={{ whiteSpace: "pre-wrap" }}>{item.content}</p>
      {item.frontmatter?.pdf_url && (
        <p>
          <a href={item.frontmatter.pdf_url} target="_blank" rel="noreferrer">
            Descargar PDF
          </a>
        </p>
      )}
    </article>
  );
}

export default NewsDetail;
