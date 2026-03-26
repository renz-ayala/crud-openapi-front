FROM nginx:stable-alpine
LABEL authors="renz.ayala"

#RUN sed -i 's/listen  80;/listen 10111;/g' /etc/nginx/conf.d/default.conf

RUN rm -rf /usr/share/nginx/html/*
COPY ./dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

## ng build
## Remove-Item -Recurse -Force .\docker\dist\ -ErrorAction SilentlyContinue
## New-Item -ItemType Directory -Path .\docker\dist\
## Copy-Item -Recurse .\dist\consulta-reemplacamiento-ui\browser\* .\docker\dist\
## cd .\docker\
## docker container stop ui-placas
## docker build . -t placas/ui-placas:latest
## docker run -d --rm --name ui-placas -p 10111:80 placas/ui-placas:latest

