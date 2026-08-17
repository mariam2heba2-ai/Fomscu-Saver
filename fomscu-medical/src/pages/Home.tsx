import { Link } from "react-router-dom";
import { getFoundations } from "../utils/data";
import AnimatedIcon from "../components/AnimatedIcon";
import { getSiteSettings } from "../utils/storage";

export default function Home() {
  const foundations = getFoundations();
  const settings = getSiteSettings();

  return (
    <div>
      <section className="hero card" style={{ position: 'relative', overflow: 'visible' }}>
        <div>
          <h1>FOMSCU SAVER</h1>
          <p className="subtitle subtitle-animated">BY M TEAM 🫡</p>
          <p className="hero-meta">A premium, curated platform for medical students — concise lectures, curated sources, and structured pathways to master core topics.</p>
          <div className="hero-cta">
            <Link to="/f/foundation-1" className="btn-hero">
              هديه foundation 1<span className="cta-emoji" aria-hidden>🎁</span>
            </Link>
          </div>
        </div>
        <div style={{ width: 360, position: 'relative' }}>
          <div className="hero-visual">
            <img
              src={settings?.homepage?.heroImage || settings?.logo || "/assets/illustrations/fomscu-logo.svg"}
              alt={settings?.homepage?.heroTitle || "FOMSCU SAVER Logo"}
              className="hero-illustration"
            />
            <div className="floating floating-dna"><AnimatedIcon name="genetics" size={28} /></div>
            <div className="floating floating-heart"><AnimatedIcon name="physiology" size={28} /></div>
            <div className="floating floating-microscope"><AnimatedIcon name="histology" size={28} /></div>
            <div className="floating floating-bone"><AnimatedIcon name="anatomy" size={28} /></div>

            {/* Square picture avatars for medical staff (linked to Telegram) */}
            <div className="hero-avatars">
              <a className="hero-avatar" href="https://t.me/+h6Cwn3Lv9HkwYmRk" target="_blank" rel="noopener noreferrer" aria-label="M Team Telegram link - female doctor">👩‍⚕️</a>
              <a className="hero-avatar" href="https://t.me/+h6Cwn3Lv9HkwYmRk" target="_blank" rel="noopener noreferrer" aria-label="M Team Telegram link - male doctor">👨‍⚕️</a>
            </div>
          </div>
        </div>
      </section>

      <h2 style={{ marginTop: 18 }}>Foundations</h2>
      <p className="subtitle">Select a foundation to browse its subjects and lectures.</p>

      <div className="foundation-grid">
        {foundations.map((f) => (
          <Link to={`/f/${f.id}`} key={f.id} className="foundation-tile">
            <div className="tile-top">
              <div className="tile-icon"><AnimatedIcon id={f.id} name={f.name} size={36} /></div>
              <div style={{ flex: 1 }}>
                <div className="tile-title">{f.name}</div>
                <div className="tile-desc">{(f as any).description || "Explore carefully curated subjects and lectures."}</div>
              </div>
            </div>
            <div className="tile-actions">
              <div className="topic-meta">{f.subjects.length} subject{f.subjects.length === 1 ? "" : "s"}</div>
              <div style={{ marginLeft: 12 }}>
                <div className="explore-btn">Explore</div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
