import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LocalAuthProvider } from '../contexts/LocalAuthContext';
import LocalProtectedRoute from '../components/LocalProtectedRoute';
import SessionExpiryWarning from '../components/SessionExpiryWarning';
import { NavigationGuard } from '../components/NavigationGuard';
import { LogoutHandler } from '../components/LogoutHandler';

// Páginas
import LocalLogin from '../pages/LocalLogin';
import LocalForgotPassword from '../pages/LocalForgotPassword';
import LocalResetPassword from '../pages/LocalResetPassword';
import AccessDenied from '../pages/AccessDenied/index';
import NotFound from '../pages/NotFound/index';

// Páginas protegidas (usando as existentes)
import LocalDashboard from '../pages/Dashboard/LocalDashboard';
import UserManagement from '../pages/UserManagement';
import Pessoas from '../pages/Pessoas';
import PessoasForm from '../pages/Pessoas/PessoasForm';
import Grupos from '../pages/Grupos';
import GruposForm from '../pages/Grupos/GruposForm';
import Financeiro from '../pages/Financeiro';
import FinanceiroForm from '../pages/Financeiro/FinanceiroForm';
import Patrimonio from '../pages/Patrimonio';
import PatrimonioForm from '../pages/Patrimonio/PatrimonioForm';
import Agenda from '../pages/Agenda';
import EventoForm from '../pages/Agenda/EventoForm';
import Mural from '../pages/Mural';
import MuralForm from '../pages/Mural/MuralForm';
import Configuracoes from '../pages/Configuracoes';
import Perfil from '../pages/Perfil';

