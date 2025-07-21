"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const router = (0, express_1.Router)();
router.get('/', (req, res) => {
    // Listar itens de patrimônio
    res.send('Listar patrimônio');
});
router.post('/', (req, res) => {
    // Criar item de patrimônio
    res.send('Criar patrimônio');
});
router.get('/:id', (req, res) => {
    // Detalhar item de patrimônio
    res.send('Detalhar patrimônio');
});
router.put('/:id', (req, res) => {
    // Atualizar item de patrimônio
    res.send('Atualizar patrimônio');
});
router.delete('/:id', (req, res) => {
    // Remover item de patrimônio
    res.send('Remover patrimônio');
});
exports.default = router;
