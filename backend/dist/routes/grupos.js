"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const router = (0, express_1.Router)();
router.get('/', (req, res) => {
    // Listar grupos
    res.send('Listar grupos');
});
router.post('/', (req, res) => {
    // Criar grupo
    res.send('Criar grupo');
});
router.get('/:id', (req, res) => {
    // Detalhar grupo
    res.send('Detalhar grupo');
});
router.put('/:id', (req, res) => {
    // Atualizar grupo
    res.send('Atualizar grupo');
});
router.delete('/:id', (req, res) => {
    // Remover grupo
    res.send('Remover grupo');
});
exports.default = router;
