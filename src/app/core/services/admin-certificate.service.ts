import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ResponseDTO } from '../models/api-response.model';
import { CertificateDTO } from '../models/certificate-dto.model';

@Injectable({ providedIn: 'root' })
export class AdminCertificateService {
  private readonly adminBase = `${environment.apiBaseUrl}/admin/certificate`;
  private readonly publicBase = `${environment.apiBaseUrl}/certificate`;

  constructor(private http: HttpClient) {}

  /** GET /certificate — fetch all certificates (public endpoint, no auth) */
  getCertificates(): Observable<ResponseDTO<CertificateDTO[]>> {
    return this.http.get<ResponseDTO<CertificateDTO[]>>(this.publicBase);
  }

  /** POST /admin/certificate — create a new certificate */
  createCertificate(payload: CertificateDTO): Observable<ResponseDTO<string>> {
    return this.http.post<ResponseDTO<string>>(this.adminBase, payload);
  }

  /** PATCH /admin/certificate/{id} — update an existing certificate */
  updateCertificate(id: string, payload: CertificateDTO): Observable<ResponseDTO<CertificateDTO>> {
    return this.http.patch<ResponseDTO<CertificateDTO>>(`${this.adminBase}/${id}`, payload);
  }

  /** DELETE /admin/certificate/{id} — delete a certificate */
  deleteCertificate(id: string): Observable<ResponseDTO<string>> {
    return this.http.delete<ResponseDTO<string>>(`${this.adminBase}/${id}`);
  }
}
