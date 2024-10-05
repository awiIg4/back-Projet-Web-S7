back-Projet-Web-S7

/src
├── config
│   └── database.ts          # Configuration Sequelize et connexion à PostgreSQL
├── models
│   ├── utilisateur.ts       # Modèle Sequelize pour 'Utilisateur'
│   ├── administrateur.ts    # Modèle Sequelize pour 'Administrateur'
│   ├── vendeur.ts           # Modèle Sequelize pour 'Vendeur'
│   └── acheteur.ts          # Modèles pour les autres entités
├── routes
│   ├── utilisateurs.ts      # Routes pour les utilisateurs
│   ├── administrateurs.ts   # Routes pour les administrateurs
│   ├── vendeurs.ts          # Routes pour les vendeurs
│   └── acheteurs.ts         # Routes pour les acheteurs
├── server.ts                # Fichier principal du serveur
└── app.ts                   # Configuration et gestion de l'application