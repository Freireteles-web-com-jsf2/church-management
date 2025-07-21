import React, { useState } from 'react';
import styled from 'styled-components';
import { theme } from '../../styles/theme';

interface HeaderProps {
  onToggleMobileSidebar: () => void;
}

const HeaderContainer = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${theme.spacing.md} 0;
  margin-bottom: ${theme.spacing.lg};
`;

const MobileMenuButton = styled.button`
  display: none;
  background: none;
  border: none;
  color: ${theme.colors.text};
  font-size: 1.5rem;
  cursor: pointer;
  width: 40px;
  height: 40px;
  border-radius: ${theme.borderRadius.md};
  
  &:hover {
    background-color: ${theme.colors.grayLight};
  }
  
  @media (max-width: ${theme.breakpoints.lg}) {
    display: flex;
    align-items: center;
    justify-content: center;
  }
`;

const PageTitle = styled.h1`
  margin: 0;
  font-size: ${theme.typography.fontSize['2xl']};
  color: ${theme.colors.primaryDark};
  font-weight: ${theme.typography.fontWeight.semibold};
`;

const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.md};
`;

const SearchContainer = styled.div`
  position: relative;
  width: 300px;
  
  @media (max-width: ${theme.breakpoints.md}) {
    display: none;
  }
`;

const SearchInput = styled.input`
  width: 100%;
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  padding-left: 2.5rem;
  border: 1px solid ${theme.colors.gray};
  border-radius: ${theme.borderRadius.full};
  font-size: ${theme.typography.fontSize.sm};
  
  &:focus {
    outline: none;
    border-color: ${theme.colors.primary};
    box-shadow: 0 0 0 3px rgba(74, 144, 226, 0.1);
  }
`;

const SearchIcon = styled.span`
  position: absolute;
  left: ${theme.spacing.md};
  top: 50%;
  transform: translateY(-50%);
  color: ${theme.colors.grayDark};
  font-size: 1rem;
`;

const UserMenu = styled.div`
  position: relative;
`;

const UserButton = styled.button`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
  background: none;
  border: none;
  cursor: pointer;
  padding: ${theme.spacing.xs} ${theme.spacing.sm};
  border-radius: ${theme.borderRadius.md};
  
  &:hover {
    background-color: ${theme.colors.grayLight};
  }
`;

const UserAvatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: ${theme.colors.primary};
  color: ${theme.colors.white};
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: ${theme.typography.fontWeight.medium};
  font-size: ${theme.typography.fontSize.lg};
`;

const UserInfo = styled.div`
  display: flex;
  flex-direction: column;
  text-align: left;
  
  @media (max-width: ${theme.breakpoints.md}) {
    display: none;
  }
`;

const UserName = styled.span`
  font-weight: ${theme.typography.fontWeight.medium};
  color: ${theme.colors.text};
`;

const UserRole = styled.span`
  font-size: ${theme.typography.fontSize.xs};
  color: ${theme.colors.textLight};
`;

const UserDropdown = styled.div<{ isOpen: boolean }>`
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  width: 220px;
  background-color: ${theme.colors.white};
  border-radius: ${theme.borderRadius.md};
  box-shadow: ${theme.shadows.lg};
  padding: ${theme.spacing.md} 0;
  z-index: ${theme.zIndex.dropdown};
  display: ${({ isOpen }) => (isOpen ? 'block' : 'none')};
`;

const DropdownItem = styled.a`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.md};
  padding: ${theme.spacing.sm} ${theme.spacing.lg};
  color: ${theme.colors.text};
  text-decoration: none;
  transition: ${theme.transitions.fast};
  
  &:hover {
    background-color: ${theme.colors.grayLight};
  }
`;

const DropdownDivider = styled.div`
  height: 1px;
  background-color: ${theme.colors.gray};
  margin: ${theme.spacing.sm} 0;
`;

const NotificationButton = styled.button`
  position: relative;
  background: none;
  border: none;
  color: ${theme.colors.text};
  font-size: 1.25rem;
  cursor: pointer;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    background-color: ${theme.colors.grayLight};
  }
`;

const NotificationBadge = styled.span`
  position: absolute;
  top: 5px;
  right: 5px;
  width: 18px;
  height: 18px;
  background-color: ${theme.colors.danger};
  color: ${theme.colors.white};
  border-radius: 50%;
  font-size: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: ${theme.typography.fontWeight.bold};
`;

const Header: React.FC<HeaderProps> = ({ onToggleMobileSidebar }) => {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  
  const toggleUserMenu = () => {
    setIsUserMenuOpen(!isUserMenuOpen);
  };
  
  return (
    <HeaderContainer>
      <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.md }}>
        <MobileMenuButton onClick={onToggleMobileSidebar}>
          ☰
        </MobileMenuButton>
        <PageTitle>Dashboard</PageTitle>
      </div>
      
      <HeaderActions>
        <SearchContainer>
          <SearchIcon>🔍</SearchIcon>
          <SearchInput placeholder="Pesquisar..." />
        </SearchContainer>
        
        <NotificationButton>
          🔔
          <NotificationBadge>3</NotificationBadge>
        </NotificationButton>
        
        <UserMenu>
          <UserButton onClick={toggleUserMenu}>
            <UserAvatar>PS</UserAvatar>
            <UserInfo>
              <UserName>Pastor Silva</UserName>
              <UserRole>Administrador</UserRole>
            </UserInfo>
          </UserButton>
          
          <UserDropdown isOpen={isUserMenuOpen}>
            <DropdownItem href="/perfil">
              👤 Meu Perfil
            </DropdownItem>
            <DropdownItem href="/configuracoes">
              ⚙️ Configurações
            </DropdownItem>
            <DropdownDivider />
            <DropdownItem href="/logout">
              🚪 Sair
            </DropdownItem>
          </UserDropdown>
        </UserMenu>
      </HeaderActions>
    </HeaderContainer>
  );
};

export default Header;