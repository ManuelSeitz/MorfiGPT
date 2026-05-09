FROM node:lts-slim

RUN corepack enable

WORKDIR /app

COPY . .

RUN pnpm install --frozen-lockfile
RUN pnpm turbo run build --filter=api

CMD ["pnpm", "--filter", "api", "start"]