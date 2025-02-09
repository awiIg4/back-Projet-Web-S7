import bcrypt from 'bcrypt';
import request from 'supertest';
import app from '../server';
import Utilisateur from '../models/utilisateur';
import Administrateur from '../models/administrateur';
import Licence from '../models/licence';
import Editeur from '../models/editeur';
import sequelize from '../config/database';

describe('Licence Routes', () => {
  let accessToken: string;
  let licenceId: number;
  let editeurId: number;
  const licenceNomInitial = 'LICENCEINITIAL';
  const editeurNomInitial = 'EDITEURINITIAL';

  beforeAll(async () => {
    const motdepasse = 'passwordAdmin123';
    const hashedPassword = await bcrypt.hash(motdepasse, 10);

    // Création d'un utilisateur administrateur pour les tests
    const admin = await Utilisateur.create({
      nom: 'Admin Licence Test',
      email: 'admin_licence@test.com',
      telephone: '0102030406',
      adresse: '123 Rue Admin Licence',
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
      email: 'admin_licence@test.com',
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
        accessToken = accessTokenCookie.split(';')[0].split('=')[1];
      } else {
        throw new Error('Cookie accessToken non trouvé dans la réponse de connexion.');
      }
    } else {
      throw new Error('set-cookie header n\'est pas un tableau.');
    }

    // Création d'un éditeur initial pour les tests
    const editeur = await Editeur.create({ nom: editeurNomInitial });
    editeurId = editeur.id;

    // Vérification de la création de l'utilisateur
    if (!editeur || !editeurId) {
        throw new Error('L\'editeur n\'a pas pu être créé');
    } 

    // Création d'une licence initiale pour les tests avec vérification
    const licence = await Licence.create({ nom: licenceNomInitial, editeur_id: editeurId });
    licenceId = licence.id;

    // Vérifier que la licence a été créée correctement
    if (!licence) {
      throw new Error('La création de la licence initiale a échoué.');
    }

    if (licence.nom !== licenceNomInitial || licence.editeur_id !== editeurId) {
      throw new Error('La licence initiale n\'a pas été correctement créée.');
    }
  });

  afterAll(async () => {
    // Supprimer toutes les licences, éditeurs, administrateurs et utilisateurs créés pendant les tests
    await Licence.destroy({ where: {} });
    await Editeur.destroy({ where: {} });
    await Administrateur.destroy({ where: {} });
    await Utilisateur.destroy({ where: {} });
  });

  // Test de création d'une licence avec un token d'administrateur
  it('devrait créer une nouvelle licence (Admin)', async () => {
    const res = await request(app)
      .post('/api/licences')
      .set('Cookie', `accessToken=${accessToken}`)
      .send({
        nom: 'LICENCE2024',
        editeur_id: editeurId,
      });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.nom).toBe('LICENCE2024');
    expect(res.body.editeur_id).toBe(editeurId);
  });

  // Test de création d'une licence sans connexion
  it('ne devrait pas permettre la création d\'une licence sans connexion', async () => {
    const res = await request(app)
      .post('/api/licences')
      .send({
        nom: 'LICENCENONAUTH',
        editeur_id: editeurId,
      });

    expect(res.status).toBe(401);
  });

  // Test de création d'une licence avec un nom déjà existant
  it('ne devrait pas permettre la création d\'une licence avec un nom déjà utilisé (Admin)', async () => {
    const res = await request(app)
      .post('/api/licences')
      .set('Cookie', `accessToken=${accessToken}`)
      .send({
        nom: licenceNomInitial, // Nom déjà utilisé
        editeur_id: editeurId,
      });

    expect(res.status).toBe(400);
    expect(res.text).toBe('Une licence avec ce nom existe déjà.');
  });

  // Test de récupération de toutes les licences avec authentification administrateur
  it('devrait récupérer toutes les licences (Admin)', async () => {
    const res = await request(app)
      .get('/api/licences')
      .set('Cookie', `accessToken=${accessToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThanOrEqual(1);
  });

  // Test de récupération de toutes les licences sans authentification
  it('ne devrait pas permettre de récupérer toutes les licences sans connexion', async () => {
    const res = await request(app).get('/api/licences');

    expect(res.status).toBe(401);
  });

  // Test de récupération d'une licence par ID avec authentification administrateur
  it('devrait récupérer une licence par ID (Admin)', async () => {
    const res = await request(app)
      .get(`/api/licences/${licenceId}`)
      .set('Cookie', `accessToken=${accessToken}`); // Utilisation correcte du cookie

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('id', licenceId);
    expect(res.body).toHaveProperty('nom', licenceNomInitial);
    expect(res.body).toHaveProperty('editeur');
    expect(res.body.editeur).toHaveProperty('nom', editeurNomInitial);
  });

  // Test de récupération d'une licence par ID sans authentification
  it('ne devrait pas permettre de récupérer une licence par ID sans connexion', async () => {
    const res = await request(app).get(`/api/licences/${licenceId}`);

    expect(res.status).toBe(401); // Refusé car non connecté
  });

  // Test de récupération d'une licence par nom avec authentification administrateur
  it('devrait récupérer une licence par nom (Admin)', async () => {
    const res = await request(app)
      .get(`/api/licences/by-name/${licenceNomInitial}`)
      .set('Cookie', `accessToken=${accessToken}`); // Utilisation correcte du cookie

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('nom', licenceNomInitial);
    expect(res.body).toHaveProperty('editeur');
    expect(res.body.editeur).toHaveProperty('nom', editeurNomInitial);
  });

  // Test de récupération d'une licence par nom sans authentification
  it('ne devrait pas permettre de récupérer une licence par nom sans connexion', async () => {
    const res = await request(app).get(`/api/licences/by-name/${licenceNomInitial}`);

    expect(res.status).toBe(401); // Refusé car non connecté
  });

  // Test de récupération d'une licence par nom non existant avec authentification administrateur
  it('devrait renvoyer 404 pour une licence introuvable par nom (Admin)', async () => {
    const res = await request(app)
      .get('/api/licences/by-name/NONEXISTANT')
      .set('Cookie', `accessToken=${accessToken}`);

    expect(res.status).toBe(404);
    expect(res.text).toBe('Licence introuvable.');
  });

  // Test de recherche des licences sans authentification
  it('devrait rechercher les licences sans authentification', async () => {
    // Création de quelques licences pour la recherche
    await Licence.create({ nom: 'LICENCESEARCH1', editeur_id: editeurId });
    await Licence.create({ nom: 'LICENCESEARCH2', editeur_id: editeurId });
    await Licence.create({ nom: 'TESTLICENCE', editeur_id: editeurId });

    const res = await request(app).get('/api/licences/search/LICENCE');

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThanOrEqual(2);
    res.body.forEach((licence: any) => {
      expect(licence.nom.startsWith('LICENCE')).toBe(true);
    });
  });

  // Test de mise à jour d'une licence avec authentification administrateur
  it('devrait mettre à jour une licence existante (Admin)', async () => {
    const nouvelleReduction = 20;
    const res = await request(app)
      .put(`/api/licences/${licenceId}`)
      .set('Cookie', `accessToken=${accessToken}`)
      .send({
        nom: 'LICENCEUPDATED',
        editeur_id: editeurId,
      });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('nom', 'LICENCEUPDATED');
    expect(res.body).toHaveProperty('editeur_id', editeurId);
  });

  // Test de mise à jour d'une licence sans authentification
  it('ne devrait pas permettre de mettre à jour une licence sans connexion', async () => {
    const res = await request(app)
      .put(`/api/licences/${licenceId}`)
      .send({
        nom: 'LICENCEUPDATEDWITHOUTAUTH',
        editeur_id: editeurId,
      });

    expect(res.status).toBe(401);
  });

  // Test de mise à jour d'une licence non existante avec authentification administrateur
  it('devrait renvoyer 404 lors de la mise à jour d\'une licence non existante (Admin)', async () => {
    const res = await request(app)
      .put('/api/licences/9999')
      .set('Cookie', `accessToken=${accessToken}`)
      .send({
        nom: 'NONEXISTANTLICENCE',
        editeur_id: editeurId,
      });

    expect(res.status).toBe(404);
    expect(res.text).toBe('Licence introuvable.');
  });

  // Test de suppression d'une licence avec authentification administrateur
  it('devrait supprimer une licence existante (Admin)', async () => {
    const res = await request(app)
      .delete(`/api/licences/${licenceId}`)
      .set('Cookie', `accessToken=${accessToken}`);

    expect(res.status).toBe(200);
    expect(res.text).toBe('Licence supprimée avec succès.');
  });

  // Test de suppression d'une licence sans authentification
  it('ne devrait pas permettre de supprimer une licence sans connexion', async () => {
    const res = await request(app)
      .delete(`/api/licences/${licenceId}`);

    expect(res.status).toBe(401); // Refusé car non connecté
  });

  // Test de suppression d'une licence non existante avec authentification administrateur
  it('devrait renvoyer 404 lors de la suppression d\'une licence non existante (Admin)', async () => {
    const res = await request(app)
      .delete('/api/licences/9999')
      .set('Cookie', `accessToken=${accessToken}`);

    expect(res.status).toBe(404);
    expect(res.text).toBe('Licence introuvable.');
  });
});