import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Skill } from '../models/skill.model';
import { SkillDTO } from '../models/skill-dto.model';
import { ResponseDTO } from '../models/api-response.model';

@Injectable({ providedIn: 'root' })
export class SkillsService {
  private readonly base = `${environment.apiBaseUrl}/skill`;

  constructor(private http: HttpClient) {}

  getSkills(): Observable<Skill[]> {
    return this.http.get<ResponseDTO<SkillDTO[]>>(this.base).pipe(
      map(res => res.data.map(d => ({
        name: d.name,
        img: d.img ?? '',
        stars: d.stars,
        category: d.category as Skill['category'],
      } as Skill)))
    );
  }
}
