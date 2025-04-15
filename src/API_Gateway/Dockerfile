FROM node:18.20-slim

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm install

COPY . .

EXPOSE 5555

CMD ["npm", "start"]