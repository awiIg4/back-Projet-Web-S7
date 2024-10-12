import sequelize from '../config/database';

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connected...');
    await sequelize.sync({ alter: true });
  } catch (err) {
    console.error('Unable to connect to the database:', err);
  }
};

export { connectDB };