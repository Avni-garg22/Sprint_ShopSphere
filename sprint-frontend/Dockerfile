FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install -g npm@11.6.2
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:1.27-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist/sprint-frontend/browser /usr/share/nginx/html
EXPOSE 80
