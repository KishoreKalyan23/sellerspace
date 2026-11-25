import { envOverrides } from './env.generated';

// Production settings, used by `ng build` (the default production configuration).
// Values set in vendor-portal/.env override these (see scripts/load-env.mjs).
// On Render/Docker, setting the API_BASE_URL environment variable also overrides apiBaseUrl at
// runtime without rebuilding (see docker-entrypoint.sh and AppConfigService).
export const environment = {
  production: true,
  apiBaseUrl: 'https://your-api.onrender.com',
  ...envOverrides,
};
