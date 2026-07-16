# Stage 1: Build the TypeScript backend
FROM node:20-alpine AS builder
WORKDIR /app

# Copy package config
COPY package.json package-lock.json ./
RUN npm ci

# Copy source code and compilation config
COPY tsconfig.json ./
COPY src/ ./src/

# Compile TypeScript
RUN npm run build

# Stage 2: Runtime image (production environment)
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# Copy package config and install only production dependencies
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Copy compiled JavaScript from builder stage
COPY --from=builder /app/dist ./dist

# Adjust ownership of files to non-root node user
RUN chown -R node:node /app

USER node

EXPOSE 5000

CMD ["node", "dist/index.js"]
