import { Router } from 'express';
import authRoutes from './auth';
import usersRoutes from './users';
import pessoasRoutes from './pessoas';
import gruposRoutes from './grupos';
import financeiroRoutes from './financeiro';
import patrimonioRoutes from './patrimonio';
import agendaRoutes from './agenda';
import muralRoutes from './mural';
import permissoesRoutes from './permissoes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', usersRoutes);
router.use('/pessoas', pessoasRoutes);
router.use('/grupos', gruposRoutes);
router.use('/financeiro', financeiroRoutes);
router.use('/patrimonio', patrimonioRoutes);
router.use('/agenda', agendaRoutes);
router.use('/mural', muralRoutes);
router.use('/permissoes', permissoesRoutes);

export default router; 