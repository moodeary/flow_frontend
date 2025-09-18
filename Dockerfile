# Vue.js 애플리케이션 빌드
FROM node:20-alpine AS build

# Enable pnpm
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile --prod=false

# Copy source code
COPY . .

# Build the application
RUN pnpm run build

# Production stage - 간단한 정적 파일 서빙
FROM nginx:1.24-alpine

# Install curl for health check
RUN apk add --no-cache curl

# Copy built files from build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Create simple nginx config for static serving
RUN echo 'server { \
    listen 80; \
    server_name localhost; \
    root /usr/share/nginx/html; \
    index index.html; \
    location / { \
        try_files $uri $uri/ /index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost/ || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]