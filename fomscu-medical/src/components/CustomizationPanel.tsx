import React, { useState, useEffect } from "react";
import { getSiteSettings, saveSiteSettings, exportSettings, importSettings } from "../utils/storage";
import type { SiteSettings } from "../types";
import AnimatedIcon from "./AnimatedIcon";

export default function CustomizationPanel({ onChange }: { onChange?: () => void }) {
  const initial = getSiteSettings() as SiteSettings;
  const [settings, setSettings] = useState<SiteSettings>({ ...initial });
  const [importText, setImportText] = useState("");

  useEffect(() => {
    // apply color variables live for preview
    if (settings.colors) {
      const root = document.documentElement;
      Object.entries(settings.colors).forEach(([k, v]) => {
        if (v) root.style.setProperty(`--color-${k}`, v);
      });
    }
  }, [settings.colors]);

  function update(partial: Partial<SiteSettings>) {
    const next = { ...settings, ...partial };
    setSettings(next);
    saveSiteSettings(next);
    onChange?.();
  }

  function updateHomepage(partial: Partial<SiteSettings["homepage"]>) {
    update({ homepage: { ...(settings.homepage || {}), ...partial } });
  }

  function handleExport() {
    const json = exportSettings();
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "fomscu-settings.json";
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleImport() {
    try {
      importSettings(importText);
      const re = getSiteSettings() as SiteSettings;
      setSettings(re);
      alert("Settings imported.");
    } catch (e: any) {
      alert("Failed to import: " + (e?.message || String(e)));
    }
  }

  function handleUploadImage(e: React.ChangeEvent<HTMLInputElement>, key: string) {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => {
      const data = String(reader.result || "");
      update({ [key]: data } as any);
    };
    reader.readAsDataURL(f);
  }

  return (
    <div style={{ display: "flex", gap: 18 }}>
      <div style={{ flex: 1 }}>
        <h2>Website Customization</h2>
        <section>
          <h3>Site</h3>
          <label>
            Site title
            <input value={settings.siteTitle || ""} onChange={(e) => update({ siteTitle: e.target.value })} />
          </label>
          <label>
            Short name
            <input value={settings.siteShortName || ""} onChange={(e) => update({ siteShortName: e.target.value })} />
          </label>
          <label>
            Logo (upload)
            <input type="file" accept="image/*" onChange={(e) => handleUploadImage(e, "logo")} />
          </label>
        </section>

        <section>
          <h3>Colors</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {[
              ["primary", "Primary"],
              ["accent", "Accent"],
              ["background", "Background"],
              ["card", "Card"],
              ["text", "Text"],
              ["heading", "Heading"],
              ["button", "Button"],
              ["border", "Border"],
              ["hover", "Hover"],
            ].map(([k, label]) => (
              <label key={String(k)} style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <span style={{ width: 90 }}>{label}</span>
                <input
                  type="color"
                  value={(settings.colors as any)?.[k] || "#000000"}
                  onChange={(e) => update({ colors: { ...(settings.colors || {}), [k]: e.target.value } })}
                />
                <input style={{ flex: 1 }} value={(settings.colors as any)?.[k] || ""} onChange={(e) => update({ colors: { ...(settings.colors || {}), [k]: e.target.value } })} />
              </label>
            ))}
          </div>
        </section>

        <section>
          <h3>Homepage - Hero</h3>
          <label>
            Hero title
            <input value={settings.homepage?.heroTitle || ""} onChange={(e) => updateHomepage({ heroTitle: e.target.value })} />
          </label>
          <label>
            Hero subtitle
            <input value={settings.homepage?.heroSubtitle || ""} onChange={(e) => updateHomepage({ heroSubtitle: e.target.value })} />
          </label>
          <label>
            Hero description
            <textarea rows={3} value={settings.homepage?.heroSubtitle || ""} onChange={(e) => updateHomepage({ heroSubtitle: e.target.value })} />
          </label>
          <label>
            Hero button text
            <input value={settings.homepage?.heroButtonText || ""} onChange={(e) => updateHomepage({ heroButtonText: e.target.value })} />
          </label>
          <label>
            Hero button link
            <input value={settings.homepage?.heroButtonLink || ""} onChange={(e) => updateHomepage({ heroButtonLink: e.target.value })} />
          </label>
          <label>
            Hero image (upload)
            <input type="file" accept="image/*" onChange={(e) => {
              const f = e.target.files?.[0];
              if (!f) return;
              const reader = new FileReader();
              reader.onload = () => updateHomepage({ heroImage: String(reader.result || "") });
              reader.readAsDataURL(f);
            }} />
          </label>
        </section>

        <section>
          <h3>Import / Export</h3>
          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn-primary" onClick={handleExport}>Export Settings</button>
            <button className="btn-secondary" onClick={() => { saveSiteSettings({}); setSettings({}); alert("Reset settings to empty."); }}>Reset Settings</button>
          </div>
          <div style={{ marginTop: 12 }}>
            <textarea rows={6} value={importText} onChange={(e) => setImportText(e.target.value)} placeholder="Paste settings JSON here to import" />
            <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
              <button className="btn-primary" onClick={handleImport}>Import</button>
            </div>
          </div>
        </section>
      </div>

      <div style={{ width: 420 }}>
        <h3>Live Preview</h3>
        <div style={{ border: "1px solid var(--color-border)", borderRadius: 10, padding: 14, background: "var(--color-surface)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 56, height: 56, borderRadius: 10, overflow: "hidden" }}>
              {settings.logo ? <img src={settings.logo} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <AnimatedIcon name={settings.siteTitle || "medical-hub"} size={48} />}
            </div>
            <div>
                            <div style={{ fontWeight: 800 }}>{settings.siteTitle || "FOMSCU SAVER"}</div>
              <div style={{ color: "var(--color-text-muted)" }}>{settings.siteShortName || "Medical Learning Hub"}</div>
            </div>
          </div>

          <div style={{ marginTop: 12 }}>
            <div style={{ padding: 12, borderRadius: 8, background: "linear-gradient(180deg, rgba(11,116,255,0.06), transparent)" }}>
              <h3 style={{ margin: 0 }}>{settings.homepage?.heroTitle || "FOMSCU SAVER"}</h3>
              <p style={{ margin: "6px 0 0" }}>{settings.homepage?.heroSubtitle || "Medical Learning Hub"}</p>
              <div style={{ marginTop: 8 }}>
                <a className="resource-btn" href={settings.homepage?.heroButtonLink || "#"}>{settings.homepage?.heroButtonText || "Explore"}</a>
              </div>
            </div>
            {settings.homepage?.heroImage && (
              <div style={{ marginTop: 10 }}>
                <img src={settings.homepage?.heroImage} style={{ width: "100%", borderRadius: 8 }} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
