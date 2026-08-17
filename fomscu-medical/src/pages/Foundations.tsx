import { Link } from "react-router-dom";
import { getFoundations } from "../utils/data";

export default function Foundations() {
  const foundations = getFoundations();

  return (
    <div>
      <h1>Foundations</h1>
      <p className="subtitle">All foundations in the curriculum.</p>

      <div className="foundation-grid">
        {foundations.map((f) => (
          <Link to={`/f/${f.id}`} key={f.id} className="foundation-tile">
            <div className="tile-top">
              <div style={{ flex: 1 }}>
                <div className="tile-title">{f.name}</div>
                <div className="tile-desc">{f.subjects?.length || 0} subject{(f.subjects?.length || 0) === 1 ? "" : "s"}</div>
              </div>
            </div>
            <div className="tile-actions">
              <div className="explore-btn">Open</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
