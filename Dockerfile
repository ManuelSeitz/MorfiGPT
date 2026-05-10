FROM node:lts-slim AS base
RUN apt-get update && apt-get install -y git git-flow && \
    rm -rf /var/lib/apt/lists/*
RUN corepack enable
WORKDIR /app
COPY package.json pnpm-lock.yaml ./

FROM base AS development
RUN pnpm install
COPY . .
CMD ["sleep", "infinity"]

FROM base AS production
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm turbo run build --filter=api
CMD ["pnpm", "--filter", "api", "start"]