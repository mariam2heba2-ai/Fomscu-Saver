import { Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Home from "./pages/Home";
import FoundationPage from "./pages/FoundationPage";
import Foundations from "./pages/Foundations";
import SubjectPage from "./pages/SubjectPage";
import LecturePage from "./pages/LecturePage";
import SearchResults from "./pages/SearchResults";
import ContentManager from "./pages/ContentManager";
import { useEffect } from "react";
import { loadWebsiteCustomization } from "./utils/storage";

export default function App() {
  useEffect(() => {
    // Load website-customization.json from public path on first visit (best-effort)
    loadWebsiteCustomization().catch(() => {});
  }, []);
  return (
    <div className="app-shell">
      <Header />
      <main className="content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/f/:foundationId" element={<FoundationPage />} />
          <Route path="/f/:foundationId/:subjectId" element={<SubjectPage />} />
          <Route
            path="/f/:foundationId/:subjectId/:lectureId"
            element={<LecturePage />}
          />
          <Route path="/search" element={<SearchResults />} />
          <Route path="/foundations" element={<Foundations />} />
          <Route path="/manage" element={<ContentManager />} />
          <Route path="*" element={<p className="empty-state">Page not found.</p>} />
        </Routes>
      </main>
    </div>
  );
}
