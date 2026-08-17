import { Link, useParams } from "react-router-dom";
import { getFoundation, getSubject, getLectures } from "../utils/data";
import Breadcrumbs from "../components/Breadcrumbs";
import AnimatedIcon from "../components/AnimatedIcon";

export default function SubjectPage() {
  const { foundationId = "", subjectId = "" } = useParams();
  const foundation = getFoundation(foundationId);
  const subject = getSubject(foundationId, subjectId);
  const lectures = getLectures(foundationId, subjectId);

  if (!foundation || !subject) {
    return <p className="empty-state">Subject not found.</p>;
  }

  return (
    <div>
      <Breadcrumbs
        crumbs={[
          { label: "Home", path: "/" },
          { label: foundation.name, path: `/f/${foundation.id}` },
          { label: subject.name },
        ]}
      />
      <h1>{subject.name}</h1>
      <p className="subtitle">{foundation.name}</p>

      {lectures.length === 0 && (
        <p className="empty-state">No lectures added yet for this subject.</p>
      )}

      <div className="subject-grid reveal-list" style={{ marginTop: 12 }}>
        {lectures.map((l) => (
          <Link to={`/f/${foundation.id}/${subject.id}/${l.id}`} key={l.id} className="subject-tile">
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 64, height: 64, borderRadius: 12, background: 'linear-gradient(135deg, rgba(255,255,255,0.02), rgba(0,0,0,0.02))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <AnimatedIcon id={l.id} name={l.title} size={40} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 800 }}>{l.title}</div>
                <div className="topic-meta">{l.sources.length} source{l.sources.length === 1 ? "" : "s"}</div>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div className="topic-count">{l.sources.length}</div>
              <div style={{ marginLeft: 8 }} className="btn-small">Open</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
