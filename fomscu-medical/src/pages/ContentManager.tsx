import { useState } from "react";
import {
  getWorkingData,
  getWorkingQuestions,
  getSiteSettings,
  saveSiteSettings,
  addFoundation,
  updateFoundation,
  deleteFoundation,
  reorderFoundations,
  addSubject,
  updateSubject,
  deleteSubject,
  reorderSubjects,
  addLecture,
  updateLecture,
  deleteLecture,
  reorderLectures,
  addSource,
  updateSource,
  deleteSource,
  reorderSources,
  addPart,
  updatePart,
  deletePart,
  reorderParts,
  addQuestion,
  updateQuestion,
  deleteQuestion,
} from "../utils/storage";
import { validateData } from "../utils/validate";
import type { Foundation, Subject, Lecture, Source, Question } from "../types";
import ConfirmDialog from "../components/ConfirmDialog";
import DataTools from "../components/DataTools";
import {
  FoundationForm,
  SubjectForm,
  LectureForm,
  SourceForm,
  PartForm,
  QuestionForm,
  SOURCE_TYPE_LABELS,
} from "../components/ContentManagerForms";
import CustomizationPanel from "../components/CustomizationPanel";
type Tab = "content" | "questions" | "data" | "website";

type EditTarget =
  | { level: "foundation"; mode: "add" }
  | { level: "foundation"; mode: "edit"; id: string }
  | { level: "subject"; mode: "add" }
  | { level: "subject"; mode: "edit"; id: string }
  | { level: "lecture"; mode: "add" }
  | { level: "lecture"; mode: "edit"; id: string }
  | { level: "source"; mode: "add" }
  | { level: "source"; mode: "edit"; id: string }
  | { level: "part"; mode: "add"; sourceId: string }
  | { level: "part"; mode: "edit"; sourceId: string; index: number }
  | { level: "question"; mode: "add" }
  | { level: "question"; mode: "edit"; id: string };

type DeleteTarget =
  | { level: "foundation"; id: string; label: string }
  | { level: "subject"; id: string; label: string }
  | { level: "lecture"; id: string; label: string }
  | { level: "source"; id: string; label: string }
  | { level: "part"; sourceId: string; index: number; label: string }
  | { level: "question"; id: string; label: string };

