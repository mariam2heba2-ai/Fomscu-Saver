import { Link, useSearchParams } from "react-router-dom";
import { globalSearch } from "../utils/search";

const KIND_LABELS: Record<string, string> = {
  foundation: "Foundation",
  subject: "Subject",
  lecture: "Lecture",
  source: "Source",
  question: "Question",
};

export default function SearchResults() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") ?? "";
  const results = globalSearch(query);

  return (
    <div>
      <h1>Search Results</h1>
      <p className="subtitle">
        {results.length} result{results.length === 1 ? "" : "s"} for "{query}"
      </p>

      {results.length === 0 && <p className="empty-state">No matches found.</p>}

      {results.map((r) => (
        <div className="search-result" key={`${r.kind}-${r.id}`}>
          <div className="kind">{KIND_LABELS[r.kind]}</div>
          <Link to={r.path}>{r.title}</Link>
          <div className="meta">{r.breadcrumb}</div>
        </div>
      ))}
    </div>
  );
}
