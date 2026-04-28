import { Injectable } from '@angular/core';
// import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { ExperienceRecord } from '../models/experience.model';

const MOCK_EXPERIENCE: ExperienceRecord[] = [
  {
    companyName: 'Acme Technologies Pvt. Ltd.',
    position: 'Senior Full Stack Developer',
    startMonthYear: 'Mar 2023',
    endMonthYear: 'Present',
    about:
      'Leading development of a large-scale SaaS platform serving 50 k+ users daily. Responsible for architecture decisions, code reviews, and mentoring junior engineers across the full stack.',
    points: [
      'Redesigned monolithic backend into microservices, reducing deployment time by 60%',
      'Built a real-time notification system using WebSockets and Redis Pub/Sub',
      'Improved API response times by 40% through query optimisation and caching strategies',
      'Established automated CI/CD pipelines with GitHub Actions and Docker',
      'Mentored 4 junior developers through pair programming and weekly code-review sessions',
    ],
  },
  {
    companyName: 'NextWave Solutions',
    position: 'Full Stack Developer',
    startMonthYear: 'Jul 2021',
    endMonthYear: 'Feb 2023',
    about:
      'Developed and maintained multiple client-facing web applications. Collaborated closely with product and design teams to ship features iteratively using agile methodologies.',
    points: [
      'Built and shipped 3 end-to-end client products from greenfield using Angular and Node.js',
      'Integrated third-party payment gateways (Razorpay, Stripe) with PCI-compliant flows',
      'Created a reusable Angular component library adopted across 5 projects',
      'Reduced bundle size by 35% through lazy loading and tree-shaking',
      'Wrote unit and integration tests achieving 80%+ code coverage',
    ],
  },
  {
    companyName: 'Pixelforge Studio',
    position: 'Junior Frontend Developer',
    startMonthYear: 'Jun 2020',
    endMonthYear: 'Jun 2021',
    about:
      'Joined as a fresher and quickly took ownership of UI features for a portfolio of digital-agency clients. Gained strong fundamentals in responsive design, performance, and cross-browser compatibility.',
    points: [
      'Converted 10+ Figma designs to pixel-perfect, responsive Angular components',
      'Improved Lighthouse performance scores from ~55 to 90+ across key pages',
      'Collaborated with backend team to design RESTful API contracts',
      'Implemented accessibility improvements meeting WCAG 2.1 AA standards',
    ],
  },
  {
    companyName: 'CodeLab Internship (Academic)',
    position: 'Software Development Intern',
    startMonthYear: 'Jan 2020',
    endMonthYear: 'May 2020',
    about:
      'Six-month academic internship focused on building internal tooling for the engineering department using React and a Django REST backend.',
    points: [
      'Developed an employee leave-management dashboard used by 200+ staff',
      'Integrated Google OAuth SSO for seamless authentication',
      'Documented REST APIs using Swagger/OpenAPI',
    ],
  },
];

@Injectable({ providedIn: 'root' })
export class ExperienceService {
  // private readonly API_URL = '/experience';

  // constructor(private http: HttpClient) {}

  getExperience(): Observable<ExperienceRecord[]> {
    // --- Uncomment below and remove mock to call real API ---
    // return this.http.get<ExperienceRecord[]>(this.API_URL);
    return of(MOCK_EXPERIENCE);
  }
}
