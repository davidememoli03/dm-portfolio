import { Routes } from '@angular/router';

import { authGuard, guestGuard } from './auth/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () => import('./pages/login/login.page').then((m) => m.LoginPage),
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./layout/admin-shell.component').then((m) => m.AdminShellComponent),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./pages/dashboard/dashboard.page').then((m) => m.DashboardPage),
      },
      {
        path: 'messages',
        loadComponent: () =>
          import('./pages/messages-list/messages-list.page').then((m) => m.MessagesListPage),
      },
      {
        path: 'messages/:id',
        loadComponent: () =>
          import('./pages/message-detail/message-detail.page').then((m) => m.MessageDetailPage),
      },
      {
        path: 'analytics',
        loadComponent: () =>
          import('./pages/analytics/analytics.page').then((m) => m.AnalyticsPage),
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
