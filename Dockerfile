FROM node:20-alpine
WORKDIR /app

# better-sqlite3 compile un module natif -- pas de binaire precompile
# disponible pour Alpine (musl) dans tous les cas, d'ou ces outils de build.
RUN apk add --no-cache python3 make g++

COPY package*.json ./
RUN npm install --production

COPY . .

EXPOSE 3000
CMD ["node", "index.js"]
