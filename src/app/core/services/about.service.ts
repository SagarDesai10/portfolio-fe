import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { AboutData } from '../models/about.model';
import { AboutDTO } from '../models/about-dto.model';
import { ResponseDTO } from '../models/api-response.model';

@Injectable({ providedIn: 'root' })
export class AboutService {
  private readonly base = `${environment.apiBaseUrl}/about`;

  constructor(private http: HttpClient) {}

  getAbout(): Observable<AboutData> {
    return this.http.get<ResponseDTO<AboutDTO>>(this.base).pipe(
      map(res => {
        const d = res.data;
        return {
          name: d.name,
          profession: d.profession,
          email: d.email,
          role: d.role,
          location: d.location,
          educationalDegree: d.degree,
          yearsOfExperience: d.experience,
          about: {
            paragraph: d.about[0] ?? '',
            points: d.about.slice(1),
          },
        } as AboutData;
      })
    );
  }
}
