/* Filters: kind, grade, earned state and text search. The spoiler rule lives here too. */
export const KIND_LABELS = {
  story: "Story",
  missable: "Missable",
  collectibles: "Collectibles",
  activities: "Activities",
  completion: "Completion",
  online: "Online",
};

export function isHiddenFromSpoilers(trophy, spoilerOn, isEarned) {
  return Boolean(trophy.hidden) && spoilerOn && !isEarned(trophy.id);
}

export function displayName(trophy, spoilerOn, isEarned) {
  return isHiddenFromSpoilers(trophy, spoilerOn, isEarned) ? "Hidden trophy" : trophy.name;
}

export function displayDescription(trophy, spoilerOn, isEarned) {
  return isHiddenFromSpoilers(trophy, spoilerOn, isEarned)
    ? "Hidden on PlayStation until earned — its name and description are spoilers."
    : trophy.description;
}

export function filterTrophies(trophies, options) {
  const query = (options.query || "").trim().toLowerCase();
  return trophies.filter((t) => {
    if (options.kind === "missable" && !t.missable) return false;
    if (options.kind === "online") return false;
    if (options.kind && options.kind !== "all" && options.kind !== "missable" && t.kind !== options.kind) return false;
    if (options.grade && options.grade !== "all" && t.grade !== options.grade) return false;
    if (options.earned === "earned" && !options.isEarned(t.id)) return false;
    if (options.earned === "todo" && options.isEarned(t.id)) return false;
    if (query) {
      const hay = `${t.name} ${t.description} ${t.guide} ${t.kind}`.toLowerCase();
      if (!hay.includes(query)) return false;
    }
    return true;
  });
}
