# --- Build stage ---
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
# Vite bakes VITE_* vars in at build time
ARG VITE_AUTH_API_URL
ARG VITE_BUSINESS_API_URL
ENV VITE_AUTH_API_URL=$VITE_AUTH_API_URL
ENV VITE_BUSINESS_API_URL=$VITE_BUSINESS_API_URL
RUN npm run build

# --- Runtime stage ---
FROM nginx:1.27-alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.spa.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
