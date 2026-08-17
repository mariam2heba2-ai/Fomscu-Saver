import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { getSiteSettings } from "../utils/storage";

export default function Header() {
  const [query, setQuery] = useState("");
  const [theme, setTheme] = useState<string>(() =>
    typeof window !== "undefined" ? localStorage.getItem("fomscu_theme") ?? "light" : "light"
  );
  const navigate = useNavigate();
  const location = useLocation();
  const settings = getSiteSettings();

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  }

  useEffect(() => {
    try {
      document.documentElement.setAttribute("data-theme", theme === "dark" ? "dark" : "light");
      localStorage.setItem("fomscu_theme", theme);
    } catch {}
  }, [theme]);

  return (
    <header className="app-header">
      <a className="brand-icon" href="https://t.me/+h6Cwn3Lv9HkwYmRk" target="_blank" rel="noopener noreferrer" aria-label="M Team Telegram link" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>M&nbsp;team</a>

      {/* Separate prominent site title */}
      <nav className="app-nav">
        <Link to="/" className={location.pathname === "/" ? "active" : ""}>
          Home
        </Link>
        <Link to="/foundations" className={location.pathname === "/foundations" ? "active" : ""}>
          Foundations
        </Link>
        <Link
          to="/manage"
          className={location.pathname.startsWith("/manage") ? "active" : ""}
        >
          Content Manager
        </Link>
      </nav>
      <form className="search-box" onSubmit={handleSearch}>
        <input
          type="text"
          placeholder="Search..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </form>
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <a className="header-telegram" href="https://t.me/+h6Cwn3Lv9HkwYmRk" target="_blank" rel="noopener noreferrer" aria-label="Open Telegram invite">
          <svg className="telegram-icon" viewBox="0 0 240 240" xmlns="http://www.w3.org/2000/svg" role="img" aria-hidden="true">
            <circle cx="120" cy="120" r="120" fill="none" />
            <path d="M34 120l165-59-44 171  -41-53-55 37z" fill="currentColor" />
          </svg>
        </a>
        <button
          className="btn-icon"
          aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          onClick={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}
          title="Toggle theme"
        >
          {theme === "dark" ? (
            <svg className="resource-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" fill="currentColor" />
            </svg>
          ) : (
            <svg className="resource-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 3v2M12 19v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2M21 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4M12 7a5 5 0 100 10 5 5 0 000-10z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </button>
      </div>
      {/* accent/theme picker removed */}
    </header>
  );
}
