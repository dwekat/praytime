FROM oven/bun:1 AS install
WORKDIR /app
COPY package.json bun.lock turbo.json ./
COPY apps/web/package.json apps/web/package.json
RUN bun install --frozen-lockfile --ignore-scripts

FROM install AS build
COPY tsconfig.base.json ./
COPY apps/web/ apps/web/
RUN bun run --filter web build

FROM oven/bun:1-slim AS runtime
WORKDIR /app
COPY --from=build --chown=bun:bun /app/apps/web/dist ./dist
COPY --from=build --chown=bun:bun /app/node_modules ./node_modules
COPY --from=build --chown=bun:bun /app/apps/web/package.json ./
USER bun
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=3s CMD bun -e "fetch('http://localhost:3000/health').then(r=>{if(!r.ok)process.exit(1)}).catch(()=>process.exit(1))"
CMD ["bun", "run", "dist/index.js"]
