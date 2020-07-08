FROM node:10-alpine

RUN apk update \
  && apk add git

USER node:node
WORKDIR /usr/src/app

COPY --chown=node:node package.json /usr/src/app
RUN npm install
COPY --chown=node:node . /usr/src/app
ARG ROOT_LANG

RUN  npm run production \
  && npm prune --production

EXPOSE 3000

CMD ["node", "server"]
