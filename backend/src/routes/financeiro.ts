import { Router, Request, Response } from 'express';
const router = Router();

router.get('/', (req: Request, res: Response) => {
  // Listar lançamentos financeiros
  res.send('Listar financeiro');
});

router.post('/', (req: Request, res: Response) => {
  // Criar lançamento financeiro
  res.send('Criar lançamento');
});

router.get('/:id', (req: Request, res: Response) => {
  // Detalhar lançamento
  res.send('Detalhar lançamento');
});

router.put('/:id', (req: Request, res: Response) => {
  // Atualizar lançamento
  res.send('Atualizar lançamento');
});

router.delete('/:id', (req: Request, res: Response) => {
  // Remover lançamento
  res.send('Remover lançamento');
});

export default router; 