# 1. Aşama: Build (Node.js kullanarak React uygulamasını derle)
FROM node:20-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# 2. Aşama: Production (Nginx ile sun)
FROM nginx:alpine
# Build aşamasından çıkan dosyaları Nginx'in html klasörüne kopyala
COPY --from=build /app/dist /usr/share/nginx/html
# Oluşturduğumuz nginx.conf dosyasını yerine koy
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]