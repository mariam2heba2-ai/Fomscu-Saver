import { getWorkingData, getWorkingQuestions } from "./storage";
import type { Foundation, Subject, Lecture, Question } from "../types";

// ------------------------------------------------------------
// Content tree lookups
// Reads through the storage overlay: local edits if present,
// otherwise the seed data.json / questions.json.
// ------------------------------------------------------------

export function getFoundations(): Foundation[] {
  return [...getWorkingData().foundations].sort((a, b) => a.order - b.order);
}

export function getFoundation(foundationId: string): Foundation | undefined {
  return getWorkingData().foundations.find((f) => f.id === foundationId);
}

export function getSubjects(foundationId: string): Subject[] {
  const foundation = getFoundation(foundationId);
  if (!foundation) return [];
  return [...foundation.subjects].sort((a, b) => a.order - b.order);
}

export function getSubject(
  foundationId: string,
  subjectId: string
): Subject | undefined {
  const foundation = getFoundation(foundationId);
  return foundation?.subjects.find((s) => s.id === subjectId);
}

export function getLectures(foundationId: string, subjectId: string): Lecture[] {
  const subject = getSubject(foundationId, subjectId);
  if (!subject) return [];
  return [...subject.lectures].sort((a, b) => a.order - b.order);
}

export function getLecture(
  foundationId: string,
  subjectId: string,
  lectureId: string
): Lecture | undefined {
  const subject = getSubject(foundationId, subjectId);
  return subject?.lectures.find((l) => l.id === lectureId);
}

// ------------------------------------------------------------
// Question bank lookups
// ------------------------------------------------------------

export function getQuestions(): Question[] {
  return getWorkingQuestions().questions;
}

export function getQuestionsFiltered(filters: {
  foundationId?: string;
  subjectId?: string;
  lectureId?: string;
  type?: string;
  difficulty?: string;
  search?: string;
}): Question[] {
  return getWorkingQuestions().questions.filter((q) => {
    if (filters.foundationId && q.links?.foundationId !== filters.foundationId)
      return false;
    if (filters.subjectId && q.links?.subjectId !== filters.subjectId)
      return false;
    if (filters.lectureId && q.links?.lectureId !== filters.lectureId)
      return false;
    if (filters.type && q.type !== filters.type) return false;
    if (filters.difficulty && q.difficulty !== filters.difficulty) return false;
    if (
      filters.search &&
      !q.question.toLowerCase().includes(filters.search.toLowerCase())
    )
      return false;
    return true;
  });
}

// ------------------------------------------------------------
// Human-readable labels, for breadcrumbs etc.
// ------------------------------------------------------------

export function foundationName(foundationId?: string): string | undefined {
  if (!foundationId) return undefined;
  return getFoundation(foundationId)?.name;
}

export function subjectName(
  foundationId?: string,
  subjectId?: string
): string | undefined {
  if (!foundationId || !subjectId) return undefined;
  return getSubject(foundationId, subjectId)?.name;
}

export function lectureName(
  foundationId?: string,
  subjectId?: string,
  lectureId?: string
): string | undefined {
  if (!foundationId || !subjectId || !lectureId) return undefined;
  return getLecture(foundationId, subjectId, lectureId)?.title;
}
