# Build context must be the "ecommerce-store" folder, e.g.:
#   docker build -t ecommerce-store -f ecommerce-store/Dockerfile ecommerce-store/

FROM node:22-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# ecommerce-store has no SSR (no @angular/ssr / express dependency), so the
# build is just static files — serve them with nginx instead of Node.
FROM nginx:1.27-alpine AS final
COPY --from=build /app/dist/ecommerce-store/browser /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
