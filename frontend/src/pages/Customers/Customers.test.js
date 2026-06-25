import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import axios from 'axios';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import Customers from './Customers';

jest.mock('axios');
jest.mock('file-saver');
jest.mock('xlsx', () => ({
  utils: {
    json_to_sheet: jest.fn(() => ({ mockSheet: true })),
    book_new: jest.fn(() => ({ Sheets: {}, SheetNames: [] })),
    book_append_sheet: jest.fn(),
  },
  write: jest.fn(() => new Uint8Array([1, 2, 3])),
}));

describe('Customers component', () => {
  beforeEach(() => {
    axios.get.mockResolvedValue({
      data: [
        {
          customerID: 'ABC123',
          fullName: 'Nguyen Van A',
          phoneNumber: '0901234567',
          gender: 'Male',
          joinDate: '2023-01-01',
        },
        {
          customerID: 'DEF456',
          fullName: 'Tran Thi B',
          phoneNumber: '0912345678',
          gender: 'Female',
          joinDate: '2023-02-01',
        },
      ],
    });
    saveAs.mockClear();
  });

  afterEach(() => {
    sessionStorage.clear();
  });

  test('tìm kiếm khách hàng hoạt động đúng', async () => {
    render(
      <MemoryRouter>
        <Customers />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Nguyen Van A')).toBeInTheDocument();
      expect(screen.getByText('Tran Thi B')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(/Tìm kiếm khách hàng.../i);

    await act(async () => {
      fireEvent.change(searchInput, { target: { value: 'Nguyen' } });
    });

    await waitFor(() => {
      expect(screen.getByText('Nguyen Van A')).toBeInTheDocument();
      expect(screen.queryByText('Tran Thi B')).not.toBeInTheDocument();
    });
  });

  test('tải xuống Excel gọi đúng saveAs với Blob', async () => {
    render(
      <MemoryRouter>
        <Customers />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Nguyen Van A')).toBeInTheDocument();
    });

    await act(async () => {
      fireEvent.click(screen.getByText(/Tải xuống/i));
    });

    await waitFor(() => {
      expect(saveAs).toHaveBeenCalledWith(expect.any(Blob), 'Customers.xlsx');
    });
  });

  test('thêm khách hàng mới', async () => {
    axios.post.mockResolvedValue({ data: {} });

    render(
      <MemoryRouter>
        <Customers />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByText(/THÊM/i));
    fireEvent.change(screen.getByPlaceholderText(/Họ tên/i), { target: { value: 'Le Van C' } });
    fireEvent.change(screen.getByPlaceholderText(/Số điện thoại/i), { target: { value: '0923456789' } });
    fireEvent.change(screen.getByText(/Chọn giới tính/i).parentElement, { target: { value: 'Male' } });
    fireEvent.change(screen.getByPlaceholderText(/Ngày tham gia/i), { target: { value: '2023-03-01' } });

    fireEvent.click(screen.getByText(/Thêm mới/i));

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalled();
    });
  });

  test('sửa khách hàng hiện có', async () => {
    axios.put.mockResolvedValue({ data: {} });

    render(
      <MemoryRouter>
        <Customers />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Nguyen Van A')).toBeInTheDocument();
    });

    fireEvent.click(screen.getAllByText(/Sửa/i)[0]);
    fireEvent.change(screen.getByPlaceholderText(/Họ tên/i), { target: { value: 'Nguyen Van A Updated' } });
    fireEvent.change(screen.getByPlaceholderText(/Số điện thoại/i), { target: { value: '0909876543' } });
    fireEvent.change(screen.getByText(/Chọn giới tính/i).parentElement, { target: { value: 'Female' } });

    fireEvent.click(screen.getByText(/Cập nhật/i));

    await waitFor(() => {
      expect(axios.put).toHaveBeenCalled();
    });
  });

  test('xóa khách hàng khi xác nhận', async () => {
    window.confirm = jest.fn(() => true);
    axios.delete.mockResolvedValue({ data: {} });

    render(
      <MemoryRouter>
        <Customers />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Nguyen Van A')).toBeInTheDocument();
    });

    fireEvent.click(screen.getAllByText(/Xóa/i)[0]);

    await waitFor(() => {
      expect(axios.delete).toHaveBeenCalled();
    });
  });

  test('hủy form reset dữ liệu', () => {
    render(
      <MemoryRouter>
        <Customers />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByText(/THÊM/i));
    fireEvent.change(screen.getByPlaceholderText(/Họ tên/i), { target: { value: 'Test Customer' } });
    fireEvent.click(screen.getByText(/Hủy/i));

    expect(screen.queryByPlaceholderText(/Họ tên/i)).not.toBeInTheDocument();
  });
});
