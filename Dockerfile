# ─── Stage 1: Build ───────────────────────────────────────────────────────────
FROM node:20-alpine AS build

RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .

ARG VITE_API_BASE_URL
ARG VITE_TELEGRAM_BOT_TOKEN
ARG VITE_TELEGRAM_CHAT_ID
ARG VITE_INSTAGRAM_BUSINESS_ACCOUNT_ID
ARG VITE_INSTAGRAM_ACCESS_TOKEN

# Override .env with build args so Vite picks them up
RUN printf "VITE_API_BASE_URL=%s\nVITE_TELEGRAM_BOT_TOKEN=%s\nVITE_TELEGRAM_CHAT_ID=%s\nVITE_INSTAGRAM_BUSINESS_ACCOUNT_ID=%s\nVITE_INSTAGRAM_ACCESS_TOKEN=%s\n" \
  "$VITE_API_BASE_URL" "$VITE_TELEGRAM_BOT_TOKEN" "$VITE_TELEGRAM_CHAT_ID" "$VITE_INSTAGRAM_BUSINESS_ACCOUNT_ID" "$VITE_INSTAGRAM_ACCESS_TOKEN" > .env

RUN pnpm vite build

# ─── Stage 2: Serve ──────────────────────────────────────────────────────────
FROM nginx:alpine AS runtime

COPY --from=build /app/dist /usr/share/nginx/html

RUN printf 'server {\n\
    listen 80;\n\
    server_name _;\n\
    root /usr/share/nginx/html;\n\
    index index.html;\n\
\n\
    location / {\n\
        try_files $uri $uri/ /index.html;\n\
    }\n\
\n\
    location ~* \\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {\n\
        expires 1y;\n\
        add_header Cache-Control "public, immutable";\n\
    }\n\
}\n' > /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
