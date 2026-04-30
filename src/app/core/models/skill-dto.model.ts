/** DTO matching the backend Skill entity. */
export interface SkillDTO {
  id?: string;
  category: string;
  name: string;
  img?: string | null;
  stars: number;
}
