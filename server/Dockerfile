FROM node:20-alpine
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install --omit=dev --legacy-peer-deps --no-audit --no-fund

# Copy source
COPY . .

# Expose port
EXPOSE 4000

# Start application
CMD ["npm", "start"]
