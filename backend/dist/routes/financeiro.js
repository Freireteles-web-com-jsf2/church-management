"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const router = (0, express_1.Router)();
router.get('/', (req, res) => {
    // Listar lançamentos financeiros
    res.send('Listar financeiro');
});
router.post('/', (req, res) => {
    // Criar lançamento financeiro
    res.send('Criar lançamento');
});
router.get('/:id', (req, res) => {
    // Detalhar lançamento
    res.send('Detalhar lançamento');
});
router.put('/:id', (req, res) => {
    // Atualizar lançamento
    res.send('Atualizar lançamento');
});
router.delete('/:id', (req, res) => {
    // Remover lançamento
    res.send('Remover lançamento');
});
exports.default = router;
