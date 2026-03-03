import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { Document, Page, pdfjs } from "react-pdf";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

function NewsDetail() {
  const { slug } = useParams();
  const [item, setItem] = useState(null);
  const [error, setError] = useState("");
  const [numPages, setNumPages] = useState(0);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageWidth, setPageWidth] = useState(0);
  const [pageHeight, setPageHeight] = useState(0);
  const containerRef = useRef(null);

  useEffect(() => {
    fetch(`${API_URL}/api/news/${slug}`)
      .then((res) => res.json())
      .then((data) => setItem(data))
      .catch(() => setError("No se pudo cargar la noticia"));
  }, [slug]);

  useEffect(() => {
    function updateWidth() {
      if (containerRef.current) {
        const padding = 24;
        setPageWidth(Math.max(300, containerRef.current.clientWidth - padding));
      }
    }
    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, [item]);


  if (error) return <div className="card">{error}</div>;
  if (!item) return <div className="card">Cargando...</div>;

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
    <article className="card">
      <h1>{item.frontmatter?.title || "Sin título"}</h1>
      <p>{formatDate(item.frontmatter?.date_published)}</p>
      {item.frontmatter?.image && (
        <img
          src={item.frontmatter.image}
          alt={item.frontmatter.title || "Imagen"}
          style={{ maxWidth: "100%", borderRadius: 8 }}
        />
      )}
      <p style={{ whiteSpace: "pre-wrap" }}>{item.content}</p>
      {item.frontmatter?.pdf_url && (
        <section className="pdf-section">
          <div
            className="pdf-viewer"
            ref={containerRef}
            style={{
              height: pageHeight ? `${pageHeight + 12}px` : "auto",
            }}
          >
            <Document
              file={item.frontmatter.pdf_url}
              onLoadSuccess={({ numPages: total }) => {
                setNumPages(total);
                setPageNumber(1);
              }}
            >
              <Page
                pageNumber={pageNumber}
                width={pageWidth || undefined}
                renderTextLayer={false}
                renderAnnotationLayer={false}
                onLoadSuccess={(page) => {
                  if (!pageWidth) return;
                  const viewport = page.getViewport({ scale: 1 });
                  const scale = pageWidth / viewport.width;
                  setPageHeight(Math.round(viewport.height * scale));
                }}
              />
            </Document>
          </div>
          {numPages > 1 && (
            <div className="pdf-actions">
              <button
                className="btn secondary"
                type="button"
                onClick={() => setPageNumber((p) => Math.max(1, p - 1))}
              >
                Anterior
              </button>
              <span>
                Página {pageNumber} de {numPages}
              </span>
              <button
                className="btn secondary"
                type="button"
                onClick={() => setPageNumber((p) => Math.min(numPages, p + 1))}
              >
                Siguiente
              </button>
            </div>
          )}
          <p>
            <a
              href={`${API_URL}/api/news/${slug}/pdf`}
              target="_blank"
              rel="noreferrer"
              download
            >
              Descargar PDF
            </a>
          </p>
          <p>
            <a
              href={`${API_URL}/api/news/${slug}/pdf-inline/${encodeURIComponent(
                item.frontmatter?.pdf_name
                  ? `${item.frontmatter.pdf_name}.pdf`
                  : "documento.pdf"
              )}`}
              target="_blank"
              rel="noreferrer"
            >
              Ver documento
            </a>
          </p>
        </section>
      )}
    </article>
  );
}

export default NewsDetail;
