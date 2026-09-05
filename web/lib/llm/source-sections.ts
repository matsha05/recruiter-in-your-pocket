const skillsHeadings = new Set([
  "skills", "technical skills", "core skills", "core competencies", "strengths and technologies",
]);

export function hasSkillsSection(source: string): boolean {
  const lines = source.split(/\r?\n/).map(line => line.trim()).filter(Boolean);
  return lines.some((line, index) => {
    const heading = line.toLowerCase().replace(/[^a-z\s]/g, "").replace(/\s+/g, " ").trim();
    if (skillsHeadings.has(heading)) return true;
    if (heading !== "additional information") return false;
    const bullets: string[] = [];
    for (const next of lines.slice(index + 1)) {
      if (!/^[-*•●◦▪▫‣⁃]\s+/.test(next)) break;
      bullets.push(next);
    }
    return /\b(?:skills|proficien(?:cy|t)|experienced in using|familiar with|languages|software|technologies)\b/i.test(bullets.join(" "));
  });
}
