FROM denoland/deno:alpine-1.42.4
LABEL MAINTAINER="Pablo Villaverde <https://github.com/pvillaverde>"

# build app directory and cache dependencies
WORKDIR /opt/rabot
COPY ./src/deps.ts /opt/rabot/src/
COPY ./deno.json /opt/rabot/
COPY ./import_map.json /opt/rabot/
RUN deno cache --import-map=./import_map.json  ./src/deps.ts
## Now we copy our App source code, having the dependencies previously cached if possible.
ADD . /opt/rabot/
RUN deno cache --import-map=./import_map.json  ./src/main.ts

HEALTHCHECK --interval=60s --timeout=10s --start-period=900s \
   CMD deno task healthcheck


ENTRYPOINT /opt/rabot/entrypoint.sh