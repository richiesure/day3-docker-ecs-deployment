# Use official Node.js runtime as base image
FROM node:18-alpine

# Set working directory in container
WORKDIR /usr/src/app

# Copy package.json first (for better caching)
COPY package.json ./

# Install dependencies (if any were needed)
# RUN npm install

# Copy application source code
COPY server.js ./

# Expose port 3000
EXPOSE 3000

# Set environment variables
ENV PORT=3000
ENV APP_VERSION=1.0.0

# Run the application
CMD ["node", "server.js"]

# Add healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"
