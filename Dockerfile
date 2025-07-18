# Build Stage
FROM node:20-alpine AS build-stage
WORKDIR /app
COPY package*.json ./
RUN yarn install --frozen-lockfile
COPY . .
# Set environment variable VUE_APP_SERVICE_API pada saat build
ENV VUE_APP_SERVICE_API=
RUN yarn build

# Production Stage
FROM nginx:alpine AS production-stage
COPY --from=build-stage /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]