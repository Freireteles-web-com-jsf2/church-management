import styled, { css } from 'styled-components';
import { theme } from '../../styles/theme';
import React from 'react';

const SidebarOverlay = styled.div.withConfig({
  shouldForwardProp: (prop) => prop !== 'isMobileOpen',
})<{ isMobileOpen: boolean }>`
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

// Adicione a tipagem das props
interface SidebarProps {
  isCollapsed: boolean;
  isMobileOpen: boolean;
  onToggleCollapse: () => void;
  onCloseMobile: () => void;
}

// Atualize o componente para aceitar props
const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, isMobileOpen, onToggleCollapse, onCloseMobile }) => {
  return (
    <aside>
      {/* Sidebar placeholder - implemente seu conteúdo aqui */}
    </aside>
  );
};

export default Sidebar;