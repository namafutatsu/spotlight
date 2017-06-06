FROM alpine:3.5

RUN apk add --no-cache --upgrade nginx && \
    chown -R nginx:www-data /var/lib/nginx

# CF. https://github.com/gliderlabs/docker-alpine/issues/185 because
# alpine package maintainers are teapots
RUN mkdir -p /run/nginx

COPY nginx.conf /etc/nginx/nginx.conf
COPY index.html settings.js spotlight.js /var/www/

CMD echo "window.SPOTLIGHT_WS_URL = '$SPOTLIGHT_WS_URL';" > /var/www/settings.js && \
  nginx
