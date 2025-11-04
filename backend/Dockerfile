# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Production stage
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm install --only=production && npm cache clean --force

# Copy built files from builder
COPY --from=builder /app/dist ./dist

# Copy migration files if needed
COPY --from=builder /app/src/db/migrations ./src/db/migrations

EXPOSE 3000

USER node

CMD ["node", "dist/index.js"]

