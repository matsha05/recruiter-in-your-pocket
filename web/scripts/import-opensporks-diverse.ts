#!/usr/bin/env npx tsx
/**
 * Import diverse categories from OpenSporks
 */

import * as fs from "fs/promises";
import * as path from "path";

const CATEGORIES = [
    { name: "HR", offset: 0 },
    { name: "DESIGNER", offset: 200 },
    { name: "ADVOCATE", offset: 500 },
    { name: "HEALTHCARE", offset: 700 },
    { name: "SALES", offset: 1000 },
    { name: "FINANCE", offset: 1500 },
    { name: "CONSTRUCTION", offset: 2000 }
];

async function main() {
    const count = parseInt(process.argv[2] || "5");
    const outputDir = path.resolve(process.cwd(), "../tests/resumes/opensporks_diverse");

    console.log(`\n📥 Importing ${count} resumes from each of ${CATEGORIES.length} categories...`);
    await fs.mkdir(outputDir, { recursive: true });

    const manifest: Array<{ id: string; path: string; category: string }> = [];

    for (const cat of CATEGORIES) {
        console.log(`\n📂 ${cat.name} (offset ${cat.offset})...`);

        const res = await fetch(`https://datasets-server.huggingface.co/rows?dataset=opensporks/resumes&config=default&split=train&offset=${cat.offset}&length=${count}`);
        if (!res.ok) {
            console.log(`   ⚠️ Failed: ${res.status}`);
            continue;
        }

        const data = await res.json();
        const rows = data.rows || [];

        for (let i = 0; i < rows.length; i++) {
            const row = rows[i].row;
            const id = `opensporks_${cat.name.toLowerCase()}_${i}`;
            const filepath = path.join(outputDir, `${id}.txt`);

            const text = (row.Resume_str || "")
                .replace(/\\n/g, "\n")
                .replace(/\\t/g, "  ")
                .trim();

            if (text.length < 100) continue;

            await fs.writeFile(filepath, text, "utf-8");
            manifest.push({ id, path: `opensporks_diverse/${id}.txt`, category: cat.name });
        }
        console.log(`   ✓ Imported ${rows.length}`);
    }

    await fs.writeFile(path.join(outputDir, "_manifest.json"), JSON.stringify(manifest, null, 2));

    console.log(`\n✅ Total: ${manifest.length} resumes across ${CATEGORIES.length} categories`);
    console.log(`📄 Manifest: ${outputDir}/_manifest.json\n`);
}

main();
