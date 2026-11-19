/* Boot the guide: load data, wire the store, route by hash, render on every change. */
import { loadTrophies } from "./data.js";
import { createProgressStore, downloadTextFile } from "./store.js";
import { renderApp } from "./views.js";

const viewEl = document.getElementById("view");
const earnedCountEl = document.getElementById("earnedCount");
const progressFillEl = document.getElementById("progressFill");
const spoilerToggleEl = document.getElementById("spoilerToggle");

const state = {
  trophies: [],
  route: "",
  selectedId: 15,
  kind: "all",
  grade: "all",
  earned: "all",
  query: "",
  store: createProgressStore(),
};

function readRoute() {
  const hash = location.hash.replace(/^#\/?/, "");
  const parts = hash.split("/");
  if (parts[0] === "trophy" && Number(parts[1])) {
    state.route = "";
    state.selectedId = Number(parts[1]);
    return;
  }
  state.route = ["roadmap", "missables", "save"].includes(parts[0]) ? parts[0] : "";
}

function updateProgress() {
  const earned = state.store.earnedCount();
  earnedCountEl.textContent = String(earned);
  progressFillEl.style.width = `${Math.round((earned / 55) * 100)}%`;
  spoilerToggleEl.checked = state.store.isSpoilerOn();
  document.querySelectorAll(".tabs a").forEach((a) => {
    a.classList.toggle("active", (a.getAttribute("data-route") || "") === state.route);
  });
}

function render() {
  readRoute();
  updateProgress();
  viewEl.innerHTML = renderApp(state);
  const search = document.getElementById("searchBox");
  if (search && document.activeElement !== search) {
    // Keep focus where the reader left it; the value is restored from state.
  }
}

function focusSearch() {
  const search = document.getElementById("searchBox");
  if (search) { search.focus(); search.select(); }
}

viewEl.addEventListener("click", (event) => {
  const earn = event.target.closest("[data-earn]");
  if (earn) {
    event.stopPropagation();
    state.store.toggleEarned(Number(earn.getAttribute("data-earn")));
    render();
    return;
  }
  const kind = event.target.closest("[data-kind]");
  if (kind) {
    state.kind = kind.getAttribute("data-kind");
    render();
    return;
  }
  const select = event.target.closest("[data-select]");
  if (select) {
    state.selectedId = Number(select.getAttribute("data-select"));
    location.hash = `#/trophy/${state.selectedId}`;
    render();
  }
});

viewEl.addEventListener("input", (event) => {
  if (event.target.id === "searchBox") {
    state.query = event.target.value;
    render();
    const search = document.getElementById("searchBox");
    if (search) { search.focus(); search.setSelectionRange(search.value.length, search.value.length); }
  }
  if (event.target.id === "gradeFilter") { state.grade = event.target.value; render(); }
  if (event.target.id === "earnedFilter") { state.earned = event.target.value; render(); }
  if (event.target.hasAttribute("data-note")) {
    state.store.setNote(Number(event.target.getAttribute("data-note")), event.target.value);
  }
});

viewEl.addEventListener("change", (event) => {
  if (event.target.id === "importFile" && event.target.files && event.target.files[0]) {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = () => {
      const msg = document.getElementById("saveMsg");
      try {
        state.store.importState(String(reader.result));
        if (msg) msg.textContent = `Imported progress from ${file.name}.`;
        render();
      } catch (err) {
        if (msg) msg.textContent = "That file is not a Leonida Platinum export.";
      }
    };
    reader.readAsText(file);
  }
});

viewEl.addEventListener("click", (event) => {
  if (event.target.id === "exportBtn") {
    downloadTextFile("leonida-platinum-progress.json", state.store.exportState());
  }
  if (event.target.id === "resetBtn") {
    if (window.confirm("Reset all earned trophies and notes?")) {
      state.store.resetAll();
      render();
    }
  }
});

spoilerToggleEl.addEventListener("change", () => {
  state.store.setSpoiler(spoilerToggleEl.checked);
  render();
});

document.addEventListener("keydown", (event) => {
  if (event.key === "/" && document.activeElement && document.activeElement.tagName !== "INPUT" && document.activeElement.tagName !== "TEXTAREA") {
    event.preventDefault();
    focusSearch();
  }
});

window.addEventListener("hashchange", render);
state.store.onChange(updateProgress);

async function bootGuide() {
  state.trophies = await loadTrophies();
  const params = new URLSearchParams(location.search);
  if (params.get("demo") === "1") state.store.seedDemo();
  if (params.get("spoilers") === "on") state.store.setSpoiler(true);
  if (params.get("spoilers") === "off") state.store.setSpoiler(false);
  render();
}

bootGuide().catch((err) => {
  viewEl.innerHTML = `<p class="empty">The guide could not load its trophy data (${err.message}). Check that data/trophies.json sits beside this page.</p>`;
});
