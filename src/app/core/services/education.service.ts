import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { EducationRecord } from '../models/education.model';
import { EducationDTO } from '../models/education-dto.model';
import { ResponseDTO } from '../models/api-response.model';

@Injectable({ providedIn: 'root' })
export class EducationService {
  private readonly base = `${environment.apiBaseUrl}/education`;

  constructor(private http: HttpClient) {}

  getEducation(): Observable<EducationRecord[]> {
    return this.http.get<ResponseDTO<EducationDTO[]>>(this.base).pipe(
      map(res => res.data.map(d => ({
        streamName: d.stream,
        institutionName: d.clgName,
        startYear: d.startYear,
        endYear: d.endYear ?? 'Present',
        marks: d.marks ?? '',
        points: d.about,
      } as EducationRecord)))
    );
  }
}
