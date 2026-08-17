import { Link } from "react-router-dom";

export interface Crumb {
  label: string;
  path?: string; // omit for the current/last crumb
}

export default function Breadcrumbs({ crumbs }: { crumbs: Crumb[] }) {
  return (
    <nav className="breadcrumbs">
      {crumbs.map((crumb, i) => (
        <span key={i}>
          {crumb.path ? <Link to={crumb.path}>{crumb.label}</Link> : crumb.label}
          {i < crumbs.length - 1 && " > "}
        </span>
      ))}
    </nav>
  );
}
