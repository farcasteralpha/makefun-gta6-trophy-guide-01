/* Views: checklist with detail pane, roadmap, missables and save pages. */
import { KIND_LABELS, displayName, displayDescription, isHiddenFromSpoilers, filterTrophies } from "./filters.js";
import { nextUpTrophies, stageTotals } from "./data.js";

export function escapeHtml(text) {
  return String(text).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

export const ROADMAP_STAGES = [
  { stage: 1, title: "Story first — Chapters 1 to 5", time: "about 60–80 hours", text: "Play the story through. Chapter trophies and the five character finals pop as you go, and both Jason and Lucia become playable in Chapter 2, which opens most of the open world. Do Lucia's balcony meditation in Chapter 1 and keep a manual save at the start of every chapter." },
  { stage: 2, title: "Strangers & secrets", time: "alongside the story", text: "Finish the 8 stranger mission strands, including Bret's hunt and the five character finals. Begin each strand as soon as it unlocks — one source warns the strands have windows tied to story progress. The hidden one-off trophies (Ocean Beach, the showroom, the bowling alley) sit here too; five methods are still unconfirmed at launch." },
  { stage: 3, title: "Activities & collectibles", time: "the long middle", text: "250 stunts, gold in all 42 Shooting Range challenges, drone races at 14 locations, 20 race wins, 18 meditation spots, 100 WAiNK locations, 3 card sets, 100 vehicles discovered, 50 challenges, exploring all of Leonida and 10 Scooter Bros registrations." },
  { stage: 4, title: "Money & mayhem", time: "after the story opens up", text: "5 bank vaults (after the optional Chapter 4 mission 'That's Where The Money Is…'), an armored truck, one illegal operation per gang (9 gangs), $250,000 laundered, $100,000 spent, 8 garages bought, plus the combat set-pieces: 5 enemies in one Combat Focus, the tank, the jet and the jewelry store." },
  { stage: 5, title: "100% & the platinum", time: "about 10 hours of cleanup", text: "Finish the 100% completion checklist for A Long Road — its targets run higher than the trophies (300 stunts, 30 races, 70 challenges, 15 card sets, 8 vaults). The platinum, Vice Got a Price!, pops the moment the last other trophy does." },
];

function gradeChip(grade) {
  return `<span class="grade ${grade}">${grade}</span>`;
}

function trophyTags(t) {
  const tags = [`<span class="kind-tag">${KIND_LABELS[t.kind] || t.kind}</span>`];
  if (t.hidden) tags.push(`<span class="hidden-tag">Hidden</span>`);
  if (t.missable) tags.push(`<span class="miss-tag">Possibly missable</span>`);
  if (t.target) tags.push(`<span class="target-tag">Target: ${t.target.toLocaleString()} ${t.targetLabel || ""}</span>`);
  return tags.join(" ");
}

function trophyRow(t, state) {
  const earned = state.store.isEarned(t.id);
  const spoilerOn = state.store.isSpoilerOn();
  const selected = state.selectedId === t.id;
  return `<li class="trow${earned ? " earned" : ""}${selected ? " selected" : ""}" data-select="${t.id}">
    <input type="checkbox" data-earn="${t.id}" ${earned ? "checked" : ""} aria-label="Earned: ${escapeHtml(displayName(t, spoilerOn, state.store.isEarned))}">
    <div><div class="tname">${escapeHtml(displayName(t, spoilerOn, state.store.isEarned))}</div>
    <div class="tdesc">${escapeHtml(displayDescription(t, spoilerOn, state.store.isEarned))}</div>
    <div class="tmeta">${gradeChip(t.grade)} ${trophyTags(t)}</div></div>
    <div><span class="stage-tag">Stage ${t.stage}</span></div>
  </li>`;
}

export function renderChecklistPage(state) {
  const store = state.store;
  const visible = filterTrophies(state.trophies, {
    kind: state.kind, grade: state.grade, earned: state.earned, query: state.query, isEarned: (id) => store.isEarned(id),
  });
  const next = nextUpTrophies(state.trophies, (id) => store.isEarned(id), 5);
  const kinds = ["all", "story", "missable", "collectibles", "activities", "completion", "online"];
  const kindChips = kinds.map((k) => `<button class="chip${state.kind === k ? " active" : ""}" data-kind="${k}">${k === "all" ? "All" : KIND_LABELS[k]}</button>`).join("");
  const rows = visible.map((t) => trophyRow(t, state)).join("");
  const nextItems = next.map((t) => {
    const label = isHiddenFromSpoilers(t, store.isSpoilerOn(), store.isEarned)
      ? `Hidden trophy — ${KIND_LABELS[t.kind] || t.kind} · Stage ${t.stage}`
      : t.name;
    return `<li>${escapeHtml(label)} ${trophyTags(t)}</li>`;
  }).join("");
  return `<div class="toolbar">
      <input type="search" id="searchBox" placeholder="Search trophies…  ( / )" value="${escapeHtml(state.query)}" aria-label="Search trophies">
      <select id="gradeFilter" aria-label="Filter by grade">
        <option value="all"${state.grade === "all" ? " selected" : ""}>All grades</option>
        <option value="platinum"${state.grade === "platinum" ? " selected" : ""}>Platinum</option>
        <option value="gold"${state.grade === "gold" ? " selected" : ""}>Gold</option>
        <option value="silver"${state.grade === "silver" ? " selected" : ""}>Silver</option>
        <option value="bronze"${state.grade === "bronze" ? " selected" : ""}>Bronze</option>
      </select>
      <select id="earnedFilter" aria-label="Filter by earned state">
        <option value="all"${state.earned === "all" ? " selected" : ""}>All trophies</option>
        <option value="todo"${state.earned === "todo" ? " selected" : ""}>Not yet earned</option>
        <option value="earned"${state.earned === "earned" ? " selected" : ""}>Earned</option>
      </select>
    </div>
    <div class="chiprow" style="margin-bottom:12px">${kindChips}</div>
    <div class="nextup"><h2>Next up — your next 5</h2><p>Ordered by the roadmap: story first, then strangers, activities, money, and 100% last.</p><ol>${nextItems}</ol></div>
    <p class="count-line">Showing ${visible.length} of 55 trophies · ${store.earnedCount()} earned · click a trophy to open its guide and sources.</p>
    <div class="layout">
      <ul class="tlist">${rows || `<li class="empty">No trophies match these filters. Try clearing the search or choosing another kind.</li>`}</ul>
      <aside>${renderDetailPane(state)}</aside>
    </div>`;
}

export function renderDetailPane(state) {
  const t = state.trophies.find((x) => x.id === state.selectedId) || state.trophies[0];
  if (!t) return `<div class="detail"><p>No trophy selected.</p></div>`;
  const store = state.store;
  const earned = store.isEarned(t.id);
  const spoilerOn = store.isSpoilerOn();
  const hidden = isHiddenFromSpoilers(t, spoilerOn, store.isEarned);
  const unconfirmed = t.guide.includes("NOT YET CONFIRMED");
  const name = displayName(t, spoilerOn, store.isEarned);
  const desc = displayDescription(t, spoilerOn, store.isEarned);
  const guide = hidden ? "Hidden on PlayStation until earned. Turn the spoiler setting off, or earn it, to read its guide." : t.guide;
  return `<div class="detail">
    <h2>${escapeHtml(name)}</h2>
    <p class="odesc">${escapeHtml(desc)}</p>
    <div class="tmeta">${gradeChip(t.grade)} ${trophyTags(t)}</div>
    ${hidden ? "" : `<h3>Source</h3><p class="source">${escapeHtml(t.source)} — <a href="${escapeHtml(t.sourceUrl)}" target="_blank" rel="noopener">${escapeHtml(t.sourceUrl)}</a></p>`}
    <h3>Guide</h3>
    ${unconfirmed && !hidden ? `<p class="unconfirmed">Method not yet confirmed at launch — this guide says so plainly instead of inventing steps.</p>` : ""}
    <p class="guide">${escapeHtml(guide)}</p>
    <h3>Your note</h3>
    <textarea class="notebox" data-note="${t.id}" placeholder="Your own note for this trophy — saved in this browser…">${escapeHtml(store.getNote(t.id))}</textarea>
    <button class="earn-btn${earned ? " earned" : ""}" data-earn="${t.id}">${earned ? "✓ Earned — click to unmark" : "Mark as earned"}</button>
  </div>`;
}

export function renderRoadmapPage(state) {
  const store = state.store;
  const totals = stageTotals(state.trophies, (id) => store.isEarned(id));
  const blocks = ROADMAP_STAGES.map((s) => {
    const list = state.trophies.filter((t) => t.stage === s.stage);
    const items = list.map((t) => `<li class="${store.isEarned(t.id) ? "earned" : ""}">${store.isEarned(t.id) ? "✓ " : ""}${escapeHtml(displayName(t, store.isSpoilerOn(), store.isEarned))} ${gradeChip(t.grade)}</li>`).join("");
    const done = totals[s.stage] ? totals[s.stage].earned : 0;
    return `<section class="stage"><h3>Stage ${s.stage} — ${escapeHtml(s.title)}</h3>
      <p class="stage-meta">${escapeHtml(s.time)} · ${done} of ${list.length} earned</p>
      <p>${escapeHtml(s.text)}</p><ul>${items}</ul></section>`;
  }).join("");
  return `<div class="page"><h2>Roadmap to the platinum</h2>
    <p class="lede">Five stages, built from the official descriptions: story first, then strangers, activities and collectibles, money and mayhem, and the 100% cleanup last. PowerPyx puts the whole run at roughly 200 hours — 60 to 80 hours of story, about 100 hours of checklist, about 10 hours of cleanup — at difficulty 4/10.</p>${blocks}</div>`;
}

export function renderMissablesPage(state) {
  const missable = state.trophies.filter((t) => t.missable);
  const cards = missable.map((t) => `<div class="stage"><h3>${escapeHtml(t.name)} ${gradeChip(t.grade)}</h3>
    <p>${escapeHtml(t.guide)}</p><p class="source">Source: ${escapeHtml(t.source)} — <a href="${escapeHtml(t.sourceUrl)}" target="_blank" rel="noopener">${escapeHtml(t.sourceUrl)}</a></p></div>`).join("");
  return `<div class="page"><h2>Missables — only one to worry about</h2>
    <p class="lede">GTA 6 has no mission replay, so the missable question matters. PowerPyx and GTABase agree: only one trophy is possibly missable. Everything else can be earned in free roam after the story.</p>
    <div class="warnbox"><h3>⚠ The one possibly missable trophy</h3>${cards}</div>
    <div class="savegrid">
      <section class="card"><h3>Save habits that protect you</h3><ul>
        <li>Keep a manual save at the start of every chapter — the game offers 15 save slots.</li>
        <li>Do Lucia's balcony meditation in Chapter 1 before the chapter ends.</li>
        <li>Keep a separate manual save before the final mission.</li>
        <li>Start each stranger mission strand as soon as it unlocks; one source warns the strands have windows tied to story progress.</li>
        <li>Leave cheats off: GTABase and TechWiser report that any cheat disables trophy tracking and saving, and the only fix is a clean save.</li>
      </ul></section>
      <section class="card"><h3>Everything else is safe</h3><ul>
        <li>All 17 story trophies pop by playing the story — none can be missed.</li>
        <li>Every count trophy (250 stunts, 42 range golds, 100 WAiNK, 3 card sets and the rest) can be ground in free roam after the credits.</li>
        <li>The five unconfirmed trophies have no confirmed method yet; they may pop while you play normally.</li>
        <li>No online trophies exist — all 55 are single-player, so nothing depends on servers or other players.</li>
      </ul></section>
    </div></div>`;
}

export function renderSavePage(state) {
  const store = state.store;
  const notes = state.trophies.filter((t) => store.getNote(t.id)).length;
  return `<div class="page"><h2>Save &amp; export</h2>
    <p class="lede">Your progress lives in this browser (localStorage) and nowhere else — this guide sends nothing anywhere. Export a backup file before you clear browser data, and import it back on any device.</p>
    <div class="savegrid">
      <section class="card"><h3>Your progress</h3>
        <p><strong>${store.earnedCount()} of 55</strong> trophies earned · <strong>${notes}</strong> notes written · spoiler setting ${store.isSpoilerOn() ? "on" : "off"}.</p>
        <p><button class="btn primary" id="exportBtn">Export progress (.json)</button>
        <label class="btn" for="importFile" style="display:inline-block;cursor:pointer">Import progress…</label>
        <input type="file" id="importFile" accept=".json,application/json" style="display:none"></p>
        <p><button class="btn danger" id="resetBtn">Reset all progress</button></p>
        <p id="saveMsg" class="source"></p>
      </section>
      <section class="card"><h3>Save habits</h3><ul>
        <li>15 manual save slots: one per chapter start, plus one before the final mission.</li>
        <li>Export after each play session — a backup file survives a cleared browser.</li>
        <li>Cheats disable trophies and saving (GTABase / TechWiser), so keep them off for a trophy run.</li>
        <li>Demo mode: open the guide with <code>?demo=1</code> to preview it with 13 trophies earned.</li>
      </ul></section>
    </div></div>`;
}

export function renderApp(state) {
  if (state.route === "roadmap") return renderRoadmapPage(state);
  if (state.route === "missables") return renderMissablesPage(state);
  if (state.route === "save") return renderSavePage(state);
  return renderChecklistPage(state);
}
