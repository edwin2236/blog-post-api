
# Build stage
FROM node:22-alpine AS builder

# Set working directory
WORKDIR /base

# Copy package files
COPY package.json ./

# enable pnpm and install dependencies
RUN corepack enable && \
    corepack prepare pnpm@latest --activate && \
    pnpm install

# Copy source code
COPY . .

# Build application
RUN pnpm build

# Production stage
FROM node:22-alpine AS production

WORKDIR /app

# Copy package files
COPY package.json ./

# # Enable pnpm and install only production dependencies
RUN corepack enable && \
    corepack prepare pnpm@latest --activate && \
    pnpm install --production

# Copy built assets from builder stage
COPY --from=builder /base/dist ./dist
COPY --from=builder /base/.env ./.env

# Expose port
EXPOSE 8080

# Start application
CMD ["pnpm", "start"]
