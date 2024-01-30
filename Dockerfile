FROM node:20-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

FROM base AS build
COPY . /usr/src/app
WORKDIR /usr/src/app
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
RUN pnpm deploy --filter=ipx --prod /prod/ipx

FROM base AS ipx
COPY --from=build /prod/ipx /prod/ipx
WORKDIR /prod/ipx
EXPOSE 3000
CMD [ "pnpm", "start" ]