/* Load the official trophy list with our guides. The app fetches only its own file. */
export async function loadTrophies() {
  const response = await fetch("data/trophies.json");
  if (!response.ok) throw new Error("could not load data/trophies.json");
  const data = await response.json();
  return Array.isArray(data) ? data : data.trophies;
}

export const GRADE_ORDER = { platinum: 0, gold: 1, silver: 2, bronze: 3 };

export function sortForRoadmap(trophies) {
  return [...trophies].sort((a, b) => (a.stage - b.stage) || (GRADE_ORDER[a.grade] - GRADE_ORDER[b.grade]) || (a.id - b.id));
}

export function nextUpTrophies(trophies, isEarned, count) {
  return sortForRoadmap(trophies).filter((t) => !isEarned(t.id)).slice(0, count);
}

export function stageTotals(trophies, isEarned) {
  const stages = {};
  for (const t of trophies) {
    stages[t.stage] = stages[t.stage] || { total: 0, earned: 0 };
    stages[t.stage].total += 1;
    if (isEarned(t.id)) stages[t.stage].earned += 1;
  }
  return stages;
}
