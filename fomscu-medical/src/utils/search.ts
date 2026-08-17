import { getWorkingData } from "./storage";
import type { SearchResult } from "../types";

/**
 * Simple case-insensitive substring search across the entire
 * content tree and question bank. No external search service.
 */
export function globalSearch(query: string): SearchResult[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  const results: SearchResult[] = [];

  for (const foundation of getWorkingData().foundations) {
    if (foundation.name.toLowerCase().includes(q)) {
      results.push({
        kind: "foundation",
        id: foundation.id,
        title: foundation.name,
        breadcrumb: foundation.name,
        path: `/f/${foundation.id}`,
      });
    }

    for (const subject of foundation.subjects) {
      if (subject.name.toLowerCase().includes(q)) {
        results.push({
          kind: "subject",
          id: subject.id,
          title: subject.name,
          breadcrumb: `${foundation.name} > ${subject.name}`,
          path: `/f/${foundation.id}/${subject.id}`,
        });
      }

      for (const lecture of subject.lectures) {
        if (lecture.title.toLowerCase().includes(q)) {
          results.push({
            kind: "lecture",
            id: lecture.id,
            title: lecture.title,
            breadcrumb: `${foundation.name} > ${subject.name} > ${lecture.title}`,
            path: `/f/${foundation.id}/${subject.id}/${lecture.id}`,
          });
        }

        for (const source of lecture.sources) {
          if (source.name.toLowerCase().includes(q)) {
            results.push({
              kind: "source",
              id: source.id,
              title: source.name,
              breadcrumb: `${foundation.name} > ${subject.name} > ${lecture.title} > ${source.name}`,
              path: `/f/${foundation.id}/${subject.id}/${lecture.id}`,
            });
          }
        }
      }
    }
  }

  // Question Bank search results removed to hide Question Bank from UI

  return results;
}
