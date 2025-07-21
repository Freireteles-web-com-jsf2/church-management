"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const router = (0, express_1.Router)();
router.get('/perfis', (req, res) => {
    // Listar perfis
    res.send('Listar perfis');
});
router.post('/perfis', (req, res) => {
    // Criar perfil
    res.send('Criar perfil');
});
router.put('/perfis/:id', (req, res) => {
    // Atualizar perfil
    res.send('Atualizar perfil');
});
router.delete('/perfis/:id', (req, res) => {
    // Remover perfil
    res.send('Remover perfil');
});
router.get('/permissoes', (req, res) => {
    // Listar permissões
    res.send('Listar permissões');
});
router.post('/permissoes', (req, res) => {
    // Criar permissão
    res.send('Criar permissão');
});
router.put('/permissoes/:id', (req, res) => {
    // Atualizar permissão
    res.send('Atualizar permissão');
});
router.delete('/permissoes/:id', (req, res) => {
    // Remover permissão
    res.send('Remover permissão');
});
exports.default = router;
