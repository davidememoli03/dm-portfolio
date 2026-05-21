import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { PortfolioProfile, PortfolioProject } from '../models/portfolio.models';

@Injectable({ providedIn: 'root' })
export class PortfolioApiService {
  private readonly http = inject(HttpClient);
  private apiBaseUrl = '/api';

  configure(apiBaseUrl: string): void {
    this.apiBaseUrl = apiBaseUrl.replace(/\/$/, '');
  }

  getProfile(): Observable<PortfolioProfile> {
    return this.http.get<PortfolioProfile>(`${this.apiBaseUrl}/profile`);
  }

  getProjects(): Observable<PortfolioProject[]> {
    return this.http.get<PortfolioProject[]>(`${this.apiBaseUrl}/projects`);
  }
}
