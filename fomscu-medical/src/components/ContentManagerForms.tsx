import { useState } from "react";
import type {
  Foundation,
  Subject,
  Lecture,
  Source,
  SourceType,
  SourcePart,
  Question,
  QuestionType,
  QuestionDifficulty,
  DistributiveOmit,
} from "../types";

export const SOURCE_TYPE_LABELS: Record<SourceType, string> = {
  university: "University",
  doctor: "Doctor",
  youtube: "YouTube",
  telegram: "Telegram",
  drive: "Google Drive",
  sharepoint: "SharePoint",
  playlist: "Playlist",
  other: "Other",
};

const SOURCE_TYPES = Object.keys(SOURCE_TYPE_LABELS) as SourceType[];

/* ------------------------------------------------------------ */
/* Foundation                                                    */
/* ------------------------------------------------------------ */

export function FoundationForm({
  initial,
  onSubmit,
  onCancel,
}: {
  initial?: Foundation;
  onSubmit: (name: string, iconData?: string) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [iconData, setIconData] = useState<string | undefined>(undefined);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => setIconData(String(reader.result || ""));
    reader.readAsDataURL(f);
  }

  return (
    <form
      className="cm-form"
      onSubmit={(e) => {
        e.preventDefault();
        if (name.trim()) onSubmit(name.trim(), iconData);
      }}
    >
      <label>
        Foundation name
        <input value={name} onChange={(e) => setName(e.target.value)} autoFocus required />
      </label>
      <label>
        Icon (optional)
        <input type="file" accept="image/*" onChange={handleFile} />
      </label>
      <div className="cm-form-actions">
        <button type="button" className="btn-secondary" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="btn-primary">
          Save
        </button>
      </div>
    </form>
  );
}

/* ------------------------------------------------------------ */
/* Subject                                                        */
/* ------------------------------------------------------------ */

export function SubjectForm({
  initial,
  onSubmit,
  onCancel,
}: {
  initial?: Subject;
  onSubmit: (name: string, iconData?: string) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [iconData, setIconData] = useState<string | undefined>(undefined);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => setIconData(String(reader.result || ""));
    reader.readAsDataURL(f);
  }

  return (
    <form
      className="cm-form"
      onSubmit={(e) => {
        e.preventDefault();
        if (name.trim()) onSubmit(name.trim(), iconData);
      }}
    >
      <label>
        Subject name
        <input value={name} onChange={(e) => setName(e.target.value)} autoFocus required />
      </label>
      <label>
        Icon (optional)
        <input type="file" accept="image/*" onChange={handleFile} />
      </label>
      <div className="cm-form-actions">
        <button type="button" className="btn-secondary" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="btn-primary">
          Save
        </button>
      </div>
    </form>
  );
}

/* ------------------------------------------------------------ */
/* Lecture                                                        */
/* ------------------------------------------------------------ */

export function LectureForm({
  initial,
  onSubmit,
  onCancel,
}: {
  initial?: Lecture;
  onSubmit: (title: string, description: string, iconData?: string) => void;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [iconData, setIconData] = useState<string | undefined>(undefined);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => setIconData(String(reader.result || ""));
    reader.readAsDataURL(f);
  }

  return (
    <form
      className="cm-form"
      onSubmit={(e) => {
        e.preventDefault();
        if (title.trim()) onSubmit(title.trim(), description.trim(), iconData);
      }}
    >
      <label>
        Lecture title
        <input value={title} onChange={(e) => setTitle(e.target.value)} autoFocus required />
      </label>
      <label>
        Description (optional)
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} />
      </label>
      <label>
        Icon (optional)
        <input type="file" accept="image/*" onChange={handleFile} />
      </label>
      <div className="cm-form-actions">
        <button type="button" className="btn-secondary" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="btn-primary">
          Save
        </button>
      </div>
    </form>
  );
}

/* ------------------------------------------------------------ */
/* Source                                                         */
/* ------------------------------------------------------------ */

