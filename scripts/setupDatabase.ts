import { config } from 'dotenv';
import sequelize from '../config/database'; // Import de la connexion à la base
import { createAdmin } from './createAdmin';
import { importEditeurs } from './importEditeurs';
import { importLicences } from './importLicences';

config();

async function setupDatabase() {
  console.log('🚀 Starting database setup...');

  try {
    console.log('🔄 Connecting to database... JADORE LES PATES AU PATES AUX PATES ');
    await sequelize.authenticate();
    console.log('✅ Database connected.');

    console.log('\n1. Creating admin user...');
    await createAdmin();
    console.log('✅ Admin setup completed.');

  } catch (error) {
    console.error('❌ Error creating admin user:', error);
  }

  try {
    console.log('\n2. Importing editeurs...');
    await importEditeurs();
    console.log('✅ Editeurs import completed.');

  } catch (error) {
    console.error('❌ Error importing editeurs:', error);
  }

  try {
    console.log('\n3. Importing licences...');
    await importLicences();
    console.log('✅ Licences import completed.');

  } catch (error) {
    console.error('❌ Error importing licences:', error);
  }

  console.log('\n✅ Database setup completed successfully!');
}

setupDatabase();

export default setupDatabase;