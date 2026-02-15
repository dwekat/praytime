FROM oven/bun:1 AS prune
WORKDIR /app
RUN bunx -y turbo@latest --version
COPY . .
RUN bunx turbo prune api --docker

FROM oven/bun:1 AS install
WORKDIR /app
COPY --from=prune /app/out/json/ .
RUN bun install --frozen-lockfile --ignore-scripts

FROM install AS build
COPY --from=prune /app/out/full/ .
COPY tsconfig.base.json .
RUN bun run build

FROM oven/bun:1-slim AS runtime
WORKDIR /app
COPY --from=build --chown=bun:bun /app/apps/api/dist ./dist
COPY --from=build --chown=bun:bun /app/node_modules ./node_modules
COPY --from=build --chown=bun:bun /app/apps/api/package.json ./
USER bun
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=3s CMD bun -e "fetch('http://localhost:3000/health').then(r=>{if(!r.ok)process.exit(1)}).catch(()=>process.exit(1))"
CMD ["bun", "run", "dist/index.js"]
