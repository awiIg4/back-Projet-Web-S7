"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_typescript_1 = require("sequelize-typescript");
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)(); // Charger les variables d'environnement
const sequelize = new sequelize_typescript_1.Sequelize({
    database: process.env.DB_NAME,
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    dialect: 'postgres',
    models: [__dirname + '/../models'] // Chargement automatique des modèles
});
exports.default = sequelize;
