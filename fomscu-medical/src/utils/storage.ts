/**
 * FOMSCU Medical - Local storage overlay
 * ---------------------------------------------------
 * Concept:
 *   data.json / questions.json   -> default/seed content (never modified)
 *   localStorage                 -> user's editable copy
 *
 * On first edit, the seed data is cloned into localStorage. From then on,
 * every read/write in the app goes through this file, which always prefers
 * the localStorage copy when one exists and falls back to the seed
 * otherwise. "Reset to Default" / "Clear Local Changes" simply remove the
 * localStorage copy, which makes the seed visible again.
 */

import rawData from "../../data/data.json";
import rawQuestions from "../../data/questions.json";
import type {
  FomscuData,
  Foundation,
  Subject,
  Lecture,
  Source,
  SourcePart,
  QuestionBankData,
  Question,
  DistributiveOmit,
} from "../types";

const DATA_KEY = "fomscu_data_v1";
const QUESTIONS_KEY = "fomscu_questions_v1";
const SETTINGS_KEY = "fomscu_settings_v1";

const seedData = rawData as unknown as FomscuData;
const seedQuestions = rawQuestions as unknown as QuestionBankData;

// ------------------------------------------------------------
// Low-level read/write helpers
// ------------------------------------------------------------

function readJSON<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    // Malformed localStorage content should not crash the app -
    // treat it as "no local changes" and fall back to seed data.
    return null;
  }
}

function writeJSON(key: string, value: unknown): void {
  localStorage.setItem(key, JSON.stringify(value));
}

function deepClone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}

/** Current working content tree: localStorage copy if present, else seed. */
export function getWorkingData(): FomscuData {
  return readJSON<FomscuData>(DATA_KEY) ?? seedData;
}

/** Current working question bank: localStorage copy if present, else seed. */
export function getWorkingQuestions(): QuestionBankData {
  return readJSON<QuestionBankData>(QUESTIONS_KEY) ?? seedQuestions;
}

/** Site customization settings (separate from content) */
export function getSiteSettings(): Partial<import("../types").SiteSettings> {
  return readJSON<import("../types").SiteSettings>(SETTINGS_KEY) ?? {};
}

export function saveSiteSettings(next: Partial<import("../types").SiteSettings>): void {
  writeJSON(SETTINGS_KEY, next);
}

export function exportSettings(): string {
  return JSON.stringify(getSiteSettings(), null, 2);
}

export function importSettings(json: string): void {
  let parsed: unknown;
  try {
    parsed = JSON.parse(json);
  } catch {
    throw new Error("Invalid JSON");
  }
  saveSiteSettings(parsed as import("../types").SiteSettings);
}

/** Try to load website-customization.json from public paths and seed settings on first run. */
export async function loadWebsiteCustomization(): Promise<void> {
  try {
    // If user already has settings saved, don't overwrite
    if (readJSON(SETTINGS_KEY)) return;

    const candidates = ["/website-customization.json", "/data/website-customization.json"];
    for (const url of candidates) {
      try {
        const res = await fetch(url, { cache: "no-store" });
        if (!res.ok) continue;
        const parsed = await res.json();
        // save into localStorage overlay so getSiteSettings() will return it
        writeJSON(SETTINGS_KEY, parsed);
        // also apply some CSS vars if present
        try {
          const root = document.documentElement;
          if (parsed.colors) {
            Object.entries(parsed.colors).forEach(([k, v]) => {
              if (v) root.style.setProperty(`--color-${k}`, String(v));
            });
          }
        } catch {}
        return;
      } catch {
        continue;
      }
    }
  } catch {
    // swallow errors - this is a best-effort enhancement
  }
}

/** Returns a mutable clone of the working content tree, cloning the seed on first edit. */
function getEditableData(): FomscuData {
  const existing = readJSON<FomscuData>(DATA_KEY);
  return existing ?? deepClone(seedData);
}

function saveData(next: FomscuData): void {
  writeJSON(DATA_KEY, next);
}

function getEditableQuestions(): QuestionBankData {
  const existing = readJSON<QuestionBankData>(QUESTIONS_KEY);
  return existing ?? deepClone(seedQuestions);
}

function saveQuestions(next: QuestionBankData): void {
  writeJSON(QUESTIONS_KEY, next);
}