const LocalRoutes: React.FC = () => {
  const handleRedirect = (from: string, to: string, reason: string) => {
    console.log(`Navigation redirect: ${from} -> ${to} (${reason})`);
  };

  const handleUnauthorizedAccess = (path: string, user: any) => {
    console.warn(`Unauthorized access attempt to ${path}`, user);
  };

  const handleLogout = () => {
    console.log('User logged out');
  };

  return (
    <BrowserRouter>
      <LocalAuthProvider>
        <NavigationGuard
          onRedirect={handleRedirect}
          onUnauthorizedAccess={handleUnauthorizedAccess}
          roleBasedRedirects={{
            admin: '/dashboard',
            pastor: '/dashboard',
            lider: '/pessoas',
            tesoureiro: '/financeiro',
            voluntario: '/agenda',
            membro: '/mural'
          }}
        >
          <LogoutHandler
            onLogout={handleLogout}
            redirectTo="/local-login"
          >
            <SessionExpiryWarning />
            <Routes>
          {/* Rota inicial - redireciona para login local */}
          <Route path="/" element={<Navigate to="/local-login" replace />} />
          
          {/* Login local e recuperação de senha */}
          <Route path="/local-login" element={<LocalLogin />} />
          <Route path="/local-esqueci-senha" element={<LocalForgotPassword />} />
          <Route path="/local-redefinir-senha/:token" element={<LocalResetPassword />} />
          
          {/* Páginas de erro */}
          <Route path="/acesso-negado" element={<AccessDenied />} />

          {/* Dashboard */}
          <Route path="/dashboard" element={
            <LocalProtectedRoute>
              <LocalDashboard />
            </LocalProtectedRoute>
          } />

          {/* User Management */}
          <Route path="/usuarios" element={
            <LocalProtectedRoute allowedRoles={['admin', 'pastor']}>
              <UserManagement />
            </LocalProtectedRoute>
          } />

          {/* Pessoas */}
          <Route path="/pessoas" element={
            <LocalProtectedRoute allowedRoles={['admin', 'pastor', 'lider']}>
              <Pessoas />
            </LocalProtectedRoute>
          } />
          <Route path="/pessoas/novo" element={
            <LocalProtectedRoute allowedRoles={['admin', 'pastor']}>
              <PessoasForm />
            </LocalProtectedRoute>
          } />
          <Route path="/pessoas/:id" element={
            <LocalProtectedRoute allowedRoles={['admin', 'pastor', 'lider']}>
              <PessoasForm />
            </LocalProtectedRoute>
          } />

          {/* Grupos */}
          <Route path="/grupos" element={
            <LocalProtectedRoute allowedRoles={['admin', 'pastor', 'lider']}>
              <Grupos />
            </LocalProtectedRoute>
          } />
          <Route path="/grupos/novo" element={
            <LocalProtectedRoute allowedRoles={['admin', 'pastor']}>
              <GruposForm />
            </LocalProtectedRoute>
          } />
          <Route path="/grupos/:id" element={
            <LocalProtectedRoute allowedRoles={['admin', 'pastor', 'lider']}>
              <GruposForm />
            </LocalProtectedRoute>
          } />

          {/* Financeiro */}
          <Route path="/financeiro" element={
            <LocalProtectedRoute allowedRoles={['admin', 'pastor', 'tesoureiro']}>
              <Financeiro />
            </LocalProtectedRoute>
          } />
          <Route path="/financeiro/novo" element={
            <LocalProtectedRoute allowedRoles={['admin', 'pastor', 'tesoureiro']}>
              <FinanceiroForm />
            </LocalProtectedRoute>
          } />
          <Route path="/financeiro/:id" element={
            <LocalProtectedRoute allowedRoles={['admin', 'pastor', 'tesoureiro']}>
              <FinanceiroForm />
            </LocalProtectedRoute>
          } />

          {/* Patrimônio */}
          <Route path="/patrimonio" element={
            <LocalProtectedRoute allowedRoles={['admin', 'pastor', 'tesoureiro']}>
              <Patrimonio />
            </LocalProtectedRoute>
          } />
          <Route path="/patrimonio/novo" element={
            <LocalProtectedRoute allowedRoles={['admin', 'pastor', 'tesoureiro']}>
              <PatrimonioForm />
            </LocalProtectedRoute>
          } />
          <Route path="/patrimonio/:id" element={
            <LocalProtectedRoute allowedRoles={['admin', 'pastor', 'tesoureiro']}>
              <PatrimonioForm />
            </LocalProtectedRoute>
          } />

          {/* Agenda */}
          <Route path="/agenda" element={
            <LocalProtectedRoute>
              <Agenda />
            </LocalProtectedRoute>
          } />
          <Route path="/agenda/novo" element={
            <LocalProtectedRoute allowedRoles={['admin', 'pastor', 'lider']}>
              <EventoForm />
            </LocalProtectedRoute>
          } />
          <Route path="/agenda/:id" element={
            <LocalProtectedRoute allowedRoles={['admin', 'pastor', 'lider']}>
              <EventoForm />
            </LocalProtectedRoute>
          } />

          {/* Mural */}
          <Route path="/mural" element={
            <LocalProtectedRoute>
              <Mural />
            </LocalProtectedRoute>
          } />
          <Route path="/mural/novo" element={
            <LocalProtectedRoute allowedRoles={['admin', 'pastor', 'lider']}>
              <MuralForm />
            </LocalProtectedRoute>
          } />
          <Route path="/mural/:id" element={
            <LocalProtectedRoute allowedRoles={['admin', 'pastor', 'lider']}>
              <MuralForm />
            </LocalProtectedRoute>
          } />

          {/* Configurações e Perfil */}
          <Route path="/configuracoes" element={
            <LocalProtectedRoute allowedRoles={['admin', 'pastor']}>
              <Configuracoes />
            </LocalProtectedRoute>
          } />
          <Route path="/perfil" element={
            <LocalProtectedRoute>
              <Perfil />
            </LocalProtectedRoute>
          } />

          {/* Rota 404 */}
          <Route path="*" element={<NotFound />} />
            </Routes>
          </LogoutHandler>
        </NavigationGuard>
      </LocalAuthProvider>
    </BrowserRouter>
  );
};

export default LocalRoutes;