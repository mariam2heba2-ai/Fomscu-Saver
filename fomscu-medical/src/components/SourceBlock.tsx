import { useState, useRef, useEffect } from "react";
import type { Source } from "../types";

const TYPE_LABELS: Record<Source["type"], string> = {
  university: "University",
  doctor: "Doctor",
  youtube: "YouTube",
  telegram: "Telegram",
  drive: "Google Drive",
  sharepoint: "SharePoint",
  playlist: "Playlist",
  other: "Other",
};

function IconForType(type: Source["type"]) {
  const commonProps = { className: "resource-icon", viewBox: "0 0 24 24", fill: "currentColor", xmlns: "http://www.w3.org/2000/svg" } as any;
  switch (type) {
    case "youtube":
      return (
        <span className="icon-wrap icon-bg-blue icon-animated" aria-hidden>
          <svg {...commonProps}><path d="M23 7s-.2-1.7-.8-2.4c-.8-.9-1.7-.9-2.1-1C16.8 3 12 3 12 3s-4.8 0-8 .6c-.4.1-1.3.1-2.1 1C1.2 5.3 1 7 1 7S0.8 9.1 0.8 11.3v1.4C0.8 14.9 1 17 1 17s.2 1.7.8 2.4c.8.9 1.9.9 2.4 1 1.7.3 7 .6 7 .6s4.8 0 8-.6c.4-.1 1.3-.1 2.1-1 .6-.7.8-2.4.8-2.4s.2-2.1.2-4.3V11.3C23.2 9.1 23 7 23 7z" /></svg>
        </span>
      );
    case "telegram":
      return (
        <span className="icon-wrap icon-bg-accent" aria-hidden>
          <svg {...commonProps}><path d="M22 2L2 11.5l5.5 2.1L9 21l3-2 5 3 4-18z" /></svg>
        </span>
      );
    case "playlist":
      return (
        <span className="icon-wrap icon-bg-blue" aria-hidden>
          <svg {...commonProps}><path d="M3 6h18v2H3V6zm0 5h12v2H3v-2zm0 5h18v2H3v-2z" /></svg>
        </span>
      );
    case "drive":
      return (
        <span className="icon-wrap icon-bg-accent" aria-hidden>
          <svg {...commonProps}><path d="M12 2l4 7h-8l4-7zm6 9h4l-6 11-6-11h4v-2h4v2z" /></svg>
        </span>
      );
    case "sharepoint":
      return (
        <span className="icon-wrap icon-bg-blue" aria-hidden>
          <svg {...commonProps}><path d="M12 2L2 7l10 5 10-5-10-5zm0 9l-10 5 2 6 8-4 8 4 2-6-10-5z" /></svg>
        </span>
      );
    case "university":
      return (
        <span className="icon-wrap icon-bg-green" aria-hidden>
          <svg {...commonProps}><path d="M12 2L1 7l11 5 11-5-11-5zm0 7L3 8v6l9 4 9-4V8l-9 1z" /></svg>
        </span>
      );
    default:
      return (
        <span className="icon-wrap icon-bg-blue" aria-hidden>
          <svg {...commonProps}><path d="M12 2a5 5 0 00-5 5v11a5 5 0 0010 0V7a5 5 0 00-5-5zm-1 14h2v2h-2v-2zm0-10h2v8h-2V6z" /></svg>
        </span>
      );
  }
}

function TopicIconFor(topic: string) {
  const t = topic.toLowerCase();
  const props = { className: "resource-icon", viewBox: "0 0 24 24", fill: "currentColor", xmlns: "http://www.w3.org/2000/svg" };
  if (t.includes("frontal") || t.includes("frontalis") || t.includes("face")) {
    return (<span className="icon-wrap icon-bg-blue icon-animated" aria-hidden><svg {...props}><path d="M12 2a7 7 0 00-7 7v3a7 7 0 0014 0V9a7 7 0 00-7-7z"/></svg></span>);
  }
  if (t.includes("lateralis") || t.includes("lateral") || t.includes("side")) {
    return (<span className="icon-wrap icon-bg-accent icon-animated" aria-hidden><svg {...props}><path d="M12 2c-2 0-4 1-6 3v14c2 2 4 3 6 3s4-1 6-3V5c-2-2-4-3-6-3z"/></svg></span>);
  }
  if (t.includes("basalis") || t.includes("basal") || t.includes("basalis externa") || t.includes("basalis interna")) {
    return (<span className="icon-wrap icon-bg-blue" aria-hidden><svg {...props}><path d="M4 4h16v2H4V4zm2 4h12v10H6V8z"/></svg></span>);
  }
  if (t.includes("occipital") || t.includes("occipitalis")) {
    return (<span className="icon-wrap icon-bg-green icon-animated" aria-hidden><svg {...props}><path d="M12 2c-3 0-7 2-7 6v8c0 4 4 6 7 6s7-2 7-6V8c0-4-4-6-7-6z"/></svg></span>);
  }
  if (t.includes("cranial") || t.includes("skull cap") || t.includes("cranial cavity")) {
    return (<span className="icon-wrap icon-bg-blue icon-animated" aria-hidden><svg {...props}><path d="M12 2c-4 0-8 3-9 7 1 8 8 10 9 10s8-2 9-10c-1-4-5-7-9-7z"/></svg></span>);
  }
  if (t.includes("foramina") || t.includes("foramen") || t.includes("forina") || t.includes("foramina")) {
    return (<span className="icon-wrap icon-bg-yellow" aria-hidden><svg {...props}><circle cx="12" cy="12" r="6"/></svg></span>);
  }
  if (t.includes("applied")) {
    return (<span className="icon-wrap icon-bg-accent icon-animated" aria-hidden><svg {...props}><path d="M4 4h16v2H4V4zm2 6h12v8H6v-8z"/></svg></span>);
  }
  // default
  return (<span className="icon-wrap icon-bg-blue" aria-hidden><svg {...props}><path d="M12 2a5 5 0 00-5 5v11a5 5 0 0010 0V7a5 5 0 00-5-5z"/></svg></span>);
}

