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
│   │   ├── achat.ts            # Modèle Sequelize pour la table "achat"
│   │   ├── acheteur.ts         # Modèle Sequelize pour la table "acheteur"
│   │   ├── administrateur.ts   # Modèle Sequelize pour la table "administrateur".
│   │   ├── codePromotion.ts    # Modèle Sequelize pour la table "codePromotion".
│   │   ├── depot.ts            # Modèle Sequelize pour la table "depot".
│   │   ├── editeur.ts          # Modèle Sequelize pour la table "editeur".
│   │   ├── index.ts            # Modèle Sequelize pour la gestion de tout les autres.
│   │   ├── jeu.ts              # Modèle Sequelize pour la table "jeu".
│   │   ├── licence.ts          # Modèle Sequelize pour la table "licence".
│   │   ├── session.ts          # Modèle Sequelize pour la table "session".
│   │   ├── somme.ts            # Modèle Sequelize pour la table "somme".
│   │   ├── utilisateur.ts      # Modèle Sequelize pour la table "utilisateur".
│   │   └── vendeur.ts          # Modèle Sequelize pour la table "vendeur".
│   │                           # Chaque modèle correspond à une table dans la base de données PostgreSQL.
│   ├── routes                  # Dossier contenant toutes les routes de l'API
│   │   ├── acheteur.ts         # Routes HTTP pour gérer les acheteurs.
│   │   ├── administrateur.ts   # Routes HTTP pour les administrateurs.
│   │   ├── codePromotion.ts    # Routes HTTP pour les codePromotion.
│   │   ├── editeur.ts          # Routes HTTP pour les éditeurs.
│   │   ├── gestion.ts          # Routes HTTP pour la partie gestion.
│   │   ├── gestionnaires.ts    # Routes HTTP pour les gestionnaires.
│   │   ├── jeu.ts              # Routes HTTP pour les jeux.
│   │   ├── licence.ts          # Routes HTTP pour les licences.
│   │   ├── middlware.ts        # Routes HTTP pour les anthentification et la gestion de connection.
│   │   ├── session.ts          # Routes HTTP pour les sessions.
│   │   ├── stats.ts            # Routes HTTP pour les statistiques.
│   │   ├── utilisateur.ts      # Routes HTTP pour gérer les utilisateurs.
│   │   └── vendeur.ts          # Routes HTTP pour les vendeurs.
│   │                           # Chaque fichier de route définit les endpoints pour les opérations CRUD sur les modèles correspondants.
│   └── server.ts               # Fichier principal du serveur, configure et démarre Express.
│                               # Gère la connexion à la base de données, les middlewares, et importe les routes.
│
├──node_modules/                # Stockage de tous les modules utilisés pour le projet.
│
└── dist/                       # (Créé après la compilation TypeScript) Contient les fichiers JavaScript compilés depuis src.