# MeetBarter Backend Dockerfile
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies
RUN npm ci

# Copy source
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

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
CMD ["sh", "-c", "npx prisma generate && node dist/main"]

