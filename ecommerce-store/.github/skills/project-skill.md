# E-commerce Angular Store Skill

## Project overview
This workspace contains a standalone Angular 19+ storefront app built with modern UI architecture and Angular Signals.

## Key architecture decisions
- Use Angular Signals for component and global state management instead of NgRx or RxJS behavior subjects.
- Keep the app modular with standalone components and route-based detail views.
- Prefer a clean, responsive UI with Tailwind-style spacing and minimal visual language.

## Important files
- src/app/services/product-signal.service.ts: global signal-driven state for category, search, products, and derived filtered results.
- src/app/components/search-bar/search-bar.component.ts: updates the global search signal from user input.
- src/app/components/category-sidebar/category-sidebar.component.ts: updates the active category signal.
- src/app/components/product-catalog/product-catalog.component.ts: renders the filtered product list with loading skeletons.
- src/app/components/product-detail/product-detail.component.ts: displays a selected product via route params.

## Development notes
- The app uses standalone components and route configuration from src/app/app.routes.ts.
- Product filtering is derived via computed signals rather than imperative state mutations.
- Build verification command: npm run build

## Future guidance
When extending this project, preserve the signal-driven flow and keep feature work modular and standalone.
