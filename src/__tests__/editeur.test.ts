import bcrypt from 'bcrypt';
import request from 'supertest';
import app from '../server';
import Utilisateur from '../models/utilisateur';
import Administrateur from '../models/administrateur';
import Editeur from '../models/editeur';

describe('Éditeur Routes', () => {
  let accessToken: string;
  let editeurId: number;

  beforeAll(async () => {
    const motdepasse = 'passwordAdmin123';
    const hashedPassword = await bcrypt.hash(motdepasse, 10);

    // Création d'un utilisateur administrateur pour les tests
    const admin = await Utilisateur.create({
      nom: 'Admin Éditeur Test',
      email: 'admin_editeur@test.com',
      telephone: '0102030406',
      adresse: '123 Rue Admin Éditeur',
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
      email: 'admin_editeur@test.com',
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

    // Création d'un éditeur initial pour les tests
    const editeur = await Editeur.create({ nom: 'Éditeur Initial Test' });
    editeurId = editeur.id;

    // Vérification de la création de l'utilisateur
    if (!editeur || !editeurId) {
        throw new Error('L\'editeur n\'a pas pu être créé');
    } 
  });

  afterAll(async () => {
    // Supprimer tous les utilisateurs et éditeurs créés pendant les tests
    await Administrateur.destroy({ where: {} });
    await Editeur.destroy({ where: {} });
    await Utilisateur.destroy({ where: {} });
  });

  // Test de création d'un éditeur avec un token d'administrateur
  it('devrait créer un nouvel éditeur (Admin)', async () => {
    const res = await request(app)
      .post('/api/editeurs')
      .set('Cookie', `accessToken=${accessToken}`)
      .send({
        nom: 'Éditeur Test',
      });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.nom).toBe('Éditeur Test');
  });

  // Test de création d'un éditeur sans connexion
  it('ne devrait pas permettre la création d\'un éditeur sans connexion', async () => {
    const res = await request(app)
      .post('/api/editeurs')
      .send({
        nom: 'Éditeur Non Auth',
      });

    expect(res.status).toBe(401); // Refusé car non connecté
  });

  // Test de récupération de tous les éditeurs avec authentification administrateur
  it('devrait récupérer tous les éditeurs (Admin)', async () => {
    const res = await request(app)
      .get('/api/editeurs')
      .set('Cookie', `accessToken=${accessToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThanOrEqual(1);
  });

  // Test de récupération de tous les éditeurs sans authentification
  it('ne devrait pas permettre de récupérer tous les éditeurs sans connexion', async () => {
    const res = await request(app).get('/api/editeurs');

    expect(res.status).toBe(401); // Refusé car non connecté
  });

  // Test de récupération d'un éditeur par ID avec authentification administrateur
  it('devrait récupérer un éditeur par ID (Admin)', async () => {
    const res = await request(app)
      .get(`/api/editeurs/${editeurId}`)
      .set('Cookie', `accessToken=${accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('id', editeurId);
    expect(res.body).toHaveProperty('nom', 'Éditeur Initial Test');
  });

  // Test de récupération d'un éditeur par ID sans authentification
  it('ne devrait pas permettre de récupérer un éditeur par ID sans connexion', async () => {
    const res = await request(app).get(`/api/editeurs/${editeurId}`);

    expect(res.status).toBe(401); // Refusé car non connecté
  });

  // Test de récupération d'un éditeur par nom avec authentification administrateur
  it('devrait récupérer un éditeur par nom (Admin)', async () => {
    const res = await request(app)
      .get(`/api/editeurs/by-name/Éditeur Initial Test`)
      .set('Cookie', `accessToken=${accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('nom', 'Éditeur Initial Test');
    expect(res.body).toHaveProperty('id', editeurId);
  });

  // Test de récupération d'un éditeur par nom sans authentification
  it('ne devrait pas permettre de récupérer un éditeur par nom sans connexion', async () => {
    const res = await request(app).get(`/api/editeurs/by-name/Éditeur Initial Test`);

    expect(res.status).toBe(401); // Refusé car non connecté
  });

  // Test de recherche des éditeurs sans authentification
  it('devrait rechercher les éditeurs sans authentification', async () => {
    const res = await request(app).get('/api/editeurs/search/Éditeur');

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThanOrEqual(1);
    expect(res.body[0].nom.startsWith('Éditeur')).toBe(true);
  });

  // Test de mise à jour d'un éditeur avec authentification administrateur
  it('devrait mettre à jour un éditeur (Admin)', async () => {
    const res = await request(app)
      .put(`/api/editeurs/${editeurId}`)
      .set('Cookie', `accessToken=${accessToken}`)
      .send({
        nom: 'Éditeur Mis à Jour',
      });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('nom', 'Éditeur Mis à Jour');
  });

  // Test de mise à jour d'un éditeur sans authentification
  it('ne devrait pas permettre de mettre à jour un éditeur sans connexion', async () => {
    const res = await request(app)
      .put(`/api/editeurs/${editeurId}`)
      .send({
        nom: 'Éditeur Non Auth Mis à Jour',
      });

    expect(res.status).toBe(401); // Refusé car non connecté
  });

  // Test de suppression d'un éditeur avec authentification administrateur
  it('devrait supprimer un éditeur (Admin)', async () => {
    const res = await request(app)
      .delete(`/api/editeurs/${editeurId}`)
      .set('Cookie', `accessToken=${accessToken}`);

    expect(res.status).toBe(200);
    expect(res.text).toBe('Éditeur supprimé avec succès.');
  });

  // Test de suppression d'un éditeur sans authentification
  it('ne devrait pas permettre de supprimer un éditeur sans connexion', async () => {
    const res = await request(app).delete(`/api/editeurs/${editeurId}`);

    expect(res.status).toBe(401); // Refusé car non connecté
  });
});
