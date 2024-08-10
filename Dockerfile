FROM node:18.20.2-alpine

WORKDIR /app

COPY package.json ./

RUN npm config set registry https://registry.npmjs.org/

RUN npm install

COPY . .

RUN npx prisma generate
RUN npm run build

CMD [  "npm", "run", "start:migrate:prod" ]