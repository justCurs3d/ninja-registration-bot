FROM node:20.11.0

WORKDIR /app


COPY package.json package-lock.json* ./

RUN npm ci
RUN npm i -g supervisor
RUN npm i -g cross-env

COPY . .

RUN npm run build