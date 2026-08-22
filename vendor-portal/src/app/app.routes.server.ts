import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: 'login',
    renderMode: RenderMode.Prerender,
  },
  {
    path: 'signup',
    renderMode: RenderMode.Prerender,
  },
  {
    path: 'forgot-password',
    renderMode: RenderMode.Prerender,
  },
  // Everything below depends on the auth session, which lives in the
  // browser's localStorage. SSR/prerendering has no access to it, so
  // building these server-side would bake in a logged-out redirect
  // that gets served on every hard refresh regardless of real login
  // state. Render them client-side only, where the real session is visible.
  {
    path: 'dashboard',
    renderMode: RenderMode.Client,
  },
  {
    path: 'products',
    renderMode: RenderMode.Client,
  },
  {
    path: 'products/new',
    renderMode: RenderMode.Client,
  },
  {
    path: 'products/:id/edit',
    renderMode: RenderMode.Client,
  },
  {
    path: 'billing',
    renderMode: RenderMode.Client,
  },
  {
    path: 'settings/vendor-details',
    renderMode: RenderMode.Client,
  },
  {
    path: 'customers',
    renderMode: RenderMode.Client,
  },
  {
    path: 'settings/invoices',
    renderMode: RenderMode.Client,
  },
  {
    path: '**',
    renderMode: RenderMode.Prerender,
  },
];
