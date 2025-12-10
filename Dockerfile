# Stage 1 with react app
FROM registry1.dso.mil/ironbank/opensource/nodejs/nodejs16:17.0.1 AS builder

USER root

WORKDIR /app

COPY ./package.json ./

COPY ./package-lock.json ./

COPY . .

RUN npm run build

USER node

# Stage 2 with nginx
FROM registry1.dso.mil/ironbank/opensource/nginx/nginx:1.27.2

COPY ./nginx.conf /etc/nginx/nginx.conf

COPY ./ndk_http_module.so ./ngx_http_set_misc_module.so /etc/nginx/modules/

USER nginx

COPY --from=builder --chown=nginx:nginx /app/public /var/www

COPY --from=builder --chown=nginx:nginx /app/build /var/www

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]