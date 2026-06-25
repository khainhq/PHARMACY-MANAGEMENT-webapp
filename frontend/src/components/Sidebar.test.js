import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Sidebar from './Sidebar';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// Giả lập axios
jest.mock('axios');

// Giả lập useNavigate
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: jest.fn(),
}));

describe('Sidebar component', () => {
  let mockNavigate;

  beforeEach(() => {
    // Thiết lập sessionStorage
    sessionStorage.setItem('token', 'dummyToken');
    sessionStorage.setItem('role', 'Admin'); // Sử dụng chữ hoa 'Admin' để khớp với logic trong Sidebar

    // Thiết lập mockNavigate
    mockNavigate = jest.fn();
    useNavigate.mockReturnValue(mockNavigate);

    // Reset mocks
    axios.post.mockReset();
  });

  afterEach(() => {
    sessionStorage.clear();
    jest.clearAllMocks();
  });

  test('hiển thị avatar, tên admin và các mục menu dành riêng cho admin', () => {
    render(
      <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Sidebar />
      </MemoryRouter>
    );

    // Kiểm tra avatar
    expect(screen.getByAltText('User Avatar')).toBeInTheDocument();

    // Kiểm tra vai trò admin
    expect(screen.getAllByText(/Admin/i).length).toBeGreaterThan(0);

    // Kiểm tra các mục menu cụ thể
    expect(screen.getByText(/Trang Chủ/i)).toBeInTheDocument();
    expect(screen.getByText(/Báo Cáo/i)).toBeInTheDocument();

    // Kiểm tra nhiều mục Hóa Đơn
    const hoaDonItems = screen.getAllByText(/Hóa Đơn/i);
    expect(hoaDonItems.length).toBeGreaterThan(0);
  });

  test('hiển thị avatar và tên người dùng (không phải admin)', () => {
    sessionStorage.setItem('role', 'Nhân viên bán hàng');

    render(
      <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Sidebar />
      </MemoryRouter>
    );

    expect(screen.getByAltText('User Avatar')).toBeInTheDocument();

    const roleElements = screen.getAllByText(/Nhân viên bán hàng/i);
    expect(roleElements.length).toBeGreaterThan(0);
  });

  test('gọi handleLogout khi nhấn nút đăng xuất', async () => {
    // Giả lập axios.post trả về thành công
    axios.post.mockResolvedValue({});

    render(
      <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Sidebar />
      </MemoryRouter>
    );

    const logoutButton = screen.getByText(/Đăng Xuất/i);
    fireEvent.click(logoutButton);

    await waitFor(() => {
      // Kiểm tra axios.post được gọi với đúng tham số
      expect(axios.post).toHaveBeenCalledWith(
        'http://localhost:8000/api/auth/logout/',
        {},
        { headers: { Authorization: `Token dummyToken` } }
      );

      // Kiểm tra sessionStorage đã được xóa
      expect(sessionStorage.getItem('token')).toBeNull();
      expect(sessionStorage.getItem('role')).toBeNull();

      // Kiểm tra điều hướng đến trang đăng nhập
      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });
  });
});