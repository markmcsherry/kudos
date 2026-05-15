FROM node:20-alpine AS build
WORKDIR /app

COPY package.json ./
COPY client/package.json ./client/package.json
COPY server/package.json ./server/package.json
RUN npm install

COPY client ./client
COPY server ./server
RUN npm run build

FROM node:20-alpine AS runtime
WORKDIR /app

COPY package.json ./
COPY server/package.json ./server/package.json
RUN npm install --workspace server --omit=dev

COPY --from=build /app/client/dist ./client/dist
COPY server ./server

EXPOSE 3000
CMD ["npm", "run", "start", "--workspace", "server"]
