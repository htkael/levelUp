FROM node:20-alpine

RUN apk upgrade --no-cache
RUN apk add openssl

WORKDIR /usr/src/app

EXPOSE 5678

COPY ./reaper/package.json ./

RUN npm install -D

COPY ./reaper ./

CMD ["sh", "/usr/src/app/setup.sh"]
