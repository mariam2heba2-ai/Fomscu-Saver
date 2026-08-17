import { useRef, useState } from "react";
import {
  exportData,
  importData,
  resetToDefault,
  clearLocalChanges,
  hasLocalChanges,
} from "../utils/storage";
import ConfirmDialog from "./ConfirmDialog";

/**
 * Export / Import / Reset / Clear controls for the Content Manager.
 * All destructive actions (import overwrite, reset, clear) go through
 * ConfirmDialog first - nothing is silently deleted.
 */
export default function DataTools({ onChanged }: { onChanged: () => void }) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pendingAction, setPendingAction] = useState<
    "reset" | "clear" | "import" | null
  >(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  function handleExport() {
    const json = exportData();
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `fomscu-export-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleFilePicked(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPendingFile(file);
    setPendingAction("import");
  }

  async function confirmImport() {
    if (!pendingFile) return;
    try {
      const text = await pendingFile.text();
      importData(text);
      setMessage("Import successful.");
      onChanged();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Import failed.");
    } finally {
      setPendingAction(null);
      setPendingFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  function confirmReset() {
    resetToDefault();
    setMessage("All local changes were reset to default data.");
    setPendingAction(null);
    onChanged();
  }

  function confirmClear() {
    clearLocalChanges();
    setMessage("Local changes cleared.");
    setPendingAction(null);
    onChanged();
  }

  return (
    <div className="data-tools">
      <h2>Data Tools</h2>
      <p className="subtitle">
        {hasLocalChanges()
          ? "You have local changes saved in this browser."
          : "No local changes yet - the site is showing the default seed data."}
      </p>

      <div className="data-tools-actions">
        <button type="button" className="btn-secondary" onClick={handleExport}>
          Export Data as JSON
        </button>

        <button
          type="button"
          className="btn-secondary"
          onClick={() => fileInputRef.current?.click()}
        >
          Import Data from JSON
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/json"
          className="visually-hidden"
          onChange={handleFilePicked}
        />

        <button
          type="button"
          className="btn-danger"
          onClick={() => setPendingAction("reset")}
        >
          Reset to Default Data
        </button>

        <button
          type="button"
          className="btn-danger"
          onClick={() => setPendingAction("clear")}
        >
          Clear Local Changes
        </button>
      </div>

      {message && <p className="data-tools-message">{message}</p>}

      {pendingAction === "reset" && (
        <ConfirmDialog
          message="This will discard all local changes and restore the default seed data. This cannot be undone. Continue?"
          onConfirm={confirmReset}
          onCancel={() => setPendingAction(null)}
        />
      )}

      {pendingAction === "clear" && (
        <ConfirmDialog
          message="This will clear everything you've edited in this browser and fall back to the default data. This cannot be undone. Continue?"
          onConfirm={confirmClear}
          onCancel={() => setPendingAction(null)}
        />
      )}

      {pendingAction === "import" && pendingFile && (
        <ConfirmDialog
          message={`Import "${pendingFile.name}"? This will replace your current local content and questions.`}
          onConfirm={confirmImport}
          onCancel={() => {
            setPendingAction(null);
            setPendingFile(null);
            if (fileInputRef.current) fileInputRef.current.value = "";
          }}
        />
      )}
    </div>
  );
}
