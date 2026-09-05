// Simple TypeScript interfaces for resume data

export interface PersonalInfo {
  fullName: string;
  email: string;
  phone: string;
  location: string;
}

export interface Education {
  id: string;
  degree: string;
  institution: string;
  year: string;
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
}

export interface Achievement {
  id: string;
  description: string;
}

export interface ResumeData {
  personalInfo: PersonalInfo;
  targetRole: string;
  rawText: string;
  summary: string;
  education: Education[];
  experience: Experience[];
  projects: Project[];
  skills: string[];
  certifications: Certification[];
  achievements: Achievement[];
}
