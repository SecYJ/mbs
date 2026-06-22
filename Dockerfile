FROM node:22-slim

WORKDIR /app

RUN apt-get update \
    && apt-get install -y --no-install-recommends ca-certificates git \
    && rm -rf /var/lib/apt/lists/*

RUN corepack enable \
    && corepack prepare pnpm@11.3.0 --activate \
    && chown node:node /app

USER node

COPY --chown=node:node . .

RUN pnpm install --no-frozen-lockfile

RUN DATABASE_URL=postgresql://username:password@localhost:5432/mbs pnpm build

ENV NODE_ENV=production
ENV HOST=0.0.0.0

EXPOSE 10000

CMD ["sh", "-c", "pnpm preview --host 0.0.0.0 --port ${PORT:-10000}"]
