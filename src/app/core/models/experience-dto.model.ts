/** DTO matching the backend Experience entity. */
export interface ExperienceDTO {
  id?: string;
  companyName: string;
  position: string;
  startDate: string;
  endDate?: string | null;
  about: string[];
}
