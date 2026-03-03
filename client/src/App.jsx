import { Route, Routes, Link } from "react-router-dom";
import Home from "./pages/Home.jsx";
import NewsDetail from "./pages/NewsDetail.jsx";
import Admin from "./pages/Admin.jsx";
import "./App.css";

function App() {
  return (
    <div className="app">
      <header className="header">
        <div className="container header-inner">
          <Link to="/" className="brand">
            NOTICIAS
          </Link>
          <nav className="nav">
            <Link to="/">Inicio</Link>
            <Link to="/admin">Admin</Link>
          </nav>
        </div>
      </header>

      <main className="container main">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/news/:slug" element={<NewsDetail />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </main>

      <footer className="footer">
        <div className="container footer-inner">
          <span>© 2026 Noticias</span>
          <nav className="footer-links">
            <a href="/#acerca">Acerca de</a>
            <a
              href="https://wa.me/59173758952"
              target="_blank"
              rel="noreferrer"
            >
              WhatsApp
            </a>
          </nav>
        </div>
      </footer>
    </div>
  );
}

export default App;
