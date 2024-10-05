import { Router } from 'express';
import { Utilisateur } from '../models';

const router = Router();

router.get('/utilisateurs', async (req, res) => {
  const utilisateurs = await Utilisateur.findAll();
  res.json(utilisateurs);
});

export default router;