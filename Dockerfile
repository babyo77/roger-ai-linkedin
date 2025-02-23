# Use Playwright base image with Node.js
FROM mcr.microsoft.com/playwright:v1.50.1-jammy

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy TypeScript config and source code
COPY tsconfig.json ./
COPY src/ ./src/

# Build the TypeScript code
RUN npm run build

# Expose the port your application uses (matches your index.ts)
EXPOSE 9000

# Start the application using the compiled JavaScript
CMD ["node", "dist/index.js"]
