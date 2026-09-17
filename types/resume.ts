// Simple TypeScript interfaces for resume data

export interface PersonalInfo {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  linkedin?: string;
  github?: string;
  portfolio?: string;
}

export interface Education {
  id: string;
  degree: string;
  institution: string;
  year: string;
  cgpa?: string;
}

export interface Experience {
  id: string;
  title: string;
  company: string;
  duration: string;
  description: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  technologies?: string;
}

export interface Certification {
  id: string;
  name: string;
  issuer?: string;
  year?: string;
}

export interface Achievement {
  id: string;
  description: string;
}

export interface CategorizedSkills {
  languages?: string[];
  frameworks?: string[];
  tools?: string[];
  databases?: string[];
}

export interface Hackathon {
  id: string;
  title: string;
  description: string;
}

export interface Course {
  id: string;
  name: string;
  institution?: string;
}

export interface ResumeData {
  personalInfo: PersonalInfo;
  targetRole: string;
  jobDescription?: string;
  rawText: string;
  summary: string;
  education: Education[];
  experience: Experience[];
  internships?: Experience[];
  projects: Project[];
  skills: string[]; // flat list for backwards compatibility
  categorizedSkills?: CategorizedSkills;
  certifications: Certification[];
  achievements: Achievement[];
  hackathons?: Hackathon[];
  volunteerExperience?: string[];
  publications?: string[];
  courses?: Course[];
  templateId?: string;
}