export default function ContentManager() {
  const [tab, setTab] = useState<Tab>("content");
  const [refresh, setRefresh] = useState(0);
  const [foundationId, setFoundationId] = useState<string | null>(null);
  const [subjectId, setSubjectId] = useState<string | null>(null);
  const [lectureId, setLectureId] = useState<string | null>(null);
  const [edit, setEdit] = useState<EditTarget | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);

  function bump() {
    setRefresh((r) => r + 1);
  }

  // `refresh` isn't read directly, but bump() calling setRefresh() is what
  // triggers this component to re-render and re-read storage after any edit.
  const data = getWorkingData();

  const foundations = [...data.foundations].sort((a, b) => a.order - b.order);
  const foundation = foundations.find((f) => f.id === foundationId) ?? null;
  const subjects = foundation ? [...foundation.subjects].sort((a, b) => a.order - b.order) : [];
  const subject = subjects.find((s) => s.id === subjectId) ?? null;
  const lectures = subject ? [...subject.lectures].sort((a, b) => a.order - b.order) : [];
  const lecture = lectures.find((l) => l.id === lectureId) ?? null;

  // Simple password gate for the Content Manager. Password is 'admin'.
  const [authorized, setAuthorized] = useState<boolean>(
    () => localStorage.getItem("fomscu_cm_unlocked") === "true"
  );
  const [password, setPassword] = useState("");
  const [pwError, setPwError] = useState<string | null>(null);

  const issues = validateData();

  if (!authorized) {
    return (
      <div className="cm-lock-overlay" role="dialog" aria-modal="true">
        <div className="cm-lock-box">
          <h2>Unlock Content Manager</h2>
          <p>Enter the admin password to unlock editing.</p>
          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoFocus
            />
          </label>
          {pwError && <p className="cm-error">{pwError}</p>}
          <div className="cm-form-actions">
            <button
              type="button"
              className="btn-secondary"
              onClick={() => {
                if (password === "admin") {
                  localStorage.setItem("fomscu_cm_unlocked", "true");
                  setAuthorized(true);
                } else {
                  setPwError("Incorrect password.");
                }
              }}
            >
              Unlock
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="content-manager">
      <h1>Content Manager</h1>
      <p className="subtitle">
        Edit content locally in this browser. Nothing here changes the original data files -
        use Data Tools to export your work when you're ready.
      </p>

      <div className="cm-tabs">
        <button
          className={tab === "content" ? "active" : ""}
          onClick={() => setTab("content")}
        >
          Content Tree
        </button>
        <button
          className={tab === "questions" ? "active" : ""}
          onClick={() => setTab("questions")}
        >
          Questions
        </button>
        <button className={tab === "data" ? "active" : ""} onClick={() => setTab("data")}>
          Data Tools
        </button>
        <button className={tab === "website" ? "active" : ""} onClick={() => setTab("website")}>
          Website
        </button>
      </div>

      {issues.length > 0 && (
        <div className="cm-issues">
          <strong>{issues.length} data issue{issues.length === 1 ? "" : "s"} found:</strong>
          <ul>
            {issues.slice(0, 8).map((issue, i) => (
              <li key={i} className={issue.level}>
                {issue.message}
              </li>
            ))}
          </ul>
          {issues.length > 8 && <p className="cm-hint">...and {issues.length - 8} more.</p>}
        </div>
      )}

      {tab === "data" && <DataTools onChanged={bump} />}

      {tab === "website" && (
        <WebsiteTab />
      )}

      {tab === "questions" && (
        <QuestionsTab
          foundations={foundations}
          questions={getWorkingQuestions().questions}
          edit={edit}
          setEdit={setEdit}
          deleteTarget={deleteTarget}
          setDeleteTarget={setDeleteTarget}
          bump={bump}
        />
      )}

      {tab === "content" && (
        <>
          <div className="cm-breadcrumbs">
            <button className="link-btn" onClick={() => { setFoundationId(null); setSubjectId(null); setLectureId(null); }}>
              Foundations
            </button>
            {foundation && (
              <>
                {" / "}
                <button className="link-btn" onClick={() => { setSubjectId(null); setLectureId(null); }}>
                  {foundation.name}
                </button>
              </>
            )}
            {subject && (
              <>
                {" / "}
                <button className="link-btn" onClick={() => setLectureId(null)}>
                  {subject.name}
                </button>
              </>
            )}
            {lecture && <> / {lecture.title}</>}
          </div>

          {/* ---------------- Foundations ---------------- */}
          {!foundation && (
            <Level
              title="Foundations"
              items={foundations.map((f) => ({ id: f.id, label: f.name, order: f.order }))}
              onAdd={() => setEdit({ level: "foundation", mode: "add" })}
              onSelect={(id) => setFoundationId(id)}
              onEdit={(id) => setEdit({ level: "foundation", mode: "edit", id })}
              onDelete={(id, label) => setDeleteTarget({ level: "foundation", id, label })}
              onReorder={(ids) => { reorderFoundations(ids); bump(); }}
              selectLabel="Manage subjects"
            />
          )}

          {/* ---------------- Subjects ---------------- */}
          {foundation && !subject && (
            <Level
              title={`Subjects in ${foundation.name}`}
              items={subjects.map((s) => ({ id: s.id, label: s.name, order: s.order }))}
              onAdd={() => setEdit({ level: "subject", mode: "add" })}
              onSelect={(id) => setSubjectId(id)}
              onEdit={(id) => setEdit({ level: "subject", mode: "edit", id })}
              onDelete={(id, label) => setDeleteTarget({ level: "subject", id, label })}
              onReorder={(ids) => { reorderSubjects(foundation.id, ids); bump(); }}
              selectLabel="Manage lectures"
            />
          )}

          {/* ---------------- Lectures ---------------- */}
          {foundation && subject && !lecture && (
            <Level
              title={`Lectures in ${subject.name}`}
              items={lectures.map((l) => ({ id: l.id, label: l.title, order: l.order }))}
              onAdd={() => setEdit({ level: "lecture", mode: "add" })}
              onSelect={(id) => setLectureId(id)}
              onEdit={(id) => setEdit({ level: "lecture", mode: "edit", id })}
              onDelete={(id, label) => setDeleteTarget({ level: "lecture", id, label })}
              onReorder={(ids) => { reorderLectures(foundation.id, subject.id, ids); bump(); }}
              selectLabel="Manage sources"
            />
          )}

          {/* ---------------- Sources & Parts ---------------- */}
          {foundation && subject && lecture && (
            <SourcesEditor
              foundation={foundation}
              subject={subject}
              lecture={lecture}
              edit={edit}
              setEdit={setEdit}
              deleteTarget={deleteTarget}
              setDeleteTarget={setDeleteTarget}
              bump={bump}
            />
          )}

          {/* ---------------- Modals ---------------- */}
          {edit?.level === "foundation" && (
            <Modal title={edit.mode === "add" ? "Add Foundation" : "Edit Foundation"}>
              <FoundationForm
                initial={edit.mode === "edit" ? foundations.find((f) => f.id === edit.id) : undefined}
                onSubmit={(name) => {
                  if (edit.mode === "add") addFoundation(name);
                  else updateFoundation(edit.id, { name });
                  setEdit(null);
                  bump();
                }}
                onCancel={() => setEdit(null)}
              />
            </Modal>
          )}

          {edit?.level === "subject" && foundation && (
            <Modal title={edit.mode === "add" ? "Add Subject" : "Edit Subject"}>
              <SubjectForm
                initial={edit.mode === "edit" ? subjects.find((s) => s.id === edit.id) : undefined}
                onSubmit={(name) => {
                  if (edit.mode === "add") addSubject(foundation.id, name);
                  else updateSubject(foundation.id, edit.id, { name });
                  setEdit(null);
                  bump();
                }}
                onCancel={() => setEdit(null)}
              />
            </Modal>
          )}

          {edit?.level === "lecture" && foundation && subject && (
            <Modal title={edit.mode === "add" ? "Add Lecture" : "Edit Lecture"}>
              <LectureForm
                initial={edit.mode === "edit" ? lectures.find((l) => l.id === edit.id) : undefined}
                onSubmit={(title, description) => {
                  if (edit.mode === "add") addLecture(foundation.id, subject.id, title, description || undefined);
                  else updateLecture(foundation.id, subject.id, edit.id, { title, description: description || undefined });
                  setEdit(null);
                  bump();
                }}
                onCancel={() => setEdit(null)}
              />
            </Modal>
          )}
        </>
      )}

      {deleteTarget && (
        <ConfirmDialog
          message={`Delete "${deleteTarget.label}"? This cannot be undone.`}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={() => {
            if (deleteTarget.level === "foundation") {
              deleteFoundation(deleteTarget.id);
              if (foundationId === deleteTarget.id) setFoundationId(null);
            } else if (deleteTarget.level === "subject" && foundation) {
              deleteSubject(foundation.id, deleteTarget.id);
              if (subjectId === deleteTarget.id) setSubjectId(null);
            } else if (deleteTarget.level === "lecture" && foundation && subject) {
              deleteLecture(foundation.id, subject.id, deleteTarget.id);
              if (lectureId === deleteTarget.id) setLectureId(null);
            } else if (deleteTarget.level === "source" && foundation && subject && lecture) {
              deleteSource(foundation.id, subject.id, lecture.id, deleteTarget.id);
            } else if (deleteTarget.level === "part" && foundation && subject && lecture) {
              deletePart(foundation.id, subject.id, lecture.id, deleteTarget.sourceId, deleteTarget.index);
            } else if (deleteTarget.level === "question") {
              deleteQuestion(deleteTarget.id);
            }
            setDeleteTarget(null);
            bump();
          }}
        />
      )}
    </div>
  );
}

