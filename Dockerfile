FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN sudo npm install && chown -R node:node /app

COPY . .

# (Opsional) Jalankan build, kalau memang ada proses build
# RUN npm run build

# Bersihkan cache build agar image lebih kecil dan tidak error permission
RUN rm -rf /app/node_modules/.cache


EXPOSE 5173
CMD ["npm", "run", "serve"]
