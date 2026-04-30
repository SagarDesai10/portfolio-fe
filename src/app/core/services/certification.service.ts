import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { CertificationRecord } from '../models/certification.model';
import { CertificateDTO } from '../models/certificate-dto.model';
import { ResponseDTO } from '../models/api-response.model';

@Injectable({ providedIn: 'root' })
export class CertificationService {
  private readonly base = `${environment.apiBaseUrl}/certificate`;

  constructor(private http: HttpClient) {}

  getCertifications(): Observable<CertificationRecord[]> {
    return this.http.get<ResponseDTO<CertificateDTO[]>>(this.base).pipe(
      map(res => res.data.map(d => ({
        techSkill: d.skill,
        certificationName: d.name,
        year: d.year,
        link: d.link,
      } as CertificationRecord)))
    );
  }
}
