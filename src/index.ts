import app from './server';
import sequelize from './config/database';

const PORT = Number(process.env.PORT) || 8000;

async function startServer() {
  try {
    console.log('🔄 Connecting to database...');
    await sequelize.authenticate();
    console.log('✅ Database connected.');

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

// Gestion des signaux de fermeture Heroku
process.on('SIGTERM', () => {
  console.log('🔻 SIGTERM received. Closing server...');
  process.exit(0);
});