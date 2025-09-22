# ---- build stage ----
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY tsconfig*.json nest-cli.json ./
COPY src ./src
RUN npm run build

# ---- production stage ----
FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production
# install only prod deps
COPY package*.json ./
RUN npm ci --omit=dev
# copy compiled code
COPY --from=build /app/dist ./dist

# run as non-root
RUN addgroup -S app && adduser -S app -G app
USER app

EXPOSE 3000
CMD ["node", "dist/main.js"]
