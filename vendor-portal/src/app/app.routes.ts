import { Routes } from '@angular/router';
import { AppShellComponent } from './layout/app-shell.component';
import { authGuard, billingAccessGuard, homeGuard, roleGuard } from './shared/services/auth/auth.guard';

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
    path: 'superadmin/setup',
    loadComponent: () => import('./superadmin/setup/superadmin-setup.component').then((m) => m.SuperAdminSetupComponent),
  },
  {
    path: '',
    component: AppShellComponent,
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        canActivate: [roleGuard(['ShopAdmin', 'ShopUser'])],
        loadComponent: () => import('./dashboard/dashboard.component').then((m) => m.DashboardComponent),
      },
      {
        path: 'products',
        canActivate: [roleGuard(['ShopAdmin', 'ShopUser'])],
        loadComponent: () => import('./products/product-list/product-list.component').then((m) => m.ProductListComponent),
      },
      {
        path: 'products/new',
        canActivate: [roleGuard(['ShopAdmin'])],
        loadComponent: () => import('./products/product-form/product-form.component').then((m) => m.ProductFormComponent),
      },
      {
        path: 'products/:id/edit',
        canActivate: [roleGuard(['ShopAdmin'])],
        loadComponent: () => import('./products/product-form/product-form.component').then((m) => m.ProductFormComponent),
      },
      {
        path: 'billing',
        canActivate: [roleGuard(['ShopAdmin', 'ShopUser']), billingAccessGuard],
        loadComponent: () => import('./billing/billing-page/billing-page.component').then((m) => m.BillingPageComponent),
      },
      {
        path: 'settings/vendor-details',
        canActivate: [roleGuard(['ShopAdmin'])],
        loadComponent: () => import('./settings/vendor-details/vendor-details.component').then((m) => m.VendorDetailsComponent),
      },
      {
        path: 'settings/users',
        canActivate: [roleGuard(['ShopAdmin'])],
        loadComponent: () => import('./settings/shop-users/shop-user-list.component').then((m) => m.ShopUserListComponent),
      },
      {
        path: 'customers',
        canActivate: [roleGuard(['ShopAdmin'])],
        loadComponent: () => import('./customers/customer-list/customer-list.component').then((m) => m.CustomerListComponent),
      },
      {
        path: 'settings/invoices',
        canActivate: [roleGuard(['ShopAdmin'])],
        loadComponent: () => import('./invoices/invoice-list/invoice-list.component').then((m) => m.InvoiceListComponent),
      },
      {
        path: 'settings/sales-report',
        canActivate: [roleGuard(['ShopAdmin'])],
        loadComponent: () => import('./settings/sales-report/sales-report.component').then((m) => m.SalesReportComponent),
      },
      {
        path: 'superadmin/shops',
        canActivate: [roleGuard(['SuperAdmin'])],
        loadComponent: () => import('./superadmin/shop-list/shop-list.component').then((m) => m.ShopListComponent),
      },
      {
        path: 'superadmin/shops/:vendorId',
        canActivate: [roleGuard(['SuperAdmin'])],
        loadComponent: () => import('./superadmin/shop-detail/shop-detail.component').then((m) => m.ShopDetailComponent),
      },
      { path: '', canActivate: [homeGuard], children: [] },
    ],
  },
  { path: '**', redirectTo: '/login' },
];
