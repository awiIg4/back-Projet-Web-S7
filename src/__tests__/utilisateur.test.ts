import request from 'supertest';
import app from '../server';
import bcrypt from 'bcrypt';
import Utilisateur from '../models/utilisateur';
import Administrateur from '../models/administrateur';
import Acheteur from '../models/acheteur';

describe('Routes Utilisateurs', () => {
  let adminAccessToken: string;
  let adminId: number;
  let utilisateurId: number;

  beforeAll(async () => {
    // Création d'un administrateur pour les tests
    const adminPassword = 'adminPassword123';
    const hashedAdminPassword = await bcrypt.hash(adminPassword, 10);

    const adminUtilisateur = await Utilisateur.create({
      nom: 'Admin Test',
      email: 'admin@test.com',
      telephone: '0102030401',
      adresse: '123 Rue Admin',
      type_utilisateur: 'administrateur',
    });
    if (!adminUtilisateur || !adminUtilisateur.id) {
      throw new Error('L\'utilisateur administrateur n\'a pas pu être créé');
    }
    adminId = adminUtilisateur.id;

    const administrateur = await Administrateur.create({
      id: adminUtilisateur.id,
      mot_de_passe: hashedAdminPassword,
    });
    if (!administrateur) {
      throw new Error('L\'administrateur n\'a pas pu être créé');
    }

    // Connexion de l'administrateur pour obtenir le token d'accès
    const adminLogin = await request(app).post('/api/administrateurs/login').send({
      email: 'admin@test.com',
      motdepasse: adminPassword,
    });

    if (adminLogin.status !== 200) {
      const messageErreur = adminLogin.body?.message || 'Aucun message d\'erreur fourni';
      throw new Error(`Connexion administrateur échouée avec statut ${adminLogin.status}. Message: ${messageErreur}`);
    }

    const setCookieHeader = adminLogin.headers['set-cookie'];
    if (!Array.isArray(setCookieHeader)) {
      throw new Error('set-cookie header n\'est pas un tableau.');
    }

    const accessTokenCookie = setCookieHeader.find(cookie => cookie.startsWith('accessToken='));
    if (!accessTokenCookie) {
      throw new Error('Cookie accessToken non trouvé dans la réponse de connexion.');
    }

    adminAccessToken = accessTokenCookie.split(';')[0].split('=')[1];
    if (!adminAccessToken) {
      throw new Error('Token d\'accès administrateur non extrait correctement.');
    }

    // Création d'un utilisateur pour les tests (acheteur)
    const utilisateur = await Utilisateur.create({
      nom: 'Utilisateur Test',
      email: 'utilisateur@test.com',
      telephone: '0102030402',
      adresse: '456 Rue Utilisateur',
      type_utilisateur: 'acheteur',
    });
    if (!utilisateur || !utilisateur.id) {
      throw new Error('L\'utilisateur n\'a pas pu être créé');
    }
    utilisateurId = utilisateur.id;

    const acheteur = await Acheteur.create({
      id: utilisateur.id,
    });
    if (!acheteur) {
      throw new Error('L\'acheteur n\'a pas pu être créé');
    }
  });

  afterAll(async () => {
    await Acheteur.destroy({ where: { id: utilisateurId } });
    await Utilisateur.destroy({ where: { id: utilisateurId } });

    await Administrateur.destroy({ where: { id: adminId } });
    await Utilisateur.destroy({ where: { id: adminId } });
  });

  describe('GET /api/utilisateurs/', () => {
    it('devrait retourner tous les utilisateurs pour un administrateur authentifié', async () => {
      const res = await request(app)
        .get('/api/utilisateurs/')
        .set('Cookie', `accessToken=${adminAccessToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);

      // Vérifier que les utilisateurs créés sont présents
      const utilisateursEmails = res.body.map((user: any) => user.email);
      expect(utilisateursEmails).toContain('admin@test.com');
      expect(utilisateursEmails).toContain('utilisateur@test.com');
    });

    it('ne devrait pas permettre à un utilisateur non authentifié d\'accéder à la liste des utilisateurs', async () => {
      const res = await request(app).get('/api/utilisateurs/');

      expect(res.status).toBe(401);
      expect(res.text).toBe('Token manquant. Veuillez vous connecter.');
    });

    it('ne devrait pas permettre à un utilisateur non administrateur d\'accéder à la liste des utilisateurs', async () => {
      const res = await request(app)
        .get('/api/utilisateurs/')
        .set('Cookie', `accessToken=token_invalide`)

      expect(res.status).toBe(403);
      expect(res.text).toBe('Token invalide ou expiré.');
    });
  });

  describe('PUT /api/utilisateurs/:id', () => {
    it('devrait permettre à un administrateur de mettre à jour un utilisateur', async () => {
      const nouveauNom = 'Utilisateur Test Modifié';
      const res = await request(app)
        .put(`/api/utilisateurs/${utilisateurId}`)
        .set('Cookie', `accessToken=${adminAccessToken}`)
        .send({
          nom: nouveauNom,
        });

      expect(res.status).toBe(200);
      expect(res.body.nom).toBe(nouveauNom);

      // Vérifier que les modifications ont été enregistrées dans la base de données
      const utilisateurMisAJour = await Utilisateur.findByPk(utilisateurId);
      expect(utilisateurMisAJour?.nom).toBe(nouveauNom);
    });

    it('ne devrait pas permettre de mettre à jour un utilisateur inexistant', async () => {
      const res = await request(app)
        .put('/api/utilisateurs/999999')
        .set('Cookie', `accessToken=${adminAccessToken}`)
        .send({
          nom: 'Nom Inexistant',
        });

      expect(res.status).toBe(404);
      expect(res.text).toBe('Utilisateur introuvable.');
    });

    it('ne devrait pas permettre à un utilisateur non administrateur de mettre à jour un utilisateur', async () => {
      const res = await request(app)
        .put(`/api/utilisateurs/${utilisateurId}`)
        .set('Cookie', `accessToken=token_invalide`)
        .send({
          nom: 'Tentative Non Admin',
        });

      expect(res.status).toBe(403);
      expect(res.text).toBe('Token invalide ou expiré.');
    });

    it('ne devrait pas permettre sans être connecté de mettre à jour un utilisateur', async () => {
        const res = await request(app)
          .put(`/api/utilisateurs/${utilisateurId}`)
          .send({
            nom: 'Tentative Non Admin',
          });
  
        expect(res.status).toBe(401);
        expect(res.text).toBe('Token manquant. Veuillez vous connecter.');
      });
  });

  describe('DELETE /api/utilisateurs/:id', () => {
    it('devrait permettre à un administrateur de supprimer un utilisateur', async () => {
      const utilisateurASupprimer = await Utilisateur.create({
        nom: 'Utilisateur À Supprimer',
        email: 'asupprimer@test.com',
        telephone: '0102030404',
        adresse: '123 Rue À Supprimer',
        type_utilisateur: 'acheteur',
      });
      if (!utilisateurASupprimer || !utilisateurASupprimer.id) {
        throw new Error('L\'utilisateur à supprimer n\'a pas pu être créé');
      }
      const acheteur = await Acheteur.create({
        id: utilisateurASupprimer.id,
      });
      if (!acheteur) {
        throw new Error('L\'acheteur à supprimer n\'a pas pu être créé');
      }

      const res = await request(app)
        .delete(`/api/utilisateurs/${utilisateurASupprimer.id}`)
        .set('Cookie', `accessToken=${adminAccessToken}`);

      expect(res.status).toBe(200);
      expect(res.text).toBe('Utilisateur supprimé avec succès.');

      const utilisateurSupprimé = await Utilisateur.findByPk(utilisateurASupprimer.id);
      expect(utilisateurSupprimé).toBeNull();
    });

    it('ne devrait pas permettre de supprimer un utilisateur inexistant', async () => {
      const res = await request(app)
        .delete('/api/utilisateurs/999999')
        .set('Cookie', `accessToken=${adminAccessToken}`);

      expect(res.status).toBe(404);
      expect(res.text).toBe('Utilisateur introuvable.');
    });

    it('ne devrait pas permettre à un utilisateur non administrateur de supprimer un utilisateur', async () => {
      const res = await request(app)
        .delete(`/api/utilisateurs/${utilisateurId}`)
        .set('Cookie', `accessToken=token_invalide`);

      expect(res.status).toBe(403);
      expect(res.text).toBe('Token invalide ou expiré.');
    });

    it('ne devrait pas permettre sans être connecté de supprimer un utilisateur', async () => {
        const res = await request(app)
          .delete(`/api/utilisateurs/${utilisateurId}`)
  
        expect(res.status).toBe(401);
        expect(res.text).toBe('Token manquant. Veuillez vous connecter.');
    });
  });
});