import { config } from 'dotenv';
import { createAdmin } from './createAdmin';
import { importEditeurs } from './importEditeurs';
import { importLicences } from './importLicences';

config();

async function setupDatabase() {
  try {
    console.log('🚀 Starting database setup...');

    console.log('\n1. Creating admin user...');
    await createAdmin();

    console.log('\n2. Importing editeurs...');
    await importEditeurs();

    console.log('\n3. Importing licences...');
    await importLicences();

    console.log('\n✅ Database setup completed successfully!');
  } catch (error) {
    console.error('❌ Error during database setup:', error);
    process.exit(1);
  }
}

setupDatabase();

export default setupDatabase;