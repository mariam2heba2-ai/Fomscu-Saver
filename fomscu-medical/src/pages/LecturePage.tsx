import { Link, useParams } from "react-router-dom";
import { getFoundation, getSubject, getLecture } from "../utils/data";
import Breadcrumbs from "../components/Breadcrumbs";
import SourceBlock from "../components/SourceBlock";

export default function LecturePage() {
  const { foundationId = "", subjectId = "", lectureId = "" } = useParams();
  const foundation = getFoundation(foundationId);
  const subject = getSubject(foundationId, subjectId);
  const lecture = getLecture(foundationId, subjectId, lectureId);

  if (!foundation || !subject || !lecture) {
    return <p className="empty-state">Lecture not found.</p>;
  }


  const sortedSources = [...lecture.sources].sort((a, b) =>
    a.recommended === b.recommended ? 0 : a.recommended ? -1 : 1
  );

  return (
    <div>
      <Breadcrumbs
        crumbs={[
          { label: "Home", path: "/" },
          { label: foundation.name, path: `/f/${foundation.id}` },
          { label: subject.name, path: `/f/${foundation.id}/${subject.id}` },
          { label: lecture.title },
        ]}
      />
      <h1 style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <svg viewBox="0 0 24 24" width={28} height={28} fill="currentColor" style={{ color: "var(--color-primary)" }} xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2C8 2 4 4 2 7v8c2 3 6 5 10 5s8-2 10-5V7c-2-3-6-5-10-5zm0 3.5c1.7 0 3 1.3 3 3s-1.3 3-3 3-3-1.3-3-3 1.3-3 3-3z"/>
        </svg>
        {lecture.title}
      </h1>
      {lecture.description && <p className="subtitle">{lecture.description}</p>}

      <h2>Sources</h2>
      {sortedSources.length === 0 && (
        <p className="empty-state">No sources added yet for this lecture.</p>
      )}
      {sortedSources.length > 0 && (
        <>
          <div className="sources-grid">
            <SourceBlock key={sortedSources[0].id} source={sortedSources[0]} />
          </div>

          {sortedSources.length > 1 && (
            <div className="alternative-section">
              <h3 style={{ marginTop: 0 }}>Alternative Sources</h3>
              <div className="sources-grid">
                {sortedSources.slice(1).map((s) => (
                  <SourceBlock key={s.id} source={s} />
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Related questions removed to keep Question Bank UI hidden */}
    </div>
  );
}
