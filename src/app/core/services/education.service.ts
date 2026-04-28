import { Injectable } from '@angular/core';
// import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { EducationRecord } from '../models/education.model';

const MOCK_EDUCATION: EducationRecord[] = [
  {
    streamName: 'Bachelor of Engineering — Computer Engineering',
    startYear: 2017,
    endYear: 2021,
    institutionName: 'Pune Institute of Computer Technology, Pune',
    marks: 'CGPA: 9.1 / 10',
    points: [
      'Graduated with First Class Distinction',
      'Final-year project: "Real-time collaborative code editor" using WebSockets and Node.js — received Best Project award',
      'Core subjects: Data Structures, Algorithms, DBMS, Operating Systems, Computer Networks, Software Engineering',
      'Active member of the college coding club; organised two inter-college hackathons',
      'Completed 2 industry internships during the programme',
    ],
  },
  {
    streamName: 'Higher Secondary Certificate — Science (PCM + CS)',
    startYear: 2015,
    endYear: 2017,
    institutionName: 'Fergusson College, Pune',
    marks: 'Percentage: 87.4 %',
    points: [
      'Specialisation in Physics, Chemistry, Mathematics with Computer Science',
      'School topper in Computer Science (96 / 100)',
      'Represented the school at the State Science Exhibition',
      'Introduced to programming through C and basic web development',
    ],
  },
  {
    streamName: 'Secondary School Certificate — General',
    startYear: 2013,
    endYear: 2015,
    institutionName: 'St. Vincent\'s High School, Pune',
    marks: 'Percentage: 91.2 %',
    points: [
      'Secured 1st rank in the school batch',
      'Mathematics and Science distinction scorer',
      'Participated in district-level Math Olympiad, advancing to the state round',
      'Member of the school debate and quiz teams',
    ],
  },
];

@Injectable({ providedIn: 'root' })
export class EducationService {
  // private readonly API_URL = '/education';

  // constructor(private http: HttpClient) {}

  getEducation(): Observable<EducationRecord[]> {
    // --- Uncomment below and remove mock to call real API ---
    // return this.http.get<EducationRecord[]>(this.API_URL);
    return of(MOCK_EDUCATION);
  }
}
