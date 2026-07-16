# Stage 1: Build Next.js static files
FROM node:20-alpine AS builder
WORKDIR /app

# Copy package configs
COPY package.json package-lock.json ./
RUN npm ci

# Copy codebase
COPY . .

# Build the Next.js application (generates the static 'out/' folder)
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# Stage 2: Serve static files with Nginx
FROM nginx:stable-alpine AS runner
WORKDIR /usr/share/nginx/html

# Clean default nginx public files
RUN rm -rf ./*

# Copy build files from builder stage
COPY --from=builder /app/out ./

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 3000

CMD ["nginx", "-g", "daemon off;"]
