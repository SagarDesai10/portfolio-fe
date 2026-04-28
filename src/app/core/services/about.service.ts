import { Injectable } from '@angular/core';
// import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { AboutData } from '../models/about.model';

const MOCK_ABOUT: AboutData = {
  name: 'Sagar Desai',
  profession: 'Software Developer',
  email: 'sagar.desai@example.com',
  about: {
    paragraph:
      'I am a passionate Full Stack Developer and system thinker with a strong foundation in building scalable, performant web applications. I love crafting elegant solutions to complex problems and continuously evolving my skill set to stay ahead of the curve.',
    points: [
      'Architecting end-to-end solutions from UI to database layer',
      'Designing clean, maintainable, and testable codebases',
      'Collaborating across cross-functional teams in agile environments',
      'Optimising performance and scalability at every layer of the stack',
      'Passionate about developer experience and modern tooling',
    ],
  },
  yearsOfExperience: 4,
  educationalDegree: 'B.E. (Computer Engineering)',
  role: 'Full Stack Developer & System Thinker',
  location: 'Pune, India',
};

@Injectable({ providedIn: 'root' })
export class AboutService {
  // private readonly API_URL = '/about';

  // constructor(private http: HttpClient) {}

  getAbout(): Observable<AboutData> {
    // --- Uncomment below and remove mock to call real API ---
    // return this.http.get<AboutData>(this.API_URL);
    return of(MOCK_ABOUT);
  }
}
