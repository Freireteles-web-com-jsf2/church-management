import React, { useState } from 'react';
import styled from 'styled-components';
import { theme } from '../../styles/theme';
import Sidebar from '../Sidebar';
import Header from '../Header';

interface LayoutProps {
    children: React.ReactNode;
}

const LayoutContainer = styled.div`
  display: flex;
  min-height: 100vh;
  background-color: ${theme.colors.background};
`;

const MainContent = styled.main<{ isSidebarCollapsed: boolean }>`
  flex: 1;
  margin-left: ${({ isSidebarCollapsed }) => (isSidebarCollapsed ? '80px' : '280px')};
  transition: margin-left ${theme.transitions.normal};
  padding: ${theme.spacing.lg};
  
  @media (max-width: ${theme.breakpoints.lg}) {
    margin-left: 0;
    padding: ${theme.spacing.md};
  }
`;

const PageContainer = styled.div`
  max-width: 1400px;
  margin: 0 auto;
`;

const Layout: React.FC<LayoutProps> = ({ children }) => {
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

    const toggleSidebar = () => {
        setIsSidebarCollapsed(!isSidebarCollapsed);
    };

    const toggleMobileSidebar = () => {
        setIsMobileSidebarOpen(!isMobileSidebarOpen);
    };

    return (
        <LayoutContainer>
            <Sidebar
                isCollapsed={isSidebarCollapsed}
                isMobileOpen={isMobileSidebarOpen}
                onToggleCollapse={toggleSidebar}
                onCloseMobile={() => setIsMobileSidebarOpen(false)}
            />
            <MainContent isSidebarCollapsed={isSidebarCollapsed}>
                <Header
                    onToggleMobileSidebar={toggleMobileSidebar}
                />
                <PageContainer>
                    {children}
                </PageContainer>
            </MainContent>
        </LayoutContainer>
    );
};

export default Layout;