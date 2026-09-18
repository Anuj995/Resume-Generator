import { ResumeData } from "@/types/resume";

/**
 * 5 Rich, Distinct Showcase Profiles tailored specifically for each ATS template:
 * - classic: Senior Financial Analyst (Corporate Finance, Banking, M&A)
 * - modern: Senior Software Engineer (Microservices, Cloud, Distributed Systems)
 * - professional: Director of Operations & Strategy (Executive Leadership, P&L, Governance)
 * - compact: Principal Cloud & DevOps Architect (Infrastructure, Kubernetes, Terraform)
 * - clean: Lead Product & UX Strategist (Product Design, User Research, Design Systems)
 */
export const TEMPLATE_SHOWCASE_PROFILES: Record<string, ResumeData> = {
  classic: {
    personalInfo: {
      fullName: "David Sterling",
      email: "david.sterling@email.com",
      phone: "+1 (212) 555-0192",
      location: "New York, NY",
      linkedin: "linkedin.com/in/davidsterling",
    },
    targetRole: "Senior Financial Analyst",
    rawText: "",
    summary:
      "Analytical Senior Financial Analyst with 6+ years of expertise in financial modeling, valuation, variance analysis, and long-range corporate planning. Proven track record leading $45M portfolio forecasting and automating month-end reporting cycles to save 3 business days per close.",
    education: [
      {
        id: "edu-c1",
        degree: "B.S. in Finance & Economics (Magna Cum Laude)",
        institution: "NYU Stern School of Business",
        year: "2014 - 2018",
        cgpa: "3.88 / 4.0",
      },
    ],
    experience: [
      {
        id: "exp-c1",
        title: "Senior Financial Analyst",
        company: "Sterling Capital Advisory",
        duration: "2021 - Present",
        description:
          "Constructed comprehensive 3-statement financial models and DCF valuations for 14 cross-border M&A transactions valued at $120M+.\nPartnered with executive leadership to forecast quarterly variance, uncovering $3.2M in annual recurring operational efficiencies.\nAutomated Bloomberg and FactSet data pipelines into internal SQL warehouses, reducing monthly reporting overhead by 40%.",
      },
      {
        id: "exp-c2",
        title: "Financial Analyst",
        company: "Beacon Global Partners",
        duration: "2018 - 2021",
        description:
          "Prepared detailed cash-flow sensitivity analyses and liquidity forecasts for Fortune 500 corporate clients across retail and manufacturing.\nDeveloped executive presentation decks for quarterly board reviews and investor roadshows with 100% audit compliance.",
      },
    ],
    projects: [
      {
        id: "proj-c1",
        title: "Automated Capital Allocation Model",
        description:
          "Engineered a dynamic portfolio risk simulator in Python and Excel VBA to model interest rate shock scenarios across fixed-income assets.",
        technologies: "Python, Excel VBA, Bloomberg API, Monte Carlo",
      },
    ],
    skills: [
      "Financial Modeling",
      "DCF & LBO Valuation",
      "Corporate Budgeting",
      "Variance Analysis",
      "Advanced Excel (VBA/Macros)",
      "Bloomberg Terminal",
      "FactSet",
      "SQL",
      "Power BI",
      "Capital Markets",
      "M&A Due Diligence",
    ],
    certifications: [
      {
        id: "cert-c1",
        name: "Chartered Financial Analyst (CFA) Level II Candidate",
        issuer: "CFA Institute",
        year: "2022",
      },
      {
        id: "cert-c2",
        name: "Financial Modeling & Valuation Analyst (FMVA)",
        issuer: "Corporate Finance Institute",
        year: "2019",
      },
    ],
    achievements: [
      {
        id: "ach-c1",
        description: "Recognized as Analyst of the Year 2022 across the Northeast corporate advisory division.",
      },
      {
        id: "ach-c2",
        description: "Authored corporate investment thesis on clean tech infrastructure published in national finance journal.",
      },
    ],
  },

  modern: {
    personalInfo: {
      fullName: "Alex Morgan",
      email: "alex.morgan@email.com",
      phone: "+1 (555) 019-2834",
      location: "San Francisco, CA",
      linkedin: "linkedin.com/in/alexmorgan",
      github: "github.com/alexmorgan",
    },
    targetRole: "Senior Software Engineer",
    rawText: "",
    summary:
      "Results-driven Senior Software Engineer with 5+ years of experience architecting scalable distributed systems, high-throughput REST APIs, and modern cloud microservices. Track record of reducing p95 API response latency by 38% and leading engineering teams through successful AWS migrations.",
    education: [
      {
        id: "edu-m1",
        degree: "B.S. in Computer Science",
        institution: "University of California, Berkeley",
        year: "2016 - 2020",
        cgpa: "3.85 / 4.0",
      },
    ],
    experience: [
      {
        id: "exp-m1",
        title: "Senior Software Engineer",
        company: "Apex Cloud Solutions",
        duration: "2022 - Present",
        description:
          "Architected high-throughput RESTful microservices handling 15M+ daily requests with 99.99% service availability.\nOptimized PostgreSQL and Redis query performance, slashing database response latency by 42% across core endpoints.\nMentored 6 junior software engineers on clean architecture patterns, automated testing, and CI/CD best practices.",
      },
      {
        id: "exp-m2",
        title: "Full Stack Developer",
        company: "TechPulse Labs",
        duration: "2020 - 2022",
        description:
          "Built responsive client portals using TypeScript, Next.js, and Tailwind CSS, increasing user session engagement by 28%.\nEngineered asynchronous job processing queues with BullMQ and Docker to automate document batching operations.",
      },
    ],
    projects: [
      {
        id: "proj-m1",
        title: "Distributed Task Worker Engine",
        description:
          "Engineered an open-source distributed task orchestrator in Go & Redis with automated exponential backoff retries and telemetry instrumentation.",
        technologies: "Go, Redis, Docker, Prometheus, Grafana",
      },
      {
        id: "proj-m2",
        title: "Real-Time Collaborative Analytics",
        description:
          "Designed a low-latency live metrics dashboard utilizing WebSockets and Next.js for concurrent real-time team collaboration.",
        technologies: "Next.js, TypeScript, WebSockets, Tailwind CSS",
      },
    ],
    skills: [
      "TypeScript",
      "Go",
      "Python",
      "React",
      "Next.js",
      "Node.js",
      "PostgreSQL",
      "Redis",
      "Docker",
      "Kubernetes",
      "AWS",
      "CI/CD Pipelines",
      "REST APIs",
      "Microservices",
    ],
    certifications: [
      {
        id: "cert-m1",
        name: "AWS Certified Solutions Architect – Associate",
        issuer: "Amazon Web Services",
        year: "2023",
      },
    ],
    achievements: [
      {
        id: "ach-m1",
        description: "First Place Winner – Silicon Valley Hackathon 2023 (600+ developers, evaluated on scalability & architecture).",
      },
      {
        id: "ach-m2",
        description: "Authored technical whitepaper on microservices resiliency featured on Hacker News front page.",
      },
    ],
  },

  professional: {
    personalInfo: {
      fullName: "Eleanor Vance",
      email: "eleanor.vance@email.com",
      phone: "+1 (312) 555-0872",
      location: "Chicago, IL",
      linkedin: "linkedin.com/in/eleanorvance",
    },
    targetRole: "Director of Operations & Strategy",
    rawText: "",
    summary:
      "Strategic Executive Leader with 10+ years directing enterprise operations, global business transformation, and $85M+ P&L budgets. Proven ability to scale operational throughput by 140% while enhancing margin efficiency and spearheading multi-region SAP ERP modernization.",
    education: [
      {
        id: "edu-p1",
        degree: "Master of Business Administration (MBA)",
        institution: "Northwestern University, Kellogg School of Management",
        year: "2014 - 2016",
      },
      {
        id: "edu-p2",
        degree: "B.S. in Industrial Engineering",
        institution: "Purdue University",
        year: "2008 - 2012",
        cgpa: "3.90 / 4.0",
      },
    ],
    experience: [
      {
        id: "exp-p1",
        title: "Director of Global Operations",
        company: "Vanguard Enterprise Group",
        duration: "2020 - Present",
        description:
          "Lead 120-person multi-region operations organization across Americas and EMEA, managing an $85M operating budget.\nOverhauled enterprise vendor procurement protocols, negotiating multi-year master service agreements yielding $6.4M in annual savings.\nLed global migration from legacy ERP systems to SAP S/4HANA, completing deployment 2 months ahead of schedule and 8% under budget.",
      },
      {
        id: "exp-p2",
        title: "Senior Operations Manager",
        company: "Meridian Logistics Global",
        duration: "2016 - 2020",
        description:
          "Increased fulfillment efficiency by 45% across 4 regional hubs using Lean Six Sigma continuous improvement frameworks.\nUnified cross-functional leadership spanning engineering, compliance, customer success, and supply chain to boost SLA compliance to 99.4%.",
      },
    ],
    projects: [
      {
        id: "proj-p1",
        title: "Enterprise Supply Chain Optimization",
        description:
          "Spearheaded company-wide predictive replenishment model across 18 distribution centers, reducing stockout incidents by 34%.",
        technologies: "SAP S/4HANA, Lean Six Sigma, Tableau, Power BI",
      },
    ],
    skills: [
      "P&L Management ($85M+)",
      "Global Operations",
      "Strategic Planning",
      "Enterprise Transformation",
      "Vendor Procurement",
      "Lean Six Sigma",
      "Executive Leadership",
      "Change Management",
      "Governance & Risk",
      "ERP Implementations",
    ],
    certifications: [
      {
        id: "cert-p1",
        name: "Lean Six Sigma Black Belt (ICBB)",
        issuer: "Council for Six Sigma Certification",
        year: "2019",
      },
      {
        id: "cert-p2",
        name: "Project Management Professional (PMP)",
        issuer: "Project Management Institute",
        year: "2017",
      },
    ],
    achievements: [
      {
        id: "ach-p1",
        description: "Awarded Chairman's Excellence in Leadership Award (2022) across a 4,500-employee global workforce.",
      },
    ],
  },

  compact: {
    personalInfo: {
      fullName: "Marcus Chen",
      email: "marcus.chen@email.com",
      phone: "+1 (206) 555-0143",
      location: "Seattle, WA",
      linkedin: "linkedin.com/in/marcuschen",
      github: "github.com/marcuschen",
    },
    targetRole: "Principal Cloud & DevOps Architect",
    rawText: "",
    summary:
      "Infrastructure Architect with 8+ years designing high-availability multi-cloud ecosystems, zero-trust security frameworks, and GitOps delivery pipelines. Expert in Kubernetes cluster orchestration and cloud infrastructure economics, reducing annual AWS expenditure by $1.8M.",
    education: [
      {
        id: "edu-d1",
        degree: "B.S. in Computer Engineering",
        institution: "University of Washington",
        year: "2012 - 2016",
        cgpa: "3.87 / 4.0",
      },
    ],
    experience: [
      {
        id: "exp-d1",
        title: "Principal Cloud Architect",
        company: "Horizon Cloud Infrastructure",
        duration: "2021 - Present",
        description:
          "Architected multi-region AWS and GCP zero-trust infrastructure using Terraform and Terragrunt supporting 200+ production services.\nEngineered multi-tenant Kubernetes (EKS) clusters handling 250,000 req/sec with automated cluster autoscaling and Istio service mesh.\nReduced deployment release duration from 4 hours to under 8 minutes utilizing automated canary deployments and ArgoCD.",
      },
      {
        id: "exp-d2",
        title: "Senior DevOps Engineer",
        company: "Strata Cloud Systems",
        duration: "2018 - 2021",
        description:
          "Automated continuous security scanning and compliance auditing using HashiCorp Vault, Falco, and Trivy within CI/CD pipelines.\nConfigured distributed Prometheus and Grafana telemetry monitoring ingesting 2.5TB of operational system metrics daily.",
      },
      {
        id: "exp-d3",
        title: "Systems Engineer",
        company: "CloudVect Technologies",
        duration: "2016 - 2018",
        description:
          "Administered 1,200+ Linux enterprise production instances, achieving 99.99% uptime with Ansible automation.",
      },
    ],
    projects: [
      {
        id: "proj-d1",
        title: "KubeCostWatcher (Open Source)",
        description:
          "Created an open-source Kubernetes operator analyzing underutilized CPU/RAM reservations (1,400+ GitHub stars).",
        technologies: "Go, Kubernetes API, Helm, Prometheus",
      },
    ],
    skills: [
      "AWS",
      "GCP",
      "Kubernetes (EKS/GKE)",
      "Docker",
      "Terraform",
      "Terragrunt",
      "Ansible",
      "ArgoCD",
      "Helm",
      "Istio",
      "Prometheus",
      "Grafana",
      "Linux / Bash",
      "Python",
      "Go",
      "CI/CD GitOps",
    ],
    certifications: [
      {
        id: "cert-d1",
        name: "AWS Certified Solutions Architect – Professional",
        issuer: "Amazon Web Services",
        year: "2023",
      },
      {
        id: "cert-d2",
        name: "Certified Kubernetes Administrator (CKA)",
        issuer: "Cloud Native Computing Foundation",
        year: "2022",
      },
      {
        id: "cert-d3",
        name: "HashiCorp Certified: Terraform Associate",
        issuer: "HashiCorp",
        year: "2021",
      },
    ],
    achievements: [
      {
        id: "ach-d1",
        description: "Featured speaker at KubeCon North America 2023 on 'Zero-Trust Multi-Tenant GitOps Architecture'.",
      },
    ],
  },

  clean: {
    personalInfo: {
      fullName: "Sophia Laurent",
      email: "sophia.laurent@email.com",
      phone: "+1 (917) 555-0188",
      location: "New York, NY",
      linkedin: "linkedin.com/in/sophialaurent",
      portfolio: "sophialaurent.design",
    },
    targetRole: "Lead Product & UX Strategist",
    rawText: "",
    summary:
      "Human-centered Product and UX Strategist with 6+ years driving end-to-end digital product design, user research, and scalable design systems. Track record of boosting user onboarding activation by 34% through iterative design methodologies and data-backed UX architecture.",
    education: [
      {
        id: "edu-u1",
        degree: "B.F.A. in Graphic Design & Human-Computer Interaction",
        institution: "Rhode Island School of Design (RISD)",
        year: "2014 - 2018",
        cgpa: "3.92 / 4.0",
      },
    ],
    experience: [
      {
        id: "exp-u1",
        title: "Lead Product Strategist",
        company: "Lumina Product Studio",
        duration: "2021 - Present",
        description:
          "Direct product design strategy for flagship B2B SaaS platform serving 90,000+ active business professionals.\nBuilt and maintain enterprise design system with Figma design tokens and React component libraries, cutting feature sprint cycles by 35%.\nConducted 70+ in-depth user discovery interviews and multivariate usability experiments, increasing trial-to-paid conversion by 26%.",
      },
      {
        id: "exp-u2",
        title: "Senior Product Designer",
        company: "Northstar Interactive",
        duration: "2018 - 2021",
        description:
          "Designed cross-platform web and mobile experiences for fintech and consumer tech clients from discovery to production handoff.\nPartnered directly with engineering leads to ensure 100% WCAG 2.1 AA accessibility compliance and micro-interaction polish.",
      },
    ],
    projects: [
      {
        id: "proj-u1",
        title: "Open Token Design System",
        description:
          "Authored multi-platform token architecture bridging Figma variables directly to CSS and React Native components.",
        technologies: "Figma, React, Storybook, Design Tokens, TypeScript",
      },
    ],
    skills: [
      "Product Strategy",
      "User Experience (UX)",
      "UI Design Systems",
      "User Research & Testing",
      "Information Architecture",
      "Figma / FigJam",
      "Wireframing & Prototyping",
      "WCAG Accessibility",
      "Data-Driven UX",
      "HTML & CSS",
    ],
    certifications: [
      {
        id: "cert-u1",
        name: "UX Master Certified (UXMC)",
        issuer: "Nielsen Norman Group",
        year: "2021",
      },
    ],
    achievements: [
      {
        id: "ach-u1",
        description: "Winner – Fast Company Innovation by Design Honoree (2022) for accessible consumer fintech design.",
      },
    ],
  },
};

export function getShowcaseData(templateId: string): ResumeData {
  return TEMPLATE_SHOWCASE_PROFILES[templateId] || TEMPLATE_SHOWCASE_PROFILES.classic;
}
