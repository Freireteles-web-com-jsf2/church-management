"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const router = (0, express_1.Router)();
router.get('/', (req, res) => {
    // Listar eventos
    res.send('Listar eventos');
});
router.post('/', (req, res) => {
    // Criar evento
    res.send('Criar evento');
});
router.get('/:id', (req, res) => {
    // Detalhar evento
    res.send('Detalhar evento');
});
router.put('/:id', (req, res) => {
    // Atualizar evento
    res.send('Atualizar evento');
});
router.delete('/:id', (req, res) => {
    // Remover evento
    res.send('Remover evento');
});
exports.default = router;
