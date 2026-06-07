/** DTO matching the backend Education entity. */
export interface EducationDTO {
  id?: string;
  stream: string;
  clgName: string;
  startYear: number;
  endYear?: number | null;
  marks?: string | null;
  about: string[];
}
