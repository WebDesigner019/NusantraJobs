// Static course recommendations mapped by skill name.
// MVP: keyword → curated link. Production: dynamic API or partner integration.

export interface CourseRecommendation {
  title: string;
  provider: string;
  url: string;
}

const COURSE_MAP: Record<string, CourseRecommendation[]> = {
  React: [
    { title: "React - The Complete Guide", provider: "Coursera", url: "https://www.coursera.org/learn/react-basics" },
    { title: "Belajar Membuat Aplikasi Web dengan React", provider: "Dicoding", url: "https://www.dicoding.com/academies/103" },
  ],
  TypeScript: [
    { title: "TypeScript Fundamentals", provider: "freeCodeCamp", url: "https://www.freecodecamp.org/news/learn-typescript/" },
  ],
  Python: [
    { title: "Python for Everybody", provider: "Coursera", url: "https://www.coursera.org/specializations/python" },
    { title: "Belajar Dasar Pemrograman Python", provider: "Dicoding", url: "https://www.dicoding.com/academies/86" },
  ],
  "Node.js": [
    { title: "Node.js Tutorial", provider: "freeCodeCamp", url: "https://www.freecodecamp.org/news/learn-node-js-full-course/" },
  ],
  Go: [
    { title: "Learn Go Programming", provider: "freeCodeCamp", url: "https://www.freecodecamp.org/news/learn-go-programming-language/" },
  ],
  Kotlin: [
    { title: "Belajar Membuat Aplikasi Android", provider: "Dicoding", url: "https://www.dicoding.com/academies/14" },
  ],
  SQL: [
    { title: "SQL for Data Science", provider: "Coursera", url: "https://www.coursera.org/learn/sql-for-data-science" },
  ],
  PostgreSQL: [
    { title: "PostgreSQL Full Course", provider: "freeCodeCamp", url: "https://www.freecodecamp.org/news/learn-postgresql-tutorial/" },
  ],
  Docker: [
    { title: "Docker Tutorial for Beginners", provider: "freeCodeCamp", url: "https://www.freecodecamp.org/news/the-docker-handbook/" },
  ],
  Kubernetes: [
    { title: "Kubernetes for Beginners", provider: "Coursera", url: "https://www.coursera.org/learn/google-kubernetes-engine" },
  ],
  AWS: [
    { title: "AWS Cloud Practitioner Essentials", provider: "Coursera", url: "https://www.coursera.org/learn/aws-cloud-practitioner-essentials" },
  ],
  Figma: [
    { title: "Figma UI/UX Design Essentials", provider: "Coursera", url: "https://www.coursera.org/projects/figma-ui-ux" },
    { title: "Belajar Dasar UX Design", provider: "Dicoding", url: "https://www.dicoding.com/academies/199" },
  ],
  "UI Design": [
    { title: "UI / UX Design Specialization", provider: "Coursera", url: "https://www.coursera.org/specializations/ui-ux-design" },
  ],
  "UX Research": [
    { title: "Foundations of User Experience Design", provider: "Coursera", url: "https://www.coursera.org/learn/foundations-user-experience-design" },
  ],
  SEO: [
    { title: "SEO Specialization", provider: "Coursera", url: "https://www.coursera.org/specializations/seo" },
  ],
  "Google Ads": [
    { title: "Google Ads Certification", provider: "Google Skillshop", url: "https://skillshop.exceedlms.com/student/catalog/list?category_ids=2844" },
  ],
  "Machine Learning": [
    { title: "Machine Learning Specialization", provider: "Coursera", url: "https://www.coursera.org/specializations/machine-learning-introduction" },
    { title: "Belajar Machine Learning untuk Pemula", provider: "Dicoding", url: "https://www.dicoding.com/academies/184" },
  ],
  TensorFlow: [
    { title: "TensorFlow Developer Certificate", provider: "Coursera", url: "https://www.coursera.org/professional-certificates/tensorflow-in-practice" },
  ],
  "Data Analysis": [
    { title: "Google Data Analytics Certificate", provider: "Coursera", url: "https://www.coursera.org/professional-certificates/google-data-analytics" },
  ],
  Excel: [
    { title: "Excel Skills for Business", provider: "Coursera", url: "https://www.coursera.org/specializations/excel" },
  ],
  Tableau: [
    { title: "Data Visualization with Tableau", provider: "Coursera", url: "https://www.coursera.org/specializations/data-visualization" },
  ],
  "Product Management": [
    { title: "Digital Product Management", provider: "Coursera", url: "https://www.coursera.org/specializations/uva-darden-digital-product-management" },
  ],
  Agile: [
    { title: "Agile Project Management", provider: "Coursera", url: "https://www.coursera.org/learn/agile-project-management" },
  ],
  Git: [
    { title: "Git Tutorial", provider: "freeCodeCamp", url: "https://www.freecodecamp.org/news/learn-the-basics-of-git-in-under-10-minutes-da548267cc91/" },
  ],
};

/** Return up to `limit` recommended courses for the given missing skills. */
export function getRecommendedCourses(missingSkills: string[], limit = 6): CourseRecommendation[] {
  const seen = new Set<string>();
  const out: CourseRecommendation[] = [];
  for (const skill of missingSkills) {
    const courses = COURSE_MAP[skill];
    if (!courses) continue;
    for (const c of courses) {
      if (seen.has(c.url)) continue;
      seen.add(c.url);
      out.push(c);
      if (out.length >= limit) return out;
    }
  }
  return out;
}
