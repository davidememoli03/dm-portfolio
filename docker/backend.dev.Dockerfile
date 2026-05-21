FROM node:22-alpine

WORKDIR /app

COPY package.json ./
RUN npm install

COPY src ./src
COPY data ./data

ENV NODE_ENV=development
ENV PORT=3000

EXPOSE 3000

CMD ["npm", "run", "dev"]
