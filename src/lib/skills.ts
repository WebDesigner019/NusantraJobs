// Curated skill dictionary for keyword-based extraction (MVP)
// Production: replace with Azure AI Document Intelligence

export const SKILL_DICTIONARY: string[] = [
  // Programming languages
  "JavaScript", "TypeScript", "Python", "Java", "Kotlin", "Swift", "Go", "Rust",
  "PHP", "Ruby", "C++", "C#", "Dart", "Scala", "R",
  // Frontend
  "React", "Vue", "Angular", "Next.js", "Svelte", "Tailwind", "HTML", "CSS",
  "SASS", "Redux", "Zustand", "TanStack",
  // Backend
  "Node.js", "Express", "NestJS", "Django", "Flask", "FastAPI", "Spring", "Laravel",
  "Ruby on Rails", "REST API", "GraphQL", "gRPC", "Microservices",
  // Mobile
  "Android", "iOS", "React Native", "Flutter", "Jetpack Compose", "SwiftUI",
  // Databases
  "PostgreSQL", "MySQL", "MongoDB", "Redis", "SQLite", "Firebase", "Supabase",
  "Elasticsearch", "DynamoDB", "SQL", "NoSQL",
  // Cloud & DevOps
  "AWS", "Azure", "GCP", "Docker", "Kubernetes", "Terraform", "Jenkins",
  "GitHub Actions", "CI/CD", "Linux", "Nginx", "Cloudflare",
  // Data & AI
  "Machine Learning", "Deep Learning", "TensorFlow", "PyTorch", "Pandas", "NumPy",
  "Scikit-learn", "Data Analysis", "Data Science", "Statistics", "Tableau",
  "Power BI", "Looker", "Excel", "Data Engineering", "ETL",
  // Tools
  "Git", "GitHub", "GitLab", "Jira", "Confluence", "Slack", "Notion", "Figma",
  "Adobe XD", "Sketch", "Photoshop", "Illustrator",
  // Design
  "UI Design", "UX Design", "UX Research", "Prototyping", "Wireframing",
  "Design System", "User Testing", "Interaction Design",
  // Testing
  "Selenium", "Cypress", "Jest", "Vitest", "Playwright", "Manual Testing",
  "Test Automation", "QA",
  // Marketing
  "SEO", "SEM", "Google Ads", "Facebook Ads", "Content Marketing",
  "Social Media", "Copywriting", "Email Marketing", "Analytics",
  "Google Analytics", "Marketing Strategy", "Brand Management",
  // Business / soft skills
  "Project Management", "Product Management", "Agile", "Scrum", "Kanban",
  "Roadmap", "Stakeholder Management", "Communication", "Leadership",
  "People Management", "Recruitment", "HR Management",
  // Finance
  "Accounting", "Financial Analysis", "Budgeting", "Forecasting", "Reporting",
  "Audit", "Tax", "Investment Analysis", "Risk Management",
  // Indonesian-market specifics
  "Bahasa Indonesia", "English", "Mandarin",
  // Misc
  "PowerPoint", "Word", "Outlook", "Editorial", "Presentation",
];

const SKILL_LOOKUP = new Map<string, string>(
  SKILL_DICTIONARY.map((s) => [s.toLowerCase(), s])
);

/** Extract skills from raw text via case-insensitive whole-word matching. */
export function extractSkillsFromText(text: string): string[] {
  if (!text) return [];
  const lower = text.toLowerCase();
  const found = new Set<string>();
  for (const [key, canonical] of SKILL_LOOKUP) {
    // Escape regex special chars
    const escaped = key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const re = new RegExp(`(^|[^a-z0-9])${escaped}([^a-z0-9]|$)`, "i");
    if (re.test(lower)) found.add(canonical);
  }
  return Array.from(found).sort();
}

/** Compute match score: percentage of required skills covered by the candidate. */
export function computeMatchScore(
  candidateSkills: string[],
  requiredSkills: string[]
): { score: number; matched: string[]; missing: string[] } {
  if (!requiredSkills.length) return { score: 0, matched: [], missing: [] };
  const candidate = new Set(candidateSkills.map((s) => s.toLowerCase()));
  const matched: string[] = [];
  const missing: string[] = [];
  for (const req of requiredSkills) {
    if (candidate.has(req.toLowerCase())) matched.push(req);
    else missing.push(req);
  }
  const score = Math.round((matched.length / requiredSkills.length) * 100);
  return { score, matched, missing };
}
