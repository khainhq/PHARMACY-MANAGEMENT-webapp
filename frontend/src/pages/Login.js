import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { theme } from '../styles/theme';
import { BiShow, BiHide } from 'react-icons/bi';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';

const LoginContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, ${theme.colors.primary}, #34d399);
  padding: 1rem;
`;

const LoginForm = styled.form`
  background-color: ${theme.colors.white};
  padding: 2.5rem;
  border-radius: 20px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
  position: relative;
  overflow: hidden;

  @media (max-width: 480px) {
    padding: 2rem;
  }
`;

const LogoContainer = styled.div`
  text-align: center;
  margin-bottom: 2rem;
`;

const Logo = styled.img`
  width: 120px;
  height: 120px;
  margin-bottom: 1rem;
  border-radius: 15px;
`;

const LoginTitle = styled.h2`
  color: ${theme.colors.primary};
  text-align: center;
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
`;

const LoginSubtitle = styled.p`
  color: ${theme.colors.gray};
  text-align: center;
  margin-bottom: 2rem;
  font-size: 0.9rem;
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
  position: relative;
`;

const FormLabel = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  color: ${theme.colors.darkGray};
  font-weight: 500;
`;

const FormControl = styled.input`
  width: 100%;
  padding: 0.875rem 1rem;
  border: 2px solid ${props => props.error ? theme.colors.error : '#e0e0e0'};
  border-radius: 10px;
  font-size: 1rem;
  transition: all 0.3s ease;
  background-color: ${theme.colors.white};

  &:focus {
    outline: none;
    border-color: ${theme.colors.primary};
    box-shadow: 0 0 0 4px rgba(5, 150, 105, 0.1);
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
  margin-bottom: 1.5rem;
`;

const Checkbox = styled.input`
  margin-right: 0.5rem;
  cursor: pointer;
`;

const RememberMeLabel = styled.label`
  color: ${theme.colors.darkGray};
  font-size: 0.9rem;
  cursor: pointer;
`;

const LoginButton = styled.button`
  width: 100%;
  padding: 1rem;
  background-color: ${theme.colors.primary};
  color: ${theme.colors.white};
  border: none;
  border-radius: 10px;
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
  padding: 1rem;
  border-radius: 10px;
  margin-bottom: 1rem;
  text-align: center;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const LoadingSpinner = styled(AiOutlineLoading3Quarters)`
  animation: spin 1s linear infinite;
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check for saved credentials
    const savedUsername = localStorage.getItem('username');
    if (savedUsername) {
      setUsername(savedUsername);
      setRememberMe(true);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await axios.post('http://localhost:8000/api/auth/login/', { username, password });
      const { token, role } = response.data;
      
      // Save credentials if remember me is checked
      if (rememberMe) {
        localStorage.setItem('username', username);
      } else {
        localStorage.removeItem('username');
      }

      sessionStorage.setItem('token', token);
      sessionStorage.setItem('role', role);

      // Navigate based on role
      switch (role) {
        case 'Admin':
          navigate('/dashboard');
          break;
        case 'Nhân viên bán hàng':
          navigate('/sales-dashboard');
          break;
        case 'Nhân viên quản lý sản phẩm':
          navigate('/product-manager-dashboard');
          break;
        default:
          navigate('/');
      }
    } catch (err) {
      setError('Invalid username or password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <LoginContainer>
      <LoginForm onSubmit={handleSubmit}>
        <LogoContainer>
          <Logo src="/images/logo.jpg" alt="PharmaCore Logo" />
          <LoginTitle>Welcome Back</LoginTitle>
          <LoginSubtitle>Please sign in to continue</LoginSubtitle>
        </LogoContainer>

        {error && <ErrorMessage>{error}</ErrorMessage>}

        <FormGroup>
          <FormLabel htmlFor="username">Username</FormLabel>
          <FormControl
            id="username"
            type="text"
            placeholder="Enter your username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            autoFocus
          />
        </FormGroup>

        <FormGroup>
          <FormLabel htmlFor="password">Password</FormLabel>
          <PasswordWrapper>
            <FormControl
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <PasswordToggle
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              tabIndex="-1"
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
          <RememberMeLabel htmlFor="rememberMe">Remember me</RememberMeLabel>
        </RememberMeContainer>

        <LoginButton type="submit" disabled={isLoading}>
          {isLoading ? (
            <>
              <LoadingSpinner size={20} />
              Signing in...
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
