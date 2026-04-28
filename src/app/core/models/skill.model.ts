export type SkillCategory = 'All' | 'FE' | 'BE' | 'DSA' | 'DevOps' | 'DB' | 'Tools';

export interface Skill {
  name: string;
  img: string;          // URL, data URI, or emoji fallback
  stars: number;        // 1–5
  category: SkillCategory;
}
