import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ResponseDTO } from '../models/api-response.model';
import { ProjectDTO } from '../models/project-dto.model';

@Injectable({ providedIn: 'root' })
export class AdminProjectService {
  private readonly adminBase = `${environment.apiBaseUrl}/admin/project`;
  private readonly publicBase = `${environment.apiBaseUrl}/project`;

  constructor(private http: HttpClient) {}

  /** GET /project — fetch all projects (public, no auth) */
  getProjects(): Observable<ResponseDTO<ProjectDTO[]>> {
    return this.http.get<ResponseDTO<ProjectDTO[]>>(this.publicBase);
  }

  /** POST /admin/project — create a new project */
  createProject(payload: ProjectDTO): Observable<ResponseDTO<string>> {
    return this.http.post<ResponseDTO<string>>(this.adminBase, payload);
  }

  /** PATCH /admin/project/{id} — update a project */
  updateProject(id: string, payload: ProjectDTO): Observable<ResponseDTO<ProjectDTO>> {
    return this.http.patch<ResponseDTO<ProjectDTO>>(`${this.adminBase}/${id}`, payload);
  }

  /** DELETE /admin/project/{id} — delete a project */
  deleteProject(id: string): Observable<ResponseDTO<string>> {
    return this.http.delete<ResponseDTO<string>>(`${this.adminBase}/${id}`);
  }
}
