"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const router = (0, express_1.Router)();
router.get('/', (req, res) => {
    // Listar mensagens do mural
    res.send('Listar mural');
});
router.post('/', (req, res) => {
    // Criar mensagem no mural
    res.send('Criar mensagem');
});
router.get('/:id', (req, res) => {
    // Detalhar mensagem
    res.send('Detalhar mensagem');
});
router.put('/:id', (req, res) => {
    // Atualizar mensagem
    res.send('Atualizar mensagem');
});
router.delete('/:id', (req, res) => {
    // Remover mensagem
    res.send('Remover mensagem');
});
exports.default = router;
