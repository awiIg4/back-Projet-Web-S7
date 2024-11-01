ARG NODE_VERSION=22.0.0

# Stage 1: Build
FROM node:${NODE_VERSION}-alpine AS builder

WORKDIR /app

# Copie des fichiers package et installation des dépendances
COPY package*.json ./
RUN npm install

# Copie du reste des fichiers et build de l'application
COPY . .
RUN npm run build

# Stage 2: Run
FROM node:${NODE_VERSION}-alpine AS production

WORKDIR /app

# Copie des fichiers construits depuis le stage builder
COPY --from=builder /app/dist ./dist
COPY package*.json ./
RUN npm install --only=production

# Exposition du port 3000
EXPOSE 8000

# Commande de démarrage de l'application
CMD ["node", "dist/index.js"]