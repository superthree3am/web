FROM node:18-alpine

WORKDIR /app

# 1. Copy package file & install dependencies SEBAGAI ROOT (default user di Docker)
COPY package*.json ./
RUN npm install

# 2. Copy source code
COPY . .

# 3. Fix permission (penting!)
RUN chown -R node:node /app

# 4. Opsional: Build kalau memang ada build step (cth. React/Vue)
# RUN npm run build

# 5. Bersihkan cache (opsional, biasanya ini enggak harus, tapi boleh)
RUN rm -rf /app/node_modules/.cache

# 6. Pindah ke user 'node'
USER node

EXPOSE 5173
CMD ["npm", "run", "serve"]
