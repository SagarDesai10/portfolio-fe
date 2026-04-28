export interface ExperienceRecord {
  companyName: string;
  position: string;
  startMonthYear: string;   // e.g. "Jan 2021"
  endMonthYear: string | 'Present';
  about: string;
  points: string[];
}
