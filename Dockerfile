FROM node:lts-slim

RUN apt-get update && \
    apt-get install -y git git-flow && \
    rm -rf /var/lib/apt/lists/*

RUN corepack enable

ENV PNPM_HOME="/home/node/.local/share/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN mkdir -p /app && chown -R node:node /app

WORKDIR /app

RUN pnpm add turbo @nestjs/cli --global

EXPOSE 3000 8080