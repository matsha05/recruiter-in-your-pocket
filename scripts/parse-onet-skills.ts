/**
 * Parse O*NET Excel files and extract unique skills for embedding
 * 
 * Run with: npx ts-node scripts/parse-onet-skills.ts
 */

const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '../web/data/onet');
const outputPath = path.join(__dirname, '../web/lib/matching/onet-skill-ontology.json');

interface SkillEntry {
    id: string;
    name: string;
    description: string;
    category: 'skill' | 'technology' | 'ability';
}

function parseExcel(filePath: string): any[] {
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    return XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
}

function main() {
    const skills: Map<string, SkillEntry> = new Map();

    // Parse Skills.xlsx
    console.log('Parsing Skills.xlsx...');
    const skillsData = parseExcel(path.join(dataDir, 'Skills.xlsx'));
    for (const row of skillsData) {
        const name = row['Element Name'] || row['Title'];
        const desc = row['Description'] || '';
        if (name && !skills.has(name.toLowerCase())) {
            skills.set(name.toLowerCase(), {
                id: `skill_${skills.size}`,
                name: name.trim(),
                description: desc.trim(),
                category: 'skill'
            });
        }
    }
    console.log(`  Found ${skills.size} unique skills`);

    // Parse Technology_Skills.xlsx
    console.log('Parsing Technology_Skills.xlsx...');
    const techData = parseExcel(path.join(dataDir, 'Technology_Skills.xlsx'));
    let techCount = 0;
    for (const row of techData) {
        const name = row['Example'] || row['Commodity Title'] || row['Title'];
        if (name && !skills.has(name.toLowerCase())) {
            skills.set(name.toLowerCase(), {
                id: `tech_${techCount++}`,
                name: name.trim(),
                description: row['Commodity Title'] || '',
                category: 'technology'
            });
        }
    }
    console.log(`  Added ${techCount} technology skills (total: ${skills.size})`);

    // Parse Abilities.xlsx
    console.log('Parsing Abilities.xlsx...');
    const abilitiesData = parseExcel(path.join(dataDir, 'Abilities.xlsx'));
    let abilityCount = 0;
    for (const row of abilitiesData) {
        const name = row['Element Name'] || row['Title'];
        const desc = row['Description'] || '';
        if (name && !skills.has(name.toLowerCase())) {
            skills.set(name.toLowerCase(), {
                id: `ability_${abilityCount++}`,
                name: name.trim(),
                description: desc.trim(),
                category: 'ability'
            });
        }
    }
    console.log(`  Added ${abilityCount} abilities (total: ${skills.size})`);

    // Convert to array and save
    const ontology = {
        version: '30.1',
        source: 'O*NET',
        generatedAt: new Date().toISOString(),
        skills: Array.from(skills.values())
    };

    fs.writeFileSync(outputPath, JSON.stringify(ontology, null, 2));
    console.log(`\nSaved ${ontology.skills.length} skills to ${outputPath}`);

    // Log category breakdown
    const byCategory = {
        skill: ontology.skills.filter(s => s.category === 'skill').length,
        technology: ontology.skills.filter(s => s.category === 'technology').length,
        ability: ontology.skills.filter(s => s.category === 'ability').length
    };
    console.log('Category breakdown:', byCategory);
}

main();
