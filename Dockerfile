# Version de Node.js
ARG NODE_VERSION=22.0.0

# Stage 1: Build
FROM node:${NODE_VERSION}-alpine AS builder

# Exécuter en tant que root
USER root

WORKDIR /app

# Copie des fichiers package et installation des dépendances (incluant les devDependencies)
COPY package*.json ./
RUN npm install

# Copie du reste des fichiers et build de l'application
COPY . .
RUN npm run build

# Stage 2: Test (inclut les dépendances de développement pour Jest)
FROM node:${NODE_VERSION}-alpine AS tester

WORKDIR /app

# Copie des fichiers depuis le stage builder
COPY --from=builder /app /app

# Ajouter node_modules/.bin au PATH
ENV PATH /app/node_modules/.bin:$PATH

# Installation des dépendances de développement pour Jest et autres tests
RUN npm install

# Commande pour lancer les tests
CMD ["npm", "test"]

# Stage 3: Run (Production)
FROM node:${NODE_VERSION}-alpine AS production

WORKDIR /app

# Copie des fichiers construits depuis le stage builder
COPY --from=builder /app/dist ./dist
COPY package*.json ./

# Installation des dépendances de production uniquement
RUN npm install --only=production

# Exposition du port de l'application
EXPOSE 8000

# Commande de démarrage de l'application
CMD ["node", "dist/index.js"]