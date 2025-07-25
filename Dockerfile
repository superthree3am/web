# Build Stage
FROM node:20-alpine AS build-stage
WORKDIR /app

COPY package*.json ./
RUN yarn install --frozen-lockfile
COPY . .

# Tambahkan ARG agar bisa diisi saat docker build
ARG VUE_APP_SERVICE_API
ENV VUE_APP_SERVICE_API=$VUE_APP_SERVICE_API

# Jalankan build, ENV VUE_APP_SERVICE_API akan di-inject oleh Vue CLI/Vite
RUN yarn build

# Production Stage - Node.js Serve Static
FROM node:20-alpine AS production-stage
WORKDIR /app

RUN yarn global add serve

COPY --from=build-stage /app/dist /app/dist

EXPOSE 8080

CMD ["serve", "-s", "dist", "-l", "8080"]
