import request from 'supertest';
import bcrypt from 'bcrypt';
import app from '../src/server';
import { Op, Sequelize, fn, col } from 'sequelize';
import Utilisateur from '../src/models/utilisateur';
import Administrateur from '../src/models/administrateur';
import Licence from '../src/models/licence';
import Editeur from '../src/models/editeur';
import Jeu from '../src/models/jeu';
import Vendeur from '../src/models/vendeur';
import Achat from '../src/models/achat';
import Acheteur from '../src/models/acheteur';
import Depot from '../src/models/depot';
import Session from '../src/models/session';
import Somme from '../src/models/somme';
import { format, addHours } from 'date-fns';

describe('Vendeur Routes', () => {
    let accessTokenGestionnaire: string;
    let gestionnaireId: number;
    let vendeurId: number;
    let sessionId: number;
    let editeurId1: number;
    let editeurId2: number;
    let licenceId1: number;
    let licenceId2: number;
    let depotId: number;
    let acheteurId: number;

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
            await jeu.update({ updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24) });
        }

        for (let i = 0; i < 3; i++) {
            const jeu = await Jeu.create({
                licence_id: licenceId2,
                prix: 70,
                statut: 'vendu',
                depot_id: depotId,
            });
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

        // 10. Création d'un acheteur pour les tests
        const acheteur = await Utilisateur.create({
            nom: 'Acheteur Test',
            email: 'acheteur@test.com',
            telephone: '0102030411',
            adresse: '456 Rue Acheteur',
            type_utilisateur: 'acheteur',
        });
        if (!acheteur || !acheteur.id) {
            throw new Error("L'utilisateur acheteur n'a pas pu être créé");
        }
        const acheteurInstance = await Acheteur.create({
            id: acheteur.id,
        });
        if (!acheteurInstance) {
            throw new Error("L'entrée acheteur n'a pas pu être créée");
        }

        acheteurId = acheteur.id;

        // 11. Création des achats pour les jeux vendus
        const jeux = await Jeu.findAll({ where: { depot_id: depotId } });
        const dateTransaction = new Date();

        for (const jeu of jeux) {
            const achat = await Achat.create({
                jeu_id: jeu.id,
                acheteur_id: acheteur.id,
                date_transaction: dateTransaction,
                commission: 5.0,
            });

            if (!achat || !achat.id) {
                throw new Error("L'achat n'a pas pu être créé pour le jeu avec id " + jeu.id);
            }
        }
    });

    afterAll(async () => {
        // Nettoyage des données créées pendant les tests
        await Somme.destroy({ where: {} });
        await Achat.destroy({ where: {} });
        await Jeu.destroy({ where: {} });
        await Depot.destroy({ where: {} });
        await Licence.destroy({ where: {} });
        await Editeur.destroy({ where: {} });
        await Session.destroy({ where: {} });

        // Suppression des utilisateurs et des entrées associées
        await Acheteur.destroy({ where: { id: acheteurId } });
        await Utilisateur.destroy({ where: { id: acheteurId } });

        await Vendeur.destroy({ where: { id: vendeurId } });
        await Utilisateur.destroy({ where: { id: vendeurId } });

        await Administrateur.destroy({ where: { id: gestionnaireId } });
        await Utilisateur.destroy({ where: { id: gestionnaireId } });
    });

    describe('GET /stock/:idsession/:idvendeur', () => {
        it('devrait récupérer les jeux pour une session et un vendeur', async () => {
            const res = await request(app)
                .get(`/api/vendeurs/stock/${sessionId}/${vendeurId}`)
                .set('Cookie', `accessToken=${accessTokenGestionnaire}`)
                .query({ numpage: 1 })
                .expect(200);

            expect(Array.isArray(res.body)).toBe(true);
            // Vérifiez que les jeux retournés correspondent aux critères
            res.body.forEach((jeu: any) => {
                expect(['en vente', 'vendu', 'récuperable', 'récupéré']).toContain(jeu.statut);
                expect(jeu.depot).toBeDefined();
                expect(jeu.depot.vendeur_id).toBe(vendeurId);
                expect(jeu.depot.session_id).toBe(sessionId);
            });
        });

        it('devrait retourner 404 si le vendeur n\'existe pas', async () => {
            const res = await request(app)
                .get(`/api/vendeurs/stock/${sessionId}/9999`) // ID vendeur inexistant
                .set('Cookie', `accessToken=${accessTokenGestionnaire}`)
                .expect(404);

            expect(res.text).toBe('Vendeur non trouvé.');
        });

        it('devrait retourner 400 si les paramètres sont invalides', async () => {
            const res = await request(app)
                .get(`/api/vendeurs/stock/${sessionId}/invalidVendeurId`)
                .set('Cookie', `accessToken=${accessTokenGestionnaire}`)
                .expect(400);

            expect(res.body).toHaveProperty('errors');
            expect(res.body.errors[0].msg).toBe('idvendeur doit être un entier positif');
        });
    });

    describe('GET /stock/:idsession/:idvendeur/:statut', () => {
        it('devrait récupérer les jeux pour une session, un vendeur et un statut donné', async () => {
            const res = await request(app)
                .get(`/api/vendeurs/stock/${sessionId}/${vendeurId}/vendu`)
                .set('Cookie', `accessToken=${accessTokenGestionnaire}`)
                .query({ numpage: 1 })
                .expect(200);

            expect(Array.isArray(res.body)).toBe(true);
            res.body.forEach((jeu: any) => {
                expect(jeu.statut).toBe('vendu');
                expect(jeu.depot).toBeDefined();
                expect(jeu.depot.vendeur_id).toBe(vendeurId);
                expect(jeu.depot.session_id).toBe(sessionId);
            });
        });

        it('devrait retourner 404 si le vendeur n\'existe pas', async () => {
            const res = await request(app)
                .get(`/api/vendeurs/stock/${sessionId}/9999/vendu`) // ID vendeur inexistant
                .set('Cookie', `accessToken=${accessTokenGestionnaire}`)
                .expect(404);

            expect(res.text).toBe('Vendeur non trouvé.');
        });

        it('devrait retourner 400 si le statut est invalide', async () => {
            const res = await request(app)
                .get(`/api/vendeurs/stock/${sessionId}/${vendeurId}/invalidStatut`)
                .set('Cookie', `accessToken=${accessTokenGestionnaire}`)
                .expect(400);

            expect(res.body).toHaveProperty('errors');
            expect(res.body.errors[0].msg).toBe('Statut invalide.');
        });
    });

    describe('GET /sommedue/:idsession/:idvendeur', () => {
        it('devrait récupérer la somme due pour une session et un vendeur', async () => {
            const res = await request(app)
                .get(`/api/vendeurs/sommedue/${sessionId}/${vendeurId}`)
                .set('Cookie', `accessToken=${accessTokenGestionnaire}`)
                .expect(200);

            expect(res.body).toHaveProperty('sommedue');
            expect(res.body.sommedue).toBe("100");
        });

        it('devrait retourner 404 si aucune somme due n\'est trouvée', async () => {
            const res = await request(app)
                .get(`/api/vendeurs/sommedue/${sessionId}/9999`) // ID vendeur inexistant
                .set('Cookie', `accessToken=${accessTokenGestionnaire}`)
                .expect(404);

            expect(res.text).toBe('Aucune somme due trouvée pour cette session.');
        });

        it('devrait retourner 400 si les paramètres sont invalides', async () => {
            const res = await request(app)
                .get(`/api/vendeurs/sommedue/${sessionId}/invalidVendeurId`)
                .set('Cookie', `accessToken=${accessTokenGestionnaire}`)
                .expect(400);

            expect(res.body).toHaveProperty('errors');
            expect(res.body.errors[0].msg).toBe('idvendeur doit être un entier positif');
        });
    });

    describe('PUT /sommedue/:idsession/:idvendeur', () => {
        it('devrait mettre à jour la somme due à zéro pour une session et un vendeur', async () => {
            const res = await request(app)
                .put(`/api/vendeurs/sommedue/${sessionId}/${vendeurId}`)
                .set('Cookie', `accessToken=${accessTokenGestionnaire}`)
                .expect(200);

            expect(res.body).toHaveProperty('message', 'Somme due mise à jour à zéro.');

            // Vérifiez que la somme due est bien mise à jour dans la base de données
            const updatedSomme = await Somme.findOne({
                where: {
                    utilisateurId: vendeurId,
                    sessionId: sessionId,
                },
            });
            expect(updatedSomme).toBeDefined();
            expect(updatedSomme!.sommedue).toBe("0");
        });

        it('devrait retourner 404 si aucune somme due n\'est trouvée', async () => {
            const res = await request(app)
                .put(`/api/vendeurs/sommedue/${sessionId}/9999`) // ID vendeur inexistant
                .set('Cookie', `accessToken=${accessTokenGestionnaire}`)
                .expect(404);

            expect(res.text).toBe('Aucune somme due trouvée pour cette session.');
        });

        it('devrait retourner 400 si les paramètres sont invalides', async () => {
            const res = await request(app)
                .put(`/api/vendeurs/sommedue/${sessionId}/invalidVendeurId`)
                .set('Cookie', `accessToken=${accessTokenGestionnaire}`)
                .expect(400);

            expect(res.body).toHaveProperty('errors');
            expect(res.body.errors[0].msg).toBe('idvendeur doit être un entier positif');
        });
    });

    describe('GET /argentgagne/:idsession/:idvendeur', () => {
        it('devrait récupérer l\'argent généré par les ventes pour une session et un vendeur', async () => {
            const res = await request(app)
                .get(`/api/vendeurs/argentgagne/${sessionId}/${vendeurId}`)
                .set('Cookie', `accessToken=${accessTokenGestionnaire}`)
                .expect(200);

            expect(res.body).toHaveProperty('sommegenerée');
            expect(res.body.sommegenerée).toBe("150");
        });

        it('devrait retourner 404 si aucune somme générée n\'est trouvée', async () => {
            const res = await request(app)
                .get(`/api/vendeurs/argentgagne/${sessionId}/9999`) // ID vendeur inexistant
                .set('Cookie', `accessToken=${accessTokenGestionnaire}`)
                .expect(404);

            expect(res.text).toBe('Aucune somme générée trouvée pour cette session.');
        });

        it('devrait retourner 400 si les paramètres sont invalides', async () => {
            const res = await request(app)
                .get(`/api/vendeurs/argentgagne/${sessionId}/invalidVendeurId`)
                .set('Cookie', `accessToken=${accessTokenGestionnaire}`)
                .expect(400);

            expect(res.body).toHaveProperty('errors');
            expect(res.body.errors[0].msg).toBe('idvendeur doit être un entier positif');
        });
    });

    describe('GET /stats/:idvendeur', () => {
        it('devrait récupérer les statistiques des jeux vendus par licence pour un vendeur', async () => {
            const res = await request(app)
                .get(`/api/vendeurs/stats/${vendeurId}`)
                .set('Cookie', `accessToken=${accessTokenGestionnaire}`)
                .expect(200);

            expect(Array.isArray(res.body)).toBe(true);
            // Vérifiez la structure des statistiques
            res.body.forEach((stat: any) => {
                expect(stat).toHaveProperty('licence_id');
                expect(stat).toHaveProperty('quantiteVendu');
            });
        });

        it('devrait retourner 404 si le vendeur n\'existe pas', async () => {
            const res = await request(app)
                .get(`/api/vendeurs/stats/9999`) // ID vendeur inexistant
                .set('Cookie', `accessToken=${accessTokenGestionnaire}`)
                .expect(404);

            expect(res.text).toBe('Vendeur non trouvé.');
        });

        it('devrait retourner 400 si l\'ID du vendeur est invalide', async () => {
            const res = await request(app)
                .get(`/api/vendeurs/stats/invalidVendeurId`)
                .set('Cookie', `accessToken=${accessTokenGestionnaire}`)
                .expect(400);

            expect(res.body).toHaveProperty('errors');
            expect(res.body.errors[0].msg).toBe('L\'ID du vendeur doit être un entier.');
        });
    });
});