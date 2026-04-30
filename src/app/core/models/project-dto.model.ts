/** DTO matching the backend Project entity. */
export interface ProjectDTO {
  id?: string;
  category: string;
  name: string;
  description?: string | null;
  keyTech: string[];
  githubLink?: string | null;
  liveLink?: string | null;
}
