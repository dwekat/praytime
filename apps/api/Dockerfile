FROM oven/bun:1 AS install
WORKDIR /app
COPY package.json bun.lock turbo.json ./
COPY packages/moonsighting/package.json packages/moonsighting/package.json
COPY packages/prayer-times/package.json packages/prayer-times/package.json
COPY apps/api/package.json apps/api/package.json
RUN bun install --frozen-lockfile

FROM install AS build
COPY tsconfig.base.json ./
COPY packages/ packages/
COPY apps/api/ apps/api/
RUN bun run build

FROM oven/bun:1-slim AS runtime
WORKDIR /app
RUN addgroup --system --gid 1001 app && \
    adduser --system --uid 1001 --ingroup app app
COPY --from=build --chown=app:app /app/apps/api/dist ./dist
COPY --from=build --chown=app:app /app/node_modules ./node_modules
COPY --from=build --chown=app:app /app/apps/api/package.json ./
USER app
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=3s CMD curl -f http://localhost:3000/health || exit 1
CMD ["bun", "run", "dist/index.js"]
