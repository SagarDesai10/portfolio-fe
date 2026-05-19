import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ResponseDTO } from '../models/api-response.model';
import { SkillDTO } from '../models/skill-dto.model';

@Injectable({ providedIn: 'root' })
export class AdminSkillService {
  private readonly adminBase = `${environment.apiBaseUrl}/admin/skill`;
  private readonly publicBase = `${environment.apiBaseUrl}/skills`;

  constructor(private http: HttpClient) {}

  /** GET /skill — fetch all skills (public, no auth) */
  getSkills(): Observable<ResponseDTO<SkillDTO[]>> {
    return this.http.get<ResponseDTO<SkillDTO[]>>(this.publicBase);
  }

  /** POST /admin/skill — create a new skill */
  createSkill(payload: SkillDTO): Observable<ResponseDTO<string>> {
    return this.http.post<ResponseDTO<string>>(this.adminBase, payload);
  }

  /** PATCH /admin/skill/{id} — update a skill */
  updateSkill(id: string, payload: SkillDTO): Observable<ResponseDTO<SkillDTO>> {
    return this.http.patch<ResponseDTO<SkillDTO>>(`${this.adminBase}/${id}`, payload);
  }

  /** DELETE /admin/skill/{id} — delete a skill */
  deleteSkill(id: string): Observable<ResponseDTO<string>> {
    return this.http.delete<ResponseDTO<string>>(`${this.adminBase}/${id}`);
  }
}
