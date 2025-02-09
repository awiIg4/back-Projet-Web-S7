"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = require("dotenv");
const createAdmin_1 = require("./createAdmin");
const importEditeurs_1 = require("./importEditeurs");
const importLicences_1 = require("./importLicences");
(0, dotenv_1.config)();
async function setupDatabase() {
    try {
        console.log('🚀 Starting database setup...');
        console.log('\n1. Creating admin user...');
        await (0, createAdmin_1.createAdmin)();
        console.log('\n2. Importing editeurs...');
        await (0, importEditeurs_1.importEditeurs)();
        console.log('\n3. Importing licences...');
        await (0, importLicences_1.importLicences)();
        console.log('\n✅ Database setup completed successfully!');
    }
    catch (error) {
        console.error('❌ Error during database setup:', error);
        process.exit(1);
    }
}
setupDatabase();
exports.default = setupDatabase;
