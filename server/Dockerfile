FROM node:7-alpine

RUN mkdir -p /usr/src/

COPY . /usr/src/app

WORKDIR /usr/src/app

RUN apk add --no-cache \
  cairo pango jpeg giflib libpng freetype \
  python pkgconfig make g++ cairo-dev jpeg-dev giflib-dev && \
  npm install --production && \
  apk del --purge python pkgconfig make g++ cairo-dev jpeg-dev giflib-dev

EXPOSE 8080

ENTRYPOINT ["node", "index.js"]
