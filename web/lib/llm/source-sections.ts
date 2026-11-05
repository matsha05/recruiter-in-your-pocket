function normalizeHeading(value: string) {
  return value.toLowerCase().replace(/[’']/g, "").replace(/[^a-z0-9%$]+/g, " ").replace(/\s+/g, " ").trim();
}

export function hasNamedSection(sourceText: string, names: string[]) {
  return sourceText.split(/\r?\n/).some((line) => {
    const heading = normalizeHeading(line);
    return names.some((name) => heading === name || (heading.startsWith(`${name} `) && heading.split(" ").length <= 5));
  });
}

export function hasWorkExperience(sourceText: string) {
  if (hasNamedSection(sourceText, ["experience", "work experience", "professional experience", "employment history", "work history"])) return true;
  const lines = sourceText.split(/\r?\n/).map(line => line.trim()).filter(Boolean);
  // Resumes often go directly from contact details to dated jobs without a heading.
  // Require both a job title and a date range followed by a responsibility bullet.
  return lines.some((line, index) => {
    const roleHeading = lines.slice(Math.max(0, index - 2), index + 1).join(" ");
    return /\b(?:manager|director|engineer|executive|recruiter|accountant|controller|officer|teacher|representative|analyst|designer|specialist|associate|assistant|intern|lead|leader|coordinator|consultant|nurse|pastor)\b/i.test(roleHeading)
      && /\b(?:19|20)\d{2}\s*(?:[-–—]|to)\s*(?:(?:[A-Za-z]+\.?\s+)?(?:19|20)\d{2}|present|current)\b/i.test(line)
      && /^[-*•●◦▪▫‣⁃]\s+/.test(lines[index + 1] || "");
  });
}

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
