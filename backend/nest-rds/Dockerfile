FROM node:18-alpine as base

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

ENV NODE_ENV=production
RUN npm run build

FROM node:18-alpine as preprod
COPY --from=base /app/package*.json ./
RUN npm ci --omit=dev
# COPY --from=base /app/dist ./dist
COPY  --from=base /app/prisma ./prisma

RUN npx prisma generate

FROM node:18-alpine
COPY --from=preprod /node_modules ./node_modules
COPY --from=base /app/dist ./dist

EXPOSE ${PORT}

CMD [ "node","dist/main" ]


