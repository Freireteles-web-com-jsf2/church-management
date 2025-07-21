import { Router, Request, Response } from 'express';
const router = Router();

router.get('/', (req: Request, res: Response) => {
  // Listar eventos
  res.send('Listar eventos');
});

router.post('/', (req: Request, res: Response) => {
  // Criar evento
  res.send('Criar evento');
});

router.get('/:id', (req: Request, res: Response) => {
  // Detalhar evento
  res.send('Detalhar evento');
});

router.put('/:id', (req: Request, res: Response) => {
  // Atualizar evento
  res.send('Atualizar evento');
});

router.delete('/:id', (req: Request, res: Response) => {
  // Remover evento
  res.send('Remover evento');
});

export default router; 