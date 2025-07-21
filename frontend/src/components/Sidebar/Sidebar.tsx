import React from 'react';
import styled, { css } from 'styled-components';
import { useLocation, useNavigate } from 'react-router-dom';
import { theme } from '../../styles/theme';
import { useLocalAuth } from '../../contexts/LocalAuthContext';

interface SidebarProps {
  isCollapsed: boolean;
  isMobileOpen: boolean;
  onToggleCollapse: () => void;
  onCloseMobile: () => void;
}

interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  isActive?: boolean;
  onClick?: () => void;
  to?: string;
}

const SidebarContainer = styled.aside<{ isCollapsed: boolean; isMobileOpen: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  width: ${({ isCollapsed }) => (isCollapsed ? '80px' : '280px')};
  background-color: ${theme.colors.sidebarBackground};
  box-shadow: ${theme.shadows.md};
  transition: width ${theme.transitions.normal}, transform ${theme.transitions.normal};
  z-index: ${theme.zIndex.fixed};
  display: flex;
  flex-direction: column;
  overflow-x: hidden;
  
  @media (max-width: ${theme.breakpoints.lg}) {
    width: 280px;
    transform: ${({ isMobileOpen }) => (isMobileOpen ? 'translateX(0)' : 'translateX(-100%)')};
  }
`;

const SidebarOverlay = styled.div<{ isMobileOpen: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: ${theme.zIndex.fixed - 1};
  display: none;
  
  @media (max-width: ${theme.breakpoints.lg}) {
    display: ${({ isMobileOpen }) => (isMobileOpen ? 'block' : 'none')};
  }
`;

const SidebarHeader = styled.div<{ isCollapsed: boolean }>`
  height: 70px;
  display: flex;
  align-items: center;
  justify-content: ${({ isCollapsed }) => (isCollapsed ? 'center' : 'space-between')};
  padding: ${({ isCollapsed }) => (isCollapsed ? theme.spacing.sm : `${theme.spacing.md} ${theme.spacing.lg}`)};
  border-bottom: 1px solid ${theme.colors.gray};
`;

const Logo = styled.div<{ isCollapsed: boolean }>`
  display: flex;
  align-items: center;
  
  img {
    width: 40px;
    height: 40px;
  }
  
  span {
    font-size: ${theme.typography.fontSize.xl};
    font-weight: ${theme.typography.fontWeight.bold};
    color: ${theme.colors.primaryDark};
    margin-left: ${theme.spacing.sm};
    white-space: nowrap;
    display: ${({ isCollapsed }) => (isCollapsed ? 'none' : 'block')};
  }
`;

const CollapseButton = styled.button`
  background: none;
  border: none;
  color: ${theme.colors.grayDark};
  cursor: pointer;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: ${theme.transitions.fast};
  
  &:hover {
    background-color: ${theme.colors.grayLight};
    color: ${theme.colors.text};
  }
  
  @media (max-width: ${theme.breakpoints.lg}) {
    display: none;
  }
`;

const SidebarContent = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: ${theme.spacing.md} 0;
  
  &::-webkit-scrollbar {
    width: 4px;
  }
  
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  
  &::-webkit-scrollbar-thumb {
    background: ${theme.colors.gray};
    border-radius: ${theme.borderRadius.full};
  }
`;

const SidebarNav = styled.nav`
  display: flex;
  flex-direction: column;
`;

const SidebarItemContainer = styled.a<{ isActive?: boolean; isCollapsed: boolean }>`
  display: flex;
  align-items: center;
  padding: ${({ isCollapsed }) => 
    isCollapsed ? theme.spacing.md : `${theme.spacing.md} ${theme.spacing.lg}`};
  color: ${({ isActive }) => (isActive ? theme.colors.primary : theme.colors.text)};
  text-decoration: none;
  transition: ${theme.transitions.fast};
  position: relative;
  cursor: pointer;
  
  ${({ isActive }) => isActive && css`
    background-color: ${theme.colors.primaryVeryLight};
    font-weight: ${theme.typography.fontWeight.medium};
    
    &::before {
      content: '';
      position: absolute;
      left: 0;
      top: 0;
      bottom: 0;
      width: 4px;
      background-color: ${theme.colors.primary};
    }
  `}
  
  &:hover {
    background-color: ${({ isActive }) => 
      isActive ? theme.colors.primaryVeryLight : theme.colors.grayLight};
  }
`;

const IconWrapper = styled.div`
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  color: ${({ color }) => color || 'inherit'};
`;

const ItemLabel = styled.span<{ isCollapsed: boolean }>`
  margin-left: ${theme.spacing.md};
  white-space: nowrap;
  opacity: ${({ isCollapsed }) => (isCollapsed ? 0 : 1)};
  visibility: ${({ isCollapsed }) => (isCollapsed ? 'hidden' : 'visible')};
  transition: opacity ${theme.transitions.fast}, visibility ${theme.transitions.fast};
`;

const SidebarFooter = styled.div<{ isCollapsed: boolean }>`
  padding: ${({ isCollapsed }) => 
    isCollapsed ? theme.spacing.md : `${theme.spacing.md} 0`};
  border-top: 1px solid ${theme.colors.gray};
  display: flex;
  flex-direction: ${({ isCollapsed }) => (isCollapsed ? 'row' : 'column')};
  align-items: ${({ isCollapsed }) => (isCollapsed ? 'center' : 'stretch')};
  justify-content: ${({ isCollapsed }) => (isCollapsed ? 'center' : 'flex-start')};
  gap: ${({ isCollapsed }) => (isCollapsed ? theme.spacing.sm : '0')};
`;

const SidebarItem: React.FC<SidebarItemProps & { isCollapsed: boolean }> = ({
  icon,
  label,
  isActive,
  onClick,
  to,
  isCollapsed,
}) => {
  return (
    <SidebarItemContainer 
      href={to} 
      onClick={(e) => {
        if (onClick) {
          e.preventDefault();
          onClick();
        }
      }}
      isActive={isActive}
      isCollapsed={isCollapsed}
    >
      <IconWrapper>{icon}</IconWrapper>
      <ItemLabel isCollapsed={isCollapsed}>{label}</ItemLabel>
    </SidebarItemContainer>
  );
};

const Sidebar: React.FC<SidebarProps> = ({
  isCollapsed,
  isMobileOpen,
  onToggleCollapse,
  onCloseMobile,
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useLocalAuth();

  const menuItems = [
    { icon: '🏠', label: 'Dashboard', to: '/dashboard', roles: ['admin', 'pastor', 'lider', 'tesoureiro', 'voluntario', 'membro'] },
    { icon: '👤', label: 'Usuários', to: '/usuarios', roles: ['admin', 'pastor'] },
    { icon: '👥', label: 'Pessoas', to: '/pessoas', roles: ['admin', 'pastor', 'lider'] },
    { icon: '👨‍👩‍👧‍👦', label: 'Grupos/Células', to: '/grupos', roles: ['admin', 'pastor', 'lider'] },
    { icon: '💰', label: 'Financeiro', to: '/financeiro', roles: ['admin', 'pastor', 'tesoureiro'] },
    { icon: '📦', label: 'Patrimônio', to: '/patrimonio', roles: ['admin', 'pastor', 'tesoureiro'] },
    { icon: '📅', label: 'Agenda', to: '/agenda', roles: ['admin', 'pastor', 'lider', 'tesoureiro', 'voluntario', 'membro'] },
    { icon: '📢', label: 'Mural', to: '/mural', roles: ['admin', 'pastor', 'lider', 'tesoureiro', 'voluntario', 'membro'] },
    { icon: '⚙️', label: 'Configurações', to: '/configuracoes', roles: ['admin', 'pastor'] },
  ];

  // Filtrar itens baseado nas permissões do usuário
  const availableMenuItems = menuItems.filter(item => 
    !user || item.roles.includes(user.role)
  );

  const handleNavigation = (path: string) => {
    navigate(path);
    if (isMobileOpen) {
      onCloseMobile();
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/local-login');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  return (
    <>
      <SidebarOverlay isMobileOpen={isMobileOpen} onClick={onCloseMobile} />
      <SidebarContainer isCollapsed={isCollapsed} isMobileOpen={isMobileOpen}>
        <SidebarHeader isCollapsed={isCollapsed}>
          <Logo isCollapsed={isCollapsed}>
            <img src="/logo-igreja.png" alt="Logo" />
            <span>IGreja</span>
          </Logo>
          <CollapseButton onClick={onToggleCollapse}>
            {isCollapsed ? '→' : '←'}
          </CollapseButton>
        </SidebarHeader>
        
        <SidebarContent>
          <SidebarNav>
            {availableMenuItems.map((item, index) => (
              <SidebarItem
                key={index}
                icon={item.icon}
                label={item.label}
                isActive={location.pathname === item.to}
                onClick={() => handleNavigation(item.to)}
                isCollapsed={isCollapsed}
              />
            ))}
          </SidebarNav>
        </SidebarContent>
        
        <SidebarFooter isCollapsed={isCollapsed}>
          <SidebarItem
            icon="👤"
            label="Meu Perfil"
            isCollapsed={isCollapsed}
            onClick={() => handleNavigation('/perfil')}
            isActive={location.pathname === '/perfil'}
          />
          <SidebarItem
            icon="🚪"
            label="Sair"
            isCollapsed={isCollapsed}
            onClick={handleLogout}
          />
        </SidebarFooter>
      </SidebarContainer>
    </>
  );
};

export default Sidebar;