export function applyResumePromotion(menuJson, resumeAvailable) {
  const deep = JSON.parse(JSON.stringify(menuJson));
  const cards = deep?.post_ident?.cards || [];
  const resumeIdx = cards.findIndex(c => (c.id || "").toUpperCase() === "RESUME");
  if (resumeIdx >= 0) {
    const resume = cards[resumeIdx];
    resume.disabled = !resumeAvailable;
    resume.badge = resumeAvailable ? "Available" : "Unavailable";
    resume.order = resumeAvailable ? 0 : 99;
    cards.sort((a,b) => (a.order ?? 50) - (b.order ?? 50));
  }
  return deep;
}