FROM node:lts-slim

RUN corepack enable

WORKDIR /app

USER node