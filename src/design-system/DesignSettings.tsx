import { useEffect, useState } from "react";
import { Moon, Settings2, SlidersHorizontal, Sun, X } from "lucide-react";
import { DSButton, DSCard } from "./primitives";
import { DEFAULT_DESIGN_PREFERENCES, DESIGN_STORAGE_KEY, glassStyleValues, normalizeDesignPreferences } from "./preferences";
import type { DesignPreferences } from "./preferences";

function loadPreferences(): DesignPreferences {
  try {
    const raw = localStorage.getItem(DESIGN_STORAGE_KEY);
    return raw ? normalizeDesignPreferences(JSON.parse(raw)) : { ...DEFAULT_DESIGN_PREFERENCES };
  } catch {
    return { ...DEFAULT_DESIGN_PREFERENCES };
  }
}

export function DesignSettings() {
  const [preferences, setPreferences] = useState<DesignPreferences>(loadPreferences);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const root = document.documentElement;
    const glass = glassStyleValues(preferences.glass);
    root.dataset.dinaroTheme = preferences.theme;
    root.dataset.dinaroDensity = preferences.density;
    root.style.setProperty("--ds-glass-blur", glass.blur);
    root.style.setProperty("--ds-glass-opacity", glass.opacity);
    try { localStorage.setItem(DESIGN_STORAGE_KEY, JSON.stringify(preferences)); } catch { /* optional storage */ }
  }, [preferences]);
  const change = (patch: Partial<DesignPreferences>) =>
    setPreferences(previous => normalizeDesignPreferences({...previous, ...patch}));

  return <div className="ds-settings" dir="rtl">
    <DSButton icon={Settings2} className="ds-settings-trigger"
      aria-expanded={open} aria-controls="dinaro-design-settings"
      onClick={() => setOpen(value => !value)}>تخصيص المظهر</DSButton>
    {open && <DSCard id="dinaro-design-settings" role="region" aria-label="إعدادات مظهر DINARO" className="ds-settings-panel">
      <div className="ds-settings-heading">
        <div><strong>DINARO Design System 1.0</strong><small>الإعدادات لا تمس أموالك أو معاملاتك</small></div>
        <DSButton icon={X} variant="ghost" aria-label="إغلاق الإعدادات" onClick={() => setOpen(false)}/>
      </div>
      <fieldset className="ds-settings-group">
        <legend>المظهر</legend>
        <div className="ds-choice-row">
          <DSButton icon={Moon} variant={preferences.theme === "dark" ? "primary" : "secondary"}
            aria-pressed={preferences.theme === "dark"} onClick={() => change({theme:"dark"})}>داكن</DSButton>
          <DSButton icon={Sun} variant={preferences.theme === "light" ? "primary" : "secondary"}
            aria-pressed={preferences.theme === "light"} onClick={() => change({theme:"light"})}>فاتح</DSButton>
        </div>
      </fieldset>
      <fieldset className="ds-settings-group">
        <legend>كثافة المعلومات</legend>
        <div className="ds-choice-row">
          <DSButton variant={preferences.density === "detailed" ? "primary" : "secondary"}
            aria-pressed={preferences.density === "detailed"} onClick={() => change({density:"detailed"})}>تفصيلية</DSButton>
          <DSButton variant={preferences.density === "comfortable" ? "primary" : "secondary"}
            aria-pressed={preferences.density === "comfortable"} onClick={() => change({density:"comfortable"})}>مريحة</DSButton>
        </div>
      </fieldset>
      <div className="ds-settings-group">
        <label htmlFor="dinaro-glass"><SlidersHorizontal size={16} aria-hidden="true"/> قوة الزجاجية: {preferences.glass}%</label>
        <input id="dinaro-glass" type="range" min="0" max="100" step="5"
          value={preferences.glass} onChange={event => change({glass:Number(event.target.value)})}/>
      </div>
      <p className="ds-settings-disclaimer">قيم الألوان والزجاجية مقترحات قابلة للمراجعة قبل الاعتماد النهائي.</p>
    </DSCard>}
  </div>;
}
