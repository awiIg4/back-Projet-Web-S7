import request from 'supertest';
import app from '../server';
import Utilisateur from '../models/utilisateur';
import Administrateur from '../models/administrateur';
import bcrypt from 'bcrypt';

describe('Administrateur Routes', () => {
  let accessToken: string;

  beforeAll(async () => {
    const motdepasse = 'passwordAdmin123';
    const hashedPassword = await bcrypt.hash(motdepasse, 10);

    // Création d'un utilisateur administrateur pour les tests
    const admin = await Utilisateur.create({
      nom: 'Admin Test',
      email: 'admin@admin.com',
      telephone: '0102030406',
      adresse: '123 Rue Admin CodePromo',
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
      email: 'admin@admin.com',
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
    // Supprimer les administrateurs et les utilisateurs associés
    await Administrateur.destroy({ where: {} });
    await Utilisateur.destroy({ where: {} });
  });

  // Test de la route d'inscription
  it('devrait créer un nouveau administrateur', async () => {

    const res = await request(app)
      .post('/api/administrateurs/register')
      .set('Cookie', `accessToken=${accessToken}`)
      .send({
      nom: 'Test Admin',
      email: 'admin@test.com',
      telephone: '0102030406',
      adresse: '456 Rue Admin',
      motdepasse: 'passwordAdmin123',
    });

    expect(res.status).toBe(201);
    expect(res.text).toBe('Compte administrateur créé avec succès.');
  });

  // Test de la route de connexion
  it('devrait connecter un administrateur existant', async () => {
    const res = await request(app).post('/api/administrateurs/login').send({
      email: 'admin@test.com',
      motdepasse: 'passwordAdmin123',
    });

    expect(res.status).toBe(200);
    expect(res.text).toBe('Connexion réussie.');
    expect(res.headers['set-cookie']).toBeDefined();
  });

  // Test du rafraîchissement du token
  it('devrait rafraîchir le token d\'accès', async () => {
    const login = await request(app).post('/api/administrateurs/login').send({
      email: 'admin@test.com',
      motdepasse: 'passwordAdmin123',
    });

    const cookies = login.headers['set-cookie'];
    const res = await request(app).post('/api/administrateurs/refresh-token').set('Cookie', cookies);

    expect(res.status).toBe(200);
    expect(res.text).toBe('Token d\'accès rafraîchi avec succès.');
    expect(res.headers['set-cookie']).toBeDefined();
  });

  // Test de déconnexion
  it('devrait déconnecter l\'administrateur', async () => {
    const res = await request(app).post('/api/administrateurs/logout');

    expect(res.status).toBe(200);
    expect(res.text).toBe('Déconnexion réussie.');
  });
});