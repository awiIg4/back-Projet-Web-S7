import bcrypt from 'bcrypt';
import request from 'supertest';
import app from '../src/server';
import Utilisateur from '../src/models/utilisateur';
import Administrateur from '../src/models/administrateur';
import CodePromotion from '../src/models/codePromotion';

describe('CodePromo Routes', () => {
  let accessToken: string;
  let codePromoLibelle: string;

  beforeAll(async () => {
    const motdepasse = 'passwordAdmin123';
    const hashedPassword = await bcrypt.hash(motdepasse, 10);

    // Création d'un utilisateur administrateur pour les tests
    const admin = await Utilisateur.create({
      nom: 'Admin CodePromo Test',
      email: 'admin_codepromo@test.com',
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
      email: 'admin_codepromo@test.com',
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

    // Création d'un code promo initial pour les tests avec vérification
    codePromoLibelle = 'PROMOINITIAL';
    const codePromo = await CodePromotion.create({ libelle: codePromoLibelle, reductionPourcent: 10 });

    // Vérifier que le code promo a été créé correctement
    if (!codePromo) {
      throw new Error('La création du code promo initial a échoué.');
    }

    if (codePromo.libelle !== codePromoLibelle || codePromo.reductionPourcent !== 10) {
      throw new Error('Le code promo initial n\'a pas été correctement créé.');
    }
  });

  afterAll(async () => {
    // Supprimer les administrateurs et les utilisateurs associés
    await Administrateur.destroy({ where: {} });
    await CodePromotion.destroy({ where: {} });
    await Utilisateur.destroy({ where: {} });
  });

  // Test de récupération de tous les codes promo avec authentification administrateur
  it('devrait récupérer tous les codes promo (Admin)', async () => {
    const res = await request(app)
      .get('/api/codesPromotion')
      .set('Cookie', `accessToken=${accessToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThanOrEqual(1);
  });

  // Test de récupération de tous les codes promo sans authentification
  it('ne devrait pas permettre de récupérer tous les codes promo sans connexion', async () => {
    const res = await request(app).get('/api/codesPromotion');

    expect(res.status).toBe(401); // Refusé car non connecté
  });

  // Test de création d'un code promo avec un token d'administrateur
  it('devrait créer un nouveau code promo (Admin)', async () => {
    const res = await request(app)
      .post('/api/codesPromotion')
      .set('Cookie', `accessToken=${accessToken}`)
      .send({
        libelle: 'PROMO2024',
        reductionPourcent: 15,
      });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('libelle');
    expect(res.body.libelle).toBe('PROMO2024');
    expect(res.body.reductionPourcent).toBe(15);
  });

  // Test de création d'un code promo sans connexion
  it('ne devrait pas permettre la création d\'un code promo sans connexion', async () => {
    const res = await request(app)
      .post('/api/codesPromotion')
      .send({
        libelle: 'PROMONONAUTH',
        reductionPourcent: 20,
      });

    expect(res.status).toBe(401); // Refusé car non connecté
  });

  // Test de création d'un code promo avec un libellé déjà existant
  it('ne devrait pas permettre la création d\'un code promo avec un libellé déjà utilisé (Admin)', async () => {
    const res = await request(app)
      .post('/api/codesPromotion')
      .set('Cookie', `accessToken=${accessToken}`)
      .send({
        libelle: codePromoLibelle, // Libellé déjà utilisé
        reductionPourcent: 25,
      });

    expect(res.status).toBe(400);
    expect(res.text).toBe('Un code promo avec ce libellé existe déjà.');
  });

  // Test de récupération d'un code promo par libellé avec authentification administrateur
  it('devrait récupérer la réduction associée à un code promo (Admin)', async () => {
    const res = await request(app)
      .get(`/api/codesPromotion/${codePromoLibelle}`)
      .set('Cookie', `accessToken=${accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('reduction');
    expect(res.body.reduction).toBe(10);
  });

  // Test de récupération d'un code promo par libellé sans authentification
  it('ne devrait pas permettre de récupérer un code promo par libellé sans connexion', async () => {
    const res = await request(app).get(`/api/codesPromotion/${codePromoLibelle}`);

    expect(res.status).toBe(401); // Refusé car non connecté
  });

  // Test de récupération d'un code promo par libellé non existant avec authentification administrateur
  it('devrait renvoyer 404 pour un code promo introuvable (Admin)', async () => {
    const res = await request(app)
      .get('/api/codesPromotion/INEXISTANT')
      .set('Cookie', `accessToken=${accessToken}`);

    expect(res.status).toBe(404);
    expect(res.text).toBe('Code promo introuvable.');
  });

  // Test de mise à jour d'un code promo avec authentification administrateur
  it('devrait mettre à jour un code promo existant (Admin)', async () => {
    const res = await request(app)
      .put(`/api/codesPromotion/${codePromoLibelle}`)
      .set('Cookie', `accessToken=${accessToken}`)
      .send({
        reductionPourcent: 12,
      });

    expect(res.status).toBe(200);
    expect(res.body.libelle).toBe(codePromoLibelle);
    expect(res.body.reductionPourcent).toBe(12);
  });

  // Test de mise à jour d'un code promo sans authentification
  it('ne devrait pas permettre de mettre à jour un code promo sans connexion', async () => {
    const res = await request(app)
      .put(`/api/codesPromotion/${codePromoLibelle}`)
      .send({
        reductionPourcent: 18,
      });

    expect(res.status).toBe(401); // Refusé car non connecté
  });

  // Test de mise à jour d'un code promo non existant avec authentification administrateur
  it('devrait renvoyer 404 lors de la mise à jour d\'un code promo non existant (Admin)', async () => {
    const res = await request(app)
      .put('/api/codesPromotion/INEXISTANT')
      .set('Cookie', `accessToken=${accessToken}`)
      .send({
        reductionPourcent: 20,
      });

    expect(res.status).toBe(404);
    expect(res.text).toBe('Code promo introuvable.');
  });

  // Test de suppression d'un code promo avec authentification administrateur
  it('devrait supprimer un code promo existant (Admin)', async () => {
    const res = await request(app)
      .delete(`/api/codesPromotion/${codePromoLibelle}`)
      .set('Cookie', `accessToken=${accessToken}`);

    expect(res.status).toBe(200);
    expect(res.text).toBe('Code promo supprimé avec succès.');
  });

  // Test de suppression d'un code promo non existant avec authentification administrateur
  it('devrait renvoyer 404 lors de la suppression d\'un code promo non existant (Admin)', async () => {
    const res = await request(app)
      .delete('/api/codesPromotion/INEXISTANT')
      .set('Cookie', `accessToken=${accessToken}`);

    expect(res.status).toBe(404);
    expect(res.text).toBe('Code promo introuvable.');
  });

  // Test de suppression d'un code promo sans authentification
  it('ne devrait pas permettre de supprimer un code promo sans connexion', async () => {
    const res = await request(app)
      .delete(`/api/codesPromotion/${codePromoLibelle}`);

    expect(res.status).toBe(401); // Refusé car non connecté
  });

  // Test de recherche des codes promo sans authentification
  it('devrait rechercher les codes promo sans authentification', async () => {
    // Création de quelques codes promo pour la recherche
    await CodePromotion.create({ libelle: 'PROMOSEARCH1', reductionPourcent: 5 });
    await CodePromotion.create({ libelle: 'PROMOSEARCH2', reductionPourcent: 10 });
    await CodePromotion.create({ libelle: 'TESTPROMO', reductionPourcent: 15 });

    const res = await request(app).get('/api/codesPromotion/search/PROMO');

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThanOrEqual(2);
    res.body.forEach((code: any) => {
      expect(code.libelle.startsWith('PROMO')).toBe(true);
    });
  });
});
