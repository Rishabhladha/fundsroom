# Stage 1: Build React Vite app
FROM node:20-alpine AS builder

WORKDIR /app

# Accept build arguments for environment variables if needed
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

COPY package*.json ./
RUN npm ci
  
COPY . .
RUN npm run build

# Stage 2: Serve static files with Nginx
FROM nginx:alpine AS runner

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
