import { Router, Request, Response } from 'express';
const router = Router();

router.get('/', (req: Request, res: Response) => {
  // Listar mensagens do mural
  res.send('Listar mural');
});

router.post('/', (req: Request, res: Response) => {
  // Criar mensagem no mural
  res.send('Criar mensagem');
});

router.get('/:id', (req: Request, res: Response) => {
  // Detalhar mensagem
  res.send('Detalhar mensagem');
});

router.put('/:id', (req: Request, res: Response) => {
  // Atualizar mensagem
  res.send('Atualizar mensagem');
});

router.delete('/:id', (req: Request, res: Response) => {
  // Remover mensagem
  res.send('Remover mensagem');
});

export default router; 