import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Project } from '../models/project.model';
import { ProjectDTO } from '../models/project-dto.model';
import { ResponseDTO } from '../models/api-response.model';

@Injectable({ providedIn: 'root' })
export class ProjectService {
  private readonly base = `${environment.apiBaseUrl}/project`;

  constructor(private http: HttpClient) {}

  getProjects(): Observable<Project[]> {
    return this.http.get<ResponseDTO<ProjectDTO[]>>(this.base).pipe(
      map(res => res.data.map(d => ({
        name: d.name,
        description: d.description ?? '',
        techStack: d.keyTech,
        githubLink: d.githubLink ?? undefined,
        liveLink: d.liveLink ?? undefined,
        category: d.category as Project['category'],
      } as Project)))
    );
  }
}
