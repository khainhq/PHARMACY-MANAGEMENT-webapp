import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Header from './Header';

describe('Header component', () => {
  beforeEach(() => {
    render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>
    );
  });

  test('hiển thị logo PharmaCare mới', () => {
    const logo = screen.getByAltText('PharmaCare Logo');
    expect(logo).toHaveAttribute('src', '/images/pharmacare/pharmacare-logo.png');
    expect(screen.getByRole('link', { name: /PharmaCare Logo Pharma\s*Care/ })).toHaveAttribute('href', '/');
  });

  test('hiển thị đúng các liên kết điều hướng', () => {
    expect(screen.getByRole('link', { name: 'Home' })).toHaveAttribute('href', '/');
    expect(screen.getByRole('link', { name: 'Contact Us' })).toHaveAttribute('href', '/contact');
    expect(screen.getByRole('link', { name: 'About Us' })).toHaveAttribute('href', '/about');
    expect(screen.getByRole('link', { name: 'Sign In' })).toHaveAttribute('href', '/login');
  });
});
