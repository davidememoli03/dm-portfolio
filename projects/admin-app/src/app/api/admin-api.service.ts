import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { AdminUser, LoginPayload } from '../models/admin.models';
import { AnalyticsOverview } from '../models/analytics.models';
import { DashboardOverview } from '../models/dashboard.models';
import {
  MessageDetail,
  MessageStatus,
  MessagesListQuery,
  MessagesListResponse,
} from '../models/message.models';

@Injectable({ providedIn: 'root' })
export class AdminApiService {
  private readonly http = inject(HttpClient);
  private readonly base = '/api/admin';

  login(payload: LoginPayload): Observable<{ ok: true; username: string }> {
    return this.http.post<{ ok: true; username: string }>(`${this.base}/auth/login`, payload);
  }

  logout(): Observable<void> {
    return this.http.post<void>(`${this.base}/auth/logout`, {});
  }

  me(): Observable<AdminUser> {
    return this.http.get<AdminUser>(`${this.base}/auth/me`);
  }

  listMessages(query: MessagesListQuery = {}): Observable<MessagesListResponse> {
    let params = new HttpParams();
    if (query.status) params = params.set('status', query.status);
    if (query.search) params = params.set('search', query.search);
    if (query.page) params = params.set('page', String(query.page));
    if (query.pageSize) params = params.set('pageSize', String(query.pageSize));

    return this.http.get<MessagesListResponse>(`${this.base}/messages`, { params });
  }

  getMessage(id: string): Observable<MessageDetail> {
    return this.http.get<MessageDetail>(`${this.base}/messages/${id}`);
  }

  updateMessageStatus(id: string, status: MessageStatus): Observable<MessageDetail> {
    return this.http.patch<MessageDetail>(`${this.base}/messages/${id}`, { status });
  }

  deleteMessage(id: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/messages/${id}`);
  }

  getAnalyticsOverview(days = 30): Observable<AnalyticsOverview> {
    const params = new HttpParams().set('days', String(days));
    return this.http.get<AnalyticsOverview>(`${this.base}/analytics/overview`, { params });
  }

  getDashboardOverview(days = 30): Observable<DashboardOverview> {
    const params = new HttpParams().set('days', String(days));
    return this.http.get<DashboardOverview>(`${this.base}/dashboard/overview`, { params });
  }
}
