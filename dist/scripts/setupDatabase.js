"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = require("dotenv");
const database_1 = __importDefault(require("../config/database")); // Import de la connexion à la base
const createAdmin_1 = require("./createAdmin");
const importEditeurs_1 = require("./importEditeurs");
const importLicences_1 = require("./importLicences");
(0, dotenv_1.config)();
async function setupDatabase() {
    console.log('🚀 Starting database setup...');
    try {
        console.log('🔄 Connecting to database... JADORE LES PATES AU PATES AUX PATES ');
        await database_1.default.authenticate();
        console.log('✅ Database connected.');
        console.log('\n1. Creating admin user...');
        await (0, createAdmin_1.createAdmin)();
        console.log('✅ Admin setup completed.');
    }
    catch (error) {
        console.error('❌ Error creating admin user:', error);
    }
    try {
        console.log('\n2. Importing editeurs...');
        await (0, importEditeurs_1.importEditeurs)();
        console.log('✅ Editeurs import completed.');
    }
    catch (error) {
        console.error('❌ Error importing editeurs:', error);
    }
    try {
        console.log('\n3. Importing licences...');
        await (0, importLicences_1.importLicences)();
        console.log('✅ Licences import completed.');
    }
    catch (error) {
        console.error('❌ Error importing licences:', error);
    }
    console.log('\n✅ Database setup completed successfully!');
}
setupDatabase();
exports.default = setupDatabase;
