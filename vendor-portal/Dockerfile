# Build context must be the "vendor-portal" folder, e.g.:
#   docker build -t vendor-portal -f vendor-portal/Dockerfile vendor-portal/

FROM node:22-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Angular's SSR build bundles express and all other server-side deps directly
# into dist/vendor-portal/server/server.mjs, so the runtime image only needs
# Node itself plus that output folder — no node_modules required at runtime.
FROM node:22-alpine AS final
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=4000
EXPOSE 4000

COPY --from=build /app/dist/vendor-portal ./dist/vendor-portal
COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# Writes app-config.json from $API_BASE_URL (if set) before the server starts, so the
# browser gets the same value the SSR server itself reads directly from $API_BASE_URL
# (see AppConfigService) — keeping the server-rendered and hydrated client in sync.
ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["node", "dist/vendor-portal/server/server.mjs"]
