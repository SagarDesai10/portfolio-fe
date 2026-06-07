/** Matches the Java AboutDTO on the backend exactly. */
export interface AboutDTO {
  id?: number | string;
  name: string;
  profession: string;
  email: string;
  about: string[];          // List<String> — list of bullet points / paragraphs
  experience: number;       // Double — years of experience
  degree: string;
  role: string;
  location: string;
}
