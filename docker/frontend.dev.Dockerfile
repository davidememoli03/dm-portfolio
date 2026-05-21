FROM node:22-alpine

WORKDIR /app

ENV CHOKIDAR_USEPOLLING=true

COPY package.json package-lock.json* ./
RUN npm install

COPY . .

EXPOSE 4200

CMD ["npm", "run", "start:docker"]
