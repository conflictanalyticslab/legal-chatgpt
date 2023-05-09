FROM node:18.16.0-slim

RUN mkdir -p /usr/src/app

WORKDIR /usr/src/app

COPY * /usr/src/app/

RUN npm install --legacy-peer-deps

EXPOSE 3000

CMD [ "npm", "start" ]