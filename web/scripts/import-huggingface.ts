#!/usr/bin/env npx tsx
/**
 * Import resumes from HuggingFace dataset
 * 
 * Downloads and converts the datasetmaster/resumes dataset to plain text format
 * for use in the eval harness.
 * 
 * Usage:
 *   npm run eval:import-hf -- --count 50
 */

import { config } from "dotenv";
config({ path: ".env.local" });

import * as fs from "fs/promises";
import * as path from "path";

const DATASET_URL = "https://huggingface.co/datasets/datasetmaster/resumes/resolve/main/master_resumes.jsonl";

// Type matches actual JSONL structure from HuggingFace
interface HFResumeRow {
    personal_info?: {
        name?: string;
        email?: string;
        phone?: string;
        location?: { city?: string; country?: string } | string;
        summary?: string;
        linkedin?: string;
        github?: string;
    };
    experience?: Array<{
        company?: string;
        title?: string;
        dates?: { start?: string; end?: string; duration?: string };
        responsibilities?: string[];
        technical_environment?: { technologies?: string[]; tools?: string[] };
    }>;
    education?: Array<{
        degree?: { level?: string; field?: string };
        institution?: { name?: string; location?: string };
        dates?: { start?: string; expected_graduation?: string };
    }>;
    skills?: {
        technical?: {
            programming_languages?: Array<{ name?: string; level?: string }>;
            frameworks?: Array<{ name?: string; level?: string }>;
            databases?: Array<{ name?: string; level?: string }>;
        };
    };
    projects?: Array<{
        name?: string;
        description?: string;
        technologies?: string[];
    }>;
    achievements?: string[];
}

function convertToPlainText(data: HFResumeRow): string {
    const lines: string[] = [];

    // Personal info
    if (data.personal_info) {
        const pi = data.personal_info;
        if (pi.name) lines.push(pi.name);

        const loc = typeof pi.location === 'string'
            ? pi.location
            : pi.location ? `${pi.location.city || ''}, ${pi.location.country || ''}` : '';
        const contact = [pi.email, pi.phone, loc].filter(Boolean).join(" | ");
        if (contact) lines.push(contact);
        if (pi.linkedin) lines.push(pi.linkedin);
        lines.push("");
        if (pi.summary) {
            lines.push("Professional Summary");
            lines.push(pi.summary);
            lines.push("");
        }
    }

    // Experience
    if (data.experience && data.experience.length > 0) {
        lines.push("Experience");
        lines.push("");
        for (const exp of data.experience) {
            const titleLine = [exp.title, exp.company].filter(Boolean).join(" | ");
            if (titleLine) lines.push(titleLine);
            if (exp.dates) {
                const dateLine = exp.dates.duration || [exp.dates.start, exp.dates.end].filter(Boolean).join(" - ");
                if (dateLine) lines.push(dateLine);
            }
            if (exp.responsibilities) {
                for (const resp of exp.responsibilities) {
                    lines.push(`• ${resp}`);
                }
            }
            if (exp.technical_environment?.technologies) {
                lines.push(`Technologies: ${exp.technical_environment.technologies.join(", ")}`);
            }
            lines.push("");
        }
    }

    // Education
    if (data.education && data.education.length > 0) {
        lines.push("Education");
        lines.push("");
        for (const edu of data.education) {
            const degree = edu.degree ? `${edu.degree.level || ''} ${edu.degree.field || ''}`.trim() : '';
            const inst = edu.institution?.name || '';
            const degreeLine = [degree, inst].filter(Boolean).join(", ");
            if (degreeLine) lines.push(degreeLine);
            if (edu.dates?.expected_graduation) lines.push(edu.dates.expected_graduation);
            lines.push("");
        }
    }

    // Skills
    if (data.skills?.technical) {
        lines.push("Skills");
        const allSkills: string[] = [];
        if (data.skills.technical.programming_languages) {
            allSkills.push(...data.skills.technical.programming_languages.map(s => s.name || '').filter(Boolean));
        }
        if (data.skills.technical.frameworks) {
            allSkills.push(...data.skills.technical.frameworks.map(s => s.name || '').filter(Boolean));
        }
        if (data.skills.technical.databases) {
            allSkills.push(...data.skills.technical.databases.map(s => s.name || '').filter(Boolean));
        }
        if (allSkills.length > 0) {
            lines.push(allSkills.join(", "));
        }
        lines.push("");
    }

    // Projects
    if (data.projects && data.projects.length > 0) {
        lines.push("Projects");
        lines.push("");
        for (const proj of data.projects) {
            if (proj.name) lines.push(proj.name);
            if (proj.description) lines.push(proj.description);
            if (proj.technologies) lines.push(`Technologies: ${proj.technologies.join(", ")}`);
            lines.push("");
        }
    }

    // Achievements
    if (data.achievements && data.achievements.length > 0) {
        lines.push("Achievements");
        for (const ach of data.achievements) {
            lines.push(`• ${ach}`);
        }
        lines.push("");
    }

    return lines.join("\n").trim();
}

