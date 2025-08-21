# ---- base ----
FROM node:22-alpine AS base
RUN apk add --no-cache libc6-compat bash
WORKDIR /app
RUN corepack enable

# ---- prune to medusa workspace (faster builds) ----
FROM base AS prune
COPY . .
RUN npx --yes turbo@2.1.2 prune --scope=medusa --docker

# ---- install deps in pruned workspace ----
FROM base AS install
COPY --from=prune /app/out/yarn.lock ./yarn.lock
COPY --from=prune /app/out/.yarnrc.yml ./.yarnrc.yml
COPY --from=prune /app/out/.yarn ./.yarn
COPY --from=prune /app/out/json/ .
RUN yarn install --immutable

# ---- build only what's needed for medusa ----
FROM install AS build
COPY --from=prune /app/out/full/ .
RUN yarn turbo run build --filter=medusa

# ---- runtime ----
FROM node:22-alpine AS runner
RUN apk add --no-cache libc6-compat bash && corepack enable
WORKDIR /app
# bring the built app + pruned workspace
COPY --from=build /app ./
ENV NODE_ENV=production
EXPOSE 9000
# Railway injects $PORT; Medusa reads PORT/HOST from env
CMD ["bash","-lc","cd apps/medusa && yarn predeploy && yarn start:prod"]
