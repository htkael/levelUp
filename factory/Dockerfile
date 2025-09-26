FROM node:20-alpine

RUN apk upgrade --no-cache
RUN apk add openssl

WORKDIR /usr/src/app

EXPOSE 5678

COPY ./factory/package.json ./

RUN npm install -D

COPY ./factory ./

CMD ["sh", "/usr/src/app/setup.sh"]
