# Multi-stage build for the Agentic AI Navigator static SPA.
# Stage 1 builds the Vite production bundle.
# Stage 2 serves it with a small nginx image.

FROM node:22.12-alpine AS build
WORKDIR /app

ENV NODE_ENV=production \
    NPM_CONFIG_AUDIT=false \
    NPM_CONFIG_FUND=false

COPY package.json package-lock.json ./
RUN npm ci --omit=optional

COPY . .
RUN npm run build


FROM nginx:1.27-alpine AS runtime

# SPA fallback: any path returns index.html so client-side navigation works.
RUN printf 'server {\n\
  listen 8080;\n\
  server_name _;\n\
  root /usr/share/nginx/html;\n\
  index index.html;\n\
  location /assets/ {\n\
    expires 1y;\n\
    add_header Cache-Control "public, max-age=31536000, immutable";\n\
  }\n\
  location / {\n\
    try_files $uri /index.html;\n\
  }\n\
}\n' > /etc/nginx/conf.d/default.conf \
  && rm -f /etc/nginx/conf.d/default.conf.bak

COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -qO- http://127.0.0.1:8080/ >/dev/null || exit 1

CMD ["nginx", "-g", "daemon off;"]
