import { Router, Request, Response } from 'express';
const router = Router();

router.get('/perfis', (req: Request, res: Response) => {
  // Listar perfis
  res.send('Listar perfis');
});

router.post('/perfis', (req: Request, res: Response) => {
  // Criar perfil
  res.send('Criar perfil');
});

router.put('/perfis/:id', (req: Request, res: Response) => {
  // Atualizar perfil
  res.send('Atualizar perfil');
});

router.delete('/perfis/:id', (req: Request, res: Response) => {
  // Remover perfil
  res.send('Remover perfil');
});

router.get('/permissoes', (req: Request, res: Response) => {
  // Listar permissões
  res.send('Listar permissões');
});

router.post('/permissoes', (req: Request, res: Response) => {
  // Criar permissão
  res.send('Criar permissão');
});

router.put('/permissoes/:id', (req: Request, res: Response) => {
  // Atualizar permissão
  res.send('Atualizar permissão');
});

router.delete('/permissoes/:id', (req: Request, res: Response) => {
  // Remover permissão
  res.send('Remover permissão');
});

export default router; 