async function main() {
    const args = process.argv.slice(2);
    let count = 50;

    for (let i = 0; i < args.length; i++) {
        if (args[i] === "--count" && args[i + 1]) {
            count = parseInt(args[i + 1], 10);
            i++;
        } else if (args[i] === "--help" || args[i] === "-h") {
            console.log(`
HuggingFace Resume Importer

Downloads resumes from the datasetmaster/resumes dataset.

Usage:
  npm run eval:import-hf -- [options]

Options:
  --count N    Number of resumes to import (default: 50)
  --help       Show this help message
      `);
            process.exit(0);
        }
    }

    const outputDir = path.resolve(process.cwd(), "../tests/resumes/huggingface");

    console.log(`\n📥 Importing ${count} resumes from HuggingFace...`);
    console.log(`   Output: ${outputDir}\n`);

    await fs.mkdir(outputDir, { recursive: true });

    try {
        console.log("📥 Downloading dataset...");
        const res = await fetch(DATASET_URL);
        if (!res.ok) {
            throw new Error(`HuggingFace download error: ${res.status}`);
        }

        const text = await res.text();
        const lines = text.trim().split("\n");

        console.log(`📝 Found ${lines.length} resumes in dataset, importing ${Math.min(count, lines.length)}...`);

        const manifest: Array<{
            id: string;
            path: string;
            source: string;
        }> = [];

        for (let i = 0; i < Math.min(count, lines.length); i++) {
            const line = lines[i];
            if (!line.trim()) continue;

            try {
                const data = JSON.parse(line) as HFResumeRow;
                const id = `hf_resume_${i}`;
                const filename = `${id}.txt`;
                const filepath = path.join(outputDir, filename);

                const plainText = convertToPlainText(data);

                if (plainText.length < 100) {
                    console.log(`   ⚠️ Skipped ${id} (too short)`);
                    continue;
                }

                await fs.writeFile(filepath, plainText, "utf-8");

                manifest.push({
                    id,
                    path: `huggingface/${filename}`,
                    source: "datasetmaster/resumes",
                });

                if ((i + 1) % 10 === 0 || i === Math.min(count, lines.length) - 1) {
                    console.log(`   ✓ Imported ${manifest.length}/${Math.min(count, lines.length)}`);
                }
            } catch (parseErr) {
                console.log(`   ⚠️ Skipped line ${i} (parse error)`);
            }
        }

        // Write manifest
        const manifestPath = path.join(outputDir, "_manifest.json");
        await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2), "utf-8");

        console.log(`\n✅ Imported ${manifest.length} resumes`);
        console.log(`📄 Manifest: ${manifestPath}\n`);

    } catch (err: any) {
        console.error("❌ Import failed:", err.message);
        process.exit(1);
    }
}

main();

