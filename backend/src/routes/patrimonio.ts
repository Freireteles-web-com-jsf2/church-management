import { Router, Request, Response } from 'express';
const router = Router();

router.get('/', (req: Request, res: Response) => {
  // Listar itens de patrimônio
  res.send('Listar patrimônio');
});

router.post('/', (req: Request, res: Response) => {
  // Criar item de patrimônio
  res.send('Criar patrimônio');
});

router.get('/:id', (req: Request, res: Response) => {
  // Detalhar item de patrimônio
  res.send('Detalhar patrimônio');
});

router.put('/:id', (req: Request, res: Response) => {
  // Atualizar item de patrimônio
  res.send('Atualizar patrimônio');
});

router.delete('/:id', (req: Request, res: Response) => {
  // Remover item de patrimônio
  res.send('Remover patrimônio');
});

export default router; 