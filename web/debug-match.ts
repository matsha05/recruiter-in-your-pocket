import { extractSkillsFromText, quickMatch } from './lib/matching/skill-engine';

const resume = `Matt Shaw
mattrshaw2011@gmail.com / 720-441-8369

Professional Experience
OpenAI, Member of Recruiting Staff
Boulder, CO                                          Apr 2024 to present
Global hiring point-of-contact for Dane Stuckey, Chief Security Officer
Hiring across all levels up to VP within the Security org, across the US, EMEA and APAC.

X-Team, Chief People Officer
Boulder, CO and Global                                May 2023 to Feb 2024
Managed a globally distributed team of 60 employees (in 19 countries) to drive business impact through the lens of HR, Talent Acquisition, Employee Engagement, Performance Management, Compliance and more.
Formulated and executed the People and Culture strategy for a $100M global Talent Marketplace and SaaS company, significantly enhancing alignment and efficiency across executive leadership and key business units.
Spearheaded the transformation of the company's talent acquisition and management processes, achieving a 300% reduction in time to hire within four months through innovative strategies aimed at expanding our presence in emerging markets (Philippines, India, Africa) and sectors (AI, Startups).
Managed the full spectrum of Human Resources functions, from compensation and benefits to performance management, introducing the company's inaugural performance review system and a 'rising stars' program to recognize and develop top talent.
Implemented the company's first-ever DEI strategy and program to foster a more inclusive workplace culture.

Meta (formerly Facebook), Recruiting Manager (AI and ML SWE)
Boulder, CO                                          Mar 2022 to May 2023
Managed a fully-remote team of 19 individuals: 3 Recruiting Leads and 16 Sourcers.
Navigated two performance-related terminations and one promotion in 2022 while building a high-performing team in Meta's highest-priority recruiting org (AI and ML Software Engineering hiring).
Played a pivotal role in Bottom and Middle of Funnel initiatives, contributing to 1,000+ ML Gen hires and providing data-driven insights to C-suite recruiting leadership.
Served as SME for ML Hiring Committee, identifying critical trends and influencing recruiting and business strategies through monthly executive leadership presentations.

Google, Talent Acquisition
Boulder, CO                                          Feb 2018 to Mar 2022
Achieved two promotions within four years, for Senior-level recruiting in the Google Cloud org.
Successfully scaled Solutions Engineering Org in Google Cloud from <5 to 300+ employees, managing teams across multiple regions and recruiting for niche business and technical roles such as Product Managers, Solutions Managers, Value Consultants, and Engineering Directors/VPs from L6 to L9.
Spearheaded the creation of Google's first-ever Cloud Value Advisory, coordinating staffing efforts across multiple teams and regions to target $1B+ enterprise cloud deals.
Managed LATAM Cloud Sales team expansion, increasing the team size from 15 to 48 employees (220% growth) across 7 countries.
Led an AMER-wide Cloud candidate referrals drive, generating 112 Offer Accepts.
Full-cycle recruiting from 2018-2020 across a variety of roles from sales, product, operations and engineering.

Adventures in Missions, Recruiting Director
Atlanta, GA                                          May 2014 to Jun 2017
Managed a team of 10 (2 Managers and 8 ICs), overseeing recruiting, hiring, and onboarding for a 200-person organization, filling positions such as CFO, COO, Software Developers, and Accountants.
Implemented strategic talent identification and alignment processes.

Robert Half International, Staffing Executive
Denver, CO                                           Jan 2012 to Apr 2014
Achieved Top-3 global ranking as a first-year producer, resulting in promotion within one year.
Managed a staff of 32 consultants and overseeing client relationships, with annual sales exceeding $2M.
Provided consulting services in resume coaching, market trends.

Education and Certifications
Oklahoma State University, B.S. Business Administration
SHRM Certified Professional (SHRM-CP)
`;

const jd = `5 years of experience in sourcing or equivalent experience working in Sales, Customer Service, Account Management, Business Development or Operations, Lead Generation or a related field.
3 years of sourcing experience at a recruitment agency or in-house recruiting team.
Experience in executive recruiting (outreach, engagement, evaluation, and presentation).
Experience maximizing teams as well as individual performance while being a collaborative team player.
Ability to deliver executive services, especially board placement.
Ability to have an open learning mindset and to quickly grasp new complex subject matter and to understand new markets, areas, roles, business initiatives.
Excellent capability, credibility, and consultative skills to influence executive colleagues and stakeholders without authority.
Develop and own search strategies and deliver research against those strategies for executive searches across various technical functions (e.g., engineering, product management, etc.).
Provide effective project management, drive searches forward and create consistent unbiased experiences for hiring managers/clients, applicants and colleagues.
Partner with leadership recruiters and collaborate to provide domain and market insights and trends, and to advise executives on talent for their most exigent business needs.
Build relationships for the future with passive candidates and talent.
Contribute to continuous improvement and innovation in the efficiency and effectiveness of our systems, services, and processes.`;

console.log('=== RESUME SKILLS EXTRACTED ===');
const resumeSkills = extractSkillsFromText(resume);
console.log('Total found:', resumeSkills.size);
const resumeSkillsArray = Array.from(resumeSkills.entries()).map(([skill, info]) => ({ skill, ...info }));
console.log(JSON.stringify(resumeSkillsArray.slice(0, 20), null, 2));

console.log('\n=== JD SKILLS EXTRACTED ===');
const jdSkills = extractSkillsFromText(jd);
console.log('Total found:', jdSkills.size);
const jdSkillsArray = Array.from(jdSkills.entries()).map(([skill, info]) => ({ skill, ...info }));
console.log(JSON.stringify(jdSkillsArray, null, 2));

console.log('\n=== QUICK MATCH RESULT ===');
const result = quickMatch(resume, jd);
console.log('Score:', result.score);
console.log('Required Coverage:', result.requiredCoverage);
console.log('Preferred Coverage:', result.preferredCoverage);
console.log('Keyword Score:', result.keywordScore);
console.log('\nMatched Skills:', result.matchedSkills);
console.log('\nMissing Skills:', result.missingSkills);
console.log('\nTop Gaps:', result.topGaps);
console.log('\n=== MATCH DETAILS ===');
for (const detail of result.matchDetails) {
    const status = detail.credit >= 0.5 ? '✓' : '✗';
    const matchInfo = detail.matchedBy ? `(matched by "${detail.matchedBy}" via ${detail.matchType})` : '';
    console.log(`  ${status} ${detail.skill} [${detail.tier}]: ${Math.round(detail.credit * 100)}% ${matchInfo}`);
}
