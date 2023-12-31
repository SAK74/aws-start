FROM node:18-alpine as base

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run build

FROM node:18-alpine
COPY --from=base /app/package.json ./
RUN npm i --omit=dev
COPY --from=base /app/dist ./dist
COPY  --from=base /app/prisma ./prisma

RUN npx prisma generate

EXPOSE ${PORT}

CMD [ "npm","run","start:migrate:prod" ]


