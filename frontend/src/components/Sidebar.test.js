import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Sidebar from './Sidebar';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

jest.mock('axios');

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: jest.fn(),
}));

describe('Sidebar component', () => {
  let mockNavigate;

  beforeEach(() => {
    sessionStorage.setItem('token', 'dummyToken');
    sessionStorage.setItem('role', 'Admin');

    mockNavigate = jest.fn();
    useNavigate.mockReturnValue(mockNavigate);

    axios.post.mockReset();
  });

  afterEach(() => {
    sessionStorage.clear();
    jest.clearAllMocks();
  });

  const renderSidebar = () => render(
    <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Sidebar />
    </MemoryRouter>
  );

  test('hiển thị menu dành cho admin', () => {
    renderSidebar();

    expect(screen.getByAltText('User Avatar')).toBeInTheDocument();
    expect(screen.getAllByText(/Admin/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/Trang Chủ/i)).toBeInTheDocument();
    expect(screen.getByText(/Báo Cáo/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Hóa Đơn/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/Nhân Viên/i)).toBeInTheDocument();
    expect(screen.getByText(/Tài Khoản/i)).toBeInTheDocument();
  });

  test('hiển thị menu bán hàng khi backend trả role Sales', () => {
    sessionStorage.setItem('role', 'Sales');

    renderSidebar();

    expect(screen.getByText(/Nhân viên bán hàng/i)).toBeInTheDocument();
    expect(screen.getByText(/Trang Chủ/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Hóa Đơn/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/Khách Hàng/i)).toBeInTheDocument();
    expect(screen.queryByText(/Thuốc/i)).not.toBeInTheDocument();
  });

  test('hiển thị menu quản lý sản phẩm khi backend trả role Product_manager', () => {
    sessionStorage.setItem('role', 'Product_manager');

    renderSidebar();

    expect(screen.getByText(/Nhân viên quản lý sản phẩm/i)).toBeInTheDocument();
    expect(screen.getByText(/Trang Chủ/i)).toBeInTheDocument();
    expect(screen.getByText(/Thuốc/i)).toBeInTheDocument();
    expect(screen.getByText(/Nhà Cung Cấp/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Phiếu Nhập/i).length).toBeGreaterThan(0);
    expect(screen.queryByText(/Khách Hàng/i)).not.toBeInTheDocument();
  });

  test('gọi handleLogout khi nhấn nút đăng xuất', async () => {
    axios.post.mockResolvedValue({});

    renderSidebar();

    fireEvent.click(screen.getByText(/Đăng Xuất/i));

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        'http://localhost:8000/api/auth/logout/',
        {},
        { headers: { Authorization: 'Token dummyToken' } }
      );
      expect(sessionStorage.getItem('token')).toBeNull();
      expect(sessionStorage.getItem('role')).toBeNull();
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });
});
