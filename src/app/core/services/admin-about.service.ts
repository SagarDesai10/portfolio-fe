import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ResponseDTO } from '../models/api-response.model';
import { AboutDTO } from '../models/about-dto.model';

@Injectable({ providedIn: 'root' })
export class AdminAboutService {
  private readonly base = `${environment.apiBaseUrl}/admin/about`;

  constructor(private http: HttpClient) {}

  /** GET /admin/about — fetch current about detail */
  getAbout(): Observable<ResponseDTO<AboutDTO>> {
    return this.http.get<ResponseDTO<AboutDTO>>(this.base);
  }

  /** POST /admin/about — create about record */
  createAbout(payload: AboutDTO): Observable<ResponseDTO<string>> {
    return this.http.post<ResponseDTO<string>>(this.base, payload);
  }

  /** PATCH /admin/about/{id} — update about record */
  updateAbout(id: number | string, payload: AboutDTO): Observable<ResponseDTO<AboutDTO>> {
    return this.http.patch<ResponseDTO<AboutDTO>>(`${this.base}/${id}`, payload);
  }

  /** DELETE /admin/about/{id} — delete about record */
  deleteAbout(id: number | string): Observable<ResponseDTO<string>> {
    return this.http.delete<ResponseDTO<string>>(`${this.base}/${id}`);
  }
}
