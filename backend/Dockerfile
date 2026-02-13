# MeetBarter Backend Dockerfile
FROM node:20-slim AS builder

WORKDIR /app

# Install OpenSSL and other dependencies
RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies
RUN npm ci

# Copy source
COPY . .

# Generate Prisma Client before build
RUN npx prisma generate

# Build the application
RUN npm run build && ls -la && ls -la dist

# Production stage
FROM node:20-slim

WORKDIR /app

# Install OpenSSL
RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

# Copy package files and prisma schema
COPY package*.json ./
COPY prisma ./prisma/

# Install production dependencies only
RUN npm ci --only=production

# Copy built application from builder
COPY --from=builder /app/dist ./dist

# Generate Prisma Client
RUN npx prisma generate

# Expose port
EXPOSE 3001

# Start the application
# Note: In production we use prisma migrate deploy, but for local dev with docker-compose
# we might want to use db push if iterating fast, or migrate deploy for strictness.
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/src/main.js"]

