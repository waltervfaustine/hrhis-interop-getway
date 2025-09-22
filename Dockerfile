# ---- build stage ----
FROM node:20-alpine AS build
WORKDIR /app

# Faster, reproducible installs
COPY package*.json ./
RUN npm ci

# Bring in build config and sources
COPY tsconfig*.json nest-cli.json ./
COPY src ./src

# Build TS -> JS
RUN npm run build

# ---- production stage ----
FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
# Optional: better stack traces in prod
ENV NODE_OPTIONS=--enable-source-maps

# Ensure HTTPS to external APIs works everywhere
RUN apk add --no-cache ca-certificates && update-ca-certificates

# (Optional) if you plan to use curl in container healthchecks/debugging
# RUN apk add --no-cache curl

# Install only prod deps
COPY package*.json ./
RUN npm ci --omit=dev

# Copy compiled code
COPY --from=build /app/dist ./dist

# Create non-root user
RUN addgroup -S app && adduser -S app -G app
USER app

EXPOSE 3000
CMD ["node", "dist/main.js"]
