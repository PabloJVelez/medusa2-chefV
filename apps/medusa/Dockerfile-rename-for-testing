FROM node:20-alpine AS base

RUN apk update && apk add --no-cache libc6-compat

WORKDIR /app

FROM base AS builder

COPY . .

# Ensure package.json has the correct packageManager field
RUN node -e "const pkg = require('./package.json'); if (!pkg.packageManager) { pkg.packageManager = 'yarn@4.5.0'; require('fs').writeFileSync('./package.json', JSON.stringify(pkg, null, 2)); }"

RUN npx --yes turbo@2.1.2 prune --scope=medusa --docker

FROM base AS installer

COPY --from=builder /app/out/json/ .
COPY --from=builder /app/out/yarn.lock yarn.lock
COPY --from=builder /app/.yarnrc.yml .yarnrc.yml
COPY --from=builder /app/.yarn .yarn

RUN yarn install

COPY --from=builder /app/out/full/ .

RUN yarn turbo build --filter=medusa && \
    rm -rf node_modules/.cache .yarn/cache


FROM base AS runner

COPY --chown=node:node --from=installer /app/yarn.lock .
COPY --chown=node:node --from=installer /app/.yarnrc.yml .yarnrc.yml
COPY --chown=node:node --from=installer /app/.yarn .yarn
COPY --chown=node:node --from=installer /app/apps/medusa/.medusa/server /app/server
COPY --chown=node:node --from=installer /app/yarn.lock /app/server/yarn.lock

RUN cd /app/server && yarn workspaces focus --production

USER 1000

WORKDIR /app/server

ENV PORT=80

CMD ["yarn", "start:prod"]