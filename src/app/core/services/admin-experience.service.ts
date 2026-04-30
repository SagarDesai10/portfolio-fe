import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ResponseDTO } from '../models/api-response.model';
import { ExperienceDTO } from '../models/experience-dto.model';

@Injectable({ providedIn: 'root' })
export class AdminExperienceService {
  private readonly adminBase = `${environment.apiBaseUrl}/admin/experience`;
  private readonly publicBase = `${environment.apiBaseUrl}/experience`;

  constructor(private http: HttpClient) {}

  /** GET /experience — fetch all experience records (public, no auth) */
  getExperience(): Observable<ResponseDTO<ExperienceDTO[]>> {
    return this.http.get<ResponseDTO<ExperienceDTO[]>>(this.publicBase);
  }

  /** POST /admin/experience — create experience record */
  createExperience(payload: ExperienceDTO): Observable<ResponseDTO<string>> {
    return this.http.post<ResponseDTO<string>>(this.adminBase, payload);
  }

  /** PATCH /admin/experience/{id} — update experience record */
  updateExperience(id: string, payload: ExperienceDTO): Observable<ResponseDTO<ExperienceDTO>> {
    return this.http.patch<ResponseDTO<ExperienceDTO>>(`${this.adminBase}/${id}`, payload);
  }

  /** DELETE /admin/experience/{id} — delete experience record */
  deleteExperience(id: string): Observable<ResponseDTO<string>> {
    return this.http.delete<ResponseDTO<string>>(`${this.adminBase}/${id}`);
  }
}