// ------------------------------------------------------------
// ID generation
// ------------------------------------------------------------

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/** Builds a unique id from a name, avoiding collisions with any id in `existingIds`. */
function makeUniqueId(name: string, existingIds: string[]): string {
  const base = slugify(name) || "item";
  let candidate = base;
  let n = 2;
  while (existingIds.includes(candidate)) {
    candidate = `${base}-${n}`;
    n += 1;
  }
  return candidate;
}

function nextOrder(items: { order: number }[]): number {
  if (items.length === 0) return 1;
  return Math.max(...items.map((i) => i.order)) + 1;
}

// ------------------------------------------------------------
// Tree navigation helpers (throw a readable error if a path is bad)
// ------------------------------------------------------------

function findFoundation(data: FomscuData, foundationId: string): Foundation {
  const foundation = data.foundations.find((f) => f.id === foundationId);
  if (!foundation) throw new Error(`Foundation not found: ${foundationId}`);
  return foundation;
}

function findSubject(
  data: FomscuData,
  foundationId: string,
  subjectId: string
): Subject {
  const subject = findFoundation(data, foundationId).subjects.find(
    (s) => s.id === subjectId
  );
  if (!subject) throw new Error(`Subject not found: ${subjectId}`);
  return subject;
}

function findLecture(
  data: FomscuData,
  foundationId: string,
  subjectId: string,
  lectureId: string
): Lecture {
  const lecture = findSubject(data, foundationId, subjectId).lectures.find(
    (l) => l.id === lectureId
  );
  if (!lecture) throw new Error(`Lecture not found: ${lectureId}`);
  return lecture;
}

function findSource(
  data: FomscuData,
  foundationId: string,
  subjectId: string,
  lectureId: string,
  sourceId: string
): Source {
  const source = findLecture(data, foundationId, subjectId, lectureId).sources.find(
    (s) => s.id === sourceId
  );
  if (!source) throw new Error(`Source not found: ${sourceId}`);
  return source;
}

// ------------------------------------------------------------
// Foundation CRUD
// ------------------------------------------------------------

export function addFoundation(name: string): Foundation {
  const data = getEditableData();
  const id = makeUniqueId(
    name,
    data.foundations.map((f) => f.id)
  );
  const foundation: Foundation = {
    id,
    name,
    order: nextOrder(data.foundations),
    subjects: [],
  };
  data.foundations.push(foundation);
  saveData(data);
  return foundation;
}

export function updateFoundation(
  foundationId: string,
  updates: Partial<Pick<Foundation, "name" | "order">>
): void {
  const data = getEditableData();
  const foundation = findFoundation(data, foundationId);
  Object.assign(foundation, updates);
  saveData(data);
}

export function deleteFoundation(foundationId: string): void {
  const data = getEditableData();
  data.foundations = data.foundations.filter((f) => f.id !== foundationId);
  saveData(data);
}

export function reorderFoundations(orderedIds: string[]): void {
  const data = getEditableData();
  orderedIds.forEach((id, index) => {
    const foundation = data.foundations.find((f) => f.id === id);
    if (foundation) foundation.order = index + 1;
  });
  saveData(data);
}

// ------------------------------------------------------------
// Subject CRUD
// ------------------------------------------------------------

export function addSubject(foundationId: string, name: string): Subject {
  const data = getEditableData();
  const foundation = findFoundation(data, foundationId);
  const id = makeUniqueId(
    name,
    foundation.subjects.map((s) => s.id)
  );
  const subject: Subject = {
    id,
    name,
    order: nextOrder(foundation.subjects),
    lectures: [],
  };
  foundation.subjects.push(subject);
  saveData(data);
  return subject;
}

export function updateSubject(
  foundationId: string,
  subjectId: string,
  updates: Partial<Pick<Subject, "name" | "order">>
): void {
  const data = getEditableData();
  const subject = findSubject(data, foundationId, subjectId);
  Object.assign(subject, updates);
  saveData(data);
}

export function deleteSubject(foundationId: string, subjectId: string): void {
  const data = getEditableData();
  const foundation = findFoundation(data, foundationId);
  foundation.subjects = foundation.subjects.filter((s) => s.id !== subjectId);
  saveData(data);
}

