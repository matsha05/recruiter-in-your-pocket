/**
 * Research Data Loader
 * 
 * Provides typed access to research study data files.
 */

import type { StudyData } from "../types/research";

// Import JSON data files
import howRecruitersRead from "./research/how-recruiters-read.json";
import howPeopleScan from "./research/how-people-scan.json";
import atsMythsData from "./research/ats-myths.json";
import linkedinVisibility from "./research/linkedin-visibility.json";

// Type the imported JSON as StudyData
export const studies: Record<string, StudyData> = {
    "how-recruiters-read": howRecruitersRead as unknown as StudyData,
    "how-people-scan": howPeopleScan as unknown as StudyData,
    "ats-myths": atsMythsData as unknown as StudyData,
    "linkedin-visibility": linkedinVisibility as unknown as StudyData,
};

/**
 * Get study data by slug
 */
export function getStudyBySlug(slug: string): StudyData | undefined {
    return studies[slug];
}

/**
 * Get all study slugs
 */
export function getAllStudySlugs(): string[] {
    return Object.keys(studies);
}

/**
 * Get all studies as array
 */
export function getAllStudies(): StudyData[] {
    return Object.values(studies);
}
