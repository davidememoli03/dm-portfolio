import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { PortfolioProfile, PortfolioProject } from '../models/portfolio.models';

@Injectable({ providedIn: 'root' })
export class PortfolioApiService {
  private readonly http = inject(HttpClient);
  private apiBaseUrl = '/api';
  private locale = 'it';

  configure(apiBaseUrl: string): void {
    this.apiBaseUrl = apiBaseUrl.replace(/\/$/, '');
  }

  configureLocale(locale: string): void {
    this.locale = locale.split('-')[0] || 'it';
  }

  getProfile(): Observable<PortfolioProfile> {
    return this.http.get<PortfolioProfile>(`${this.apiBaseUrl}/profile`, {
      params: this.localeParams(),
    });
  }

  getProjects(): Observable<PortfolioProject[]> {
    return this.http.get<PortfolioProject[]>(`${this.apiBaseUrl}/projects`, {
      params: this.localeParams(),
    });
  }

  private localeParams(): HttpParams {
    return new HttpParams().set('lang', this.locale);
  }
}
