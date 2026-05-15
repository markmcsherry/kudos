FROM node:20-alpine AS build
WORKDIR /app

COPY package.json ./
COPY package-lock.json ./
COPY client/package.json ./client/package.json
COPY server/package.json ./server/package.json
RUN npm ci --no-audit --no-fund

COPY client ./client
COPY server ./server
RUN npm run build

FROM node:20-alpine AS runtime
WORKDIR /app

COPY package.json ./
COPY package-lock.json ./
COPY server/package.json ./server/package.json
RUN npm ci --workspace server --omit=dev --no-audit --no-fund

COPY --from=build /app/client/dist ./client/dist
COPY server ./server

EXPOSE 3000
CMD ["npm", "run", "start", "--workspace", "server"]
