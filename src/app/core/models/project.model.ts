export type ProjectCategory = string;

export interface Project {
  name: string;
  description: string;
  techStack: string[];
  githubLink?: string;
  liveLink?: string;
  category: ProjectCategory;
}
