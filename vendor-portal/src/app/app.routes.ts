import { Routes } from '@angular/router';
import { AppShellComponent } from './layout/app-shell.component';
import { authGuard } from './shared/services/auth/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () => import('./auth/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'signup',
    loadComponent: () => import('./auth/signup/signup.component').then((m) => m.SignupComponent),
  },
  {
    path: 'forgot-password',
    loadComponent: () => import('./auth/forgot-password/forgot-password.component').then((m) => m.ForgotPasswordComponent),
  },
  {
    path: '',
    component: AppShellComponent,
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./dashboard/dashboard.component').then((m) => m.DashboardComponent),
      },
      {
        path: 'products',
        loadComponent: () => import('./products/product-list/product-list.component').then((m) => m.ProductListComponent),
      },
      {
        path: 'products/new',
        loadComponent: () => import('./products/product-form/product-form.component').then((m) => m.ProductFormComponent),
      },
      {
        path: 'products/:id/edit',
        loadComponent: () => import('./products/product-form/product-form.component').then((m) => m.ProductFormComponent),
      },
      {
        path: 'billing',
        loadComponent: () => import('./billing/billing-page/billing-page.component').then((m) => m.BillingPageComponent),
      },
      {
        path: 'settings/vendor-details',
        loadComponent: () => import('./settings/vendor-details/vendor-details.component').then((m) => m.VendorDetailsComponent),
      },
      {
        path: 'customers',
        loadComponent: () => import('./customers/customer-list/customer-list.component').then((m) => m.CustomerListComponent),
      },
      {
        path: 'settings/invoices',
        loadComponent: () => import('./invoices/invoice-list/invoice-list.component').then((m) => m.InvoiceListComponent),
      },
      { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
    ],
  },
  { path: '**', redirectTo: '/login' },
];
