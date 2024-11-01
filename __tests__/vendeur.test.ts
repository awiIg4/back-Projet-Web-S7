import bcrypt from 'bcrypt';
import request from 'supertest';
import app from '../src/server';
import Utilisateur from '../src/models/utilisateur';
import Administrateur from '../src/models/administrateur';
import Vendeur from '../src/models/vendeur';

describe('Vendeur Routes', () => {
  let accessToken: string;
  let vendeurId: number; 
  
  beforeAll(async () => {
    const motdepasse = 'passwordAdmin123';
    const hashedPassword = await bcrypt.hash(motdepasse, 10);

    // Création d'un utilisateur administrateur pour les tests
    const admin = await Utilisateur.create({
      nom: 'Admin Vendeur Test',
      email: 'admin_vendeur@test.com',
      telephone: '0102030406',
      adresse: '123 Rue Admin Vendeur',
      type_utilisateur: 'administrateur',
    });

    await Administrateur.create({
      id: admin.id,
      mot_de_passe: hashedPassword,
    });

    // Vérification de la création de l'utilisateur
    if (!admin || !admin.id) {
      throw new Error('L\'utilisateur administrateur n\'a pas pu être créé');
    }

    // Connexion de l'administrateur pour obtenir le token d'accès
    const adminLogin = await request(app).post('/api/administrateurs/login').send({
      email: 'admin_vendeur@test.com',
      motdepasse: 'passwordAdmin123',
    });

    // Vérifier si la réponse du login a échoué
    if (adminLogin.status !== 200) {
      const messageErreur = adminLogin.body?.message || 'Aucun message d\'erreur fourni';
      throw new Error(`La connexion administrateur a échoué avec le statut: ${adminLogin.status}. Message: ${messageErreur}`);
    }

    const setCookieHeader = adminLogin.headers['set-cookie'];

    if (Array.isArray(setCookieHeader)) {
      const accessTokenCookie = setCookieHeader.find(cookie => cookie.startsWith('accessToken='));
      if (accessTokenCookie) {
        // Extraire la valeur du token
        accessToken = accessTokenCookie.split(';')[0].split('=')[1];
      } else {
        throw new Error('Cookie accessToken non trouvé dans la réponse de connexion.');
      }
    } else {
      throw new Error('set-cookie header n\'est pas un tableau.');
    }

    // Création d'un vendeur directement via Sequelize
    const vendeurUtilisateur = await Utilisateur.create({
      nom: 'Vendeur Initial Test',
      email: 'vendeur_initial@test.com',
      telephone: '0102030407',
      adresse: '456 Rue Vendeur Initial',
      type_utilisateur: 'vendeur',
    });

    const vendeur = await Vendeur.create({
      id: vendeurUtilisateur.id,
    });

    vendeurId = vendeur.id;

    // Vérification de la création du vendeur
    if (!vendeur || !vendeurId) {
        throw new Error('L\'utilisateur vendeur n\'a pas pu être créé');
    }
  });

  afterAll(async () => {
    // Supprimer l'entrée dans la table Administrateur si elle existe
    const adminExist = await Utilisateur.findOne({ where: { email: 'admin_vendeur@test.com' } });

    if (adminExist) {
      await Administrateur.destroy({ where: { id: adminExist.id } });
      await Utilisateur.destroy({ where: { email: 'admin_vendeur@test.com' } });
    }

    // Supprimer l'entrée du vendeur initial créé dans beforeAll
    const vendeurInitialExist = await Utilisateur.findOne({ where: { email: 'vendeur_initial@test.com' } });

    if (vendeurInitialExist) {
      await Vendeur.destroy({ where: { id: vendeurInitialExist.id } });
      await Utilisateur.destroy({ where: { email: 'vendeur_initial@test.com' } });
    }

    // Supprimer l'entrée du vendeur créé via les tests si elle existe
    const utilisateurVendeur = await Utilisateur.findOne({ where: { email: 'vendeur@test.com' } });

    if (utilisateurVendeur) {
      await Vendeur.destroy({ where: { id: utilisateurVendeur.id } });
      await Utilisateur.destroy({ where: { email: 'vendeur@test.com' } });
    }

    // Supprimer un autre vendeur si nécessaire
    const utilisateurVendeur2 = await Utilisateur.findOne({ where: { email: 'vendeur2@test.com' } });

    if (utilisateurVendeur2) {
      await Vendeur.destroy({ where: { id: utilisateurVendeur2.id } });
      await Utilisateur.destroy({ where: { email: 'vendeur2@test.com' } });
    }
  });

  // Test de création d'un vendeur avec un token d'administrateur
  it('devrait créer un vendeur avec un email unique (Admin)', async () => {
    const res = await request(app)
      .post('/api/vendeurs/register')
      .set('Cookie', `accessToken=${accessToken}`)
      .send({
        nom: 'Vendeur Test',
        email: 'vendeur@test.com',
        telephone: '0102030405',
        adresse: '789 Rue Vendeur',
      });

    expect(res.status).toBe(201);
    expect(res.text).toBe('Compte vendeur créé avec succès.');
  });

  // Test de création d'un vendeur sans connexion
  it('ne devrait pas permettre la création d\'un vendeur sans connexion', async () => {
    const res = await request(app)
      .post('/api/vendeurs/register')
      .send({
        nom: 'Vendeur Non Auth',
        email: 'vendeur2@test.com',
        telephone: '0102030405',
        adresse: '789 Rue Vendeur Non Auth',
      });

    expect(res.status).toBe(401);
  });

  // Test de récupération d'un vendeur avec un email
  it('devrait charger un vendeur existant grace à son email (Admin)', async () => {
    const res = await request(app)
      .get('/api/vendeurs/vendeur_initial@test.com')
      .set('Cookie', `accessToken=${accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body.email).toBe('vendeur_initial@test.com');
  });

  // Test de récupération d'un vendeur sans être connecté
  it('ne devrait pas permettre de charger un vendeur sans connexion', async () => {
    const res = await request(app).get('/api/vendeurs/vendeur_initial@test.com');

    expect(res.status).toBe(401); // Refusé car non connecté
  });

  // Test de récupération des informations d'un vendeur avec un token d'administrateur
  it('devrait récupérer les informations d\'un vendeur grace à son id (Admin)', async () => {
    const res = await request(app)
      .get(`/api/vendeurs/informations/${vendeurId}`)
      .set('Cookie', `accessToken=${accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body.nom).toBe('Vendeur Initial Test');
    expect(res.body.email).toBe('vendeur_initial@test.com');
    expect(res.body.telephone).toBe('0102030407');
    expect(res.body.adresse).toBe('456 Rue Vendeur Initial');
  });

  // Test de récupération des informations d'un vendeur sans être connecté
  it('ne devrait pas permettre de récupérer les informations d\'un vendeur sans connexion', async () => {
    const res = await request(app).get(`/api/vendeurs/informations/${vendeurId}`);

    expect(res.status).toBe(401);
  });
});