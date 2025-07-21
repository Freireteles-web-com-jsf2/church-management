import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from '../components';
import { AuthProvider } from '../contexts/AuthContext';
import AuthDebug from '../components/AuthDebug';

// Páginas públicas
import Login from '../pages/Login';
import Cadastro from '../pages/Cadastro';
import ForgotPassword from '../pages/ForgotPassword';
import ResetPassword from '../pages/ResetPassword';
import LandingPage from '../pages/LandingPage';
import AccessDenied from '../pages/AccessDenied';
import NotFound from '../pages/NotFound';

// Páginas protegidas
import DashboardPage from '../pages/Dashboard';
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

const AppRoutes: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AuthDebug />
        <Routes>
          {/* Rotas públicas */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/cadastro" element={<Cadastro />} />
          <Route path="/esqueci-senha" element={<ForgotPassword />} />
          <Route path="/redefinir-senha/:token" element={<ResetPassword />} />
          <Route path="/redefinir-senha/recovery" element={<ResetPassword />} />
          <Route path="/acesso-negado" element={<AccessDenied />} />

          {/* Redirecionamento de erro de digitação */}
          <Route path="/daschboard" element={<Navigate to="/dashboard" replace />} />

          {/* Rotas protegidas */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          } />

          {/* Pessoas */}
          <Route path="/pessoas" element={
            <ProtectedRoute allowedRoles={['admin', 'pastor', 'lider']}>
              <Pessoas />
            </ProtectedRoute>
          } />
          <Route path="/pessoas/novo" element={
            <ProtectedRoute allowedRoles={['admin', 'pastor']}>
              <PessoasForm />
            </ProtectedRoute>
          } />
          <Route path="/pessoas/:id" element={
            <ProtectedRoute allowedRoles={['admin', 'pastor', 'lider']}>
              <PessoasForm />
            </ProtectedRoute>
          } />

          {/* Grupos */}
          <Route path="/grupos" element={
            <ProtectedRoute allowedRoles={['admin', 'pastor', 'lider']}>
              <Grupos />
            </ProtectedRoute>
          } />
          <Route path="/grupos/novo" element={
            <ProtectedRoute allowedRoles={['admin', 'pastor']}>
              <GruposForm />
            </ProtectedRoute>
          } />
          <Route path="/grupos/:id" element={
            <ProtectedRoute allowedRoles={['admin', 'pastor', 'lider']}>
              <GruposForm />
            </ProtectedRoute>
          } />

          {/* Financeiro */}
          <Route path="/financeiro" element={
            <ProtectedRoute allowedRoles={['admin', 'pastor', 'tesoureiro']}>
              <Financeiro />
            </ProtectedRoute>
          } />
          <Route path="/financeiro/novo" element={
            <ProtectedRoute allowedRoles={['admin', 'pastor', 'tesoureiro']}>
              <FinanceiroForm />
            </ProtectedRoute>
          } />
          <Route path="/financeiro/:id" element={
            <ProtectedRoute allowedRoles={['admin', 'pastor', 'tesoureiro']}>
              <FinanceiroForm />
            </ProtectedRoute>
          } />

          {/* Patrimônio */}
          <Route path="/patrimonio" element={
            <ProtectedRoute allowedRoles={['admin', 'pastor', 'tesoureiro']}>
              <Patrimonio />
            </ProtectedRoute>
          } />
          <Route path="/patrimonio/novo" element={
            <ProtectedRoute allowedRoles={['admin', 'pastor', 'tesoureiro']}>
              <PatrimonioForm />
            </ProtectedRoute>
          } />
          <Route path="/patrimonio/:id" element={
            <ProtectedRoute allowedRoles={['admin', 'pastor', 'tesoureiro']}>
              <PatrimonioForm />
            </ProtectedRoute>
          } />

          {/* Agenda */}
          <Route path="/agenda" element={
            <ProtectedRoute>
              <Agenda />
            </ProtectedRoute>
          } />
          <Route path="/agenda/novo" element={
            <ProtectedRoute allowedRoles={['admin', 'pastor', 'lider']}>
              <EventoForm />
            </ProtectedRoute>
          } />
          <Route path="/agenda/:id" element={
            <ProtectedRoute allowedRoles={['admin', 'pastor', 'lider']}>
              <EventoForm />
            </ProtectedRoute>
          } />

          {/* Mural */}
          <Route path="/mural" element={
            <ProtectedRoute>
              <Mural />
            </ProtectedRoute>
          } />
          <Route path="/mural/novo" element={
            <ProtectedRoute allowedRoles={['admin', 'pastor', 'lider']}>
              <MuralForm />
            </ProtectedRoute>
          } />
          <Route path="/mural/:id" element={
            <ProtectedRoute allowedRoles={['admin', 'pastor', 'lider']}>
              <MuralForm />
            </ProtectedRoute>
          } />

          {/* Configurações e Perfil */}
          <Route path="/configuracoes" element={
            <ProtectedRoute allowedRoles={['admin', 'pastor']}>
              <Configuracoes />
            </ProtectedRoute>
          } />
          <Route path="/perfil" element={
            <ProtectedRoute>
              <Perfil />
            </ProtectedRoute>
          } />

          {/* Rota padrão - redireciona para o dashboard se autenticado, ou para a landing page se não */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default AppRoutes;