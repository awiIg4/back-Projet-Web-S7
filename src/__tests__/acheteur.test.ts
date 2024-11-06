import bcrypt from 'bcrypt';
import request from 'supertest';
import app from '../server';
import Utilisateur from '../models/utilisateur';
import Administrateur from '../models/administrateur';
import Acheteur from '../models/acheteur';

describe('Acheteur Routes', () => {
  let accessToken: string;

  beforeAll(async () => {
    const motdepasse = 'passwordAdmin123';
    const hashedPassword = await bcrypt.hash(motdepasse, 10);

    // Création d'un utilisateur administrateur pour les tests
    const admin = await Utilisateur.create({
      nom: 'Admin Test',
      email: 'admin@test.com',
      telephone: '0102030406',
      adresse: '123 Rue Admin',
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
      email: 'admin@test.com',
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
  });

  afterAll(async () => {
    // Supprimer l'entrée dans la table Administrateur si elle existe
    const utilisateurExist = await Utilisateur.findOne({ where: { email: 'admin@test.com' } });

    if (utilisateurExist) {
      await Administrateur.destroy({ where: { id: utilisateurExist.id } });
      await Utilisateur.destroy({ where: { email: 'admin@test.com' } });
    }

    // Supprimer l'entrée de l'acheteur créé si elle existe
    const utilisateurAcheteur = await Utilisateur.findOne({ where: { email: 'acheteur@test.com' } });

    if (utilisateurAcheteur) {
      await Acheteur.destroy({ where: { id: utilisateurAcheteur.id } });
      await Utilisateur.destroy({ where: { email: 'acheteur@test.com' } });
    }
  });

  // Test de création d'un acheteur avec un token d'administrateur
  it('devrait créer un acheteur avec un email unique (Admin)', async () => {
    const res = await request(app)
      .post('/api/acheteurs/register')
      .set('Cookie', `accessToken=${accessToken}`) // Utilisation correcte du cookie
      .send({
        nom: 'Acheteur Test',
        email: 'acheteur@test.com',
        telephone: '0102030404',
        adresse: '456 Rue Acheteur',
      });

    expect(res.status).toBe(201);
    expect(res.text).toBe('Compte acheteur créé avec succès.');
  });

  // Test de création d'un acheteur sans connexion
  it('ne devrait pas permettre la création d\'un acheteur sans connexion', async () => {
    const res = await request(app)
      .post('/api/acheteurs/register')
      .send({
        nom: 'Acheteur Non Auth',
        email: 'acheteur_non_auth@test.com',
        telephone: '0102030404',
        adresse: '456 Rue Acheteur Non Auth',
      });

    expect(res.status).toBe(401); // Refusé car non connecté
  });

  // Test de récupération d'un acheteur avec un email
  it('devrait charger un acheteur existant (Admin)', async () => {
    const res = await request(app)
      .get('/api/acheteurs/acheteur@test.com')
      .set('Cookie', `accessToken=${accessToken}`); // Utilisation correcte du cookie

    expect(res.status).toBe(200);
    expect(res.body.email).toBe('acheteur@test.com');
  });

  // Test de récupération d'un acheteur sans être connecté
  it('ne devrait pas permettre de charger un acheteur sans connexion', async () => {
    const res = await request(app).get('/api/acheteurs/acheteur@test.com');

    expect(res.status).toBe(401); // Refusé car non connecté
  });
});