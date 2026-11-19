/* Saved progress: localStorage only, exportable and importable as JSON. */
export const STORAGE_KEY = "leonida-platinum-v1";
export const DEMO_EARNED_IDS = [2, 3, 4, 15, 16, 17, 19, 20, 21, 31, 32, 35, 42];

export function loadSavedState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { earned: {}, notes: {}, spoiler: true };
    const parsed = JSON.parse(raw);
    return { earned: parsed.earned || {}, notes: parsed.notes || {}, spoiler: parsed.spoiler !== false };
  } catch (err) {
    return { earned: {}, notes: {}, spoiler: true };
  }
}

export function createProgressStore() {
  let state = loadSavedState();
  const listeners = new Set();

  function save() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (err) { /* storage full or blocked */ }
    for (const fn of listeners) fn(state);
  }
  function onChange(fn) { listeners.add(fn); }
  function isEarned(id) { return Boolean(state.earned[id]); }
  function toggleEarned(id) {
    if (state.earned[id]) delete state.earned[id];
    else state.earned[id] = true;
    save();
  }
  function setEarned(id, value) {
    if (value) state.earned[id] = true;
    else delete state.earned[id];
    save();
  }
  function earnedCount() { return Object.keys(state.earned).length; }
  function getNote(id) { return state.notes[id] || ""; }
  function setNote(id, text) {
    if (text) state.notes[id] = text;
    else delete state.notes[id];
    save();
  }
  function isSpoilerOn() { return state.spoiler !== false; }
  function setSpoiler(value) { state.spoiler = Boolean(value); save(); }
  function exportState() {
    return JSON.stringify({ app: "Leonida Platinum", exportedAt: new Date().toISOString(), ...state }, null, 2);
  }
  function importState(text) {
    const parsed = JSON.parse(text);
    if (!parsed || typeof parsed !== "object") throw new Error("not a Leonida Platinum export");
    state = { earned: parsed.earned || {}, notes: parsed.notes || {}, spoiler: parsed.spoiler !== false };
    save();
  }
  function resetAll() {
    state = { earned: {}, notes: {}, spoiler: true };
    save();
  }
  function seedDemo() {
    if (Object.keys(state.earned).length > 0) return false;
    for (const id of DEMO_EARNED_IDS) state.earned[id] = true;
    state.spoiler = true;
    save();
    return true;
  }
  return { onChange, isEarned, toggleEarned, setEarned, earnedCount, getNote, setNote, isSpoilerOn, setSpoiler, exportState, importState, resetAll, seedDemo };
}

export function downloadTextFile(filename, text) {
  const blob = new Blob([text], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
