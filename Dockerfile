# Dockerfile for Synology NAS deployment
FROM node:21-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install ALL dependencies (including devDependencies for build)
RUN npm ci

# Copy prisma schema first
COPY prisma ./prisma

# Set DATABASE_URL for Prisma generation (build-time only)
ENV DATABASE_URL="file:./prisma/dev.db"

# Generate Prisma Client
RUN npx prisma generate

# Copy rest of application files
COPY . .

# Build Next.js application
RUN npm run build

# Production image
FROM node:21-alpine AS runner

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production

# Copy built application from builder
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/prisma ./prisma

# Create database directory
RUN mkdir -p /app/prisma

# Expose port
EXPOSE 3000

# Set environment variables
ENV NODE_ENV=production
ENV DATABASE_URL="file:./prisma/dev.db"

# Initialize database and start application
CMD npx prisma db push && npm start
