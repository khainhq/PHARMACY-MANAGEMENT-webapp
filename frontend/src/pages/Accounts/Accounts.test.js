import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import axios from 'axios';
import Accounts from './Accounts';
import { ToastProvider } from '../../components/ToastProvider';

jest.mock('axios');
jest.mock('../../components/Sidebar', () => () => <div data-testid="sidebar">Sidebar</div>);

const renderAccounts = () => render(
  <ToastProvider>
    <Accounts />
  </ToastProvider>
);

describe('Accounts component', () => {
  const mockAccounts = [
    {
      accountID: 1,
      username: 'user1',
      role: '2',
      employee: 'emp1',
      is_active: true,
    },
    {
      accountID: 2,
      username: 'user2',
      role: '3',
      employee: 'emp2',
      is_active: false,
    },
  ];

  const mockEmployees = [
    { employeeID: 'emp1', fullName: 'Nguyen Van A' },
    { employeeID: 'emp2', fullName: 'Tran Thi B' },
    { employeeID: 'emp3', fullName: 'Le Thi C' },
  ];

  beforeEach(() => {
    sessionStorage.setItem('token', 'dummyToken');
    jest.clearAllMocks();

    axios.get.mockImplementation((url) => {
      if (url === 'http://127.0.0.1:8000/api/auth/employees/') {
        return Promise.resolve({ data: mockEmployees });
      }
      if (url === 'http://127.0.0.1:8000/api/auth/accounts/') {
        return Promise.resolve({ data: mockAccounts });
      }
      return Promise.reject(new Error(`Unexpected API call: ${url}`));
    });
  });

  afterEach(() => {
    sessionStorage.clear();
  });

  test('hiển thị Sidebar, Toolbar và bảng danh sách tài khoản', async () => {
    const { container } = renderAccounts();

    expect(screen.getByTestId('sidebar')).toBeInTheDocument();
    expect(screen.getByText(/THÊM/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Tìm kiếm tài khoản.../i)).toBeInTheDocument();
    expect(screen.getByText(/DANH SÁCH TÀI KHOẢN/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('user1')).toBeInTheDocument();
      expect(screen.getByText('user2')).toBeInTheDocument();
      expect(screen.getByText('Nhân viên bán hàng')).toBeInTheDocument();
      expect(screen.getByText('Nhân viên quản lí sản phẩm')).toBeInTheDocument();
      expect(screen.getByText('Hoạt động')).toBeInTheDocument();
      expect(screen.getByText('Vô hiệu')).toBeInTheDocument();
    });

    expect(container).toMatchSnapshot();
  });

  test('hiển thị form khi nhấn nút THÊM và chụp snapshot', async () => {
    const { container } = renderAccounts();

    fireEvent.click(screen.getByText(/THÊM/i));

    expect(screen.getByPlaceholderText(/Tên tài khoản/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Mật khẩu/i)).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: 'Chọn quyền' })).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: 'Chọn nhân viên' })).toBeInTheDocument();
    expect(screen.getByText(/Tạo tài khoản/i)).toBeInTheDocument();
    expect(screen.getByText(/Hủy/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByRole('option', { name: /emp3 - Le Thi C/i })).toBeInTheDocument();
    });

    expect(container).toMatchSnapshot();
  });

  test('tìm kiếm tài khoản theo tên người dùng', async () => {
    renderAccounts();

    await waitFor(() => {
      expect(screen.getByText('user1')).toBeInTheDocument();
      expect(screen.getByText('user2')).toBeInTheDocument();
    });

    fireEvent.change(screen.getByPlaceholderText(/Tìm kiếm tài khoản.../i), {
      target: { value: 'user1' },
    });

    expect(screen.getByText('user1')).toBeInTheDocument();
    expect(screen.queryByText('user2')).not.toBeInTheDocument();
  });

  test('thêm tài khoản mới bằng danh sách nhân viên hợp lệ', async () => {
    axios.post.mockResolvedValue({ data: {} });

    renderAccounts();

    fireEvent.click(screen.getByText(/THÊM/i));
    await screen.findByRole('option', { name: /emp3 - Le Thi C/i });
    fireEvent.change(screen.getByPlaceholderText(/Tên tài khoản/i), {
      target: { value: 'newuser' },
    });
    fireEvent.change(screen.getByPlaceholderText(/Mật khẩu/i), {
      target: { value: 'password123' },
    });
    fireEvent.change(screen.getByRole('combobox', { name: 'Chọn quyền' }), {
      target: { value: '2' },
    });
    fireEvent.change(screen.getByRole('combobox', { name: 'Chọn nhân viên' }), {
      target: { value: 'emp3' },
    });

    fireEvent.click(screen.getByText(/Tạo tài khoản/i));

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        'http://127.0.0.1:8000/api/auth/accounts/',
        {
          username: 'newuser',
          password: 'password123',
          role: 2,
          employee: 'emp3',
        },
        { headers: { Authorization: 'Token dummyToken' } }
      );
    });

    await waitFor(() => {
      expect(screen.queryByPlaceholderText(/Tên tài khoản/i)).not.toBeInTheDocument();
    });
  });

  test('hiển thị lỗi cụ thể từ API khi tạo tài khoản thất bại', async () => {
    axios.post.mockRejectedValue({ response: { data: { error: 'Tên tài khoản đã tồn tại.' } } });

    renderAccounts();

    fireEvent.click(screen.getByText(/THÊM/i));
    fireEvent.change(screen.getByPlaceholderText(/Tên tài khoản/i), {
      target: { value: 'Test' },
    });
    fireEvent.change(screen.getByPlaceholderText(/Mật khẩu/i), {
      target: { value: 'password123' },
    });
    fireEvent.change(screen.getByRole('combobox', { name: 'Chọn quyền' }), {
      target: { value: '2' },
    });

    fireEvent.click(screen.getByText(/Tạo tài khoản/i));

    expect(await screen.findByRole('alert')).toHaveTextContent('Tên tài khoản đã tồn tại.');
  });

  test('sửa tài khoản hiện có', async () => {
    axios.patch.mockResolvedValue({ data: {} });

    renderAccounts();

    await waitFor(() => {
      expect(screen.getByText('user1')).toBeInTheDocument();
    });

    fireEvent.click(screen.getAllByText(/Sửa/i)[0]);

    expect(screen.getByPlaceholderText(/Tên tài khoản/i)).toHaveValue('user1');
    expect(screen.getByPlaceholderText(/Mật khẩu/i)).toHaveValue('');
    expect(screen.getByRole('combobox', { name: 'Chọn quyền' })).toHaveValue('2');
    expect(screen.getByRole('combobox', { name: 'Chọn nhân viên' })).toHaveValue('emp1');

    fireEvent.change(screen.getByPlaceholderText(/Tên tài khoản/i), {
      target: { value: 'updateduser' },
    });
    fireEvent.click(screen.getByText(/Cập nhật tài khoản/i));

    await waitFor(() => {
      expect(axios.patch).toHaveBeenCalledWith(
        'http://127.0.0.1:8000/api/auth/accounts/1/',
        {
          username: 'updateduser',
          role: 2,
          employee: 'emp1',
        },
        { headers: { Authorization: 'Token dummyToken' } }
      );
    });
  });

  test('xóa tài khoản', async () => {
    axios.delete.mockResolvedValue({ data: {} });
    window.confirm = jest.fn().mockReturnValue(true);

    renderAccounts();

    await waitFor(() => {
      expect(screen.getByText('user1')).toBeInTheDocument();
    });

    fireEvent.click(screen.getAllByText(/Xóa/i)[0]);

    await waitFor(() => {
      expect(axios.delete).toHaveBeenCalledWith(
        'http://127.0.0.1:8000/api/auth/accounts/1/',
        { headers: { Authorization: 'Token dummyToken' } }
      );
    });
  });

  test('kích hoạt hoặc vô hiệu hóa tài khoản', async () => {
    axios.patch.mockResolvedValue({ data: {} });

    renderAccounts();

    await waitFor(() => {
      expect(screen.getByText('user1')).toBeInTheDocument();
    });

    fireEvent.click(screen.getAllByText(/Vô hiệu hóa/i)[0]);

    await waitFor(() => {
      expect(axios.patch).toHaveBeenCalledWith(
        'http://127.0.0.1:8000/api/auth/accounts/1/',
        { is_active: false },
        { headers: { Authorization: 'Token dummyToken' } }
      );
    });
  });

  test('nhấn nút Hủy đóng form và reset dữ liệu', async () => {
    renderAccounts();

    fireEvent.click(screen.getByText(/THÊM/i));
    fireEvent.change(screen.getByPlaceholderText(/Tên tài khoản/i), {
      target: { value: 'testuser' },
    });
    fireEvent.click(screen.getByText(/Hủy/i));

    expect(screen.queryByPlaceholderText(/Tên tài khoản/i)).not.toBeInTheDocument();

    fireEvent.click(screen.getByText(/THÊM/i));
    expect(screen.getByPlaceholderText(/Tên tài khoản/i)).toHaveValue('');
  });

  test('gửi form không hợp lệ không gọi API', async () => {
    axios.post.mockResolvedValue({ data: {} });

    renderAccounts();

    fireEvent.click(screen.getByText(/THÊM/i));
    fireEvent.change(screen.getByPlaceholderText(/Mật khẩu/i), {
      target: { value: 'password123' },
    });
    fireEvent.change(screen.getByRole('combobox', { name: 'Chọn quyền' }), {
      target: { value: '2' },
    });
    fireEvent.click(screen.getByText(/Tạo tài khoản/i));

    await waitFor(() => {
      expect(axios.post).not.toHaveBeenCalled();
    });

    expect(screen.getByPlaceholderText(/Tên tài khoản/i)).toBeInTheDocument();
  });

  test('hiển thị đúng trên màn hình nhỏ', async () => {
    global.innerWidth = 500;
    global.dispatchEvent(new Event('resize'));

    renderAccounts();

    await waitFor(() => {
      expect(screen.getByText('user1')).toBeInTheDocument();
      expect(screen.getByText('user2')).toBeInTheDocument();
    });

    expect(screen.getByTestId('sidebar')).toBeInTheDocument();
    expect(screen.getByText(/THÊM/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Tìm kiếm tài khoản.../i)).toBeInTheDocument();
    expect(screen.getByText(/DANH SÁCH TÀI KHOẢN/i)).toBeInTheDocument();
    expect(screen.getByText('Nhân viên bán hàng')).toBeInTheDocument();
    expect(screen.getByText('Nhân viên quản lí sản phẩm')).toBeInTheDocument();
  });
});
