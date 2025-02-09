import sequelize from '../config/database';
describe('Exécuter tous les tests', () => {
  // Avant d'exécuter TOUS les tests
  beforeAll(async () => {
    await sequelize.sync({ force: true });
  });

  // Après l'exécution de TOUS les tests
  afterAll(async () => {
    await sequelize.close();
  });

  describe('Tests de Gestionnaire', () => {
    require('./gestionnaire.test');
  });

  describe('Tests d\'Administrateur', () => {
    require('./administrateur.test');
  });

  describe('Tests d\'Acheteteur', () => {
    require('./acheteur.test');
  });

  describe('Tests de Vendeur', () => {
    require('./vendeur.test');
  });

  describe('Tests d\'Editeur', () => {
    require('./editeur.test');
  });

  describe('Tests de codePromotion', () => {
    require('./codePromotion.test');
  });

  describe('Tests de Licence', () => {
    require('./licence.test');
  });

  describe('Tests de Session', () => {
    require('./session.test');
  });

  describe('Tests de Jeu', () => {
    require('./jeu.test');
  });

  describe('Tests d\'Utilisateur', () => {
    require('./utilisateur.test');
  });

  describe('Tests de Gestion', () => {
    require('./gestion.test');
  });

  describe('Tests de Statistiques', () => {
    require('./stat.test');
  });

  describe('Tests de Transaction', () => {
    require('./transaction.test');
  });
});