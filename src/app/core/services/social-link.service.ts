import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { SocialLink } from '../models/social-link.model';
import { SocialDTO } from '../models/social-dto.model';
import { ResponseDTO } from '../models/api-response.model';

@Injectable({ providedIn: 'root' })
export class SocialLinkService {
  private readonly base = `${environment.apiBaseUrl}/social-link`;

  constructor(private http: HttpClient) {}

  getSocialLinks(): Observable<SocialLink[]> {
    return this.http.get<ResponseDTO<SocialDTO[]>>(this.base).pipe(
      map(res => res.data.map(d => ({
        name: d.name,
        link: d.link,
        icon: d.img ?? '',
      } as SocialLink)))
    );
  }
}
