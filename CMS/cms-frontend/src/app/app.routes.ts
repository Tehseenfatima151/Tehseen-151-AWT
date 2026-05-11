import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { AuthLayoutComponent } from './layouts/auth-layout/auth-layout.component';
import { MainLayoutComponent } from './layouts/main-layout/main-layout.component';
import { guestGuard } from './core/guards/guest.guard';
import { kycCompleteGuard } from './core/guards/kyc-complete.guard';
import { adminGuard } from './core/guards/admin.guard';

export const routes: Routes = [
  {
    path: '',
    component: AuthLayoutComponent,
    canActivate: [guestGuard],
    children: [
      { path: 'login', loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent) },
      { path: 'signup', loadComponent: () => import('./features/auth/signup/signup.component').then(m => m.SignupComponent) },
      {
        path: 'forgot-password',
        loadComponent: () =>
          import('./features/auth/forgot-password/forgot-password.component').then(m => m.ForgotPasswordComponent),
      },
      { path: '', pathMatch: 'full', redirectTo: 'login' },
    ],
  },
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: 'kyc',
        loadComponent: () => import('./features/kyc/kyc-shell.component').then(m => m.KycShellComponent),
        children: [
          { path: '', pathMatch: 'full', redirectTo: 'personal' },
          {
            path: 'personal',
            loadComponent: () => import('./features/kyc/kyc-personal.component').then(m => m.KycPersonalComponent),
          },
          {
            path: 'financial',
            loadComponent: () => import('./features/kyc/kyc-financial.component').then(m => m.KycFinancialComponent),
          },
          {
            path: 'identity',
            loadComponent: () => import('./features/kyc/kyc-identity.component').then(m => m.KycIdentityComponent),
          },
          {
            path: 'review',
            loadComponent: () => import('./features/kyc/kyc-review.component').then(m => m.KycReviewComponent),
          },
          {
            path: 'complete',
            loadComponent: () => import('./features/kyc/kyc-complete.component').then(m => m.KycCompleteComponent),
          },
        ],
      },
      {
        path: 'admin',
        canActivate: [adminGuard],
        loadComponent: () => import('./features/admin/admin-shell.component').then(m => m.AdminShellComponent),
        children: [
          { path: '', pathMatch: 'full', redirectTo: 'overview' },
          {
            path: 'overview',
            loadComponent: () =>
              import('./features/admin/admin-dashboard.component').then(m => m.AdminDashboardComponent),
          },
          {
            path: 'users',
            loadComponent: () => import('./features/admin/admin-users.component').then(m => m.AdminUsersComponent),
          },
          {
            path: 'kyc',
            loadComponent: () =>
              import('./features/admin/admin-kyc-queue.component').then(m => m.AdminKycQueueComponent),
          },
          {
            path: 'committees',
            loadComponent: () =>
              import('./features/admin/admin-committees.component').then(m => m.AdminCommitteesComponent),
          },
          {
            path: 'fraud',
            loadComponent: () => import('./features/admin/admin-fraud.component').then(m => m.AdminFraudComponent),
          },
          {
            path: 'disputes',
            loadComponent: () => import('./features/admin/admin-disputes.component').then(m => m.AdminDisputesComponent),
          },
        ],
      },
      { path: 'dashboard', canActivate: [kycCompleteGuard], loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent) },
      {
        path: 'committees',
        canActivate: [kycCompleteGuard],
        children: [
          { path: '', loadComponent: () => import('./features/committees/committees-list.component').then(m => m.CommitteesListComponent) },
          {
            path: 'create',
            loadComponent: () =>
              import('./features/committees/committee-create.component').then(m => m.CommitteeCreateComponent),
          },
          {
            path: ':id',
            loadComponent: () =>
              import('./features/committees/committee-detail.component').then(m => m.CommitteeDetailComponent),
          },
        ],
      },
      {
        path: 'transactions',
        canActivate: [kycCompleteGuard],
        loadComponent: () =>
          import('./features/transactions/transactions.component').then(m => m.TransactionsComponent),
      },
      {
        path: 'trust-score',
        canActivate: [kycCompleteGuard],
        loadComponent: () => import('./features/trust-score/trust-score.component').then(m => m.TrustScoreComponent),
      },
      {
        path: 'analytics',
        canActivate: [kycCompleteGuard],
        loadComponent: () => import('./features/analytics/analytics.component').then(m => m.AnalyticsComponent),
      },
      {
        path: 'disputes',
        canActivate: [kycCompleteGuard],
        loadComponent: () => import('./features/disputes/disputes.component').then(m => m.DisputesComponent),
      },
      {
        path: 'settings',
        canActivate: [kycCompleteGuard],
        loadComponent: () => import('./features/settings/settings.component').then(m => m.SettingsComponent),
      },
      {
        path: 'notifications',
        canActivate: [kycCompleteGuard],
        loadComponent: () =>
          import('./features/notifications/notifications.component').then(m => m.NotificationsComponent),
      },
      {
        path: 'fraud-detection',
        canActivate: [kycCompleteGuard],
        loadComponent: () =>
          import('./features/fraud-detection/fraud-detection.component').then(m => m.FraudDetectionComponent),
      },
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
    ],
  },
  { path: '**', redirectTo: 'login' },
];
