FROM node:18-alpine as builder

WORKDIR /usr/src/app
COPY package.json tsconfig.json yarn.lock .yarnrc.yml ./
COPY tsconfig.json ./
RUN yarn install
COPY ./src ./src
COPY .env .env
RUN yarn build

EXPOSE 3123
CMD ["node", "dist/main.js"]
