import request from 'supertest';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import app from '../src/server';
import { Op, Sequelize } from 'sequelize';
import Utilisateur from '../src/models/utilisateur';
import Administrateur from '../src/models/administrateur';
import Vendeur from '../src/models/vendeur';
import Licence from '../src/models/licence';
import Editeur from '../src/models/editeur';
import Jeu from '../src/models/jeu';
import Depot from '../src/models/depot';
import Session from '../src/models/session';
import Somme from '../src/models/somme';

describe('Gestion Routes', () => {
  let accessTokenGestionnaire: string;
  let gestionnaireId: number;
  let vendeurId: number;
  let sessionId: number;
  let editeurId1: number;
  let editeurId2: number;
  let licenceId1: number;
  let licenceId2: number;
  let depotId: number;

  beforeAll(async () => {
    // 1. Création d'un utilisateur gestionnaire
    const motdepasseGestionnaire = 'passwordGestionnaire123';
    const hashedPasswordGestionnaire = await bcrypt.hash(motdepasseGestionnaire, 10);

    const gestionnaire = await Utilisateur.create({
      nom: 'Gestionnaire Test',
      email: 'gestionnaire@test.com',
      telephone: '0102030408',
      adresse: '123 Rue Gestionnaire',
      type_utilisateur: 'gestionnaire',
    });
    if (!gestionnaire || !gestionnaire.id) {
      throw new Error("L'utilisateur gestionnaire n'a pas pu être créé");
    }
    gestionnaireId = gestionnaire.id;

    const gestionnaireEntry = await Administrateur.create({
      id: gestionnaire.id,
      mot_de_passe: hashedPasswordGestionnaire,
    });
    if (!gestionnaireEntry) {
      throw new Error("L'entrée gestionnaire n'a pas pu être créée");
    }

    // 2. Connexion du gestionnaire pour obtenir le token d'accès
    const gestionnaireLogin = await request(app).post('/api/gestionnaires/login').send({
      email: 'gestionnaire@test.com',
      motdepasse: motdepasseGestionnaire,
    });

    if (gestionnaireLogin.status !== 200) {
      const messageErreur = gestionnaireLogin.body?.message || "Aucun message d'erreur fourni";
      throw new Error(`Connexion gestionnaire échouée avec statut ${gestionnaireLogin.status}. Message: ${messageErreur}`);
    }

    const setCookieHeader = gestionnaireLogin.headers['set-cookie'];
    if (!Array.isArray(setCookieHeader)) {
      throw new Error("set-cookie header n'est pas un tableau.");
    }

    const accessTokenCookie = setCookieHeader.find((cookie) => cookie.startsWith('accessToken='));
    if (!accessTokenCookie) {
      throw new Error("Cookie accessToken non trouvé dans la réponse de connexion.");
    }

    accessTokenGestionnaire = accessTokenCookie.split(';')[0].split('=')[1];
    if (!accessTokenGestionnaire) {
      throw new Error("Token d'accès non extrait correctement.");
    }

    // 3. Création d'une session
    const session = await Session.create({
      date_debut: new Date(Date.now() - 1000 * 60 * 60 * 24), // Hier
      date_fin: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7), // Dans 7 jours
      valeur_commission: 10,
      commission_en_pourcentage: true,
      valeur_frais_depot: 5,
      frais_depot_en_pourcentage: true,
    });
    if (!session || !session.id) {
      throw new Error("La session n'a pas pu être créée");
    }
    sessionId = session.id;

    // 4. Création des éditeurs
    const editeur1 = await Editeur.create({
      nom: 'Editeur Test1',
    });
    if (!editeur1 || !editeur1.id) {
      throw new Error("L'éditeur n'a pas pu être créé");
    }
    editeurId1 = editeur1.id;

    const editeur2 = await Editeur.create({
      nom: 'Editeur Test2',
    });
    if (!editeur2 || !editeur2.id) {
      throw new Error("L'éditeur n'a pas pu être créé");
    }
    editeurId2 = editeur2.id;

    // 5. Création des licences
    const licence1 = await Licence.create({
      nom: 'Licence Test1',
      editeur_id: editeurId1,
    });
    if (!licence1 || !licence1.id) {
      throw new Error("La licence n'a pas pu être créée");
    }
    licenceId1 = licence1.id;

    const licence2 = await Licence.create({
      nom: 'Licence Test2',
      editeur_id: editeurId2,
    });
    if (!licence2 || !licence2.id) {
      throw new Error("La licence n'a pas pu être créée");
    }
    licenceId2 = licence2.id;

    // 6. Création d'un vendeur
    const vendeurUtilisateur = await Utilisateur.create({
      nom: 'Vendeur Test',
      email: 'vendeur@test.com',
      telephone: '0102030409',
      adresse: '789 Rue Vendeur',
      type_utilisateur: 'vendeur',
    });
    if (!vendeurUtilisateur || !vendeurUtilisateur.id) {
      throw new Error("L'utilisateur vendeur n'a pas pu être créé");
    }

    const vendeur = await Vendeur.create({
      id: vendeurUtilisateur.id,
    });
    if (!vendeur || !vendeur.id) {
      throw new Error("L'entrée vendeur n'a pas pu être créée");
    }
    vendeurId = vendeur.id;

    // 7. Création d'un dépôt
    const depot = await Depot.create({
      vendeur_id: vendeurId,
      session_id: sessionId,
      frais_depot: 10,
      date_depot: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // Il y a 2 jours
    });
    if (!depot || !depot.id) {
      throw new Error("Le dépôt n'a pas pu être créé");
    }
    depotId = depot.id;

    // 8. Création des jeux vendus
    for (let i = 0; i < 5; i++) {
      const jeu = await Jeu.create({
        licence_id: licenceId1,
        prix: 50,
        statut: 'vendu',
        depot_id: depotId,
      });
      // Mettre à jour updatedAt
      await jeu.update({ updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24) });
    }

    for (let i = 0; i < 3; i++) {
      const jeu = await Jeu.create({
        licence_id: licenceId2,
        prix: 70,
        statut: 'vendu',
        depot_id: depotId,
      });
      // Mettre à jour updatedAt
      await jeu.update({ updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24) });
    }

    // 9. Création d'une somme pour le vendeur
    const somme = await Somme.create({
      utilisateurId: vendeurId,
      sessionId: sessionId,
      sommedue: 100,
      sommegenerée: 150,
    });

    if (!somme || !somme.id) {
      throw new Error("La somme n'a pas pu être créée");
    }
  });

  afterAll(async () => {
    // Nettoyage des données créées pendant les tests
    await Somme.destroy({ where: {} });
    await Jeu.destroy({ where: {} });
    await Depot.destroy({ where: {} });
    await Licence.destroy({ where: {} });
    await Editeur.destroy({ where: {} });
    await Session.destroy({ where: {} });

    // Suppression des utilisateurs et des entrées associées
    await Vendeur.destroy({ where: { id: vendeurId } });
    await Utilisateur.destroy({ where: { id: vendeurId } });

    await Administrateur.destroy({ where: { id: gestionnaireId } });
    await Utilisateur.destroy({ where: { id: gestionnaireId } });
  });

  // Tests pour GET /gestion/games/:numpage
  describe('GET /gestion/games/:numpage', () => {
    it('devrait retourner les jeux vendus groupés par éditeur et licence', async () => {
      const res = await request(app)
        .get('/api/gestion/games/1')
        .set('Cookie', `accessToken=${accessTokenGestionnaire}`)
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);

      res.body.forEach((item: any) => {
        expect(item.editeur_nom).toBeDefined();
        expect(item.licence_nom).toBeDefined();
        expect(item.quantite_vendue).toBeDefined();
      });

      const expectedResults = [
        {
          editeur_nom: 'Editeur Test1',
          licence_nom: 'Licence Test1',
          quantite_vendue: '5',
        },
        {
          editeur_nom: 'Editeur Test2',
          licence_nom: 'Licence Test2',
          quantite_vendue: '3',
        },
      ];

      expect(res.body.length).toBe(expectedResults.length);

      expectedResults.forEach((expected) => {
        const item = res.body.find(
          (i: any) => i.editeur_nom === expected.editeur_nom && i.licence_nom === expected.licence_nom
        );
        expect(item).toBeDefined();
        expect(item.quantite_vendue).toBe(expected.quantite_vendue);
      });
    });

    it("devrait retourner 404 si aucune session n'est disponible", async () => {
      // Suppression des jeux, dépôts et sessions
      await Jeu.destroy({ where: {} });
      await Depot.destroy({ where: {} });
      await Somme.destroy({ where: {} });
      await Session.destroy({ where: {} });

      const res = await request(app)
        .get('/api/gestion/games/1')
        .set('Cookie', `accessToken=${accessTokenGestionnaire}`)
        .expect(404);

      expect(res.text).toBe('Aucune session disponible.');

      // Re-création de la session pour les autres tests
      const session = await Session.create({
        date_debut: new Date(Date.now() - 1000 * 60 * 60 * 24),
        date_fin: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
        valeur_commission: 10,
        commission_en_pourcentage: true,
        valeur_frais_depot: 5,
        frais_depot_en_pourcentage: true,
      });
      sessionId = session.id;

      // Re-création du dépôt
      const depot = await Depot.create({
        vendeur_id: vendeurId,
        session_id: sessionId,
        frais_depot: 10,
        date_depot: new Date(),
      });
      depotId = depot.id;

      // Re-création des jeux
      for (let i = 0; i < 5; i++) {
        const jeu = await Jeu.create({
          licence_id: licenceId1,
          prix: 50,
          statut: 'vendu',
          depot_id: depotId,
        });
        await jeu.update({ updatedAt: new Date() });
      }

      for (let i = 0; i < 3; i++) {
        const jeu = await Jeu.create({
          licence_id: licenceId2,
          prix: 70,
          statut: 'vendu',
          depot_id: depotId,
        });
        await jeu.update({ updatedAt: new Date() });
      }
    });

    it("devrait retourner un tableau vide si aucun jeu n'a été vendu pendant la session", async () => {
      // Suppression des jeux
      await Jeu.destroy({ where: {} });

      const res = await request(app)
        .get('/api/gestion/games/1')
        .set('Cookie', `accessToken=${accessTokenGestionnaire}`)
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(0);

      // Re-création des jeux pour les autres tests
      // Vérifier que depotId est valide
      if (!depotId) {
        // Re-création du dépôt
        const depot = await Depot.create({
          vendeur_id: vendeurId,
          session_id: sessionId,
          frais_depot: 10,
          date_depot: new Date(),
        });
        depotId = depot.id;
      }

      for (let i = 0; i < 5; i++) {
        const jeu = await Jeu.create({
          licence_id: licenceId1,
          prix: 50,
          statut: 'vendu',
          depot_id: depotId,
        });
        await jeu.update({ updatedAt: new Date() });
      }

      for (let i = 0; i < 3; i++) {
        const jeu = await Jeu.create({
          licence_id: licenceId2,
          prix: 70,
          statut: 'vendu',
          depot_id: depotId,
        });
        await jeu.update({ updatedAt: new Date() });
      }
    });

    it("devrait retourner 401 si l'utilisateur n'est pas authentifié", async () => {
      await request(app).get('/api/gestion/games/1').expect(401);
    });

    it("devrait retourner 403 si l'utilisateur n'est pas gestionnaire ou administrateur", async () => {
      // Création d'un utilisateur acheteur sans possibilité de login
      const acheteurUtilisateur = await Utilisateur.create({
        nom: 'Acheteur Test',
        email: 'acheteur@test.com',
        telephone: '0102030410',
        adresse: '456 Rue Acheteur',
        type_utilisateur: 'acheteur',
      });

      // Génération d'un token faux pour l'acheteur
      const accessTokenAcheteur = jwt.sign(
        {
          id: acheteurUtilisateur.id,
          email: acheteurUtilisateur.email,
          type_utilisateur: 'acheteur',
        },
        process.env.JWT_SECRET || 'your_jwt_secret',
        { expiresIn: '1h' }
      );

      await request(app)
        .get('/api/gestion/games/1')
        .set('Cookie', `accessToken=${accessTokenAcheteur}`)
        .expect(403);

      // Nettoyage
      await Utilisateur.destroy({ where: { id: acheteurUtilisateur.id } });
    });
  });

  // Tests pour GET /gestion/vendeurs/:numpage
  describe('GET /gestion/vendeurs/:numpage', () => {
    it('devrait retourner les jeux vendus groupés par vendeur, éditeur et licence', async () => {
      const res = await request(app)
        .get('/api/gestion/vendeurs/1')
        .set('Cookie', `accessToken=${accessTokenGestionnaire}`)
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);

      res.body.forEach((item: any) => {
        expect(item.vendeur_nom).toBeDefined();
        expect(item.editeur_nom).toBeDefined();
        expect(item.licence_nom).toBeDefined();
        expect(item.quantite_vendue).toBeDefined();
      });

      const expectedResults = [
        {
          vendeur_nom: 'Vendeur Test',
          editeur_nom: 'Editeur Test1',
          licence_nom: 'Licence Test1',
          quantite_vendue: '5',
        },
        {
          vendeur_nom: 'Vendeur Test',
          editeur_nom: 'Editeur Test2',
          licence_nom: 'Licence Test2',
          quantite_vendue: '3',
        },
      ];

      expect(res.body.length).toBe(expectedResults.length);

      expectedResults.forEach((expected) => {
        const item = res.body.find(
          (i: any) =>
            i.vendeur_nom === expected.vendeur_nom &&
            i.editeur_nom === expected.editeur_nom &&
            i.licence_nom === expected.licence_nom
        );
        expect(item).toBeDefined();
        expect(item.quantite_vendue).toBe(expected.quantite_vendue);
      });
    });

    it('devrait retourner les jeux vendus pour un vendeur spécifique lorsque vendeur_id est fourni', async () => {
      const res = await request(app)
        .get('/api/gestion/vendeurs/1')
        .query({ vendeur_id: vendeurId })
        .set('Cookie', `accessToken=${accessTokenGestionnaire}`)
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);

      res.body.forEach((item: any) => {
        expect(item.vendeur_nom).toBe('Vendeur Test');
      });
    });

    it("devrait retourner un tableau vide si aucun jeu n'a été vendu pour le vendeur spécifié", async () => {
      const res = await request(app)
        .get('/api/gestion/vendeurs/1')
        .query({ vendeur_id: 9999 }) // ID vendeur inexistant
        .set('Cookie', `accessToken=${accessTokenGestionnaire}`)
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(0);
    });

    it("devrait retourner 401 si l'utilisateur n'est pas authentifié", async () => {
      await request(app).get('/api/gestion/vendeurs/1').expect(401);
    });

    it("devrait retourner 403 si l'utilisateur n'est pas gestionnaire ou administrateur", async () => {
      // Création d'un utilisateur acheteur sans possibilité de login
      const acheteurUtilisateur = await Utilisateur.create({
        nom: 'Acheteur Test',
        email: 'acheteur2@test.com',
        telephone: '0102030411',
        adresse: '456 Rue Acheteur',
        type_utilisateur: 'acheteur',
      });

      // Génération d'un token faux pour l'acheteur
      const accessTokenAcheteur = jwt.sign(
        {
          id: acheteurUtilisateur.id,
          email: acheteurUtilisateur.email,
          type_utilisateur: 'acheteur',
        },
        process.env.JWT_SECRET || 'your_jwt_secret',
        { expiresIn: '1h' }
      );

      await request(app)
        .get('/api/gestion/vendeurs/1')
        .set('Cookie', `accessToken=${accessTokenAcheteur}`)
        .expect(403);

      // Nettoyage
      await Utilisateur.destroy({ where: { id: acheteurUtilisateur.id } });
    });
  });

  // Tests pour GET /gestion/bilan
  describe('GET /gestion/bilan', () => {
    beforeEach(async () => {
        // Nettoyer les données
        await Somme.destroy({ where: {} });
        await Jeu.destroy({ where: {} });
        await Depot.destroy({ where: {} });
        await Session.destroy({ where: {} });
    
        // Création de la session
        const session = await Session.create({
          date_debut: new Date('2000-01-01'),
          date_fin: new Date('2100-01-01'),
          valeur_commission: 10,
          commission_en_pourcentage: true,
          valeur_frais_depot: 5,
          frais_depot_en_pourcentage: true,
        });
        sessionId = session.id;
    
        // Création du dépôt
        const depot = await Depot.create({
          vendeur_id: vendeurId,
          session_id: sessionId,
          frais_depot: 10,
          date_depot: new Date(),
        });
        depotId = depot.id;
    
        // Création des jeux vendus
        for (let i = 0; i < 5; i++) {
          await Jeu.create({
            licence_id: licenceId1,
            prix: 50,
            statut: 'vendu',
            depot_id: depotId,
          });
        }
    
        for (let i = 0; i < 3; i++) {
          await Jeu.create({
            licence_id: licenceId2,
            prix: 70,
            statut: 'vendu',
            depot_id: depotId,
          });
        }
    
        // Création de la somme
        const somme = await Somme.create({
          utilisateurId: vendeurId,
          sessionId: sessionId,
          sommedue: 100,
          sommegenerée: 150,
        });
    
        if (!somme || !somme.id) {
          throw new Error("La somme n'a pas pu être créée");
        }
      });
    
      afterEach(async () => {
        // Nettoyer les données
        await Somme.destroy({ where: {} });
        await Jeu.destroy({ where: {} });
        await Depot.destroy({ where: {} });
        await Session.destroy({ where: {} });
      });

    it('devrait retourner le résumé financier pour la session actuelle ou la plus récente', async () => {
      const res = await request(app)
        .get('/api/gestion/bilan')
        .set('Cookie', `accessToken=${accessTokenGestionnaire}`)
        .expect(200);

      expect(res.body).toHaveProperty('session');
      expect(res.body).toHaveProperty('bilan');

      expect(res.body.session.id).toBe(sessionId);

      expect(res.body.bilan).toHaveProperty('total_generé_par_vendeurs');
      expect(res.body.bilan).toHaveProperty('total_dû_aux_vendeurs');
      expect(res.body.bilan).toHaveProperty('argent_généré_pour_admin');

      expect(res.body.bilan.total_generé_par_vendeurs).toBe('150.00');
      expect(res.body.bilan.total_dû_aux_vendeurs).toBe('100.00');
      expect(res.body.bilan.argent_généré_pour_admin).toBe('50.00');
    });

    it("devrait retourner 404 si aucune session n'est disponible", async () => {
      // Suppression des jeux, dépôts, sommes et sessions
      await Somme.destroy({ where: {} });
      await Jeu.destroy({ where: {} });
      await Depot.destroy({ where: {} });
      await Session.destroy({ where: {} });

      const res = await request(app)
        .get('/api/gestion/bilan')
        .set('Cookie', `accessToken=${accessTokenGestionnaire}`)
        .expect(404);

      expect(res.text).toBe('Aucune session disponible.');

      // Re-création de la session pour les autres tests
      const session = await Session.create({
        date_debut: new Date(Date.now() - 1000 * 60 * 60 * 24),
        date_fin: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
        valeur_commission: 10,
        commission_en_pourcentage: true,
        valeur_frais_depot: 5,
        frais_depot_en_pourcentage: true,
      });
      sessionId = session.id;

      // Re-création du dépôt
      const depot = await Depot.create({
        vendeur_id: vendeurId,
        session_id: sessionId,
        frais_depot: 10,
        date_depot: new Date(),
      });
      depotId = depot.id;

      // Re-création des jeux
      for (let i = 0; i < 5; i++) {
        const jeu = await Jeu.create({
          licence_id: licenceId1,
          prix: 50,
          statut: 'vendu',
          depot_id: depotId,
        });
        await jeu.update({ updatedAt: new Date() });
      }

      for (let i = 0; i < 3; i++) {
        const jeu = await Jeu.create({
          licence_id: licenceId2,
          prix: 70,
          statut: 'vendu',
          depot_id: depotId,
        });
        await jeu.update({ updatedAt: new Date() });
      }

      // Re-création de la somme
      const somme = await Somme.create({
        utilisateurId: vendeurId,
        sessionId: sessionId,
        sommedue: 100,
        sommegenerée: 150,
      });
    });

    it("devrait retourner 404 si aucune donnée financière n'est disponible pour la session", async () => {
      // Suppression des sommes
      await Somme.destroy({ where: {} });

      const res = await request(app)
        .get('/api/gestion/bilan')
        .set('Cookie', `accessToken=${accessTokenGestionnaire}`)
        .expect(404);

      expect(res.text).toBe('Aucune donnée financière pour cette session.');

      // Re-création de la somme pour les autres tests
      await Somme.create({
        utilisateurId: vendeurId,
        sessionId: sessionId,
        sommedue: 100,
        sommegenerée: 150,
      });
    });

    it("devrait retourner 401 si l'utilisateur n'est pas authentifié", async () => {
      await request(app).get('/api/gestion/bilan').expect(401);
    });

    it("devrait retourner 403 si l'utilisateur n'est pas gestionnaire ou administrateur", async () => {
      // Création d'un utilisateur acheteur sans possibilité de login
      const acheteurUtilisateur = await Utilisateur.create({
        nom: 'Acheteur Test',
        email: 'acheteur3@test.com',
        telephone: '0102030412',
        adresse: '456 Rue Acheteur',
        type_utilisateur: 'acheteur',
      });

      // Génération d'un token faux pour l'acheteur
      const accessTokenAcheteur = jwt.sign(
        {
          id: acheteurUtilisateur.id,
          email: acheteurUtilisateur.email,
          type_utilisateur: 'acheteur',
        },
        process.env.JWT_SECRET || 'your_jwt_secret',
        { expiresIn: '1h' }
      );

      await request(app)
        .get('/api/gestion/bilan')
        .set('Cookie', `accessToken=${accessTokenAcheteur}`)
        .expect(403);

      // Nettoyage
      await Utilisateur.destroy({ where: { id: acheteurUtilisateur.id } });
    });
  });

  // Tests pour GET /gestion/bilan/:idvendeur
  describe('GET /gestion/bilan/:idvendeur', () => {
    beforeEach(async () => {
        // Nettoyer les données
        await Somme.destroy({ where: {} });
        await Jeu.destroy({ where: {} });
        await Depot.destroy({ where: {} });
        await Session.destroy({ where: {} });
    
        // Création de la session
        const session = await Session.create({
          date_debut: new Date('2000-01-01'),
          date_fin: new Date('2100-01-01'),
          valeur_commission: 10,
          commission_en_pourcentage: true,
          valeur_frais_depot: 5,
          frais_depot_en_pourcentage: true,
        });
        sessionId = session.id;
    
        // Création du dépôt
        const depot = await Depot.create({
          vendeur_id: vendeurId,
          session_id: sessionId,
          frais_depot: 10,
          date_depot: new Date(),
        });
        depotId = depot.id;
    
        // Création des jeux vendus
        for (let i = 0; i < 5; i++) {
          await Jeu.create({
            licence_id: licenceId1,
            prix: 50,
            statut: 'vendu',
            depot_id: depotId,
          });
        }
    
        for (let i = 0; i < 3; i++) {
          await Jeu.create({
            licence_id: licenceId2,
            prix: 70,
            statut: 'vendu',
            depot_id: depotId,
          });
        }
    
        // Création de la somme
        const somme = await Somme.create({
          utilisateurId: vendeurId,
          sessionId: sessionId,
          sommedue: 100,
          sommegenerée: 150,
        });
    
        if (!somme || !somme.id) {
          throw new Error("La somme n'a pas pu être créée");
        }
      });
    
      afterEach(async () => {
        // Nettoyer les données
        await Somme.destroy({ where: {} });
        await Jeu.destroy({ where: {} });
        await Depot.destroy({ where: {} });
        await Session.destroy({ where: {} });
      });


    it('devrait retourner le résumé financier pour le vendeur spécifié', async () => {
      const res = await request(app)
        .get(`/api/gestion/bilan/${vendeurId}`)
        .set('Cookie', `accessToken=${accessTokenGestionnaire}`)
        .expect(200);

      expect(res.body).toHaveProperty('vendeur');
      expect(res.body).toHaveProperty('session');
      expect(res.body).toHaveProperty('bilan');

      expect(res.body.vendeur.id).toBe(vendeurId);
      expect(res.body.vendeur.nom).toBe('Vendeur Test');
      expect(res.body.vendeur.email).toBe('vendeur@test.com');

      expect(res.body.session.id).toBe(sessionId);

      expect(res.body.bilan.total_generé_par_vendeur).toBe('150.00');
      expect(res.body.bilan.total_dû_au_vendeur).toBe('100.00');
      expect(res.body.bilan.argent_généré_pour_admin).toBe('50.00');
    });

    it("devrait retourner 404 si le vendeur n'est pas trouvé", async () => {
      const res = await request(app)
        .get('/api/gestion/bilan/9999')
        .set('Cookie', `accessToken=${accessTokenGestionnaire}`)
        .expect(404);

      expect(res.text).toBe('Vendeur introuvable.');
    });

    it("devrait retourner 404 si aucune donnée financière n'est disponible pour le vendeur dans la session", async () => {
      await Somme.destroy({ where: {} });

      // Suppression des sommes pour le vendeur
      await Somme.destroy({ where: { utilisateurId: vendeurId } });

      const res = await request(app)
        .get(`/api/gestion/bilan/${vendeurId}`)
        .set('Cookie', `accessToken=${accessTokenGestionnaire}`)
        .expect(404);

      expect(res.text).toBe('Aucune donnée financière pour ce vendeur dans la session actuelle.');

      // Re-création de la somme pour les autres tests
      await Somme.create({
        utilisateurId: vendeurId,
        sessionId: sessionId,
        sommedue: 100,
        sommegenerée: 150,
      });
    });

    it("devrait retourner 401 si l'utilisateur n'est pas authentifié", async () => {
      await request(app).get(`/api/gestion/bilan/${vendeurId}`).expect(401);
    });

    it("devrait retourner 403 si l'utilisateur n'est pas gestionnaire ou administrateur", async () => {
      // Création d'un utilisateur acheteur sans possibilité de login
      const acheteurUtilisateur = await Utilisateur.create({
        nom: 'Acheteur Test',
        email: 'acheteur4@test.com',
        telephone: '0102030413',
        adresse: '456 Rue Acheteur',
        type_utilisateur: 'acheteur',
      });

      // Génération d'un token faux pour l'acheteur
      const accessTokenAcheteur = jwt.sign(
        {
          id: acheteurUtilisateur.id,
          email: acheteurUtilisateur.email,
          type_utilisateur: 'acheteur',
        },
        process.env.JWT_SECRET || 'your_jwt_secret',
        { expiresIn: '1h' }
      );

      await request(app)
        .get(`/api/gestion/bilan/${vendeurId}`)
        .set('Cookie', `accessToken=${accessTokenAcheteur}`)
        .expect(403);

      // Nettoyage
      await Utilisateur.destroy({ where: { id: acheteurUtilisateur.id } });
    });
  });
});