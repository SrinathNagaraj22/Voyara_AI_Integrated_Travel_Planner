# syntax=docker/dockerfile:1.7
#
# Multi-stage: Vite build with Node, serve static assets with nginx.
# Listens on :8080 inside the container; the outer nginx (server/nginx)
# fronts it on :80.

# ---------- builder ----------
FROM node:20-bookworm-slim AS builder

WORKDIR /app

COPY package.json package-lock.json* ./
RUN --mount=type=cache,target=/root/.npm npm install --no-audit --no-fund

COPY . .

# VITE_GOOGLE_CLIENT_ID is baked into the bundle at build time.
# Override at build with: --build-arg VITE_GOOGLE_CLIENT_ID=...
ARG VITE_GOOGLE_CLIENT_ID=""
ENV VITE_GOOGLE_CLIENT_ID=${VITE_GOOGLE_CLIENT_ID}

RUN npm run build

# ---------- runtime ----------
FROM nginx:1.27-alpine AS runtime

COPY --from=builder /app/dist /usr/share/nginx/html

# SPA fallback + simple asset caching. The outer nginx terminates HTTP
# from the public network and proxies here, so this layer only needs
# to serve static files.
RUN printf '%s\n' \
    'server {' \
    '  listen 8080;' \
    '  server_name _;' \
    '  root /usr/share/nginx/html;' \
    '  index index.html;' \
    '  location / {' \
    '    try_files $uri $uri/ /index.html;' \
    '  }' \
    '  location ~* \.(?:js|css|woff2?|ttf|eot|svg|png|jpe?g|gif|webp|ico)$ {' \
    '    expires 7d;' \
    '    add_header Cache-Control "public, max-age=604800, immutable";' \
    '  }' \
    '  location = /index.html {' \
    '    add_header Cache-Control "no-cache, no-store, must-revalidate";' \
    '  }' \
    '}' > /etc/nginx/conf.d/default.conf

# Drop privileges: nginx:alpine runs as root by default to bind :80;
# we listen on :8080 and run as the nginx user.
RUN chown -R nginx:nginx /usr/share/nginx/html /var/cache/nginx /var/log/nginx /etc/nginx/conf.d \
    && touch /var/run/nginx.pid \
    && chown nginx:nginx /var/run/nginx.pid

USER nginx
EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
    CMD wget -qO- http://127.0.0.1:8080/ >/dev/null || exit 1

CMD ["nginx", "-g", "daemon off;"]
