import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { theme } from '../styles/theme';

const NavBar = styled.nav`
  background-color: ${theme.colors.white};
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 1rem 0;
`;

const NavContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
`;

const LogoContainer = styled(Link)`
  display: flex;
  align-items: center;
  text-decoration: none;

  &:hover {
    transform: scale(1.05); /* Phóng to nhẹ khi hover */
    transition: transform 0.3s ease;
  }
`;

const LogoImage = styled.img`
  width: 60px; /* Tăng kích thước logo */
  height: 60px;
  margin-right: 0.75rem; /* Tăng khoảng cách giữa logo và chữ */
`;

const LogoText = styled.span`
  color: ${theme.colors.primary};
  font-size: 2rem; /* Tăng kích thước chữ */
  font-weight: 800; /* Tăng độ đậm */
  background: linear-gradient(90deg, #059669, #34d399); /* Thêm gradient */
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent; /* Hiệu ứng gradient chữ */
  transition: color 0.3s ease;

`;

const NavLinks = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem; /* Khoảng cách giữa các nút */
`;

const NavLink = styled(Link)`
  color: ${theme.colors.primary};
  text-decoration: none;
  font-weight: 600;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: ${theme.colors.lightGray};
  }
`;

const LoginButton = styled(Link)`
  background-color: #059669;
  color: ${theme.colors.white};
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 600;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: ${theme.colors.secondary};
  }
`;

const Header = () => {
  return (
    <NavBar>
      <NavContainer>
        <LogoContainer to="/">
          <LogoImage src="/images/logo.jpg" alt="PharmaCore Logo" />
          <LogoText>PharmaCore</LogoText>
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