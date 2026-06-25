import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { theme } from '../styles/theme';

const NavBar = styled.nav`
  background: rgba(255, 255, 255, 0.96);
  box-shadow: 0 8px 28px rgba(3, 105, 161, 0.08);
  padding: 0.75rem 0;
  position: sticky;
  top: 0;
  z-index: 20;
  backdrop-filter: blur(12px);
`;

const NavContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
  gap: 1rem;

  @media (max-width: 640px) {
    flex-direction: column;
    gap: 0.55rem;
  }
`;

const LogoContainer = styled(Link)`
  display: flex;
  align-items: center;
  text-decoration: none;
  min-width: 0;

  @media (max-width: 640px) {
    justify-content: center;
  }
`;

const LogoImage = styled.img`
  width: 54px;
  height: 54px;
  border-radius: 8px;
  object-fit: cover;
  margin-right: 0.7rem;

  @media (max-width: 640px) {
    width: 46px;
    height: 46px;
  }
`;

const LogoText = styled.span`
  font-size: 1.9rem;
  font-weight: 800;
  color: ${theme.colors.primary};
  white-space: nowrap;

  strong {
    color: ${theme.colors.green};
  }

  @media (max-width: 640px) {
    font-size: 1.35rem;
  }
`;

const NavLinks = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
  justify-content: flex-end;

  @media (max-width: 640px) {
    width: 100%;
    justify-content: center;
    flex-wrap: nowrap;
    gap: 0.15rem;
  }
`;

const NavLink = styled(Link)`
  color: ${theme.colors.primary};
  text-decoration: none;
  font-weight: 700;
  padding: 0.55rem 0.85rem;
  border-radius: 8px;
  transition: background-color 0.2s ease, color 0.2s ease;

  &:hover {
    background-color: #e0f2fe;
  }

  @media (max-width: 640px) {
    padding: 0.45rem 0.5rem;
    font-size: 0.8rem;
  }
`;

const LoginButton = styled(Link)`
  background: linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.secondary});
  color: ${theme.colors.white};
  padding: 0.7rem 1.2rem;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 700;
  box-shadow: 0 8px 20px rgba(14, 165, 233, 0.25);

  @media (max-width: 640px) {
    padding: 0.55rem 0.75rem;
    font-size: 0.8rem;
    white-space: nowrap;
  }
`;

const Header = () => {
  return (
    <NavBar>
      <NavContainer>
        <LogoContainer to="/">
          <LogoImage src="/images/pharmacare/pharmacare-logo.png" alt="PharmaCare Logo" />
          <LogoText>Pharma<strong>Care</strong></LogoText>
        </LogoContainer>
        <NavLinks>
          <NavLink to="/">Home</NavLink>
          <NavLink to="/contact">Contact Us</NavLink>
          <NavLink to="/about">About Us</NavLink>
          <LoginButton to="/login">Sign In</LoginButton>
        </NavLinks>
      </NavContainer>
    </NavBar>
  );
};

export default Header;
