FROM node:18

WORKDIR /app

COPY package*.json ./

RUN npm config set registry https://registry.npmjs.org/

RUN npm ci

COPY . .

RUN npx prisma generate
RUN npm run build

CMD [  "npm", "run", "start:migrate:prod" ]