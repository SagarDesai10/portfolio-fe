import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ResponseDTO } from '../models/api-response.model';
import { EducationDTO } from '../models/education-dto.model';

@Injectable({ providedIn: 'root' })
export class AdminEducationService {
  private readonly adminBase = `${environment.apiBaseUrl}/admin/education`;
  private readonly publicBase = `${environment.apiBaseUrl}/education`;

  constructor(private http: HttpClient) {}

  /** GET /education — fetch all education records (public, no auth) */
  getEducation(): Observable<ResponseDTO<EducationDTO[]>> {
    return this.http.get<ResponseDTO<EducationDTO[]>>(this.publicBase);
  }

  /** POST /admin/education — create education record */
  createEducation(payload: EducationDTO): Observable<ResponseDTO<string>> {
    return this.http.post<ResponseDTO<string>>(this.adminBase, payload);
  }

  /** PATCH /admin/education/{id} — update education record */
  updateEducation(id: string, payload: EducationDTO): Observable<ResponseDTO<EducationDTO>> {
    return this.http.patch<ResponseDTO<EducationDTO>>(`${this.adminBase}/${id}`, payload);
  }

  /** DELETE /admin/education/{id} — delete education record */
  deleteEducation(id: string): Observable<ResponseDTO<string>> {
    return this.http.delete<ResponseDTO<string>>(`${this.adminBase}/${id}`);
  }
}
