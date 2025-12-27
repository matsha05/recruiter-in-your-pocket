/**
 * LinkedIn PDF Parser
 * 
 * Parses LinkedIn profile PDFs to extract structured data.
 * LinkedIn PDF exports have a predictable structure:
 * - Name (first line)
 * - Headline (second line)
 * - Location
 * - Contact Info section
 * - Summary/About section
 * - Experience section
 * - Education section
 * - Skills section
 * - etc.
 */

import type { LinkedInProfile, LinkedInExperience, LinkedInEducation } from '@/types/linkedin';
// Note: pdf-parse will need to be installed: npm install pdf-parse @types/pdf-parse

export async function parseLinkedInPdf(buffer: Buffer): Promise<LinkedInProfile> {
    // Dynamic import to avoid SSR issues
    const pdfParse = (await import('pdf-parse')).default;

    const data = await pdfParse(buffer);
    const text = data.text;

    // Split into lines and clean up
    const lines = text.split('\n').map(l => l.trim()).filter(Boolean);

    const profile: LinkedInProfile = {
        source: 'pdf',
        name: extractName(lines),
        headline: extractHeadline(lines, text),
        location: extractLocation(lines),
        profileUrl: '',
        about: extractAbout(text),
        experience: extractExperience(text),
        education: extractEducation(text),
        skills: extractSkills(text),
        certifications: extractCertifications(text),
        hasPhoto: null, // Not available in PDF
        hasBanner: null,
        photoUrl: null,
        connectionCount: null,
        followerCount: null,
        fetchedAt: new Date().toISOString(),
        isComplete: true,
    };

    return profile;
}

/**
 * Parse LinkedIn PDF text without needing the buffer
 * (for when text is already extracted)
 */
export function parseLinkedInText(text: string): LinkedInProfile {
    const lines = text.split('\n').map(l => l.trim()).filter(Boolean);

    return {
        source: 'pdf',
        name: extractName(lines),
        headline: extractHeadline(lines, text),
        location: extractLocation(lines),
        profileUrl: '',
        about: extractAbout(text),
        experience: extractExperience(text),
        education: extractEducation(text),
        skills: extractSkills(text),
        certifications: extractCertifications(text),
        hasPhoto: null,
        hasBanner: null,
        photoUrl: null,
        connectionCount: null,
        followerCount: null,
        fetchedAt: new Date().toISOString(),
        isComplete: true,
    };
}

// --- Section Extractors ---

function extractName(lines: string[]): string {
    // LinkedIn PDFs typically start with: Name, Contact Info header, then details
    // The actual name is usually the first substantive line
    for (const line of lines.slice(0, 5)) {
        // Skip common headers
        if (line.toLowerCase().includes('contact') ||
            line.toLowerCase().includes('linkedin') ||
            line.includes('@') ||
            line.match(/^\d/)) {
            continue;
        }
        // Name is typically 2-4 words, capitalized
        if (line.split(' ').length >= 2 && line.split(' ').length <= 5) {
            const words = line.split(' ');
            const looksLikeName = words.every(w =>
                w.length > 0 &&
                w[0] === w[0].toUpperCase() &&
                !w.includes('@')
            );
            if (looksLikeName) {
                return line;
            }
        }
    }
    return lines[0] || 'Unknown';
}

function extractHeadline(lines: string[], fullText: string): string {
    // Headline is typically right after the name
    // LinkedIn PDFs often have: Name, then headline on next line(s)

    // Look for the line after the name that looks like a headline
    const name = extractName(lines);
    const nameIndex = lines.indexOf(name);

    if (nameIndex >= 0 && nameIndex < lines.length - 1) {
        // Next few lines might be headline (can span multiple lines)
        const potentialHeadline: string[] = [];
        for (let i = nameIndex + 1; i < Math.min(nameIndex + 4, lines.length); i++) {
            const line = lines[i];
            // Stop at section headers or contact info
            if (line.toLowerCase().includes('contact') ||
                line.toLowerCase().includes('summary') ||
                line.toLowerCase().includes('experience') ||
                line.includes('@') ||
                line.match(/^\d{3}/) || // Phone number
                line.toLowerCase() === 'top skills') {
                break;
            }
            potentialHeadline.push(line);
        }
        if (potentialHeadline.length > 0) {
            return potentialHeadline.join(' ').trim();
        }
    }

    return '';
}

function extractLocation(lines: string[]): string | null {
    // Location patterns in LinkedIn PDFs
    // Often appears near contact info or after headline
    for (const line of lines.slice(0, 20)) {
        // Common location patterns: "City, State" or "City, Country"
        if (line.match(/^[A-Z][a-z]+,\s*[A-Z]/)) {
            // Exclude emails and other patterns
            if (!line.includes('@') && !line.includes('http')) {
                return line;
            }
        }
    }
    return null;
}

function extractAbout(text: string): string | null {
    // About/Summary section patterns
    const patterns = [
        /Summary\n([\s\S]*?)(?=\nExperience|\nEducation|\nSkills|\nTop Skills|$)/i,
        /About\n([\s\S]*?)(?=\nExperience|\nEducation|\nSkills|\nTop Skills|$)/i,
    ];

    for (const pattern of patterns) {
        const match = text.match(pattern);
        if (match && match[1]) {
            const about = match[1].trim();
            // Filter out if it's too short or looks like a different section
            if (about.length > 50 && !about.toLowerCase().startsWith('page ')) {
                return about;
            }
        }
    }

    return null;
}

