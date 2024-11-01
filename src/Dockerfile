# Stage 1: Build
FROM node:18-alpine AS builder

WORKDIR /app

# Copie des fichiers package et installation des dépendances
COPY package*.json ./
RUN npm install

# Copie du reste des fichiers et build de l'application
COPY . .
RUN npm run build

# Stage 2: Run
FROM node:18-alpine

WORKDIR /app

# Copie des fichiers construits depuis le stage builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules

# Copie du script wait-for-it
COPY wait-for-it.sh /wait-for-it.sh
RUN chmod +x /wait-for-it.sh

# Variables d'environnement
ENV NODE_ENV=production

# Expose le port
EXPOSE 8000

# Commande par défaut pour démarrer l'application après avoir attendu PostgreSQL
CMD ["./wait-for-it.sh", "projetweb_s7_db:5432", "--", "node", "dist/index.js"]