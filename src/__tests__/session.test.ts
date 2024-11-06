import request from 'supertest';
import bcrypt from 'bcrypt';
import app from '../server';
import Utilisateur from '../models/utilisateur';
import Administrateur from '../models/administrateur';
import Session from '../models/session';

describe('Session Routes', () => {
  let accessToken: string;
  let sessionId: number;

  beforeAll(async () => {
    // Créer un administrateur
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
  });

  afterAll(async () => {
    // Nettoyer la base de données
    await Session.destroy({ where: {} });
    await Administrateur.destroy({ where: {} });
    await Utilisateur.destroy({ where: {} });
  });

  describe('POST /api/sessions', () => {
    it('devrait créer une nouvelle session avec des données valides', async () => {
      const res = await request(app)
        .post('/api/sessions')
        .set('Cookie', `accessToken=${accessToken}`)
        .send({
          date_debut: '2024-01-01T00:00:00.000Z',
          date_fin: '2024-12-31T23:59:59.999Z',
          valeur_commission: 1000,
          commission_en_pourcentage: true,
          valeur_frais_depot: 500,
          frais_depot_en_pourcentage: false,
        });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('id');
      expect(res.body.nom).toBeUndefined();
      sessionId = res.body.id;
    });

    it('ne devrait pas créer une session avec des données invalides', async () => {
      const res = await request(app)
        .post('/api/sessions')
        .set('Cookie', `accessToken=${accessToken}`)
        .send({
          date_debut: 'invalid-date',
          date_fin: '2023-12-31T23:59:59.999Z',
          valeur_commission: -100,
          commission_en_pourcentage: 'yes',
          valeur_frais_depot: 'five hundred',
          frais_depot_en_pourcentage: null,
        });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('errors');
      expect(res.body.errors.length).toBeGreaterThan(0);
    });

    it('ne devrait pas créer une session sans authentification', async () => {
      const res = await request(app).post('/api/sessions').send({
        date_debut: '2024-01-01T00:00:00.000Z',
        date_fin: '2024-12-31T23:59:59.999Z',
        valeur_commission: 1000,
        commission_en_pourcentage: true,
        valeur_frais_depot: 500,
        frais_depot_en_pourcentage: false,
      });

      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/sessions', () => {
    it('devrait récupérer toutes les sessions', async () => {
      const res = await request(app)
        .get('/api/sessions')
        .set('Cookie', `accessToken=${accessToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThanOrEqual(1);
    });

    it('ne devrait pas récupérer les sessions sans authentification', async () => {
      const res = await request(app).get('/api/sessions');

      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/sessions/:id', () => {
    it('devrait récupérer une session par son ID', async () => {
      const res = await request(app)
        .get(`/api/sessions/${sessionId}`)
        .set('Cookie', `accessToken=${accessToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('id', sessionId);
    });

    it('devrait renvoyer 404 pour une session inexistante', async () => {
      const res = await request(app)
        .get('/api/sessions/9999')
        .set('Cookie', `accessToken=${accessToken}`);

      expect(res.status).toBe(404);
      expect(res.text).toBe('Session introuvable.');
    });

    it('ne devrait pas récupérer une session avec un ID invalide', async () => {
      const res = await request(app)
        .get('/api/sessions/invalid-id')
        .set('Cookie', `accessToken=${accessToken}`);

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('errors');
    });

    it('ne devrait pas récupérer une session sans authentification', async () => {
      const res = await request(app).get(`/api/sessions/${sessionId}`);

      expect(res.status).toBe(401);
    });
  });


  describe('PUT /api/sessions/:id', () => {
    it('devrait mettre à jour une session avec des données valides', async () => {
      const res = await request(app)
        .put(`/api/sessions/${sessionId}`)
        .set('Cookie', `accessToken=${accessToken}`)
        .send({
          valeur_commission: 2000,
          commission_en_pourcentage: false,
        });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('valeur_commission', 2000);
      expect(res.body).toHaveProperty('commission_en_pourcentage', false);
    });

    it('ne devrait pas mettre à jour une session avec des données invalides', async () => {
      const res = await request(app)
        .put(`/api/sessions/${sessionId}`)
        .set('Cookie', `accessToken=${accessToken}`)
        .send({
          date_fin: '2023-01-01T00:00:00.000Z',
          valeur_commission: -500,
          commission_en_pourcentage: 'nope',
        });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('errors');
      expect(res.body.errors.length).toBeGreaterThan(0);
    });

    it('devrait renvoyer 404 lors de la mise à jour d\'une session inexistante', async () => {
      const res = await request(app)
        .put('/api/sessions/9999')
        .set('Cookie', `accessToken=${accessToken}`)
        .send({
          valeur_commission: 1500,
        });

      expect(res.status).toBe(404);
      expect(res.text).toBe('Session introuvable.');
    });

    it('ne devrait pas mettre à jour une session sans authentification', async () => {
      const res = await request(app)
        .put(`/api/sessions/${sessionId}`)
        .send({
          valeur_commission: 1500,
        });

      expect(res.status).toBe(401);
    });
  });

  describe('DELETE /api/sessions/:id', () => {
    it('devrait supprimer une session existante', async () => {
      const res = await request(app)
        .delete(`/api/sessions/${sessionId}`)
        .set('Cookie', `accessToken=${accessToken}`);

      expect(res.status).toBe(200);
      expect(res.text).toBe('Session supprimée avec succès.');

      // Vérifier que la session a été supprimée
      const check = await Session.findByPk(sessionId);
      expect(check).toBeNull();
    });

    it('devrait renvoyer 404 lors de la suppression d\'une session inexistante', async () => {
      const res = await request(app)
        .delete('/api/sessions/9999')
        .set('Cookie', `accessToken=${accessToken}`);

      expect(res.status).toBe(404);
      expect(res.text).toBe('Session introuvable.');
    });

    it('ne devrait pas supprimer une session avec un ID invalide', async () => {
      const res = await request(app)
        .delete('/api/sessions/invalid-id')
        .set('Cookie', `accessToken=${accessToken}`);

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('errors');
    });

    it('ne devrait pas supprimer une session sans authentification', async () => {
      const res = await request(app).delete(`/api/sessions/${sessionId}`);

      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/sessions/current', () => {
    // 1. Test sans authentification
    it('ne devrait pas récupérer la session courante sans authentification', async () => {
      const res = await request(app).get('/api/sessions/current');

      expect(res.status).toBe(401);
    });

    // 2. Test connecté mais sans session courante
    it('devrait renvoyer 404 lorsqu\'il n\'y a pas de session courante', async () => {
      const res = await request(app)
        .get('/api/sessions/current')
        .set('Cookie', `accessToken=${accessToken}`);

      expect(res.status).toBe(404);
      expect(res.text).toBe('Aucune session courante.');
    });

    // 3. Test connecté avec une session courante existante
    it('devrait récupérer la session courante lorsqu\'elle existe', async () => {
      // Créer une session courante
      const currentSession = await Session.create({
        date_debut: new Date(Date.now() - 1000 * 60 * 60), 
        date_fin: new Date(Date.now() + 1000 * 60 * 60),  
        valeur_commission: 1500,
        commission_en_pourcentage: true,
        valeur_frais_depot: 700,
        frais_depot_en_pourcentage: false,
      });

      const res = await request(app)
        .get('/api/sessions/current')
        .set('Cookie', `accessToken=${accessToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('id', currentSession.id);
      expect(new Date(res.body.date_debut) <= new Date()).toBe(true);
      expect(new Date(res.body.date_fin) >= new Date()).toBe(true);

      // Nettoyer la session créée pour ne pas affecter d'autres tests
      await currentSession.destroy();
    });
  });
});
