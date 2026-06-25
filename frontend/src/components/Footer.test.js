import React from 'react';
import { render, screen } from '@testing-library/react';
import Footer from './Footer';

describe('Footer component', () => {
  beforeEach(() => render(<Footer />));

  test('hiển thị thương hiệu và mô tả PharmaCare', () => {
    expect(screen.getByRole('heading', { name: /Pharma\s*Care/, level: 4 })).toBeInTheDocument();
    expect(screen.getByText(/Giải pháp quản lý nhà thuốc với giao diện thân thiện/)).toBeInTheDocument();
  });

  test('hiển thị liên kết nhanh và không còn nhóm nghiệp vụ', () => {
    expect(screen.getByRole('link', { name: 'Home' })).toHaveAttribute('href', '/');
    expect(screen.getByRole('link', { name: 'Contact Us' })).toHaveAttribute('href', '/contact');
    expect(screen.getByRole('link', { name: 'About Us' })).toHaveAttribute('href', '/about');
    expect(screen.getByRole('link', { name: 'Sign In' })).toHaveAttribute('href', '/login');
    expect(screen.queryByRole('heading', { name: 'Nghiệp vụ' })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Quản lý thuốc' })).not.toBeInTheDocument();
    expect(screen.getByTitle('Bản đồ PharmaCare ở chân trang')).toBeInTheDocument();
  });

  test('hiển thị thông tin liên hệ và bản quyền', () => {
    expect(screen.getByText('Điện thoại: +84 816151762')).toBeInTheDocument();
    expect(screen.getByText('Email: khainhq0310@ut.edu.vn')).toBeInTheDocument();
    expect(screen.getByText(`© ${new Date().getFullYear()} PharmaCare. Đã đăng ký bản quyền.`)).toBeInTheDocument();
  });
});
