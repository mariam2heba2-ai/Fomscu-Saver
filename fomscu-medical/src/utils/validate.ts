/**
 * FOMSCU Medical - Data validation
 * ---------------------------------------------------
 * Non-fatal checks run over the current working data (seed + local
 * edits). Returns a list of human-readable warnings; never throws,
 * and never blocks the app from rendering.
 */

import { getWorkingData, getWorkingQuestions } from "./storage";

export interface ValidationIssue {
  level: "error" | "warning";
  message: string;
}

function isLikelyValidUrl(url: string): boolean {
  if (!url || !url.trim()) return false;
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

function trackDuplicates(
  ids: string[],
  label: string,
  issues: ValidationIssue[]
): void {
  const seen = new Set<string>();
  const dupes = new Set<string>();
  for (const id of ids) {
    if (seen.has(id)) dupes.add(id);
    seen.add(id);
  }
  for (const id of dupes) {
    issues.push({
      level: "error",
      message: `Duplicate ${label} id: "${id}"`,
    });
  }
}

export function validateData(): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const data = getWorkingData();
  const questions = getWorkingQuestions().questions;

  const foundationIds: string[] = [];
  const subjectIds: string[] = [];
  const lectureIds: string[] = [];
  const sourceIds: string[] = [];

  for (const foundation of data.foundations) {
    if (!foundation.id) issues.push({ level: "error", message: "A foundation is missing an id." });
    if (!foundation.name) {
      issues.push({
        level: "error",
        message: `Foundation "${foundation.id || "(no id)"}" is missing a title.`,
      });
    }
    foundationIds.push(foundation.id);

    for (const subject of foundation.subjects) {
      if (!subject.id) {
        issues.push({
          level: "error",
          message: `A subject in "${foundation.name}" is missing an id.`,
        });
      }
      if (!subject.name) {
        issues.push({
          level: "error",
          message: `Subject "${subject.id || "(no id)"}" is missing a title.`,
        });
      }
      subjectIds.push(subject.id);

      for (const lecture of subject.lectures) {
        if (!lecture.id) {
          issues.push({
            level: "error",
            message: `A lecture in "${subject.name}" is missing an id.`,
          });
        }
        if (!lecture.title) {
          issues.push({
            level: "error",
            message: `Lecture "${lecture.id || "(no id)"}" is missing a title.`,
          });
        }
        lectureIds.push(lecture.id);

        if (lecture.sources.length === 0) {
          issues.push({
            level: "warning",
            message: `Lecture "${lecture.title}" (${subject.name}) has no resources added yet.`,
          });
        }

        for (const source of lecture.sources) {
          if (!source.id) {
            issues.push({
              level: "error",
              message: `A source in "${lecture.title}" is missing an id.`,
            });
          }
          if (!source.name) {
            issues.push({
              level: "error",
              message: `Source "${source.id || "(no id)"}" is missing a name.`,
            });
          }
          sourceIds.push(source.id);

          if (source.url && !isLikelyValidUrl(source.url)) {
            issues.push({
              level: "warning",
              message: `Source "${source.name}" has an invalid URL: "${source.url}"`,
            });
          }
          if (!source.url && (!source.parts || source.parts.length === 0)) {
            issues.push({
              level: "warning",
              message: `Source "${source.name}" in "${lecture.title}" has no URL and no parts.`,
            });
          }
          for (const part of source.parts ?? []) {
            if (!isLikelyValidUrl(part.url)) {
              issues.push({
                level: "warning",
                message: `"${part.title}" under "${source.name}" (${lecture.title}) has an invalid URL: "${part.url}"`,
              });
            }
          }
        }
      }
    }
  }

  trackDuplicates(foundationIds, "foundation", issues);
  trackDuplicates(subjectIds, "subject", issues);
  trackDuplicates(lectureIds, "lecture", issues);
  trackDuplicates(sourceIds, "source", issues);

  const questionIds = questions.map((q) => q.id);
  trackDuplicates(questionIds, "question", issues);
  for (const q of questions) {
    if (!q.id) issues.push({ level: "error", message: "A question is missing an id." });
    if (!q.question) {
      issues.push({
        level: "error",
        message: `Question "${q.id || "(no id)"}" is missing question text.`,
      });
    }
  }

  return issues;
}
