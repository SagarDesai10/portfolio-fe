import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { ExperienceRecord } from '../models/experience.model';
import { ExperienceDTO } from '../models/experience-dto.model';
import { ResponseDTO } from '../models/api-response.model';

@Injectable({ providedIn: 'root' })
export class ExperienceService {
  private readonly base = `${environment.apiBaseUrl}/experience`;

  constructor(private http: HttpClient) {}

  getExperience(): Observable<ExperienceRecord[]> {
    return this.http.get<ResponseDTO<ExperienceDTO[]>>(this.base).pipe(
      map(res => res.data.map(d => ({
        companyName: d.companyName,
        position: d.position,
        startMonthYear: d.startDate,
        endMonthYear: d.endDate ?? 'Present',
        about: d.about[0] ?? '',
        points: d.about.slice(1),
      } as ExperienceRecord)))
    );
  }
}
