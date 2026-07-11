import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { theme } from '../styles/theme';
import { BiShow, BiHide } from 'react-icons/bi';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';

const LoginContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100svh;
  height: 100svh;
  background: linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.secondary}, ${theme.colors.accent});
  padding: clamp(0.35rem, 1.4svh, 0.75rem);
  overflow: hidden;
`;

const LoginForm = styled.form`
  background-color: ${theme.colors.white};
  padding: clamp(0.85rem, 2svh, 1.1rem);
  border-radius: 8px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 360px;

  @media (max-width: 480px) {
    padding: 0.75rem;
  }
`;

const LogoContainer = styled.div`
  text-align: center;
  margin-bottom: 0.6rem;
`;

const Logo = styled.img`
  width: clamp(52px, 9.5svh, 74px);
  height: clamp(52px, 9.5svh, 74px);
  margin-bottom: 0.35rem;
  border-radius: 8px;
  object-fit: cover;
`;

const LoginTitle = styled.h2`
  color: ${theme.colors.primary};
  text-align: center;
  font-size: clamp(1.2rem, 2.9svh, 1.55rem);
  line-height: 1.12;
  font-weight: 700;
  margin-bottom: 0.25rem;
`;

const LoginSubtitle = styled.p`
  color: ${theme.colors.gray};
  text-align: center;
  margin-bottom: 0;
  font-size: 0.84rem;
  line-height: 1.32;
`;

const SwitchPanel = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.5rem;
  margin-bottom: 0.65rem;
`;

const SwitchLink = styled(Link)`
  text-align: center;
  text-decoration: none;
  padding: 0.52rem 0.7rem;
  border-radius: 8px;
  border: 1px solid ${({ $active }) => ($active ? theme.colors.primary : '#d1d5db')};
  background: ${({ $active }) => ($active ? '#e0f2fe' : '#ffffff')};
  color: ${({ $active }) => ($active ? theme.colors.primary : theme.colors.darkGray)};
  font-weight: 700;
`;

const FormGroup = styled.div`
  margin-bottom: 0.65rem;
  position: relative;
`;

const FormLabel = styled.label`
  display: block;
  margin-bottom: 0.25rem;
  color: ${theme.colors.darkGray};
  font-weight: 500;
  font-size: 0.92rem;
`;

const FormControl = styled.input`
  width: 100%;
  padding: 0.58rem 0.8rem;
  border: 2px solid ${props => props.error ? theme.colors.error : '#e0e0e0'};
  border-radius: 8px;
  font-size: 0.95rem;
  transition: all 0.3s ease;
  background-color: ${theme.colors.white};

  &:focus {
    outline: none;
    border-color: ${theme.colors.primary};
    box-shadow: 0 0 0 4px rgba(14, 165, 233, 0.12);
  }

  &::placeholder {
    color: #9ca3af;
  }
`;

const PasswordWrapper = styled.div`
  position: relative;
`;

const PasswordToggle = styled.button`
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: ${theme.colors.gray};
  cursor: pointer;
  display: flex;
  align-items: center;
  padding: 0;

  &:hover {
    color: ${theme.colors.primary};
  }
`;

const RememberMeContainer = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 0.6rem;
`;

const Checkbox = styled.input`
  margin-right: 0.5rem;
  cursor: pointer;
`;

const RememberMeLabel = styled.label`
  color: ${theme.colors.darkGray};
  font-size: 0.86rem;
  cursor: pointer;
`;

const LoginButton = styled.button`
  width: 100%;
  padding: 0.65rem;
  background-color: ${theme.colors.primary};
  color: ${theme.colors.white};
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;

  &:hover {
    background-color: ${theme.colors.secondary};
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.div`
  color: ${theme.colors.error};
  background-color: #fee2e2;
  padding: 0.55rem;
  border-radius: 8px;
  margin-bottom: 0.55rem;
  text-align: center;
  font-size: 0.84rem;
  line-height: 1.35;
`;

const LoadingSpinner = styled(AiOutlineLoading3Quarters)`
  animation: spin 1s linear infinite;
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;

const roleHome = {
  Admin: '/dashboard',
  Sales: '/sales-dashboard',
  Product_manager: '/product-manager-dashboard',
};

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const isAdminLogin = location.pathname === '/admin-login';

  useEffect(() => {
    const savedUsername = localStorage.getItem(isAdminLogin ? 'adminUsername' : 'username');
    setUsername(savedUsername || '');
    setRememberMe(Boolean(savedUsername));
    setPassword('');
    setError('');
  }, [isAdminLogin]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await axios.post('/api/auth/login/', { username, password });
      const { token, role } = response.data;
      const isAdminAccount = role === 'Admin';

      if (isAdminLogin !== isAdminAccount) {
        setError(isAdminLogin
          ? 'Tài khoản này không thuộc quyền quản trị viên.'
          : 'Tài khoản quản trị viên vui lòng đăng nhập ở cổng Admin.');
        return;
      }

      const storageKey = isAdminLogin ? 'adminUsername' : 'username';
      if (rememberMe) {
        localStorage.setItem(storageKey, username);
      } else {
        localStorage.removeItem(storageKey);
      }

      sessionStorage.setItem('token', token);
      sessionStorage.setItem('role', role);
      navigate(roleHome[role] || '/');
    } catch (err) {
      setError('Tên đăng nhập hoặc mật khẩu không đúng. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <LoginContainer>
      <LoginForm onSubmit={handleSubmit}>
        <LogoContainer>
          <Logo src="/images/pharmacare/pharmacare-logo.png" alt="PharmaCare Logo" />
          <LoginTitle>{isAdminLogin ? 'Đăng nhập Admin' : 'Đăng nhập nhân viên'}</LoginTitle>
          <LoginSubtitle>
            {isAdminLogin
              ? 'Cổng dành riêng cho quản trị viên hệ thống.'
              : 'Cổng dành cho nhân viên bán hàng và quản lý sản phẩm.'}
          </LoginSubtitle>
        </LogoContainer>

        <SwitchPanel aria-label="Chọn cổng đăng nhập">
          <SwitchLink to="/login" $active={!isAdminLogin}>Nhân viên</SwitchLink>
          <SwitchLink to="/admin-login" $active={isAdminLogin}>Admin</SwitchLink>
        </SwitchPanel>

        {error && <ErrorMessage>{error}</ErrorMessage>}

        <FormGroup>
          <FormLabel htmlFor="username">Tên đăng nhập</FormLabel>
          <FormControl
            id="username"
            type="text"
            placeholder="Nhập tên đăng nhập"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            autoFocus
          />
        </FormGroup>

        <FormGroup>
          <FormLabel htmlFor="password">Mật khẩu</FormLabel>
          <PasswordWrapper>
            <FormControl
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Nhập mật khẩu"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <PasswordToggle
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              tabIndex="-1"
              aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
            >
              {showPassword ? <BiHide size={20} /> : <BiShow size={20} />}
            </PasswordToggle>
          </PasswordWrapper>
        </FormGroup>

        <RememberMeContainer>
          <Checkbox
            type="checkbox"
            id="rememberMe"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
          />
          <RememberMeLabel htmlFor="rememberMe">Ghi nhớ đăng nhập</RememberMeLabel>
        </RememberMeContainer>

        <LoginButton type="submit" disabled={isLoading}>
          {isLoading ? (
            <>
              <LoadingSpinner size={20} />
              Đang đăng nhập...
            </>
          ) : (
            'Sign In'
          )}
        </LoginButton>
      </LoginForm>
    </LoginContainer>
  );
};

export default Login;
