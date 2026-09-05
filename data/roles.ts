// List of available target job roles and their relevant keywords

export interface RoleConfig {
  name: string;
  keywords: string[];
}

export const JOB_ROLES: RoleConfig[] = [
  {
    name: "Frontend Developer",
    keywords: ["HTML", "CSS", "JavaScript", "React", "TypeScript", "Git", "Next.js", "Tailwind CSS"],
  },
  {
    name: "Backend Developer",
    keywords: ["Node.js", "Python", "Java", "SQL", "APIs", "Databases", "Express", "MongoDB"],
  },
  {
    name: "Full Stack Developer",
    keywords: ["React", "Node.js", "JavaScript", "TypeScript", "SQL", "APIs", "Git", "HTML/CSS"],
  },
  {
    name: "Data Analyst",
    keywords: ["Python", "SQL", "Excel", "Power BI", "Statistics", "Data Visualization", "Pandas"],
  },
  {
    name: "UI/UX Designer",
    keywords: ["Figma", "Wireframing", "Prototyping", "User Research", "UI Design", "Design Systems"],
  },
  {
    name: "Digital Marketing Executive",
    keywords: ["SEO", "Content Strategy", "Social Media", "Google Analytics", "Email Marketing", "PPC"],
  },
  {
    name: "Project Manager",
    keywords: ["Agile", "Scrum", "Jira", "Risk Management", "Roadmapping", "Communication"],
  },
  {
    name: "Business Analyst",
    keywords: ["Requirements Gathering", "SQL", "Data Analysis", "Process Modeling", "Documentation"],
  },
];
