import bcrypt from 'bcrypt';
import request from 'supertest';
import app from '../src/server';
import Utilisateur from '../src/models/utilisateur';
import Administrateur from '../src/models/administrateur';
import Acheteur from '../src/models/acheteur';
import Vendeur from '../src/models/vendeur';
import Depot from '../src/models/depot';
import Jeu from '../src/models/jeu';
import SessionModel from '../src/models/session';
import Editeur from '../src/models/editeur';
import Licence from '../src/models/licence';
import CodePromo from '../src/models/codePromotion';
import Somme from '../src/models/somme';
import Achat from '../src/models/achat';
import { Op } from 'sequelize';

describe('Routes Jeux', () => {
  let accessTokenGestionnaire: string;
  let vendeurId: number;
  let acheteurId: number;
  let sessionId: number;
  let editeurId1: number;
  let editeurId2: number;
  let licenceId1: number;
  let licenceId2: number;
  let licenceId3: number;
  const codePromoLibelle: string = 'PROMO10';
  let depotId: number;
  let jeuxDeposesIds: number[] = [];

  beforeAll(async () => {
    // 1. Création d'un éditeur
    const editeur1 = await Editeur.create({
      nom: 'Editeur Test1',
    });
    if (!editeur1 || !editeur1.id) {
      throw new Error('L\'éditeur n\'a pas pu être créé');
    }
    editeurId1 = editeur1.id;

    const editeur2 = await Editeur.create({
        nom: 'Editeur Test2',
      });
      if (!editeur2 || !editeur2.id) {
        throw new Error('L\'éditeur n\'a pas pu être créé');
      }
      editeurId2 = editeur2.id;

    // 2. Création d'une licence associée à l'éditeur
    const licence1 = await Licence.create({
      nom: 'Licence Test1',
      editeur_id: editeurId1,
    });
    if (!licence1 || !licence1.id) {
      throw new Error('La licence n\'a pas pu être créée');
    }
    licenceId1 = licence1.id;

    const licence2 = await Licence.create({
      nom: 'Licence Test',
      editeur_id: editeurId2,
    });
    if (!licence2 || !licence2.id) {
      throw new Error('La licence n\'a pas pu être créée');
    }
    licenceId2 = licence2.id;

    const licence3 = await Licence.create({
      nom: 'Licence Test',
      editeur_id: editeurId2,
    });
    if (!licence3 || !licence3.id) {
      throw new Error('La licence n\'a pas pu être créée');
    }
    licenceId3 = licence3.id;

    // 3. Création d'un code promo
    const codePromo = await CodePromo.create({
      libelle: codePromoLibelle,
      reductionPourcent: 10,
    });
    if (!codePromo) {
      throw new Error('Le code promo n\'a pas pu être créé');
    }

    // 4. Création d'un utilisateur gestionnaire
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
      throw new Error('L\'utilisateur gestionnaire n\'a pas pu être créé');
    }

    const gestionnaireEntry = await Administrateur.create({
      id: gestionnaire.id,
      mot_de_passe: hashedPasswordGestionnaire,
    });
    if (!gestionnaireEntry) {
      throw new Error('L\'entrée gestionnaire n\'a pas pu être créée');
    }

    // 5. Connexion du gestionnaire pour obtenir le token d'accès
    const gestionnaireLogin = await request(app).post('/api/gestionnaires/login').send({
      email: 'gestionnaire@test.com',
      motdepasse: motdepasseGestionnaire,
    });

    // Vérifier si la réponse du login a échoué
    if (gestionnaireLogin.status !== 200) {
      const messageErreur = gestionnaireLogin.body?.message || 'Aucun message d\'erreur fourni';
      throw new Error(`Connexion gestionnaire échouée avec statut ${gestionnaireLogin.status}. Message: ${messageErreur}`);
    }

    const setCookieHeader = gestionnaireLogin.headers['set-cookie'];
    if (!Array.isArray(setCookieHeader)) {
      throw new Error('set-cookie header n\'est pas un tableau.');
    }

    const accessTokenCookie = setCookieHeader.find(cookie => cookie.startsWith('accessToken='));
    if (!accessTokenCookie) {
      throw new Error('Cookie accessToken non trouvé dans la réponse de connexion.');
    }

    accessTokenGestionnaire = accessTokenCookie.split(';')[0].split('=')[1];
    if (!accessTokenGestionnaire) {
      throw new Error('Token d\'accès non extrait correctement.');
    }

    // 6. Création d'une session avec tous les champs requis
    const session = await SessionModel.create({
      date_debut: new Date(Date.now() - 1000 * 60 * 60 * 24),
      date_fin: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
      valeur_commission: 10,
      commission_en_pourcentage: true,
      valeur_frais_depot: 5,
      frais_depot_en_pourcentage: true,
    });
    if (!session || !session.id) {
      throw new Error('La session n\'a pas pu être créée');
    }
    sessionId = session.id;

    // 7. Création d'un vendeur
    const vendeurUtilisateur = await Utilisateur.create({
      nom: 'Vendeur Transaction Test',
      email: 'vendeur_transaction@test.com',
      telephone: '0102030409',
      adresse: '789 Rue Vendeur Transaction',
      type_utilisateur: 'vendeur',
    });
    if (!vendeurUtilisateur || !vendeurUtilisateur.id) {
      throw new Error('L\'utilisateur vendeur n\'a pas pu être créé');
    }

    const vendeur = await Vendeur.create({
      id: vendeurUtilisateur.id,
    });
    if (!vendeur || !vendeur.id) {
      throw new Error('L\'entrée vendeur n\'a pas pu être créée');
    }
    vendeurId = vendeur.id;

    // 8. Création d'un acheteur
    const acheteurUtilisateur = await Utilisateur.create({
      nom: 'Acheteur Transaction Test',
      email: 'acheteur_transaction@test.com',
      telephone: '0102030410',
      adresse: '123 Rue Acheteur Transaction',
      type_utilisateur: 'acheteur',
    });
    if (!acheteurUtilisateur || !acheteurUtilisateur.id) {
      throw new Error('L\'utilisateur acheteur n\'a pas pu être créé');
    }

    const acheteur = await Acheteur.create({
      id: acheteurUtilisateur.id,
    });
    if (!acheteur || !acheteur.id) {
      throw new Error('L\'entrée acheteur n\'a pas pu être créée');
    }
    acheteurId = acheteur.id;
  });

  afterAll(async () => {
    // 1. Supprimer les achats
    await Achat.destroy({ where: {} });

    // 2. Supprimer les sommes
    await Somme.destroy({ where: {} });

    // 3. Supprimer les jeux
    await Jeu.destroy({ where: {} });

    // 4. Supprimer les dépôts
    await Depot.destroy({ where: {} });

    // 5. Supprimer les utilisateurs et entités associées
    const utilisateurs = [
      'gestionnaire@test.com',
      'vendeur_transaction@test.com',
      'acheteur_transaction@test.com',
      'vendeur_sans_somme@test.com',
      'vendeur_sans_somme_update@test.com',
    ];

    for (const email of utilisateurs) {
      const utilisateur = await Utilisateur.findOne({ where: { email } });
      if (utilisateur) {
        if (utilisateur.type_utilisateur === 'gestionnaire') {
          await Administrateur.destroy({ where: { id: utilisateur.id } });
        } else if (utilisateur.type_utilisateur === 'vendeur') {
          await Vendeur.destroy({ where: { id: utilisateur.id } });
        } else if (utilisateur.type_utilisateur === 'acheteur') {
          await Acheteur.destroy({ where: { id: utilisateur.id } });
        }
        await utilisateur.destroy();
      }
    }

    // 6. Supprimer les sessions
    await SessionModel.destroy({ where: { id: sessionId } });

    // 7. Supprimer les licences et éditeurs
    await Licence.destroy({ where: { } });
    await Editeur.destroy({ where: { } });

    // 8. Supprimer les codes promo
    await CodePromo.destroy({ where: { libelle: codePromoLibelle } });
  });




  
  // Tests pour POST /api/jeux/deposer
  describe('POST /api/jeux/deposer', () => {
    it('devrait permettre de déposer plusieurs jeux sans codePromo', async () => {
      const nombreDeJeux = 30;
        
      const res = await request(app)
        .post('/api/jeux/deposer')
        .set('Cookie', `accessToken=${accessTokenGestionnaire}`)
        .send({
        licence: [licenceId2, licenceId3],
        quantite: [20, 10],
        prix: [10, 50],
        id_vendeur: vendeurId,
      });
        
      // Assertions sur la réponse HTTP
      expect(res.status).toBe(201);
      expect(res.body.message).toBe('Dépôt effectué avec succès et jeux créés.');
      expect(res.body.fraisDepot).toBeDefined();

      // Recherche du dépôt associé au vendeur et à la session actuelle
      const depot = await Depot.findOne({
        where: {
        vendeur_id: vendeurId,     
        session_id: sessionId,     
        },
      });

      // Vérification que le dépôt a bien été trouvé
      expect(depot).not.toBeNull();

      // Assignation sécurisée de depotId
      depotId = depot!.id;

      // Récupération des jeux déposés depuis la base de données
      const jeuxDeposes = await Jeu.findAll({
        where: {
        depot_id: depotId,
        statut: 'récuperable',
        },
      });

      // Vérification du nombre de jeux déposés
      expect(jeuxDeposes.length).toBeGreaterThanOrEqual(nombreDeJeux);

      // Stockage des IDs des jeux déposés pour les tests ultérieurs
      jeuxDeposesIds = jeuxDeposes.map(jeu => jeu.id);

      // Vérification que chaque jeu est en statut 'récuperable' et a les attributs corrects
      jeuxDeposes.forEach(jeu => {
        expect(jeu.statut).toBe('récuperable');
        if (jeu.licence_id === licenceId2) {
          expect(jeu.licence_id).toBe(licenceId2);
          expect(jeu.prix).toBe('10.00');
        } else if (jeu.licence_id === licenceId3) {
          expect(jeu.licence_id).toBe(licenceId3);
          expect(jeu.prix).toBe('50.00');
        } else {
            expect(jeu.licence_id).toBe(-1);
        }      
        });

      // Assurez-vous que les frais de dépôt sont calculés correctement
      expect(parseFloat(res.body.fraisDepot)).toBeGreaterThanOrEqual(0);
    });

    it('devrait permettre de déposer plusieurs jeux avec un code promo valide', async () => {
      const res = await request(app)
        .post('/api/jeux/deposer')
        .set('Cookie', `accessToken=${accessTokenGestionnaire}`)
        .send({
          licence: [licenceId1],
          quantite: [20],
          prix: [10],
          code_promo: codePromoLibelle,
          id_vendeur: vendeurId,
        });

      expect(res.status).toBe(201);
      expect(res.body.message).toBe('Dépôt effectué avec succès et jeux créés.');
      expect(res.body.fraisDepot).toBeDefined();
    });

    it('devrait permettre de déposer plusieurs jeux sans code promo', async () => {
      const nombreDeJeux = 15; // Nombre de jeux à déposer

      const res = await request(app)
        .post('/api/jeux/deposer')
        .set('Cookie', `accessToken=${accessTokenGestionnaire}`)
        .send({
          licence: [licenceId1],
          quantite: [2],
          prix: [150],
          id_vendeur: vendeurId,
        });

      expect(res.status).toBe(201);
      expect(res.body.message).toBe('Dépôt effectué avec succès et jeux créés.');
      expect(res.body.fraisDepot).toBeDefined();
    });

    it('ne devrait pas permettre de déposer des jeux avec un code promo invalide', async () => {
      const res = await request(app)
        .post('/api/jeux/deposer')
        .set('Cookie', `accessToken=${accessTokenGestionnaire}`)
        .send({
          licence: [licenceId1],
          quantite: [1],
          prix: [100],
          code_promo: 'INVALIDPROMO',
          id_vendeur: vendeurId,
        });

      expect(res.status).toBe(404);
      expect(res.text).toBe('Code promo invalide.');
    });

    it('ne devrait pas permettre de déposer des jeux avec des licences invalides', async () => {
      const res = await request(app)
        .post('/api/jeux/deposer')
        .set('Cookie', `accessToken=${accessTokenGestionnaire}`)
        .send({
          licence: [9999],
          quantite: [1],
          prix: [100],
          id_vendeur: vendeurId,
        });

      expect(res.status).toBe(404);
      expect(res.text).toBe('Licence avec l\'ID 9999 introuvable.');
    });

    it('ne devrait pas permettre de déposer des jeux avec des quantités invalides', async () => {
      const res = await request(app)
        .post('/api/jeux/deposer')
        .set('Cookie', `accessToken=${accessTokenGestionnaire}`)
        .send({
          licence: [licenceId1],
          quantite: [0],
          prix: [100],
          id_vendeur: vendeurId,
        });

      expect(res.status).toBe(400);
      expect(res.body.errors).toBeDefined();
      expect(res.body.errors[0].msg).toBe('Chaque quantite doit être un entier positif.');
    });

    it('ne devrait pas permettre de déposer des jeux avec des prix invalides', async () => {
      const res = await request(app)
        .post('/api/jeux/deposer')
        .set('Cookie', `accessToken=${accessTokenGestionnaire}`)
        .send({
          licence: [licenceId1],
          quantite: [1],
          prix: [-50],
          id_vendeur: vendeurId,
        });

      expect(res.status).toBe(400);
      expect(res.body.errors).toBeDefined();
      expect(res.body.errors[0].msg).toBe('Chaque prix doit être un nombre positif ou nul.');
    });

    it('ne devrait pas permettre de déposer des jeux sans être connecté', async () => {
      const res = await request(app)
        .post('/api/jeux/deposer')
        .send({
          licence: [licenceId1],
          quantite: [1],
          prix: [100],
          id_vendeur: vendeurId,
        });

      expect(res.status).toBe(401);
    });
  });





  // Tests pour PUT /api/jeux/updateStatus
  describe('PUT /api/jeux/updateStatus', () => {
    // Avant de tester, sélectionner quelques jeux déposés pour les mettre à jour
    let jeuxToUpdateIds: number[] = [];

    beforeAll(async () => {
      // Sélectionner 10 jeux déposés pour les mettre à jour
      const jeux = await Jeu.findAll({
        where: {
          id: jeuxDeposesIds.slice(0, 40),
        }, 
      });

      jeuxToUpdateIds = jeux.map(jeu => jeu.id);
    });

    it('devrait mettre à jour le statut des jeux avec succès', async () => {
      const res = await request(app)
        .put('/api/jeux/updateStatus')
        .set('Cookie', `accessToken=${accessTokenGestionnaire}`)
        .send({
          jeux_ids: jeuxToUpdateIds,
          nouveau_statut: 'en vente',
        });

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Le statut des jeux a été mis à jour avec succès.');
      expect(res.body.jeux_ids).toEqual(jeuxToUpdateIds);
      expect(res.body.nouveau_statut).toBe('en vente');

      // Vérifier que les jeux ont bien été mis à jour
      const jeuxMisAJour = await Jeu.findAll({ where: { id: jeuxToUpdateIds } });
      jeuxMisAJour.forEach(jeu => {
        expect(jeu.statut).toBe('en vente');
      });
    });

    it('ne devrait pas permettre de mettre à jour le statut de jeux inexistants', async () => {
      const res = await request(app)
        .put('/api/jeux/updateStatus')
        .set('Cookie', `accessToken=${accessTokenGestionnaire}`)
        .send({
          jeux_ids: [9999],
          nouveau_statut: 'vendu',
        });

      expect(res.status).toBe(400);
      expect(res.text).toBe('Certains jeux ne peuvent pas être trouvés ou n\'existent pas : 9999');
    });

    it('ne devrait pas permettre de mettre à jour le statut avec un statut invalide', async () => {
      const res = await request(app)
        .put('/api/jeux/updateStatus')
        .set('Cookie', `accessToken=${accessTokenGestionnaire}`)
        .send({
          jeux_ids: jeuxToUpdateIds,
          nouveau_statut: 'invalid_status',
        });

      expect(res.status).toBe(400);
      expect(res.body.errors).toBeDefined();
      expect(res.body.errors[0].msg).toBe('Le champ nouveau_statut doit être une valeur valide.');
    });

    it('ne devrait pas permettre de mettre à jour le statut sans être connecté', async () => {
      const res = await request(app)
        .put('/api/jeux/updateStatus')
        .send({
          jeux_ids: jeuxToUpdateIds,
          nouveau_statut: 'vendu',
        });

      expect(res.status).toBe(401);
    });
  });





  // Tests pour POST /api/jeux/recuperer
  describe('POST /api/jeux/recuperer', () => {
    let jeuxToRecupererIds: number[] = [];

    beforeAll(async () => {
        // Sélectionner les 15 jeux déposés pour les mettre à jour
        const jeux = await Jeu.findAll({
          where: {
            id: jeuxDeposesIds.slice(0, 15),
            statut:['en vente', 'récupérable'],
          },
        });
        expect(jeux.length).toBeGreaterThanOrEqual(2);
        jeuxToRecupererIds = jeux.map(jeu => jeu.id);
    });

    it('devrait permettre de récupérer des jeux avec succès', async () => {
      const res = await request(app)
        .post('/api/jeux/recuperer')
        .set('Cookie', `accessToken=${accessTokenGestionnaire}`)
        .send({
          jeux_a_recup: jeuxToRecupererIds,
        });

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Les jeux ont été récupérés avec succès.');
      expect(res.body.jeux_recuperes).toBeDefined();
      expect(Array.isArray(res.body.jeux_recuperes)).toBe(true);
      expect(res.body.jeux_recuperes.length).toBe(jeuxToRecupererIds.length);

      // Vérifier que les jeux ont bien été mis à jour
      const jeuxMisAJour = await Jeu.findAll({ where: { id: jeuxToRecupererIds } });
      jeuxMisAJour.forEach(jeu => {
        expect(jeu.statut).toBe('récupéré');
      });
    });

    it('ne devrait pas permettre de récupérer des jeux inexistants ou non éligibles', async () => {
      const res = await request(app)
        .post('/api/jeux/recuperer')
        .set('Cookie', `accessToken=${accessTokenGestionnaire}`)
        .send({
          jeux_a_recup: [9999, jeuxToRecupererIds[0]],
        });

      expect(res.status).toBe(400);
    });

    it('ne devrait pas permettre de récupérer des jeux sans être connecté', async () => {
      const res = await request(app)
        .post('/api/jeux/recuperer')
        .send({
          jeux_a_recup: jeuxToRecupererIds,
        });

      expect(res.status).toBe(401);
    });
  });
  




  // Tests pour POST /api/jeux/acheter
  describe('POST /api/jeux/acheter', () => {
    let jeuxToAcheterIds: number[] = [];
    let jeuxToAcheterIds1: number[] = [];
    let jeuxToAcheterIds2: number[] = [];


    beforeAll(async () => {
        // Sélectionner les 15 jeux déposés pour les mettre à jour
        const jeux = await Jeu.findAll({
          where: {
            id: jeuxDeposesIds.slice(20, 30),
            statut:['en vente', 'récupérable'],
          },
        });
        expect(jeux.length).toBeGreaterThanOrEqual(2);

        // Diviser les jeux en 3 groupes de 5 jeux chacun
        const jeuxGroup1 = jeux.slice(0, jeux.length/2);
        const jeuxGroup2 = jeux.slice(jeux.length/2, jeux.length);
        expect(jeuxGroup1.length).toBeGreaterThanOrEqual(1);
        expect(jeuxGroup2.length).toBeGreaterThanOrEqual(1);


        // Stocker les IDs pour chaque groupe
        jeuxToAcheterIds1 = jeuxGroup1.map(jeu => jeu.id);
        jeuxToAcheterIds2 = jeuxGroup2.map(jeu => jeu.id);
    });

    it('devrait permettre d\'acheter des jeux avec un code promo valide et un acheteur valide', async () => {
      const res = await request(app)
        .post('/api/jeux/acheter')
        .set('Cookie', `accessToken=${accessTokenGestionnaire}`)
        .send({
          jeux_a_acheter: jeuxToAcheterIds1,
          code_promo: codePromoLibelle,
          acheteur: acheteurId,
        });

      expect(res.status).toBe(201);
      expect(res.body.message).toBe('Les jeux ont été achetés avec succès.');
      expect(res.body.achats).toBeDefined();
      expect(Array.isArray(res.body.achats)).toBe(true);
      const achatsCount = Array.isArray(res.body.achats) ? res.body.achats.length : Object.keys(res.body.achats).length;
      expect(achatsCount).toBe(jeuxToAcheterIds1.length);

      // Vérifier que les jeux ont bien été mis à jour
      const jeuxMisAJour = await Jeu.findAll({ where: { id: jeuxToAcheterIds1 } });
      expect(jeuxMisAJour.length).toBe(jeuxToAcheterIds1.length);
      jeuxMisAJour.forEach(jeu => {
        expect(jeu.statut).toBe('vendu');
      });

      // Vérifier que les sommes dues ont été mises à jour
      const somme = await Somme.findOne({
        where: {
          utilisateurId: vendeurId,
          sessionId: sessionId,
        },
      });
      expect(somme).toBeDefined();
      expect(parseFloat(somme!.sommedue.toString())).toBeGreaterThanOrEqual(0);
      expect(parseFloat(somme!.sommegenerée.toString())).toBeGreaterThanOrEqual(0);
    });

    it('devrait permettre d\'acheter des jeux avec un code promo valide sans fournir d\'acheteur', async () => {
      const res = await request(app)
        .post('/api/jeux/acheter')
        .set('Cookie', `accessToken=${accessTokenGestionnaire}`)
        .send({
          jeux_a_acheter: jeuxToAcheterIds2,
          code_promo: codePromoLibelle,
        });
      
      expect(res.status).toBe(201);
      expect(res.body.message).toBe('Les jeux ont été achetés avec succès.');
      expect(res.body.achats).toBeDefined();
      expect(Array.isArray(res.body.achats)).toBe(true);
      const achatsCount = Array.isArray(res.body.achats) ? res.body.achats.length : Object.keys(res.body.achats).length;
      expect(achatsCount).toBe(jeuxToAcheterIds2.length);

      // Vérifier que les jeux ont bien été mis à jour
      const jeuxMisAJour = await Jeu.findAll({ where: { id: jeuxToAcheterIds2 } });
      jeuxMisAJour.forEach(jeu => {
        expect(jeu.statut).toBe('vendu');
      });
      
      // Vérifier que les sommes dues ont été mises à jour
      const somme = await Somme.findOne({
        where: {
          utilisateurId: vendeurId,
          sessionId: sessionId,
        },
      });
      expect(somme).toBeDefined();
      expect(parseFloat(somme!.sommedue.toString())).toBeGreaterThanOrEqual(0);
      expect(parseFloat(somme!.sommegenerée.toString())).toBeGreaterThanOrEqual(0);
    });      

    it('ne devrait pas permettre d\'acheter des jeux avec un code promo invalide', async () => {
      const res = await request(app)
        .post('/api/jeux/acheter')
        .set('Cookie', `accessToken=${accessTokenGestionnaire}`)
        .send({
          jeux_a_acheter: [jeuxToAcheterIds[0]],
          code_promo: 'INVALIDPROMO',
          acheteur: acheteurId,
        });

      expect(res.status).toBe(400);
    });

    it('ne devrait pas permettre d\'acheter des jeux inexistants ou déjà vendus', async () => {
      const res = await request(app)
        .post('/api/jeux/acheter')
        .set('Cookie', `accessToken=${accessTokenGestionnaire}`)
        .send({
          jeux_a_acheter: [9999, jeuxToAcheterIds1[0]],
          code_promo: codePromoLibelle,
          acheteur: acheteurId,
        });

      expect(res.status).toBe(400);
    });

    it('ne devrait pas permettre d\'acheter des jeux sans être connecté', async () => {
      const res = await request(app)
        .post('/api/jeux/acheter')
        .send({
          jeux_a_acheter: [jeuxToAcheterIds1[1]],
          code_promo: codePromoLibelle,
          acheteur: acheteurId,
        });

      expect(res.status).toBe(401);
    });

    it('ne devrait pas permettre d\'acheter des jeux avec un acheteur invalide', async () => {
      const res = await request(app)
        .post('/api/jeux/acheter')
        .set('Cookie', `accessToken=${accessTokenGestionnaire}`)
        .send({
          jeux_a_acheter: [jeuxToAcheterIds1[1]],
          code_promo: codePromoLibelle,
          acheteur: 9999,
        });

      expect(res.status).toBe(404);
      expect(res.text).toBe('Acheteur non trouvé.');
    });
  });





  // Tests pour GET /api/jeux/rechercher
  describe('GET /api/jeux/rechercher', () => {
    // Variables pour stocker les IDs
    let vendeurId: number;
    let accessTokenGestionnaire: string;
    let editeurId1: number;
    let editeurId2: number;
    let licenceId1: number;
    let licenceId2: number;
    let licenceId3: number;
    let jeuxDeposesIds: number[] = [];

    beforeAll(async () => {
      const gestionnaireLogin = await request(app).post('/api/gestionnaires/login').send({
        email: 'gestionnaire@test.com',
        motdepasse: 'passwordGestionnaire123',
      });

      if (gestionnaireLogin.status !== 200) {
        throw new Error('Échec de la connexion du gestionnaire pour les tests de recherche.');
      }

      const setCookieHeader = gestionnaireLogin.headers['set-cookie'];
      if (!Array.isArray(setCookieHeader)) {
        throw new Error('set-cookie header n\'est pas un tableau.');
      }

      const accessTokenCookie = setCookieHeader.find(cookie => cookie.startsWith('accessToken='));
      if (!accessTokenCookie) {
        throw new Error('Cookie accessToken non trouvé dans la réponse de connexion.');
      }

      accessTokenGestionnaire = accessTokenCookie.split(';')[0].split('=')[1];

      // 2. Création d'un vendeur pour les tests
      const vendeurUtilisateur = await Utilisateur.create({
        nom: 'Vendeur Test Recherche',
        email: 'vendeur_recherche@test.com',
        telephone: '0102030411',
        adresse: '456 Rue Vendeur Recherche',
        type_utilisateur: 'vendeur',
      });
      if (!vendeurUtilisateur || !vendeurUtilisateur.id) {
        throw new Error('L\'utilisateur vendeur n\'a pas pu être créé');
      }

      const vendeur = await Vendeur.create({
        id: vendeurUtilisateur.id,
      });
      if (!vendeur || !vendeur.id) {
        throw new Error('L\'entrée vendeur n\'a pas pu être créée');
      }
      vendeurId = vendeur.id;

      // 3. Création de deux éditeurs
      const editeur1 = await Editeur.create({
        nom: 'Editeur Test1',
      });
      if (!editeur1 || !editeur1.id) {
        throw new Error('L\'éditeur n\'a pas pu être créé');
      }
      editeurId1 = editeur1.id;

      const editeur2 = await Editeur.create({
        nom: 'Editeur Test2',
      });
      if (!editeur2 || !editeur2.id) {
        throw new Error('L\'éditeur n\'a pas pu être créé');
      }
      editeurId2 = editeur2.id;

      // 4. Création de trois licences associées aux éditeurs
      const licence1 = await Licence.create({
        nom: 'Licence Test1',
        editeur_id: editeurId1,
      });
      if (!licence1 || !licence1.id) {
        throw new Error('La licence n\'a pas pu être créée');
      }
      licenceId1 = licence1.id;

      const licence2 = await Licence.create({
        nom: 'Licence Test2',
        editeur_id: editeurId2,
      });
      if (!licence2 || !licence2.id) {
        throw new Error('La licence n\'a pas pu être créée');
      }
      licenceId2 = licence2.id;

      const licence3 = await Licence.create({
        nom: 'Licence Test3',
        editeur_id: editeurId2,
      });
      if (!licence3 || !licence3.id) {
        throw new Error('La licence n\'a pas pu être créée');
      }
      licenceId3 = licence3.id;

      // 5. Dépôt de jeux via la route /api/jeux/deposer
      const res = await request(app)
        .post('/api/jeux/deposer')
        .set('Cookie', `accessToken=${accessTokenGestionnaire}`)
        .send({
          licence: [licenceId1, licenceId2, licenceId3],
          quantite: [2, 2, 2],
          prix: [60, 80, 100],
          id_vendeur: vendeurId,
        });

      expect(res.status).toBe(201);
      expect(res.body.message).toBe('Dépôt effectué avec succès et jeux créés.');
      expect(res.body.fraisDepot).toBeDefined();

      // Récupération des jeux déposés depuis la base de données
      const jeuxDeposes = await Jeu.findAll({
        where: {
          statut: 'récuperable',
        },
      });

      // Stockage des IDs des jeux déposés pour les tests ultérieurs
      jeuxDeposesIds = jeuxDeposes.map(jeu => jeu.id);

      // Mettre à jour le statut des jeux en 'en vente' via la route updateStatus
      const updateRes = await request(app)
        .put('/api/jeux/updateStatus')
        .set('Cookie', `accessToken=${accessTokenGestionnaire}`)
        .send({
          jeux_ids: jeuxDeposesIds,
          nouveau_statut: 'en vente',
        });

      expect(updateRes.status).toBe(200);
      expect(updateRes.body.message).toBe('Le statut des jeux a été mis à jour avec succès.');
    });

    it('devrait rechercher des jeux en vente avec des filtres spécifiques', async () => {
      const res = await request(app)
        .get('/api/jeux/rechercher')
        .query({
          numpage: 1,
          licence: 'Licence Test Recherche1',
          editeur: 'Editeur Test Recherche1',
          price_min: 50,
          price_max: 200,
        });
  
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
  
      // Vérifier que chaque jeu respecte les filtres
      res.body.forEach((jeu: any) => {
        expect(parseFloat(jeu.prix_min)).toBeGreaterThanOrEqual(50);
        expect(parseFloat(jeu.prix_max)).toBeLessThanOrEqual(200);
        expect(jeu.licence_nom).toBe('Licence Test Recherche1');
        expect(jeu.editeur_nom).toBe('Editeur Test Recherche1');
      });
    });
  
    it('devrait retourner une erreur 400 pour des paramètres invalides', async () => {
      const res = await request(app)
        .get('/api/jeux/rechercher')
        .query({
          numpage: 'abc', // Invalide
          price_min: -10, // Invalide
          price_max: 'xyz', // Invalide
        });
  
      expect(res.status).toBe(400);
      expect(res.body.errors).toBeDefined();
      expect(Array.isArray(res.body.errors)).toBe(true);
      expect(res.body.errors.length).toBeGreaterThan(0);
  
      const messages = res.body.errors.map((err: any) => err.msg);
      expect(messages).toContain('Le paramètre numpage doit être un entier positif.');
      expect(messages).toContain('Le paramètre price_min doit être un nombre positif.');
      expect(messages).toContain('Le paramètre price_max doit être un nombre positif.');
    });
  
    it('devrait paginer correctement les résultats', async () => {
      // Récupérer la première page
      const resPage1 = await request(app)
        .get('/api/jeux/rechercher')
        .query({
          numpage: 1,
          limit: 20, // Supposons que vous avez ajouté la possibilité de définir le nombre de résultats par page
        });
  
      expect(resPage1.status).toBe(200);
      expect(Array.isArray(resPage1.body)).toBe(true);
      expect(resPage1.body.length).toBeLessThanOrEqual(20);
  
      // Récupérer la deuxième page
      const resPage2 = await request(app)
        .get('/api/jeux/rechercher')
        .query({
          numpage: 2,
          limit: 20,
        });
  
      expect(resPage2.status).toBe(200);
      expect(Array.isArray(resPage2.body)).toBe(true);
      expect(resPage2.body.length).toBeLessThanOrEqual(20);
  
      // Vérifier que les jeux de la page 2 sont différents de ceux de la page 1
      const idsPage1 = resPage1.body.map((jeu: any) => jeu.id);
      const idsPage2 = resPage2.body.map((jeu: any) => jeu.id);
  
      const intersection = idsPage1.filter((id: number) => idsPage2.includes(id));
      expect(intersection.length).toBe(0);
    });
  
    it('devrait retourner des jeux sans filtres', async () => {
      const res = await request(app)
        .get('/api/jeux/rechercher');
  
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
  
      // Vérifier que des jeux sont retournés
      expect(res.body.length).toBeGreaterThan(0);
    });
  
    it('devrait retourner des jeux en fonction du prix minimum uniquement', async () => {
      const res = await request(app)
        .get('/api/jeux/rechercher')
        .query({
          price_min: 90,
        });
  
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
  
      // Vérifier que chaque jeu a un prix minimum supérieur ou égal à 90
      res.body.forEach((jeu: any) => {
        expect(parseFloat(jeu.prix_min)).toBeGreaterThanOrEqual(90);
      });
    });
  
    it('devrait retourner des jeux en fonction du prix maximum uniquement', async () => {
      const res = await request(app)
        .get('/api/jeux/rechercher')
        .query({
          price_max: 70,
        });
  
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
  
      // Vérifier que chaque jeu a un prix maximum inférieur ou égal à 70
      res.body.forEach((jeu: any) => {
        expect(parseFloat(jeu.prix_max)).toBeLessThanOrEqual(70);
      });
    });
  
    it('devrait retourner des jeux en fonction de la licence uniquement', async () => {
      const res = await request(app)
        .get('/api/jeux/rechercher')
        .query({
          licence: 'Licence Test Recherche2',
        });
  
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
  
      // Vérifier que chaque jeu correspond à la licence spécifiée
      res.body.forEach((jeu: any) => {
        expect(jeu.licence_nom).toBe('Licence Test Recherche2');
      });
    });
  
    it('devrait retourner des jeux en fonction de l\'éditeur uniquement', async () => {
      const res = await request(app)
        .get('/api/jeux/rechercher')
        .query({
          editeur: 'Editeur Test Recherche2',
        });
  
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
  
      // Vérifier que chaque jeu correspond à l'éditeur spécifié
      res.body.forEach((jeu: any) => {
        expect(jeu.editeur_nom).toBe('Editeur Test Recherche2');
      });
    });
  
    it('devrait retourner une erreur 400 si aucun jeu ne correspond aux filtres', async () => {
      const res = await request(app)
        .get('/api/jeux/rechercher')
        .query({
          licence: 'Licence Inexistante',
        });
  
      // Selon votre implémentation, cela peut retourner un tableau vide ou une erreur 404
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(0);
    });
  });
});