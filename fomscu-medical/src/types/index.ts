/**
 * FOMSCU Medical - Data Types
 * ---------------------------------------------------
 * These types describe the shape of /data/data.json and
 * /data/questions.json. If you edit those JSON files, this
 * file tells you (and your editor) exactly what fields are
 * expected.
 */

// ============================================================
// CONTENT TREE: Foundation -> Subject -> Lecture -> Source -> Part
// ============================================================

export type SourceType =
  | "university"
  | "doctor"
  | "youtube"
  | "telegram"
  | "drive"
  | "sharepoint"
  | "playlist"
  | "other";

/** One part of a multi-part source, e.g. "Part 1", "Part 2". */
export interface SourcePart {
  title: string;
  url: string;
  order: number;
}

/**
 * A single source of material for a lecture (e.g. "Dr. Wahdan",
 * "University Recording", "YouTube Playlist").
 *
 * A source has EITHER a single `url` OR a `parts` array - not both.
 * Use `url` for a single video/link. Use `parts` when the source
 * is split into multiple videos/files.
 */
export interface Source {
  id: string;
  name: string;
  type: SourceType;
  recommended?: boolean;
  url?: string;
  parts?: SourcePart[];
}

export interface Lecture {
  id: string;
  title: string;
  description?: string;
  order: number;
  sources: Source[];
}

export interface Subject {
  id: string;
  name: string;
  order: number;
  lectures: Lecture[];
}

export interface Foundation {
  id: string;
  name: string;
  order: number;
  subjects: Subject[];
}

/** Shape of the entire /data/data.json file. */
export interface FomscuData {
  foundations: Foundation[];
}

// ------------------------------------------------------------
// SITE CUSTOMIZATION SETTINGS
// Stored separately from content (localStorage overlay)
// ------------------------------------------------------------

export interface ThemeColors {
  primary?: string;
  secondary?: string;
  accent?: string;
  background?: string;
  card?: string;
  text?: string;
  heading?: string;
  button?: string;
  border?: string;
  hover?: string;
}

export interface HomepageSection {
  id: string;
  type: string;
  title?: string;
  subtitle?: string;
  body?: string;
  image?: string; // data URL or public path
  buttonText?: string;
  buttonLink?: string;
  visible?: boolean;
}

export interface SiteSettings {
  siteTitle?: string;
  siteShortName?: string;
  logo?: string;
  favicon?: string;
  colors?: ThemeColors;
  homepage?: {
    heroTitle?: string;
    heroSubtitle?: string;
    heroImage?: string;
    heroButtonText?: string;
    heroButtonLink?: string;
    sections?: HomepageSection[];
  };
  icons?: Record<string, string>; // mapping keys to icon names or uploaded data URLs
}

// ============================================================
// QUESTION BANK
// ============================================================

export type QuestionType = "mcq" | "true_false" | "short_answer";

/**
 * Optional links tying a question back to the content tree.
 * All fields are optional - a question can be fully standalone.
 */
export interface QuestionLinks {
  foundationId?: string;
  subjectId?: string;
  lectureId?: string;
  topic?: string;
}

export type QuestionDifficulty = "easy" | "medium" | "hard";

interface BaseQuestion {
  id: string;
  explanation?: string;
  links?: QuestionLinks;
  difficulty?: QuestionDifficulty;
  tags?: string[];
  image?: string; // path relative to /public, e.g. "assets/questions/q1.png"
}

export interface MCQQuestion extends BaseQuestion {
  type: "mcq";
  question: string;
  options: string[];
  correctAnswer: number; // index into options
}

export interface TrueFalseQuestion extends BaseQuestion {
  type: "true_false";
  question: string;
  correctAnswer: boolean;
}

export interface ShortAnswerQuestion extends BaseQuestion {
  type: "short_answer";
  question: string;
  modelAnswer: string;
}

export type Question = MCQQuestion | TrueFalseQuestion | ShortAnswerQuestion;

/**
 * Like `Omit<T, K>`, but distributes over a union so each member keeps
 * its own extra fields (plain `Omit` on a union collapses to only the
 * fields shared by every member, which drops `options`, `modelAnswer`, etc).
 */
export type DistributiveOmit<T, K extends keyof any> = T extends unknown
  ? Omit<T, K>
  : never;

/** Shape of the entire /data/questions.json file. */
export interface QuestionBankData {
  questions: Question[];
}

// ============================================================
// SEARCH RESULT (used by the global search utility)
// ============================================================

export type SearchResultKind =
  | "foundation"
  | "subject"
  | "lecture"
  | "source"
  | "question";

export interface SearchResult {
  kind: SearchResultKind;
  id: string;
  title: string;
  /** Human-readable breadcrumb, e.g. "Foundation 1 > Anatomy > Skull" */
  breadcrumb: string;
  /** Path to navigate to when clicked */
  path: string;
}
