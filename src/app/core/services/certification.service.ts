import { Injectable } from '@angular/core';
// import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { CertificationRecord } from '../models/certification.model';

const MOCK_CERTIFICATIONS: CertificationRecord[] = [
  {
    techSkill: 'Angular',
    certificationName: 'Coursera — Angular: The Complete Guide',
    year: 2023,
    link: 'https://drive.google.com/file/d/example-angular-cert',
  },
  {
    techSkill: 'Node.js',
    certificationName: 'Udemy — Node.js, Express, MongoDB & More: The Complete Bootcamp',
    year: 2022,
    link: 'https://drive.google.com/file/d/example-nodejs-cert',
  },
  {
    techSkill: 'JDBC & Java',
    certificationName: 'Coursera — Java Programming and Software Engineering Fundamentals',
    year: 2021,
    link: 'https://drive.google.com/file/d/example-java-cert',
  },
  {
    techSkill: 'AWS Cloud',
    certificationName: 'AWS Certified Cloud Practitioner (CLF-C01)',
    year: 2023,
    link: 'https://drive.google.com/file/d/example-aws-cert',
  },
  {
    techSkill: 'Docker & Kubernetes',
    certificationName: 'Udemy — Docker and Kubernetes: The Complete Guide',
    year: 2024,
    link: 'https://drive.google.com/file/d/example-docker-cert',
  },
  {
    techSkill: 'Data Structures & Algorithms',
    certificationName: 'Coursera — Algorithms Specialization by Stanford University',
    year: 2022,
    link: 'https://drive.google.com/file/d/example-dsa-cert',
  },
];

@Injectable({ providedIn: 'root' })
export class CertificationService {
  // private readonly API_URL = '/certification';

  // constructor(private http: HttpClient) {}

  getCertifications(): Observable<CertificationRecord[]> {
    // --- Uncomment below and remove mock to call real API ---
    // return this.http.get<CertificationRecord[]>(this.API_URL);
    return of(MOCK_CERTIFICATIONS);
  }
}
