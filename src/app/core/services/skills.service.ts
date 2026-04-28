import { Injectable } from '@angular/core';
// import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { Skill } from '../models/skill.model';

// Icons sourced from https://cdn.jsdelivr.net/gh/devicons/devicon/icons/
// Replace with DB-stored URLs or live links when the API is live.
const CDN = 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons';

const MOCK_SKILLS: Skill[] = [
  // ── Frontend ──────────────────────────────────────────────
  { name: 'HTML5',       img: `${CDN}/html5/html5-original.svg`,            stars: 5, category: 'FE' },
  { name: 'CSS3',        img: `${CDN}/css3/css3-original.svg`,              stars: 5, category: 'FE' },
  { name: 'JavaScript',  img: `${CDN}/javascript/javascript-original.svg`,  stars: 5, category: 'FE' },
  { name: 'TypeScript',  img: `${CDN}/typescript/typescript-original.svg`,  stars: 5, category: 'FE' },
  { name: 'Angular',     img: `${CDN}/angular/angular-original.svg`,        stars: 5, category: 'FE' },
  { name: 'React',       img: `${CDN}/react/react-original.svg`,            stars: 4, category: 'FE' },
  { name: 'Three.js',    img: `${CDN}/threejs/threejs-original.svg`,        stars: 3, category: 'FE' },
  { name: 'SCSS/SASS',   img: `${CDN}/sass/sass-original.svg`,              stars: 5, category: 'FE' },
  { name: 'Tailwind CSS',img: `${CDN}/tailwindcss/tailwindcss-original.svg`,stars: 4, category: 'FE' },
  { name: 'RxJS',        img: `${CDN}/rxjs/rxjs-original.svg`,              stars: 4, category: 'FE' },

  // ── Backend ───────────────────────────────────────────────
  { name: 'Node.js',     img: `${CDN}/nodejs/nodejs-original.svg`,          stars: 4, category: 'BE' },
  { name: 'Express.js',  img: `${CDN}/express/express-original.svg`,        stars: 4, category: 'BE' },
  { name: 'Java',        img: `${CDN}/java/java-original.svg`,              stars: 4, category: 'BE' },
  { name: 'Spring Boot', img: `${CDN}/spring/spring-original.svg`,          stars: 3, category: 'BE' },
  { name: 'JDBC',        img: `${CDN}/java/java-original.svg`,              stars: 4, category: 'BE' },
  { name: 'REST APIs',   img: '🔌',                                          stars: 5, category: 'BE' },
  { name: 'GraphQL',     img: `${CDN}/graphql/graphql-plain.svg`,           stars: 3, category: 'BE' },

  // ── Databases ─────────────────────────────────────────────
  { name: 'MySQL',       img: `${CDN}/mysql/mysql-original.svg`,            stars: 4, category: 'DB' },
  { name: 'PostgreSQL',  img: `${CDN}/postgresql/postgresql-original.svg`,  stars: 4, category: 'DB' },
  { name: 'MongoDB',     img: `${CDN}/mongodb/mongodb-original.svg`,        stars: 4, category: 'DB' },
  { name: 'Redis',       img: `${CDN}/redis/redis-original.svg`,            stars: 3, category: 'DB' },

  // ── DevOps ────────────────────────────────────────────────
  { name: 'Docker',      img: `${CDN}/docker/docker-original.svg`,          stars: 4, category: 'DevOps' },
  { name: 'Kubernetes',  img: `${CDN}/kubernetes/kubernetes-original.svg`,  stars: 3, category: 'DevOps' },
  { name: 'GitHub Actions', img: `${CDN}/github/github-original.svg`,       stars: 4, category: 'DevOps' },
  { name: 'AWS',         img: `${CDN}/amazonwebservices/amazonwebservices-original-wordmark.svg`, stars: 3, category: 'DevOps' },
  { name: 'Linux',       img: `${CDN}/linux/linux-original.svg`,            stars: 4, category: 'DevOps' },

  // ── DSA ───────────────────────────────────────────────────
  { name: 'Arrays & Strings', img: '🔢',                                    stars: 5, category: 'DSA' },
  { name: 'Trees & Graphs',   img: '🌳',                                    stars: 4, category: 'DSA' },
  { name: 'Dynamic Prog.',    img: '⚡',                                     stars: 4, category: 'DSA' },
  { name: 'Sorting & Search', img: '🔍',                                    stars: 5, category: 'DSA' },
  { name: 'System Design',    img: '🏗️',                                    stars: 4, category: 'DSA' },

  // ── Tools ─────────────────────────────────────────────────
  { name: 'Git',         img: `${CDN}/git/git-original.svg`,                stars: 5, category: 'Tools' },
  { name: 'VS Code',     img: `${CDN}/vscode/vscode-original.svg`,          stars: 5, category: 'Tools' },
  { name: 'Postman',     img: `${CDN}/postman/postman-original.svg`,        stars: 5, category: 'Tools' },
  { name: 'Figma',       img: `${CDN}/figma/figma-original.svg`,            stars: 3, category: 'Tools' },
  { name: 'Jira',        img: `${CDN}/jira/jira-original.svg`,              stars: 4, category: 'Tools' },
  { name: 'Webpack',     img: `${CDN}/webpack/webpack-original.svg`,        stars: 3, category: 'Tools' },
];

@Injectable({ providedIn: 'root' })
export class SkillsService {
  // private readonly API_URL = '/skills';

  // constructor(private http: HttpClient) {}

  getSkills(): Observable<Skill[]> {
    // --- Uncomment below and remove mock to call real API ---
    // return this.http.get<Skill[]>(this.API_URL);
    return of(MOCK_SKILLS);
  }
}
