import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import axios from 'axios';
import Accounts from './Accounts';
import Sidebar from '../../components/Sidebar';

// Giả lập axios
jest.mock('axios');

// Giả lập Sidebar
jest.mock('../../components/Sidebar', () => () => <div data-testid="sidebar">Sidebar</div>);

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

  beforeEach(() => {
    // Thiết lập sessionStorage
    sessionStorage.setItem('token', 'dummyToken');

    // Reset mocks
    jest.clearAllMocks();

    // Giả lập axios.get
    axios.get.mockResolvedValue({ data: mockAccounts });
  });

  afterEach(() => {
    sessionStorage.clear();
  });

  test('hiển thị Sidebar, Toolbar và bảng danh sách tài khoản', async () => {
    const { container } = render(<Accounts />);

    // Kiểm tra Sidebar
    expect(screen.getByTestId('sidebar')).toBeInTheDocument();

    // Kiểm tra Toolbar
    expect(screen.getByText(/THÊM/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Tìm kiếm tài khoản.../i)).toBeInTheDocument();

    // Kiểm tra tiêu đề bảng
    expect(screen.getByText(/DANH SÁCH TÀI KHOẢN/i)).toBeInTheDocument();

    // Kiểm tra dữ liệu bảng
    await waitFor(() => {
      expect(screen.getByText('user1')).toBeInTheDocument();
      expect(screen.getByText('user2')).toBeInTheDocument();
      expect(screen.getByText('Nhân viên bán hàng')).toBeInTheDocument();
      expect(screen.getByText('Nhân viên quản lí sản phẩm')).toBeInTheDocument();
      expect(screen.getByText('Hoạt động')).toBeInTheDocument();
      expect(screen.getByText('Vô hiệu')).toBeInTheDocument();
    });

    // Snapshot test cho trạng thái mặc định
    expect(container).toMatchSnapshot();
  });

  test('hiển thị form khi nhấn nút THÊM và chụp snapshot', async () => {
    const { container } = render(<Accounts />);

    // Nhấn nút THÊM
    fireEvent.click(screen.getByText(/THÊM/i));

    // Kiểm tra form hiển thị
    expect(screen.getByPlaceholderText(/Tên tài khoản/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Mật khẩu/i)).toBeInTheDocument();
    expect(screen.getByRole('combobox')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Nhân viên \(ID\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Tạo tài khoản/i)).toBeInTheDocument();
    expect(screen.getByText(/Hủy/i)).toBeInTheDocument();

    // Snapshot test khi form hiển thị
    expect(container).toMatchSnapshot();
  });

  test('tìm kiếm tài khoản theo tên người dùng', async () => {
    render(<Accounts />);

    // Chờ dữ liệu tải
    await waitFor(() => {
      expect(screen.getByText('user1')).toBeInTheDocument();
      expect(screen.getByText('user2')).toBeInTheDocument();
    });

    // Nhập từ khóa tìm kiếm
    fireEvent.change(screen.getByPlaceholderText(/Tìm kiếm tài khoản.../i), {
      target: { value: 'user1' },
    });

    // Kiểm tra kết quả tìm kiếm
    expect(screen.getByText('user1')).toBeInTheDocument();
    expect(screen.queryByText('user2')).not.toBeInTheDocument();
  });

  test('thêm tài khoản mới', async () => {
    axios.post.mockResolvedValue({ data: {} });

    render(<Accounts />);

    // Nhấn nút THÊM
    fireEvent.click(screen.getByText(/THÊM/i));

    // Điền form
    fireEvent.change(screen.getByPlaceholderText(/Tên tài khoản/i), {
      target: { value: 'newuser' },
    });
    fireEvent.change(screen.getByPlaceholderText(/Mật khẩu/i), {
      target: { value: 'password123' },
    });
    fireEvent.change(screen.getByRole('combobox'), {
      target: { value: '2' },
    });
    fireEvent.change(screen.getByPlaceholderText(/Nhân viên \(ID\)/i), {
      target: { value: 'emp3' },
    });

    // Nhấn nút Tạo tài khoản
    fireEvent.click(screen.getByText(/Tạo tài khoản/i));

    // Kiểm tra axios.post được gọi
    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        'http://localhost:8000/api/auth/accounts/',
        {
          username: 'newuser',
          password: 'password123',
          role: '2',
          employee: 'emp3',
        },
        { headers: { Authorization: 'Token dummyToken' } }
      );
    });

    // Kiểm tra form bị ẩn
    await waitFor(() => {
      expect(screen.queryByPlaceholderText(/Tên tài khoản/i)).not.toBeInTheDocument();
    });
  });

  test('sửa tài khoản hiện có', async () => {
    axios.put.mockResolvedValue({ data: {} });

    render(<Accounts />);

    // Chờ dữ liệu tải
    await waitFor(() => {
      expect(screen.getByText('user1')).toBeInTheDocument();
    });

    // Nhấn nút Sửa
    fireEvent.click(screen.getAllByText(/Sửa/i)[0]);

    // Kiểm tra form hiển thị với dữ liệu
    expect(screen.getByPlaceholderText(/Tên tài khoản/i)).toHaveValue('user1');
    expect(screen.getByPlaceholderText(/Mật khẩu/i)).toHaveValue('');
    expect(screen.getByRole('combobox')).toHaveValue('2');

    // Cập nhật dữ liệu
    fireEvent.change(screen.getByPlaceholderText(/Tên tài khoản/i), {
      target: { value: 'updateduser' },
    });

    // Nhấn nút Cập nhật tài khoản
    fireEvent.click(screen.getByText(/Cập nhật tài khoản/i));

    // Kiểm tra axios.put được gọi
    await waitFor(() => {
      expect(axios.put).toHaveBeenCalledWith(
        'http://localhost:8000/api/auth/accounts/1/',
        {
          username: 'updateduser',
          role: '2',
          employee: 'emp1',
        },
        { headers: { Authorization: 'Token dummyToken' } }
      );
    });
  });

  test('xóa tài khoản', async () => {
    axios.delete.mockResolvedValue({ data: {} });
    window.confirm = jest.fn().mockReturnValue(true);

    render(<Accounts />);

    // Chờ dữ liệu tải
    await waitFor(() => {
      expect(screen.getByText('user1')).toBeInTheDocument();
    });

    // Nhấn nút Xóa
    fireEvent.click(screen.getAllByText(/Xóa/i)[0]);

    // Kiểm tra axios.delete được gọi
    await waitFor(() => {
      expect(axios.delete).toHaveBeenCalledWith(
        'http://localhost:8000/api/auth/accounts/1/',
        { headers: { Authorization: 'Token dummyToken' } }
      );
    });
  });

  test('kích hoạt/vô hiệu hóa tài khoản', async () => {
    axios.patch.mockResolvedValue({ data: {} });

    render(<Accounts />);

    // Chờ dữ liệu tải
    await waitFor(() => {
      expect(screen.getByText('user1')).toBeInTheDocument();
    });

    // Nhấn nút Vô hiệu hóa
    fireEvent.click(screen.getAllByText(/Vô hiệu hóa/i)[0]);

    // Kiểm tra axios.patch được gọi
    await waitFor(() => {
      expect(axios.patch).toHaveBeenCalledWith(
        'http://localhost:8000/api/auth/accounts/1/',
        { is_active: false },
        { headers: { Authorization: 'Token dummyToken' } }
      );
    });
  });

  // Interaction test: Nhấn nút Hủy
  test('nhấn nút Hủy đóng form và reset dữ liệu', async () => {
    render(<Accounts />);

    // Nhấn nút THÊM
    fireEvent.click(screen.getByText(/THÊM/i));

    // Điền form
    fireEvent.change(screen.getByPlaceholderText(/Tên tài khoản/i), {
      target: { value: 'testuser' },
    });

    // Nhấn nút Hủy
    fireEvent.click(screen.getByText(/Hủy/i));

    // Kiểm tra form bị ẩn
    expect(screen.queryByPlaceholderText(/Tên tài khoản/i)).not.toBeInTheDocument();

    // Nhấn lại nút THÊM và kiểm tra form rỗng
    fireEvent.click(screen.getByText(/THÊM/i));
    expect(screen.getByPlaceholderText(/Tên tài khoản/i)).toHaveValue('');
  });

  // Interaction test: Gửi form không hợp lệ
  test('gửi form không hợp lệ không gọi API', async () => {
    axios.post.mockResolvedValue({ data: {} });

    render(<Accounts />);

    // Nhấn nút THÊM
    fireEvent.click(screen.getByText(/THÊM/i));

    // Để trống username (trường bắt buộc)
    fireEvent.change(screen.getByPlaceholderText(/Mật khẩu/i), {
      target: { value: 'password123' },
    });
    fireEvent.change(screen.getByRole('combobox'), {
      target: { value: '2' },
    });

    // Nhấn nút Tạo tài khoản
    fireEvent.click(screen.getByText(/Tạo tài khoản/i));

    // Kiểm tra axios.post không được gọi
    await waitFor(() => {
      expect(axios.post).not.toHaveBeenCalled();
    });

    // Kiểm tra form vẫn hiển thị
    expect(screen.getByPlaceholderText(/Tên tài khoản/i)).toBeInTheDocument();
  });

  // Responsive behavior test
  test('hiển thị đúng trên màn hình nhỏ', async () => {
    // Giả lập màn hình nhỏ
    global.innerWidth = 500;
    global.dispatchEvent(new Event('resize'));

    render(<Accounts />);

    // Chờ dữ liệu tải
    await waitFor(() => {
      expect(screen.getByText('user1')).toBeInTheDocument();
      expect(screen.getByText('user2')).toBeInTheDocument();
    });

    // Kiểm tra các phần tử chính vẫn hiển thị
    expect(screen.getByTestId('sidebar')).toBeInTheDocument();
    expect(screen.getByText(/THÊM/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Tìm kiếm tài khoản.../i)).toBeInTheDocument();
    expect(screen.getByText(/DANH SÁCH TÀI KHOẢN/i)).toBeInTheDocument();
    expect(screen.getByText('Nhân viên bán hàng')).toBeInTheDocument();
    expect(screen.getByText('Nhân viên quản lí sản phẩm')).toBeInTheDocument();
  });
});