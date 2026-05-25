# Build stage
FROM node:22-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY angular.json tsconfig.json .postcssrc.json ./
COPY projects ./projects

RUN npm run build:lib && npm run build:admin

# Production stage
FROM nginx:1.27-alpine

COPY docker/admin.nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist/admin-app/browser /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
