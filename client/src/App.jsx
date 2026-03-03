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
        <div className="container">© 2026 Noticias</div>
      </footer>
    </div>
  );
}

export default App;