/* ------------------------------------------------------------ */
/* Generic list level (Foundations / Subjects / Lectures)         */
/* ------------------------------------------------------------ */

function Level({
  title,
  items,
  onAdd,
  onSelect,
  onEdit,
  onDelete,
  onReorder,
  selectLabel,
}: {
  title: string;
  items: { id: string; label: string; order: number }[];
  onAdd: () => void;
  onSelect: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string, label: string) => void;
  onReorder: (orderedIds: string[]) => void;
  selectLabel: string;
}) {
  function move(index: number, direction: -1 | 1) {
    const next = [...items];
    const target = index + direction;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    onReorder(next.map((i) => i.id));
  }

  return (
    <section className="cm-level">
      <div className="cm-level-header">
        <h2>{title}</h2>
        <button className="btn-primary btn-small" onClick={onAdd}>
          + Add
        </button>
      </div>
      {items.length === 0 && <p className="empty-state">Nothing here yet.</p>}
      <div className="list">
        {items.map((item, index) => (
          <div className="list-item cm-item" key={item.id}>
            <button className="link-btn cm-item-title" onClick={() => onSelect(item.id)}>
              {item.label}
            </button>
            <div className="cm-item-actions">
              <button className="btn-icon" onClick={() => move(index, -1)} aria-label="Move up" disabled={index === 0}>
                ↑
              </button>
              <button className="btn-icon" onClick={() => move(index, 1)} aria-label="Move down" disabled={index === items.length - 1}>
                ↓
              </button>
              <button className="btn-secondary btn-small" onClick={() => onSelect(item.id)}>
                {selectLabel}
              </button>
              <button className="btn-secondary btn-small" onClick={() => onEdit(item.id)}>
                Edit
              </button>
              <button className="btn-danger btn-small" onClick={() => onDelete(item.id, item.label)}>
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------ */
/* Sources + Parts editor for a single lecture                    */
/* ------------------------------------------------------------ */

function SourcesEditor({
  foundation,
  subject,
  lecture,
  edit,
  setEdit,
  deleteTarget,
  setDeleteTarget,
  bump,
}: {
  foundation: Foundation;
  subject: Subject;
  lecture: Lecture;
  edit: EditTarget | null;
  setEdit: (e: EditTarget | null) => void;
  deleteTarget: DeleteTarget | null;
  setDeleteTarget: (d: DeleteTarget | null) => void;
  bump: () => void;
}) {
  const sources = lecture.sources;

  function moveSource(index: number, direction: -1 | 1) {
    const next = [...sources];
    const target = index + direction;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    reorderSources(foundation.id, subject.id, lecture.id, next.map((s) => s.id));
    bump();
  }

  function movePart(source: Source, index: number, direction: -1 | 1) {
    const parts = [...(source.parts ?? [])];
    const target = index + direction;
    if (target < 0 || target >= parts.length) return;
    const indexes = parts.map((_, i) => i);
    [indexes[index], indexes[target]] = [indexes[target], indexes[index]];
    reorderParts(foundation.id, subject.id, lecture.id, source.id, indexes);
    bump();
  }

  return (
    <section className="cm-level">
      <div className="cm-level-header">
        <h2>Sources in {lecture.title}</h2>
        <button className="btn-primary btn-small" onClick={() => setEdit({ level: "source", mode: "add" })}>
          + Add Source
        </button>
      </div>

      {sources.length === 0 && <p className="empty-state">No resources added yet.</p>}

      <div className="list">
        {sources.map((source, index) => (
          <div className="cm-source-card" key={source.id}>
            <div className="cm-item">
              <div className="cm-item-title">
                {source.name}
                <span className="badge">{SOURCE_TYPE_LABELS[source.type]}</span>
                {source.recommended && <span className="badge recommended">Recommended</span>}
              </div>
              <div className="cm-item-actions">
                <button className="btn-icon" onClick={() => moveSource(index, -1)} aria-label="Move up" disabled={index === 0}>
                  ↑
                </button>
                <button className="btn-icon" onClick={() => moveSource(index, 1)} aria-label="Move down" disabled={index === sources.length - 1}>
                  ↓
                </button>
                <button className="btn-secondary btn-small" onClick={() => setEdit({ level: "source", mode: "edit", id: source.id })}>
                  Edit
                </button>
                <button
                  className="btn-danger btn-small"
                  onClick={() => setDeleteTarget({ level: "source", id: source.id, label: source.name })}
                >
                  Delete
                </button>
              </div>
            </div>

            {source.url && <p className="cm-hint">Link: {source.url}</p>}

            <div className="cm-parts">
              {(source.parts ?? []).map((part, pIndex) => (
                <div className="list-item cm-item" key={pIndex}>
                  <span>{part.title} — {part.url}</span>
                  <div className="cm-item-actions">
                    <button className="btn-icon" onClick={() => movePart(source, pIndex, -1)} aria-label="Move up" disabled={pIndex === 0}>
                      ↑
                    </button>
                    <button
                      className="btn-icon"
                      onClick={() => movePart(source, pIndex, 1)}
                      aria-label="Move down"
                      disabled={pIndex === (source.parts?.length ?? 0) - 1}
                    >
                      ↓
                    </button>
                    <button
                      className="btn-secondary btn-small"
                      onClick={() => setEdit({ level: "part", mode: "edit", sourceId: source.id, index: pIndex })}
                    >
                      Edit
                    </button>
                    <button
                      className="btn-danger btn-small"
                      onClick={() => setDeleteTarget({ level: "part", sourceId: source.id, index: pIndex, label: part.title })}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
              <button
                className="btn-secondary btn-small"
                onClick={() => setEdit({ level: "part", mode: "add", sourceId: source.id })}
              >
                + Add Part
              </button>
            </div>
          </div>
        ))}
      </div>

      {edit?.level === "source" && (
        <Modal title={edit.mode === "add" ? "Add Source" : "Edit Source"}>
          <SourceForm
            initial={edit.mode === "edit" ? sources.find((s) => s.id === edit.id) : undefined}
            onSubmit={(values) => {
              const payload: any = { name: values.name, type: values.type, recommended: values.recommended || undefined };
              if (values.parts && values.parts.length > 0) payload.parts = values.parts.map((p: any, i: number) => ({ title: p.title || `Part ${i + 1}`, url: p.url, order: i + 1 }));
              else if (values.url) payload.url = values.url;

              if (edit.mode === "add") {
                addSource(foundation.id, subject.id, lecture.id, payload);
              } else {
                updateSource(foundation.id, subject.id, lecture.id, edit.id, payload);
              }
              setEdit(null);
              bump();
            }}
            onCancel={() => setEdit(null)}
          />
        </Modal>
      )}

      {edit?.level === "part" && (
        <Modal title={edit.mode === "add" ? "Add Part" : "Edit Part"}>
          <PartForm
            initial={
              edit.mode === "edit"
                ? sources.find((s) => s.id === edit.sourceId)?.parts?.[edit.index]
                : undefined
            }
            onSubmit={(values) => {
              if (edit.mode === "add") {
                addPart(foundation.id, subject.id, lecture.id, edit.sourceId, values);
              } else {
                updatePart(foundation.id, subject.id, lecture.id, edit.sourceId, edit.index, values);
              }
              setEdit(null);
              bump();
            }}
            onCancel={() => setEdit(null)}
          />
        </Modal>
      )}
    </section>
  );
}

/* ------------------------------------------------------------ */
/* Questions tab                                                   */
/* ------------------------------------------------------------ */

function QuestionsTab({
  foundations,
  questions,
  edit,
  setEdit,
  deleteTarget,
  setDeleteTarget,
  bump,
}: {
  foundations: Foundation[];
  questions: Question[];
  edit: EditTarget | null;
  setEdit: (e: EditTarget | null) => void;
  deleteTarget: DeleteTarget | null;
  setDeleteTarget: (d: DeleteTarget | null) => void;
  bump: () => void;
}) {
  void deleteTarget;
  return (
    <section className="cm-level">
      <div className="cm-level-header">
        <h2>Question Bank ({questions.length})</h2>
        <button className="btn-primary btn-small" onClick={() => setEdit({ level: "question", mode: "add" })}>
          + Add Question
        </button>
      </div>

      {questions.length === 0 && <p className="empty-state">No questions yet.</p>}

      <div className="list">
        {questions.map((q) => (
          <div className="list-item cm-item" key={q.id}>
            <div>
              <div className="cm-item-title">{q.question}</div>
              <span className="badge">{q.type}</span>
              {q.difficulty && <span className="badge">{q.difficulty}</span>}
            </div>
            <div className="cm-item-actions">
              <button className="btn-secondary btn-small" onClick={() => setEdit({ level: "question", mode: "edit", id: q.id })}>
                Edit
              </button>
              <button
                className="btn-danger btn-small"
                onClick={() => setDeleteTarget({ level: "question", id: q.id, label: q.question })}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {edit?.level === "question" && (
        <Modal title={edit.mode === "add" ? "Add Question" : "Edit Question"}>
          <QuestionForm
            initial={edit.mode === "edit" ? questions.find((q) => q.id === edit.id) : undefined}
            foundations={foundations}
            onSubmit={(values) => {
              if (edit.mode === "add") addQuestion(values);
              else updateQuestion(edit.id, values);
              setEdit(null);
              bump();
            }}
            onCancel={() => setEdit(null)}
          />
        </Modal>
      )}
    </section>
  );
}

function WebsiteTab() {
  return (
    <section className="cm-level">
      <div className="cm-level-header">
        <h2>Website Customization</h2>
      </div>
      <CustomizationPanel />
    </section>
  );
}

/* ------------------------------------------------------------ */
/* Modal shell                                                     */
/* ------------------------------------------------------------ */

function Modal({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="confirm-overlay" role="dialog" aria-modal="true">
      <div className="cm-modal-box">
        <h2>{title}</h2>
        {children}
      </div>
    </div>
  );
}
