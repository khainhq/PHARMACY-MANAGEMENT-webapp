import React from 'react';
import { render, screen, waitFor, fireEvent, act } from '@testing-library/react';
import axios from 'axios';
import Employees from './Employees';

// Mock các module cần thiết
jest.mock('axios');
jest.mock('../../components/Sidebar', () => () => <div>Mocked Sidebar</div>);
jest.mock('react-icons/fa', () => ({
  FaUserPlus: () => <span>FaUserPlus</span>,
  FaSearch: () => <span>FaSearch</span>,
}));

describe('Employees component', () => {
  beforeEach(() => {
    // Reset các mock
    axios.get.mockReset();
    axios.post.mockReset();
    axios.put.mockReset();
    axios.delete.mockReset();

    // Thiết lập token trong sessionStorage
    sessionStorage.setItem('token', 'dummyToken');

    // Mock dữ liệu API
    axios.get.mockResolvedValue({
      data: [
        {
          employeeID: 'AB12CDEF',
          fullName: 'Nguyen Van A',
          phoneNumber: '0123456789',
          gender: 'Male',
          yearOfBirth: 1990,
          hireDate: '2023-01-15',
        },
        {
          employeeID: 'XY34WXYZ',
          fullName: 'Tran Thi B',
          phoneNumber: '0987654321',
          gender: 'Female',
          yearOfBirth: 1995,
          hireDate: '2023-06-20',
        },
      ],
    });

    // Mock window.confirm
    window.confirm = jest.fn(() => true);
  });

  afterEach(() => {
    sessionStorage.clear();
    jest.clearAllMocks();
  });

  test('hiển thị Sidebar, tiêu đề và bảng nhân viên', async () => {
    render(<Employees />);

    await waitFor(() => {
      expect(screen.getByText(/Mocked Sidebar/i)).toBeInTheDocument();
      expect(screen.getByText(/DANH SÁCH THÔNG TIN NHÂN VIÊN/i)).toBeInTheDocument();
      expect(screen.getByText(/Nguyen Van A/i)).toBeInTheDocument();
      expect(screen.getByText(/Tran Thi B/i)).toBeInTheDocument();
      expect(screen.getByText(/0123456789/i)).toBeInTheDocument();
      expect(screen.getByText(/0987654321/i)).toBeInTheDocument();
      expect(screen.getByText(/Nam/i)).toBeInTheDocument();
      expect(screen.getByText(/Nữ/i)).toBeInTheDocument();
      expect(screen.getByText(/1990/i)).toBeInTheDocument();
      expect(screen.getByText(/1995/i)).toBeInTheDocument();
      expect(screen.getByText(/2023-01-15/i)).toBeInTheDocument();
      expect(screen.getByText(/2023-06-20/i)).toBeInTheDocument();
    });
  });

  test('tìm kiếm nhân viên theo từ khóa', async () => {
    render(<Employees />);

    await waitFor(() => {
      expect(screen.getByText(/Nguyen Van A/i)).toBeInTheDocument();
      expect(screen.getByText(/Tran Thi B/i)).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(/Tìm kiếm nhân viên.../i);
    fireEvent.change(searchInput, { target: { value: 'Nguyen' } });

    expect(screen.getByText(/Nguyen Van A/i)).toBeInTheDocument();
    expect(screen.queryByText(/Tran Thi B/i)).not.toBeInTheDocument();
  });

  test('hiển thị form khi nhấn nút "Thêm Nhân viên"', async () => {
    render(<Employees />);

    const addButton = screen.getByRole('button', { name: /Thêm Nhân viên/i });
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/Họ tên/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/Số điện thoại/i)).toBeInTheDocument();
      expect(screen.getByText(/Chọn giới tính/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/Năm sinh/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/Ngày vào làm/i)).toBeInTheDocument();
    });
  });

  test('thêm nhân viên mới', async () => {
    axios.post.mockResolvedValue({ data: {} });

    render(<Employees />);

    const addButton = screen.getByRole('button', { name: /Thêm Nhân viên/i });
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/Họ tên/i)).toBeInTheDocument();
    });

    fireEvent.change(screen.getByPlaceholderText(/Họ tên/i), { target: { value: 'Le Thi C' } });
    fireEvent.change(screen.getByPlaceholderText(/Số điện thoại/i), { target: { value: '0912345678' } });
    // Target the <select> element, not the <option>
    const genderSelect = screen.getByRole('combobox');
    fireEvent.change(genderSelect, { target: { value: 'Female' } });
    fireEvent.change(screen.getByPlaceholderText(/Năm sinh/i), { target: { value: '1992' } });
    fireEvent.change(screen.getByPlaceholderText(/Ngày vào làm/i), { target: { value: '2023-12-01' } });

    const submitButtons = screen.getAllByRole('button');
    const submitButton = submitButtons.find(button => button.textContent === 'Thêm nhân viên' && button.getAttribute('type') === 'submit');
    await act(async () => {
      fireEvent.click(submitButton);
    });

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        'http://localhost:8000/api/auth/employees/',
        expect.objectContaining({
          fullName: 'Le Thi C',
          phoneNumber: '0912345678',
          gender: 'Female',
          yearOfBirth: '1992',
          hireDate: '2023-12-01',
        }),
        expect.any(Object)
      );
      expect(screen.queryByPlaceholderText(/Họ tên/i)).not.toBeInTheDocument();
    });
  });

  test('chỉnh sửa thông tin nhân viên', async () => {
    axios.put.mockResolvedValue({ data: {} });

    render(<Employees />);

    await waitFor(() => {
      expect(screen.getByText(/Nguyen Van A/i)).toBeInTheDocument();
    });

    const editButton = screen.getAllByRole('button', { name: /Sửa/i })[0];
    fireEvent.click(editButton);

    fireEvent.change(screen.getByPlaceholderText(/Họ tên/i), { target: { value: 'Nguyen Van B' } });
    fireEvent.change(screen.getByPlaceholderText(/Số điện thoại/i), { target: { value: '0999999999' } });

    const updateButton = screen.getByRole('button', { name: /Cập nhật/i });
    await act(async () => {
      fireEvent.click(updateButton);
    });

    await waitFor(() => {
      expect(axios.put).toHaveBeenCalledWith(
        'http://localhost:8000/api/auth/employees/AB12CDEF/',
        expect.objectContaining({
          employeeID: 'AB12CDEF',
          fullName: 'Nguyen Van B',
          phoneNumber: '0999999999',
          gender: 'Male',
          yearOfBirth: 1990,
          hireDate: '2023-01-15',
          is_active: true,
        }),
        expect.any(Object)
      );
      expect(screen.queryByPlaceholderText(/Họ tên/i)).not.toBeInTheDocument();
    });
  });

  test('xóa nhân viên', async () => {
    axios.delete.mockResolvedValue({ data: {} });

    render(<Employees />);

    await waitFor(() => {
      expect(screen.getByText(/Nguyen Van A/i)).toBeInTheDocument();
    });

    const deleteButton = screen.getAllByRole('button', { name: /Xóa/i })[0];
    await act(async () => {
      fireEvent.click(deleteButton);
    });

    await waitFor(() => {
      expect(window.confirm).toHaveBeenCalled();
      expect(axios.delete).toHaveBeenCalledWith(
        'http://localhost:8000/api/auth/employees/AB12CDEF/',
        expect.any(Object)
      );
    });
  });

  test('snapshot của giao diện Employees', async () => {
    const { container } = render(<Employees />);

    await waitFor(() => {
      expect(screen.getByText(/Nguyen Van A/i)).toBeInTheDocument();
    });

    expect(container).toMatchSnapshot();
  });
});