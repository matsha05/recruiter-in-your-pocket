#!/usr/bin/env npx tsx
/**
 * OpenSporks Resume Importer
 * 
 * Downloads US-based resumes from opensporks/resumes dataset.
 * 2,400+ resumes across 24 job categories from livecareer.com.
 * 
 * Usage:
 *   npm run eval:import-opensporks -- --count 50
 */

import { config } from "dotenv";
config({ path: ".env.local" });

import * as fs from "fs/promises";
import * as path from "path";

// HuggingFace datasets API endpoint for parquet files
const DATASET_URL = "https://huggingface.co/datasets/opensporks/resumes/resolve/main/train.parquet";
const FALLBACK_URL = "https://huggingface.co/api/datasets/opensporks/resumes/rows/train";

interface ResumeRow {
    ID: string;
    Resume_str: string;
    Resume_html?: string;
    Category: string;
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
 OpenSporks Resume Importer

 Downloads US-based resumes from opensporks/resumes dataset.
 2,400+ resumes across 24 job categories from livecareer.com.

 Categories: HR, Designer, IT, Teacher, Healthcare, Sales, Finance, 
 Engineering, Accountant, Banking, Consultant, Digital-Media, etc.

 Usage:
   npm run eval:import-opensporks -- [options]

 Options:
   --count N    Number of resumes to import (default: 50)
   --help       Show this help message
      `);
            process.exit(0);
        }
    }

    const outputDir = path.resolve(process.cwd(), "../tests/resumes/opensporks");

    console.log(`\n📥 Importing ${count} resumes from opensporks/resumes...`);
    console.log(`   Output: ${outputDir}\n`);

    await fs.mkdir(outputDir, { recursive: true });

    try {
        // Use the HuggingFace datasets server API
        console.log("📥 Fetching via HuggingFace Datasets Server...");
        const res = await fetch(`https://datasets-server.huggingface.co/rows?dataset=opensporks/resumes&config=default&split=train&offset=0&length=${count}`, {
            headers: {
                "Accept": "application/json"
            }
        });

        if (!res.ok) {
            throw new Error(`HuggingFace API error: ${res.status}`);
        }

        const data = await res.json();
        const rows = data.rows || [];

        if (rows.length === 0) {
            throw new Error("No rows returned from API");
        }

        console.log(`📝 Found ${rows.length} resumes, processing...\n`);

        const manifest: Array<{
            id: string;
            path: string;
            category: string;
            source: string;
        }> = [];

        for (let i = 0; i < rows.length; i++) {
            const row = rows[i].row as ResumeRow;
            const id = `opensporks_${row.ID || i}`;
            const filename = `${id}.txt`;
            const filepath = path.join(outputDir, filename);

            // Clean up the resume text
            let resumeText = row.Resume_str || "";

            // Skip if too short
            if (resumeText.length < 100) {
                console.log(`   ⚠️ Skipped ${id} (too short)`);
                continue;
            }

            // Clean up common issues
            resumeText = resumeText
                .replace(/\\n/g, "\n")
                .replace(/\\t/g, "  ")
                .replace(/\s+/g, " ")
                .trim();

            await fs.writeFile(filepath, resumeText, "utf-8");

            manifest.push({
                id,
                path: `opensporks/${filename}`,
                category: row.Category || "unknown",
                source: "opensporks/resumes"
            });

            if ((i + 1) % 10 === 0 || i === rows.length - 1) {
                console.log(`   ✓ Imported ${manifest.length}/${rows.length}`);
            }
        }

        // Write manifest
        const manifestPath = path.join(outputDir, "_manifest.json");
        await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2), "utf-8");

        // Category distribution
        const categories: Record<string, number> = {};
        for (const item of manifest) {
            categories[item.category] = (categories[item.category] || 0) + 1;
        }

        console.log(`\n✅ Imported ${manifest.length} resumes`);
        console.log(`📄 Manifest: ${manifestPath}`);
        console.log(`\n📊 Category Distribution:`);
        for (const [cat, count] of Object.entries(categories).sort((a, b) => b[1] - a[1]).slice(0, 10)) {
            console.log(`   ${cat}: ${count}`);
        }
        console.log();

    } catch (err: any) {
        console.error("❌ Import failed:", err.message);
        process.exit(1);
    }
}

main();
