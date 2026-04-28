import { Injectable } from '@angular/core';
// import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { Project } from '../models/project.model';

const MOCK_PROJECTS: Project[] = [
  // ── Full Stack ───────────────────────────────────────────
  {
    name: 'DevCollab — Real-time Code Editor',
    description:
      'A collaborative online code editor supporting multiple users simultaneously. Features live cursor sharing, syntax highlighting, and integrated chat powered by WebSockets.',
    techStack: ['Angular', 'Node.js', 'Socket.IO', 'Monaco Editor', 'MongoDB', 'Docker'],
    githubLink: 'https://github.com/',
    liveLink: 'https://devcollab.example.com',
    category: 'Full Stack',
  },
  {
    name: 'Portfolio CMS',
    description:
      'A headless CMS for managing portfolio content (projects, skills, experience) served via REST APIs to this Angular frontend. Includes an admin panel with role-based access.',
    techStack: ['Angular', 'Spring Boot', 'PostgreSQL', 'JWT', 'AWS S3'],
    githubLink: 'https://github.com/',
    category: 'Full Stack',
  },
  {
    name: 'E-Commerce Platform',
    description:
      'Full-featured online store with product catalogue, cart, Razorpay payment integration, order tracking, and an admin dashboard for inventory management.',
    techStack: ['React', 'Node.js', 'Express', 'MongoDB', 'Razorpay', 'Redis'],
    githubLink: 'https://github.com/',
    liveLink: 'https://shop.example.com',
    category: 'Full Stack',
  },

  // ── Frontend ──────────────────────────────────────────────
  {
    name: 'Three.js Portfolio',
    description:
      'This very portfolio — built with Angular 19 and Three.js. Features immersive WebGL scenes on every page, glassmorphism UI, and responsive design across all breakpoints.',
    techStack: ['Angular', 'Three.js', 'TypeScript', 'SCSS'],
    githubLink: 'https://github.com/',
    liveLink: 'https://sagar.dev',
    category: 'FE',
  },
  {
    name: 'Design System Library',
    description:
      'A reusable Angular component library (buttons, modals, tables, forms) built with accessibility (WCAG 2.1 AA) in mind and published as an npm package.',
    techStack: ['Angular', 'Storybook', 'TypeScript', 'SCSS', 'Jest'],
    githubLink: 'https://github.com/',
    category: 'FE',
  },
  {
    name: 'Weather Dashboard',
    description:
      'Real-time weather application with animated backgrounds based on current conditions, 7-day forecast charts, and location-based auto-detection via the OpenWeather API.',
    techStack: ['React', 'Chart.js', 'OpenWeather API', 'CSS Animations'],
    githubLink: 'https://github.com/',
    liveLink: 'https://weather.example.com',
    category: 'FE',
  },

  // ── Backend ───────────────────────────────────────────────
  {
    name: 'Notification Microservice',
    description:
      'Decoupled notification service handling email, SMS, and push notifications via RabbitMQ queues. Supports template management and delivery-status webhooks.',
    techStack: ['Node.js', 'RabbitMQ', 'SendGrid', 'Twilio', 'PostgreSQL', 'Docker'],
    githubLink: 'https://github.com/',
    category: 'BE',
  },
  {
    name: 'Auth Service (JWT + OAuth)',
    description:
      'Standalone authentication service implementing JWT refresh-token rotation, Google/GitHub OAuth2, rate-limiting, and audit logging for enterprise applications.',
    techStack: ['Node.js', 'Express', 'Passport.js', 'Redis', 'PostgreSQL'],
    githubLink: 'https://github.com/',
    category: 'BE',
  },
  {
    name: 'Leave Management System API',
    description:
      'REST API for employee leave management: apply, approve, reject, balance tracking, holiday calendar, and reporting — built during academic internship.',
    techStack: ['Java', 'Spring Boot', 'JDBC', 'MySQL', 'Swagger'],
    githubLink: 'https://github.com/',
    category: 'BE',
  },

  // ── POC ───────────────────────────────────────────────────
  {
    name: 'WebAssembly Image Filter POC',
    description:
      'Proof-of-concept demonstrating browser-side image processing (blur, sharpen, greyscale) using Rust compiled to WebAssembly — achieving ~10× speedup over pure JS.',
    techStack: ['Rust', 'WebAssembly', 'JavaScript', 'Canvas API'],
    githubLink: 'https://github.com/',
    liveLink: 'https://wasm-poc.example.com',
    category: 'POC',
  },
  {
    name: 'AI Code Review Bot',
    description:
      'GitHub Action that triggers an OpenAI GPT-4 call on every pull-request, posts inline review comments, and assigns a risk score to changed files.',
    techStack: ['Python', 'GitHub Actions', 'OpenAI API', 'TypeScript'],
    githubLink: 'https://github.com/',
    category: 'POC',
  },
  {
    name: 'Serverless URL Shortener',
    description:
      'Minimal URL shortener deployed on AWS Lambda + API Gateway with DynamoDB, custom domain, analytics tracking, and a React frontend — entire infra as code with CDK.',
    techStack: ['AWS Lambda', 'DynamoDB', 'API Gateway', 'React', 'AWS CDK'],
    githubLink: 'https://github.com/',
    liveLink: 'https://short.example.com',
    category: 'POC',
  },
];

@Injectable({ providedIn: 'root' })
export class ProjectService {
  // private readonly API_URL = '/project';

  // constructor(private http: HttpClient) {}

  getProjects(): Observable<Project[]> {
    // --- Uncomment below and remove mock to call real API ---
    // return this.http.get<Project[]>(this.API_URL);
    return of(MOCK_PROJECTS);
  }
}
