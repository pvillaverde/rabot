FROM denoland/deno:alpine
LABEL MAINTAINER="Pablo Villaverde <https://github.com/pvillaverde>"

# build app directory and cache dependencies
WORKDIR /opt/rabot
COPY ./src/deps.ts /opt/rabot/src/
RUN deno cache ./src/deps.ts
## Now we copy our App source code, having the dependencies previously cached if possible.
ADD . /opt/rabot/
RUN deno cache ./src/main.ts

HEALTHCHECK --interval=10s --timeout=3s --start-period=30s \
      CMD deno task healthcheck

ENTRYPOINT /opt/rabot/entrypoint.sh