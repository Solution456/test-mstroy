FROM node:22-alpine AS base

WORKDIR /app

FROM base AS builder

RUN npm i -g corepack@latest && corepack enable

RUN apk update
RUN apk add git --no-cache

COPY package.json ./
COPY pnpm-lock.yaml ./
RUN pnpm i --frozen-lockfile --ignore-scripts

FROM base AS development
RUN npm i -g corepack@latest && corepack enable

COPY --from=builder /app/node_modules ./node_modules

COPY . .

RUN chown -R node:node /app

USER node

EXPOSE 5173


CMD ["pnpm", "dev", "--host", "--port", "5173"]
