/                               # Racine du projet
├── .env                        # Fichier des variables d'environnement (contient DB_HOST, DB_USER, etc.)
│                               # Non versionné (ajouté au .gitignore), contient les identifiants sensibles.
├── package.json                # Fichier de configuration npm, liste les dépendances et scripts du projet.
│                               # Il contient des informations sur le projet (nom, version, scripts, dépendances, etc.)
├── package-lock.json           # Fichier généré automatiquement par npm pour verrouiller les versions des dépendances.
│                               # Assure que tous les utilisateurs du projet ont les mêmes versions des modules installés.
├── tsconfig.json               # Fichier de configuration TypeScript. Définit la version de TypeScript à utiliser, le répertoire
│                               # de sortie des fichiers compilés, les règles strictes, et les chemins des fichiers source.
├── README.md                   # Fichier de documentation du projet. Décrit comment installer, configurer et utiliser l'application.
│                               # Important pour partager des instructions avec d'autres développeurs ou utilisateurs du projet.
├── src/                        # Dossier principal contenant tout le code source TypeScript du projet
│   ├── config
│   │   └── database.ts         # Fichier de configuration Sequelize pour la connexion à PostgreSQL.
│   │                           # Gère la connexion en utilisant les variables d'environnement du fichier .env.
│   ├── models                  # Dossier contenant tous les modèles Sequelize
│   │   ├── utilisateur.ts      # Modèle Sequelize pour la table "utilisateur", représente les utilisateurs de l'application.
│   │   ├── administrateur.ts   # Modèle Sequelize pour la table "administrateur".
│   │   ├── vendeur.ts          # Modèle Sequelize pour la table "vendeur".
│   │   ├── acheteur.ts         # Modèle Sequelize pour la table "acheteur".
│   │   ├── jeu.ts              # Modèle Sequelize pour la table "jeu".
│   │   ├── editeur.ts          # Modèle Sequelize pour la table "editeur".
│   │   ├── achat.ts            # Modèle Sequelize pour la table "achat".
│   │   ├── session.ts          # Modèle Sequelize pour la table "session".
│   │   └── depot.ts            # Modèle Sequelize pour la table "depot".
│   │                           # Chaque modèle correspond à une table dans la base de données PostgreSQL.
│   ├── routes                  # Dossier contenant toutes les routes de l'API
│   │   ├── utilisateur.ts      # Routes HTTP pour gérer les opérations CRUD sur les utilisateurs.
│   │   ├── administrateur.ts   # Routes HTTP pour les administrateurs.
│   │   ├── vendeur.ts          # Routes HTTP pour les vendeurs.
│   │   ├── acheteur.ts         # Routes HTTP pour les acheteurs.
│   │   ├── jeu.ts              # Routes HTTP pour les jeux.
│   │   ├── editeur.ts          # Routes HTTP pour les éditeurs.
│   │   ├── achat.ts            # Routes HTTP pour les achats.
│   │   ├── session.ts          # Routes HTTP pour les sessions.
│   │   └── depot.ts            # Routes HTTP pour les dépôts.
│   │                           # Chaque fichier de route définit les endpoints pour les opérations CRUD sur les modèles correspondants.
│   └── server.ts               # Fichier principal du serveur, configure et démarre Express.
│                               # Gère la connexion à la base de données, les middlewares, et importe les routes.
│
└── dist/                       # (Créé après la compilation TypeScript) Contient les fichiers JavaScript compilés depuis src.
                                # Utilisé en production pour exécuter le serveur.