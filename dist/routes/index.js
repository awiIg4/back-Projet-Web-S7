"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const models_1 = require("../models");
const router = (0, express_1.Router)();
router.get('/utilisateurs', async (req, res) => {
    const utilisateurs = await models_1.Utilisateur.findAll();
    res.json(utilisateurs);
});
exports.default = router;
