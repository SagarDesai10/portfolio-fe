export interface EducationRecord {
  streamName: string;
  startYear: number;
  endYear: number | 'Present';
  institutionName: string;
  marks: string;         // e.g. "CGPA: 9 / 10"  or  "Percentage: 87%"
  points: string[];
}
