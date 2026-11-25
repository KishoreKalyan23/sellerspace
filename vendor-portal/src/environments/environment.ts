import { envOverrides } from './env.generated';

// Development settings, used by `ng serve`, `ng build --configuration development` and unit tests.
// `ng build` (production) swaps this file for environment.prod.ts — see fileReplacements in angular.json.
// Values set in vendor-portal/.env override these (see scripts/load-env.mjs).
export const environment = {
  production: false,
  apiBaseUrl: 'https://localhost:55142',
  ...envOverrides,
};
