import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../context/AuthContext';

const Nav = styled.nav`
  background: #2d3e50;
  color: #fff;
  padding: 1rem 2rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;
const NavLinks = styled.div`
  display: flex;
  gap: 1.5rem;
`;
const NavButton = styled.button`
  background: #3bb54a;
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 0.5rem 1.2rem;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  transition: background 0.2s;
  &:hover {
    background: #2d8c3c;
  }
`;

const Menu: React.FC = () => {
  const { token, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Nav>
      <div><b>Sistema Igreja</b></div>
      <NavLinks>
        {!token && <Link to="/login">Login</Link>}
        {!token && <Link to="/register">Cadastro</Link>}
        {token && <NavButton onClick={handleLogout}>Logout</NavButton>}
      </NavLinks>
    </Nav>
  );
};

export default Menu; 