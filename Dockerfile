# Dockerfile for Synology NAS deployment
FROM node:21-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application files
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Build Next.js application
RUN npm run build

# Create database directory
RUN mkdir -p /app/prisma

# Expose port
EXPOSE 3000

# Set environment variables
ENV NODE_ENV=production
ENV DATABASE_URL="file:./prisma/dev.db"

# Initialize database and start application
CMD npx prisma db push && npm start