export function reorderSubjects(foundationId: string, orderedIds: string[]): void {
  const data = getEditableData();
  const foundation = findFoundation(data, foundationId);
  orderedIds.forEach((id, index) => {
    const subject = foundation.subjects.find((s) => s.id === id);
    if (subject) subject.order = index + 1;
  });
  saveData(data);
}

// ------------------------------------------------------------
// Lecture CRUD
// ------------------------------------------------------------

export function addLecture(
  foundationId: string,
  subjectId: string,
  title: string,
  description?: string
): Lecture {
  const data = getEditableData();
  const subject = findSubject(data, foundationId, subjectId);
  const id = makeUniqueId(
    `${subjectId}-${title}`,
    subject.lectures.map((l) => l.id)
  );
  const lecture: Lecture = {
    id,
    title,
    description,
    order: nextOrder(subject.lectures),
    sources: [],
  };
  subject.lectures.push(lecture);
  saveData(data);
  return lecture;
}

export function updateLecture(
  foundationId: string,
  subjectId: string,
  lectureId: string,
  updates: Partial<Pick<Lecture, "title" | "description" | "order">>
): void {
  const data = getEditableData();
  const lecture = findLecture(data, foundationId, subjectId, lectureId);
  Object.assign(lecture, updates);
  saveData(data);
}

export function deleteLecture(
  foundationId: string,
  subjectId: string,
  lectureId: string
): void {
  const data = getEditableData();
  const subject = findSubject(data, foundationId, subjectId);
  subject.lectures = subject.lectures.filter((l) => l.id !== lectureId);
  saveData(data);
}

export function reorderLectures(
  foundationId: string,
  subjectId: string,
  orderedIds: string[]
): void {
  const data = getEditableData();
  const subject = findSubject(data, foundationId, subjectId);
  orderedIds.forEach((id, index) => {
    const lecture = subject.lectures.find((l) => l.id === id);
    if (lecture) lecture.order = index + 1;
  });
  saveData(data);
}

// ------------------------------------------------------------
// Source CRUD
// ------------------------------------------------------------

export type NewSourceInput = Omit<Source, "id">;

export function addSource(
  foundationId: string,
  subjectId: string,
  lectureId: string,
  source: NewSourceInput
): Source {
  const data = getEditableData();
  const lecture = findLecture(data, foundationId, subjectId, lectureId);
  const id = makeUniqueId(
    `${lectureId}-${source.name}`,
    lecture.sources.map((s) => s.id)
  );
  const newSource: Source = { ...source, id };
  lecture.sources.push(newSource);
  saveData(data);
  return newSource;
}

export function updateSource(
  foundationId: string,
  subjectId: string,
  lectureId: string,
  sourceId: string,
  updates: Partial<Omit<Source, "id">>
): void {
  const data = getEditableData();
  const source = findSource(data, foundationId, subjectId, lectureId, sourceId);
  Object.assign(source, updates);
  saveData(data);
}

export function deleteSource(
  foundationId: string,
  subjectId: string,
  lectureId: string,
  sourceId: string
): void {
  const data = getEditableData();
  const lecture = findLecture(data, foundationId, subjectId, lectureId);
  lecture.sources = lecture.sources.filter((s) => s.id !== sourceId);
  saveData(data);
}

export function reorderSources(
  foundationId: string,
  subjectId: string,
  lectureId: string,
  orderedIds: string[]
): void {
  // Sources don't carry an explicit order field individually -
  // reorder by rewriting the array in the given id order.
  const data = getEditableData();
  const lecture = findLecture(data, foundationId, subjectId, lectureId);
  const bySourceId = new Map(lecture.sources.map((s) => [s.id, s]));
  lecture.sources = orderedIds
    .map((id) => bySourceId.get(id))
    .filter((s): s is Source => Boolean(s));
  saveData(data);
}

// ------------------------------------------------------------
// Part CRUD
// ------------------------------------------------------------

export function addPart(
  foundationId: string,
  subjectId: string,
  lectureId: string,
  sourceId: string,
  part: Omit<SourcePart, "order">
): SourcePart {
  const data = getEditableData();
  const source = findSource(data, foundationId, subjectId, lectureId, sourceId);
  if (!source.parts) source.parts = [];
  const newPart: SourcePart = { ...part, order: nextOrder(source.parts) };
  source.parts.push(newPart);
  saveData(data);
  return newPart;
}

