import app from './server';
import sequelize from './config/database';

const PORT = Number(process.env.PORT) || 8000;

sequelize.sync().then(() => {
  console.log('Database connected...');
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
  });
}).catch(err => {
  console.error('Failed to connect to the database:', err);
});