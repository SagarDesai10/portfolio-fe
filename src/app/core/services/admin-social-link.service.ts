import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ResponseDTO } from '../models/api-response.model';
import { SocialDTO } from '../models/social-dto.model';

@Injectable({ providedIn: 'root' })
export class AdminSocialLinkService {
  private readonly adminBase = `${environment.apiBaseUrl}/admin/social-link`;
  private readonly publicBase = `${environment.apiBaseUrl}/social-link`;

  constructor(private http: HttpClient) {}

  /** GET /social-link — fetch all social links (public, no auth) */
  getSocialLinks(): Observable<ResponseDTO<SocialDTO[]>> {
    return this.http.get<ResponseDTO<SocialDTO[]>>(this.publicBase);
  }

  /** POST /admin/social-link — create a new social link */
  createSocialLink(payload: SocialDTO): Observable<ResponseDTO<string>> {
    return this.http.post<ResponseDTO<string>>(this.adminBase, payload);
  }

  /** PATCH /admin/social-link/{id} — update a social link */
  updateSocialLink(id: string, payload: SocialDTO): Observable<ResponseDTO<SocialDTO>> {
    return this.http.patch<ResponseDTO<SocialDTO>>(`${this.adminBase}/${id}`, payload);
  }

  /** DELETE /admin/social-link/{id} — delete a social link */
  deleteSocialLink(id: string): Observable<ResponseDTO<string>> {
    return this.http.delete<ResponseDTO<string>>(`${this.adminBase}/${id}`);
  }
}
