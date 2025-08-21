# ---- base ----
FROM node:22-alpine AS base
RUN apk add --no-cache libc6-compat bash && corepack enable
WORKDIR /app

# ---- prune to medusa workspace ----
FROM base AS prune
COPY . .
# Use explicit turbo version so the step always has turbo
RUN npx --yes turbo@2.1.2 prune --scope=medusa --docker

# ---- install in pruned workspace ----
FROM base AS install
COPY --from=prune /app/out/yarn.lock ./yarn.lock
COPY --from=prune /app/out/.yarnrc.yml ./.yarnrc.yml
COPY --from=prune /app/out/.yarn ./.yarn
COPY --from=prune /app/out/json/ .
RUN yarn install --immutable

# ---- build the medusa app (standalone) ----
FROM install AS build
COPY --from=prune /app/out/full/ .
WORKDIR /app/apps/medusa

# Helpful logs + robust CLI fallback
RUN set -euxo pipefail \
  && node -v && yarn -v \
  && (node -e "require.resolve('@medusajs/cli/package.json')" \
      && echo 'Medusa CLI found in deps' \
      || echo 'Medusa CLI not found; will use npx fallback') \
  && (yarn build:standalone \
      || (echo 'yarn build:standalone failed; trying npx @medusajs/cli build' \
          && npx --yes @medusajs/cli@latest build \
          && cd .medusa/server \
          && yarn install --immutable))

# ---- runtime ----
FROM node:22-alpine AS runner
RUN apk add --no-cache libc6-compat bash && corepack enable
WORKDIR /app
COPY --from=build /app ./

ENV NODE_ENV=production \
    HOST=0.0.0.0 \
    PORT=9000

EXPOSE 9000
# run DB migrations, then launch compiled server
CMD ["bash","-lc","cd apps/medusa && yarn predeploy && yarn start:standalone"]
