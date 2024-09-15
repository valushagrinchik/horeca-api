FROM node:22

WORKDIR /app

RUN npm install -g pnpm

COPY . .

RUN pnpm install 

RUN pnpm exec npx prisma generate
RUN pnpm build

CMD [ "pnpm", "start:migrate:prod" ]