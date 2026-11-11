import assert from "node:assert/strict";
import { fileReadFindings, fileReadSummary } from "../lib/reports/file-read";

const byId = (text: string) => Object.fromEntries(fileReadFindings(text).map((finding) => [finding.id, finding]));

const CLEAN = `Alex Rivera
alex.rivera@example.com | (512) 555-0142 | Austin, TX

Professional Experience
Northwind Pay, Senior Backend Engineer
March 2021 - Present
Built the payouts ledger.

Kestrel Labs, Software Engineer
06/2018 – 02/2021
Built the reconciliation job.

Education
University of Texas, B.S. Computer Science, 2014 - 2018

Technical Skills
Go, PostgreSQL, Kafka`;

// A resume that came through whole: every finding is "found", and the summary says so.
{
  const found = byId(CLEAN);
  for (const id of ["email", "phone", "experience", "education", "skills", "dates"]) assert.equal(found[id].state, "found", id);
  assert.equal(found.dates.label, "3 dated jobs or courses");
  assert.equal(found.garbled, undefined);
  assert.deepEqual(fileReadSummary(fileReadFindings(CLEAN)), { tone: "ok", text: "Everything we looked for came through." });
}

// What isn't in the text is reported as missing, never guessed at.
{
  const bare = byId("Alex Rivera\nBackend engineer who builds payment systems.\nNorthwind Pay\nBuilt the payouts ledger.");
  for (const id of ["email", "phone", "experience", "education", "skills", "dates"]) assert.equal(bare[id].state, "missing", id);
  assert.equal(fileReadSummary(fileReadFindings("Alex Rivera\nBackend engineer who builds payment systems.")).text, "6 things we looked for aren't in the text. Check the list below.");
  const summary = fileReadSummary(fileReadFindings("Alex Rivera\nalex@example.com\n512-555-0142\nExperience\nNorthwind, 2021 - Present\nEducation\nUT, 2014 - 2018"));
  assert.equal(summary.tone, "look");
  assert.equal(summary.text, "We didn't find a Skills heading. Check the text below.");
}

// A year alone, a zip code and a salary are not a phone number or a date range.
{
  const found = byId("Alex Rivera\nAustin, TX 78701\nGraduated 2018. Managed a $1,250,000 budget.");
  assert.equal(found.phone.state, "missing");
  assert.equal(found.dates.state, "missing");
}

// A heading has to be a line of its own: the word in a sentence is not a section.
{
  const found = byId("I have ten years of experience in education and strong skills in sales.");
  assert.equal(found.experience.state, "missing");
  assert.equal(found.education.state, "missing");
  assert.equal(found.skills.state, "missing");
}

// Garbled text is a problem, shown with the excerpt, and leads the summary.
{
  const replaced = byId(`${CLEAN}\nLed the caf� launch.`);
  assert.equal(replaced.garbled.state, "problem");
  assert.match(replaced.garbled.excerpt ?? "", /caf� launch/u);

  const unmapped = byId(`${CLEAN}\n(cid:127) Built the ledger`);
  assert.equal(unmapped.garbled.label, "Some characters didn't come through");

  const spaced = byId(CLEAN.replace("Professional Experience", "E X P E R I E N C E"));
  assert.equal(spaced.garbled.label, "A word came out one letter at a time");
  assert.equal(spaced.garbled.excerpt, "E X P E R I E N C E");
  assert.equal(spaced.experience.state, "missing", "a spaced-out heading isn't found, which is the point");
  assert.equal(fileReadSummary(fileReadFindings(CLEAN.replace("Professional Experience", "E X P E R I E N C E"))).text, "A word came out one letter at a time. Check the text below.");
}

// Initials and single-letter grades are not a spaced-out word.
{
  assert.equal(byId(`${CLEAN}\nJ. R. R. Tolkien Society, treasurer\nGPA: A B A A`).garbled, undefined);
}

// Same text, same findings.
assert.deepEqual(fileReadFindings(CLEAN), fileReadFindings(CLEAN));

console.log("file read tests passed");
