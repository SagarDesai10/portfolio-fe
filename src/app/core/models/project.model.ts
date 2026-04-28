export type ProjectCategory = 'All' | 'FE' | 'BE' | 'Full Stack' | 'POC';

export interface Project {
  name: string;
  description: string;
  techStack: string[];
  githubLink?: string;
  liveLink?: string;
  category: ProjectCategory;
}