export default function SourceBlock({ source }: { source: Source }) {
  return (
    <div className="source-block">
      <div className="source-title">
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            {IconForType(source.type)}
            <div>
              <div style={{ fontWeight: 700 }}>{source.name}</div>
              <div style={{ fontSize: 12, color: "var(--color-text-muted)" }}>{TYPE_LABELS[source.type]}</div>
            </div>
          </div>
        </div>
        <div style={{ marginLeft: "auto" }}>
          {source.recommended && <span className="badge recommended">Recommended</span>}
        </div>
      </div>

      <div style={{ marginTop: 12 }}>
        {/* Treat a single-part array labelled like "Part 1" as a single URL for display. */}
        {((source.url && !source.parts?.length) || (source.parts && source.parts.length === 1 && /^\s*part\s*1\b/i.test(source.parts[0].title))) && (
          (() => {
            const singleUrl = source.url || (source.parts && source.parts[0]?.url) || "";
              return (
              <a
                className={`resource-btn ${source.type}`}
                href={singleUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Open ${TYPE_LABELS[source.type]}`}
              >
                {IconForType(source.type)}
                {(() => {
                  switch (source.type) {
                    case "youtube":
                      return "Watch Video";
                    case "playlist":
                      return "Open Playlist";
                    case "telegram":
                      return "Open Telegram";
                    case "drive":
                      return "Open Drive";
                    case "sharepoint":
                      return "Open SharePoint";
                    case "university":
                      return "Open University Data";
                    default:
                      return "Open";
                  }
                })()}
              </a>
            );
          })()
        )}

        {source.parts && source.parts.length > 0 && !(source.parts.length === 1 && /^\s*part\s*1\b/i.test(source.parts[0].title)) && (
          <div className="source-topics" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {
              // Group consecutive parts by their topic name. A topic is the text before "- Part" when present,
              // otherwise the whole part title is treated as a single-part topic.
            }
            {(() => {
              const parts = [...source.parts].sort((a, b) => a.order - b.order);
              const groups: { title: string; parts: typeof parts }[] = [];
              for (const p of parts) {
                const match = p.title.split(/\s*-\s*Part\b/i)[0].trim();
                const topic = match || p.title;
                const last = groups[groups.length - 1];
                if (last && last.title === topic) {
                  last.parts.push(p);
                } else {
                  groups.push({ title: topic, parts: [p] });
                }
              }

              return groups.map((g, idx) => (
                <TopicGroup
                  key={idx}
                  index={idx + 1}
                  topic={g.title}
                  parts={g.parts}
                  sourceType={source.type}
                />
              ));
            })()}
          </div>
        )}
      </div>
    </div>
  );
}

function TopicGroup({
  index,
  topic,
  parts,
  sourceType,
}: {
  index: number;
  topic: string;
  parts: { title: string; url: string; order: number }[];
  sourceType: Source["type"];
}) {
  const [open, setOpen] = useState<boolean>(true);
  const partsRef = useRef<HTMLDivElement | null>(null);
  const [maxH, setMaxH] = useState<string>("0px");

  useEffect(() => {
    if (!partsRef.current) return;
    if (open) setMaxH(`${partsRef.current.scrollHeight}px`);
    else setMaxH("0px");
  }, [open, parts]);

  return (
    <div className="source-topic card" style={{ padding: 12 }}>
      <div className="topic-header" style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <div className="card-icon">{TopicIconFor(topic)}</div>
          <div>
            <div style={{ fontWeight: 800, color: "var(--color-primary-dark)" }}>{index}. {topic}</div>
            <div className="topic-meta" style={{ marginTop: 4 }}>{parts.length} {parts.length > 1 ? "Parts" : "Video"}</div>
          </div>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", gap: 8, alignItems: "center" }}>
          <button className="btn-small" onClick={() => setOpen((s: boolean) => !s)}>
            {open ? "Collapse" : "Expand"}
          </button>
        </div>
      </div>

      <div ref={partsRef} className="topic-parts" style={{ marginTop: 10, maxHeight: maxH, opacity: open ? 1 : 0 }}>
        {parts.map((p, i) => {
          const isMulti = parts.length > 1;
          const label = isMulti ? p.title.replace(/\s*-\s*Part\s*\d+/i, "Part") : p.title;
          return (
            <div key={p.order} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: '8px 0' }}>
              <div style={{ fontWeight: 600 }}>{label}</div>
              <div style={{ display: "flex", gap: 8 }}>
                <a className="resource-btn" href={p.url} target="_blank" rel="noopener noreferrer">
                  <svg className="resource-icon" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" style={{ width: 16, height: 16 }}>
                    <path d="M8 5v14l11-7z" />
                  </svg>
                  {" "}Watch
                </a>
                {isMulti && <div className="btn-small" style={{ border: "1px solid var(--color-border)", borderRadius: 8, padding: "6px 8px" }}>{i + 1}</div>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