function extractExperience(text: string): LinkedInExperience[] {
    const experiences: LinkedInExperience[] = [];

    // Find Experience section
    const expMatch = text.match(/Experience\n([\s\S]*?)(?=\nEducation|\nSkills|\nTop Skills|\nLicenses|\nCertifications|$)/i);
    if (!expMatch) return experiences;

    const expSection = expMatch[1];
    const lines = expSection.split('\n').map(l => l.trim()).filter(Boolean);

    // LinkedIn experience format varies, but typically:
    // Title
    // Company · Employment Type
    // Date range
    // Location (optional)
    // Description

    let currentExp: Partial<LinkedInExperience> = {};
    let i = 0;

    while (i < lines.length) {
        const line = lines[i];

        // Date patterns: "Jan 2020 - Present", "2019 - 2021", etc.
        const datePattern = /^(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|\d{4})\s*[-–]\s*(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|Present|\d{4})/i;
        const durationPattern = /\d+\s*(?:yr|year|mo|month)/i;

        if (datePattern.test(line) || durationPattern.test(line)) {
            if (currentExp.title) {
                currentExp.duration = line;
            }
        } else if (line.includes('·') || line.includes('•')) {
            // Company line often has · separator
            const parts = line.split(/[·•]/);
            if (parts.length >= 1 && currentExp.title) {
                currentExp.company = parts[0].trim();
            } else if (parts.length >= 1 && !currentExp.title) {
                // Sometimes company comes before title
                currentExp.company = parts[0].trim();
            }
        } else if (!currentExp.title && line.length > 3 && line.length < 100) {
            // First substantial line is likely a title
            currentExp.title = line;
        } else if (currentExp.title && currentExp.duration && line.length > 50) {
            // Longer text after date is likely description
            currentExp.description = line;

            // Save this experience and start a new one
            if (currentExp.title && currentExp.company) {
                experiences.push({
                    title: currentExp.title || '',
                    company: currentExp.company || '',
                    duration: currentExp.duration || '',
                    description: currentExp.description || null,
                    isCurrent: (currentExp.duration || '').toLowerCase().includes('present'),
                });
            }
            currentExp = {};
        }

        i++;
    }

    // Don't forget the last one
    if (currentExp.title) {
        experiences.push({
            title: currentExp.title || '',
            company: currentExp.company || '',
            duration: currentExp.duration || '',
            description: currentExp.description || null,
            isCurrent: (currentExp.duration || '').toLowerCase().includes('present'),
        });
    }

    return experiences;
}

function extractEducation(text: string): LinkedInEducation[] {
    const education: LinkedInEducation[] = [];

    // Find Education section
    const eduMatch = text.match(/Education\n([\s\S]*?)(?=\nSkills|\nTop Skills|\nLicenses|\nCertifications|\nHonors|\nLanguages|$)/i);
    if (!eduMatch) return education;

    const eduSection = eduMatch[1];
    const lines = eduSection.split('\n').map(l => l.trim()).filter(Boolean);

    let currentEdu: Partial<LinkedInEducation> = {};

    for (const line of lines) {
        // Date patterns
        const datePattern = /^\d{4}\s*[-–]\s*\d{4}/;

        if (datePattern.test(line)) {
            if (currentEdu.school) {
                currentEdu.dates = line;
            }
        } else if (line.toLowerCase().includes('bachelor') ||
            line.toLowerCase().includes('master') ||
            line.toLowerCase().includes('phd') ||
            line.toLowerCase().includes('mba') ||
            line.toLowerCase().includes('b.s.') ||
            line.toLowerCase().includes('m.s.') ||
            line.toLowerCase().includes('degree')) {
            currentEdu.degree = line;
        } else if (!currentEdu.school && line.length > 3 && !line.match(/^\d/)) {
            // First line is likely school name
            if (currentEdu.school) {
                // Save previous and start new
                education.push({
                    school: currentEdu.school,
                    degree: currentEdu.degree || null,
                    field: currentEdu.field || null,
                    dates: currentEdu.dates || null,
                });
                currentEdu = { school: line };
            } else {
                currentEdu.school = line;
            }
        }
    }

    // Last one
    if (currentEdu.school) {
        education.push({
            school: currentEdu.school,
            degree: currentEdu.degree || null,
            field: currentEdu.field || null,
            dates: currentEdu.dates || null,
        });
    }

    return education;
}

function extractSkills(text: string): string[] {
    const skills: string[] = [];

    // Find Skills section (LinkedIn often uses "Top Skills" or just "Skills")
    const skillsMatch = text.match(/(?:Top Skills|Skills)\n([\s\S]*?)(?=\nLanguages|\nCertifications|\nHonors|\nPublications|$)/i);
    if (!skillsMatch) return skills;

    const skillsSection = skillsMatch[1];
    const lines = skillsSection.split('\n').map(l => l.trim()).filter(Boolean);

    for (const line of lines) {
        // Skills are usually short phrases
        if (line.length > 2 && line.length < 50 && !line.match(/^\d/)) {
            // Some PDFs have skills with endorsement counts, remove those
            const skill = line.replace(/\s*\d+\s*(?:endorsement|endorsements)?/i, '').trim();
            if (skill) {
                skills.push(skill);
            }
        }
    }

    return skills.slice(0, 20); // Limit to top 20
}

function extractCertifications(text: string): string[] {
    const certs: string[] = [];

    const certsMatch = text.match(/(?:Licenses & Certifications|Certifications)\n([\s\S]*?)(?=\nSkills|\nLanguages|\nHonors|\nPublications|$)/i);
    if (!certsMatch) return certs;

    const certsSection = certsMatch[1];
    const lines = certsSection.split('\n').map(l => l.trim()).filter(Boolean);

    for (const line of lines) {
        if (line.length > 5 && line.length < 100 && !line.match(/^\d{4}/)) {
            certs.push(line);
        }
    }

    return certs.slice(0, 10);
}
