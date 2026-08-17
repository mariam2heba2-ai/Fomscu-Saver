import { Link, useParams } from "react-router-dom";
import { getFoundation, getSubjects } from "../utils/data";
import Breadcrumbs from "../components/Breadcrumbs";
import AnimatedIcon from "../components/AnimatedIcon";

export default function FoundationPage() {
  const { foundationId = "" } = useParams();
  const foundation = getFoundation(foundationId);
  const subjects = getSubjects(foundationId);

  if (!foundation) {
    return <p className="empty-state">Foundation not found.</p>;
  }

  return (
    <div>
      <Breadcrumbs crumbs={[{ label: "Home", path: "/" }, { label: foundation.name }]} />
      <h1>{foundation.name}</h1>
      <p className="subtitle">Select a subject to browse its lectures.</p>

      {subjects.length === 0 && (
        <p className="empty-state">No subjects added yet for this foundation.</p>
      )}

      <div className="foundation-grid" style={{ marginTop: 12 }}>
        {subjects.map((s) => (
          <Link to={`/f/${foundation.id}/${s.id}`} key={s.id} className="card" style={{ display: 'flex', alignItems: 'center', padding: 12 }}>
            <div className="card-icon"><AnimatedIcon id={s.id} name={s.name} size={36} /></div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 800 }}>{s.name}</div>
              <div className="topic-meta">{s.lectures.length} lecture{s.lectures.length === 1 ? "" : "s"}</div>
            </div>
            <div style={{ marginLeft: 'auto' }}>
              <div className="topic-count">{s.lectures.length}</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