export function updatePart(
  foundationId: string,
  subjectId: string,
  lectureId: string,
  sourceId: string,
  partIndex: number,
  updates: Partial<SourcePart>
): void {
  const data = getEditableData();
  const source = findSource(data, foundationId, subjectId, lectureId, sourceId);
  const part = source.parts?.[partIndex];
  if (!part) throw new Error(`Part not found at index ${partIndex}`);
  Object.assign(part, updates);
  saveData(data);
}

export function deletePart(
  foundationId: string,
  subjectId: string,
  lectureId: string,
  sourceId: string,
  partIndex: number
): void {
  const data = getEditableData();
  const source = findSource(data, foundationId, subjectId, lectureId, sourceId);
  if (!source.parts) return;
  source.parts = source.parts.filter((_, i) => i !== partIndex);
  saveData(data);
}

export function reorderParts(
  foundationId: string,
  subjectId: string,
  lectureId: string,
  sourceId: string,
  orderedIndexes: number[]
): void {
  const data = getEditableData();
  const source = findSource(data, foundationId, subjectId, lectureId, sourceId);
  if (!source.parts) return;
  const original = source.parts;
  source.parts = orderedIndexes
    .map((i) => original[i])
    .filter((p): p is SourcePart => Boolean(p))
    .map((p, index) => ({ ...p, order: index + 1 }));
  saveData(data);
}

// ------------------------------------------------------------
// Question CRUD
// ------------------------------------------------------------

export function addQuestion(
  question: DistributiveOmit<Question, "id"> & { id?: string }
): Question {
  const bank = getEditableQuestions();
  const id =
    question.id && !bank.questions.some((q) => q.id === question.id)
      ? question.id
      : makeUniqueId(
          question.question,
          bank.questions.map((q) => q.id)
        );
  const newQuestion = { ...question, id } as Question;
  bank.questions.push(newQuestion);
  saveQuestions(bank);
  return newQuestion;
}

export function updateQuestion(id: string, updates: Partial<Question>): void {
  const bank = getEditableQuestions();
  const index = bank.questions.findIndex((q) => q.id === id);
  if (index === -1) throw new Error(`Question not found: ${id}`);
  bank.questions[index] = { ...bank.questions[index], ...updates } as Question;
  saveQuestions(bank);
}

export function deleteQuestion(id: string): void {
  const bank = getEditableQuestions();
  bank.questions = bank.questions.filter((q) => q.id !== id);
  saveQuestions(bank);
}

// ------------------------------------------------------------
// Import / Export / Reset
// ------------------------------------------------------------

export interface ExportedBundle {
  data: FomscuData;
  questions: QuestionBankData;
  exportedAt: string;
}

/** Returns the current working content (seed + local edits) as a JSON string. */
export function exportData(): string {
  const bundle: ExportedBundle = {
    data: getWorkingData(),
    questions: getWorkingQuestions(),
    exportedAt: new Date().toISOString(),
  };
  return JSON.stringify(bundle, null, 2);
}

/**
 * Replaces the local overlay with the given JSON export. Throws on
 * malformed input so the caller can show an error instead of corrupting
 * local data.
 */
export function importData(json: string): void {
  let parsed: unknown;
  try {
    parsed = JSON.parse(json);
  } catch {
    throw new Error("That file isn't valid JSON.");
  }
  const bundle = parsed as Partial<ExportedBundle>;
  if (!bundle.data || !Array.isArray(bundle.data.foundations)) {
    throw new Error("That file doesn't look like a FOMSCU Medical export.");
  }
  if (!bundle.questions || !Array.isArray(bundle.questions.questions)) {
    throw new Error("That file doesn't look like a FOMSCU Medical export.");
  }
  saveData(bundle.data);
  saveQuestions(bundle.questions);
}

/**
 * Removes all local edits so the site falls back to the seed data.
 * "Reset to Default" and "Clear Local Changes" perform the same
 * underlying action: drop the localStorage overlay.
 */
export function resetToDefault(): void {
  localStorage.removeItem(DATA_KEY);
  localStorage.removeItem(QUESTIONS_KEY);
}

export function clearLocalChanges(): void {
  resetToDefault();
}

/** True if the user has any local edits saved (i.e. an overlay exists). */
export function hasLocalChanges(): boolean {
  return (
    localStorage.getItem(DATA_KEY) !== null ||
    localStorage.getItem(QUESTIONS_KEY) !== null
  );
}