export function SourceForm({
  initial,
  onSubmit,
  onCancel,
}: {
  initial?: Source;
  onSubmit: (source: {
    name: string;
    type: SourceType;
    recommended?: boolean;
    url?: string;
    parts?: { title: string; url: string }[];
  }) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [type, setType] = useState<SourceType>(initial?.type ?? "doctor");
  const [recommended, setRecommended] = useState(initial?.recommended ?? false);
  // mode: 'single' = URL, 'parts' = multiple parts
  const hasParts = Array.isArray(initial?.parts) && initial!.parts!.length > 0;
  const [mode, setMode] = useState<"single" | "parts">(hasParts ? "parts" : "single");
  const [url, setUrl] = useState(initial?.url ?? (hasParts && initial!.parts![0] ? initial!.parts![0].url : ""));
  const [parts, setParts] = useState<{ title: string; url: string }[]>(
    initial?.parts && initial.parts.length > 0 ? initial.parts.map((p) => ({ title: p.title, url: p.url })) : []
  );

  function updatePart(index: number, field: "title" | "url", value: string) {
    setParts((prev) => prev.map((p, i) => (i === index ? { ...p, [field]: value } : p)));
  }

  function addPart() {
    setParts((prev) => [...prev, { title: `Part ${prev.length + 1}`, url: "" }]);
  }

  function removePart(index: number) {
    setParts((prev) => prev.filter((_, i) => i !== index));
  }

  return (
    <form
      className="cm-form"
      onSubmit={(e) => {
        e.preventDefault();
        if (!name.trim()) return;
        if (mode === "single") {
          onSubmit({ name: name.trim(), type, recommended: recommended || undefined, url: url.trim() || undefined });
        } else {
          // filter out empty parts
          const clean = parts
            .map((p, i) => ({ title: p.title.trim() || `Part ${i + 1}`, url: p.url.trim() }))
            .filter((p) => p.url);
          onSubmit({ name: name.trim(), type, recommended: recommended || undefined, parts: clean.length ? clean : undefined });
        }
      }}
    >
      <label>
        Source name
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Dr. Wahdan, University Data"
          autoFocus
          required
        />
      </label>
      <label>
        Source type
        <select value={type} onChange={(e) => setType(e.target.value as SourceType)}>
          {SOURCE_TYPES.map((t) => (
            <option key={t} value={t}>
              {SOURCE_TYPE_LABELS[t]}
            </option>
          ))}
        </select>
      </label>
      <label className="cm-checkbox">
        <input
          type="checkbox"
          checked={recommended}
          onChange={(e) => setRecommended(e.target.checked)}
        />
        Mark as recommended
      </label>

      <label>
        Source Mode
        <div style={{ display: "flex", gap: 8 }}>
          <label style={{ display: "flex", gap: 6, alignItems: "center" }}>
            <input type="radio" name="mode" checked={mode === "single"} onChange={() => setMode("single")} /> Single URL
          </label>
          <label style={{ display: "flex", gap: 6, alignItems: "center" }}>
            <input type="radio" name="mode" checked={mode === "parts"} onChange={() => setMode("parts")} /> Multiple Parts
          </label>
        </div>
      </label>

      {mode === "single" && (
        <label>
          URL
          <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://..." />
        </label>
      )}

      {mode === "parts" && (
        <fieldset className="cm-fieldset">
          <legend>Parts</legend>
          {parts.map((p, i) => (
            <div key={i} style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 8 }}>
              <input value={p.title} onChange={(e) => updatePart(i, "title", e.target.value)} style={{ flex: 1 }} />
              <input value={p.url} onChange={(e) => updatePart(i, "url", e.target.value)} style={{ flex: 2 }} placeholder="https://..." />
              <button type="button" className="btn-icon" onClick={() => removePart(i)} aria-label="Remove part">✕</button>
            </div>
          ))}
          <button type="button" className="btn-secondary btn-small" onClick={addPart}>+ Add part</button>
        </fieldset>
      )}

      <p className="cm-hint">Only enter real URLs. Single URL is suitable for one video/link; choose Multiple Parts when the source is split across several files.</p>

      <div className="cm-form-actions">
        <button type="button" className="btn-secondary" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="btn-primary">
          Save
        </button>
      </div>
    </form>
  );
}

/* ------------------------------------------------------------ */
/* Part                                                            */
/* ------------------------------------------------------------ */

