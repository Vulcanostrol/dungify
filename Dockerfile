FROM node:18-alpine AS base

WORKDIR /app

COPY package*.json ./

RUN npm install --save-dev; \
    npx tailwindcss init -p

COPY . .

EXPOSE 3000

CMD npm run dev