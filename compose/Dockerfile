# Build stage
FROM node:22-alpine AS builder

ENV NODE_ENV=production

# Install OpenSSL
RUN apk add --no-cache openssl

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json pnpm-workspace.yaml ./

# Enable pnpm and install dependencies
RUN corepack enable && \
    corepack prepare pnpm@latest --activate && \
    pnpm install

# Copy source code
COPY . .

# Generate Prisma client and build application
RUN pnpm prisma:generate && \
    pnpm build

# Production stage
FROM node:22-alpine AS production

ENV NODE_ENV=production

# Install OpenSSL
RUN apk add --no-cache openssl

WORKDIR /app

# Copy package files
COPY package.json pnpm-workspace.yaml ./

# Enable pnpm and install only production dependencies
RUN corepack enable && \
    corepack prepare pnpm@latest --activate && \
    pnpm install --prod

# # Copy Prisma schema and client

# Copy builtin files
COPY --from=builder /app/dist /app/

COPY --from=builder /app/src/shared/infrastructure/database/prisma/schema.prisma ./src/shared/infrastructure/database/prisma/
COPY --from=builder /app/src/shared/infrastructure/database/prisma/generated/prisma-client ./src/shared/infrastructure/database/prisma/generated/prisma-client

# Copy built assets
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/.env ./dist/.env

# Expose port
EXPOSE 8080

# Start application
CMD ["node", "dist/src/server.js"]