export function PartForm({
  initial,
  onSubmit,
  onCancel,
}: {
  initial?: SourcePart;
  onSubmit: (part: { title: string; url: string }) => void;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [url, setUrl] = useState(initial?.url ?? "");

  return (
    <form
      className="cm-form"
      onSubmit={(e) => {
        e.preventDefault();
        if (title.trim() && url.trim()) {
          onSubmit({ title: title.trim(), url: url.trim() });
        }
      }}
    >
      <label>
        Part title
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Part 1"
          autoFocus
          required
        />
      </label>
      <label>
        URL
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://..."
          required
        />
      </label>
      <div className="cm-form-actions">
        <button type="button" className="btn-secondary" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="btn-primary">
          Save
        </button>
      </div>
    </form>
  );
}

/* ------------------------------------------------------------ */
/* Question                                                        */
/* ------------------------------------------------------------ */

const QUESTION_TYPES: { value: QuestionType; label: string }[] = [
  { value: "mcq", label: "Multiple choice" },
  { value: "true_false", label: "True / False" },
  { value: "short_answer", label: "Short answer" },
];

const DIFFICULTIES: { value: QuestionDifficulty; label: string }[] = [
  { value: "easy", label: "Easy" },
  { value: "medium", label: "Medium" },
  { value: "hard", label: "Hard" },
];

export function QuestionForm({
  initial,
  foundations,
  onSubmit,
  onCancel,
}: {
  initial?: Question;
  foundations: Foundation[];
  onSubmit: (question: DistributiveOmit<Question, "id">) => void;
  onCancel: () => void;
}) {
  const [type, setType] = useState<QuestionType>(initial?.type ?? "mcq");
  const [questionText, setQuestionText] = useState(initial?.question ?? "");
  const [options, setOptions] = useState<string[]>(
    initial?.type === "mcq" ? initial.options : ["", ""]
  );
  const [correctIndex, setCorrectIndex] = useState(
    initial?.type === "mcq" ? initial.correctAnswer : 0
  );
  const [correctBool, setCorrectBool] = useState(
    initial?.type === "true_false" ? initial.correctAnswer : true
  );
  const [modelAnswer, setModelAnswer] = useState(
    initial?.type === "short_answer" ? initial.modelAnswer : ""
  );
  const [explanation, setExplanation] = useState(initial?.explanation ?? "");
  const [difficulty, setDifficulty] = useState<QuestionDifficulty | "">(
    initial?.difficulty ?? ""
  );
  const [tags, setTags] = useState((initial?.tags ?? []).join(", "));
  const [image, setImage] = useState(initial?.image ?? "");
  const [foundationId, setFoundationId] = useState(initial?.links?.foundationId ?? "");
  const [subjectId, setSubjectId] = useState(initial?.links?.subjectId ?? "");
  const [lectureId, setLectureId] = useState(initial?.links?.lectureId ?? "");

  const selectedFoundation = foundations.find((f) => f.id === foundationId);
  const selectedSubject = selectedFoundation?.subjects.find((s) => s.id === subjectId);

  function updateOption(index: number, value: string) {
    setOptions((prev) => prev.map((o, i) => (i === index ? value : o)));
  }

  function addOption() {
    setOptions((prev) => [...prev, ""]);
  }

  function removeOption(index: number) {
    setOptions((prev) => prev.filter((_, i) => i !== index));
    if (correctIndex >= index && correctIndex > 0) setCorrectIndex(correctIndex - 1);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!questionText.trim()) return;

    const links =
      foundationId || subjectId || lectureId
        ? {
            foundationId: foundationId || undefined,
            subjectId: subjectId || undefined,
            lectureId: lectureId || undefined,
          }
        : undefined;

    const shared = {
      explanation: explanation.trim() || undefined,
      links,
      difficulty: difficulty || undefined,
      tags: tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      image: image.trim() || undefined,
    };

    if (type === "mcq") {
      const cleanOptions = options.map((o) => o.trim()).filter(Boolean);
      if (cleanOptions.length < 2) return;
      onSubmit({
        type: "mcq",
        question: questionText.trim(),
        options: cleanOptions,
        correctAnswer: Math.min(correctIndex, cleanOptions.length - 1),
        ...shared,
      });
    } else if (type === "true_false") {
      onSubmit({
        type: "true_false",
        question: questionText.trim(),
        correctAnswer: correctBool,
        ...shared,
      });
    } else {
      if (!modelAnswer.trim()) return;
      onSubmit({
        type: "short_answer",
        question: questionText.trim(),
        modelAnswer: modelAnswer.trim(),
        ...shared,
      });
    }
  }

  return (
    <form className="cm-form" onSubmit={handleSubmit}>
      <label>
        Question type
        <select value={type} onChange={(e) => setType(e.target.value as QuestionType)}>
          {QUESTION_TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
      </label>

      <label>
        Question text
        <textarea
          value={questionText}
          onChange={(e) => setQuestionText(e.target.value)}
          rows={2}
          required
        />
      </label>

      {type === "mcq" && (
        <fieldset className="cm-fieldset">
          <legend>Options (mark the correct one)</legend>
          {options.map((opt, i) => (
            <div className="cm-option-row" key={i}>
              <input
                type="radio"
                name="correct-option"
                checked={correctIndex === i}
                onChange={() => setCorrectIndex(i)}
                aria-label={`Option ${i + 1} is correct`}
              />
              <input
                value={opt}
                onChange={(e) => updateOption(i, e.target.value)}
                placeholder={`Option ${i + 1}`}
              />
              {options.length > 2 && (
                <button
                  type="button"
                  className="btn-icon"
                  onClick={() => removeOption(i)}
                  aria-label="Remove option"
                >
                  ✕
                </button>
              )}
            </div>
          ))}
          <button type="button" className="btn-secondary btn-small" onClick={addOption}>
            + Add option
          </button>
        </fieldset>
      )}

      {type === "true_false" && (
        <label>
          Correct answer
          <select
            value={correctBool ? "true" : "false"}
            onChange={(e) => setCorrectBool(e.target.value === "true")}
          >
            <option value="true">True</option>
            <option value="false">False</option>
          </select>
        </label>
      )}

      {type === "short_answer" && (
        <label>
          Model answer
          <textarea
            value={modelAnswer}
            onChange={(e) => setModelAnswer(e.target.value)}
            rows={2}
            required
          />
        </label>
      )}

      <label>
        Explanation (optional)
        <textarea value={explanation} onChange={(e) => setExplanation(e.target.value)} rows={2} />
      </label>

      <label>
        Difficulty (optional)
        <select value={difficulty} onChange={(e) => setDifficulty(e.target.value as QuestionDifficulty | "")}>
          <option value="">Not set</option>
          {DIFFICULTIES.map((d) => (
            <option key={d.value} value={d.value}>
              {d.label}
            </option>
          ))}
        </select>
      </label>

      <label>
        Tags (optional, comma separated)
        <input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="e.g. skull, exam" />
      </label>

      <label>
        Image path (optional, relative to /public)
        <input
          value={image}
          onChange={(e) => setImage(e.target.value)}
          placeholder="assets/questions/q1.png"
        />
      </label>

      <fieldset className="cm-fieldset">
        <legend>Link to content (optional)</legend>
        <label>
          Foundation
          <select
            value={foundationId}
            onChange={(e) => {
              setFoundationId(e.target.value);
              setSubjectId("");
              setLectureId("");
            }}
          >
            <option value="">None</option>
            {foundations.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name}
              </option>
            ))}
          </select>
        </label>
        {selectedFoundation && (
          <label>
            Subject
            <select
              value={subjectId}
              onChange={(e) => {
                setSubjectId(e.target.value);
                setLectureId("");
              }}
            >
              <option value="">None</option>
              {selectedFoundation.subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </label>
        )}
        {selectedSubject && (
          <label>
            Lecture
            <select value={lectureId} onChange={(e) => setLectureId(e.target.value)}>
              <option value="">None</option>
              {selectedSubject.lectures.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.title}
                </option>
              ))}
            </select>
          </label>
        )}
      </fieldset>

      <div className="cm-form-actions">
        <button type="button" className="btn-secondary" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="btn-primary">
          Save
        </button>
      </div>
    </form>
  );
}
