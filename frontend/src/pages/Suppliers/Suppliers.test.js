import React from 'react';
import { render, screen, fireEvent, act, within, waitFor } from '@testing-library/react';
import axios from 'axios';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import Suppliers from './Suppliers';

// Mock dependencies
jest.mock('axios');
jest.mock('file-saver', () => ({ saveAs: jest.fn() }));
jest.mock('xlsx', () => ({
  utils: {
    json_to_sheet: jest.fn(),
    book_new: jest.fn(),
    book_append_sheet: jest.fn(),
  },
  write: jest.fn(),
}));
jest.mock('../../components/Sidebar', () => () => <div>Mocked Sidebar</div>);

// Mock window.confirm
const mockConfirm = jest.fn();
window.confirm = mockConfirm;

// Tăng timeout toàn cục
jest.setTimeout(30000);

describe('Suppliers component', () => {
  let mockSuppliers;

  beforeEach(() => {
    // Reset mocks
    axios.get.mockReset();
    axios.post.mockReset();
    axios.put.mockReset();
    axios.delete.mockReset();
    saveAs.mockReset();
    XLSX.utils.json_to_sheet.mockReset();
    XLSX.utils.book_new.mockReset();
    XLSX.utils.book_append_sheet.mockReset();
    XLSX.write.mockReset();
    mockConfirm.mockReset();

    // Set up mock data
    mockSuppliers = [
      {
        supplierID: 'AB-123456',
        supplierName: 'Supplier A',
        phoneNumber: '0123456789',
        address: '123 Main St',
      },
      {
        supplierID: 'CD-789012',
        supplierName: 'Supplier B',
        phoneNumber: '0987654321',
        address: '456 Oak Ave',
      },
    ];

    // Set up token in sessionStorage
    sessionStorage.setItem('token', 'dummyToken');

    // Mock API responses
    axios.get.mockImplementation((url) => {
      if (url === 'http://localhost:8000/api/medicines/suppliers/') {
        console.log('Mock API /api/medicines/suppliers/ called, returning:', mockSuppliers);
        return Promise.resolve({ data: mockSuppliers });
      }
      return Promise.reject(new Error('Unexpected API call'));
    });

    // Mock XLSX
    XLSX.utils.json_to_sheet.mockReturnValue('mockWorksheet');
    XLSX.utils.book_new.mockReturnValue('mockWorkbook');
    XLSX.utils.book_append_sheet.mockReturnValue(undefined);
    XLSX.write.mockReturnValue('mockExcelBuffer');

    // Mock console.error
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    sessionStorage.clear();
    jest.clearAllMocks();
    console.error.mockRestore();
  });

  test('hiển thị Sidebar, tiêu đề, bảng và các nút', async () => {
    render(<Suppliers />);

    await waitFor(() => {
      expect(screen.getByText(/Mocked Sidebar/i)).toBeInTheDocument();
      expect(screen.getByText(/DANH SÁCH NHÀ CUNG CẤP/i)).toBeInTheDocument();
      expect(screen.getByText(/THÊM/i)).toBeInTheDocument();
      expect(screen.getByText(/Tải xuống/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/Tìm kiếm nhà cung cấp.../i)).toBeInTheDocument();
    }, { timeout: 5000 });

    const table = screen.getByRole('table');
    expect(within(table).getByText(/STT/i)).toBeInTheDocument();
    expect(within(table).getByText(/Tên nhà cung cấp/i)).toBeInTheDocument();
    expect(within(table).getByText(/Số điện thoại/i)).toBeInTheDocument();
    expect(within(table).getByText(/Địa chỉ/i)).toBeInTheDocument();
    expect(within(table).getByText(/Hành động/i)).toBeInTheDocument();

    await waitFor(() => {
      const row1 = within(table).getByText('Supplier A').closest('tr');
      const cells1 = within(row1).getAllByRole('cell');
      expect(cells1[0]).toHaveTextContent('1');
      expect(cells1[1]).toHaveTextContent('Supplier A');
      expect(cells1[2]).toHaveTextContent('0123456789');
      expect(cells1[3]).toHaveTextContent('123 Main St');
    }, { timeout: 5000 });
  });

  test('hiển thị dữ liệu nhà cung cấp từ API', async () => {
    render(<Suppliers />);

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith(
        'http://localhost:8000/api/medicines/suppliers/',
        expect.any(Object)
      );
    }, { timeout: 5000 });

    const table = screen.getByRole('table');
    await waitFor(() => {
      const row1 = within(table).getByText('Supplier A').closest('tr');
      const cells1 = within(row1).getAllByRole('cell');
      expect(cells1[1]).toHaveTextContent('Supplier A');
      expect(cells1[2]).toHaveTextContent('0123456789');
      expect(cells1[3]).toHaveTextContent('123 Main St');

      const row2 = within(table).getByText('Supplier B').closest('tr');
      const cells2 = within(row2).getAllByRole('cell');
      expect(cells2[1]).toHaveTextContent('Supplier B');
      expect(cells2[2]).toHaveTextContent('0987654321');
      expect(cells2[3]).toHaveTextContent('456 Oak Ave');
    }, { timeout: 5000 });
  });

  test('tìm kiếm nhà cung cấp theo tên', async () => {
    render(<Suppliers />);

    await waitFor(() => {
      expect(screen.getByText('Supplier A')).toBeInTheDocument();
      expect(screen.getByText('Supplier B')).toBeInTheDocument();
    }, { timeout: 5000 });

    const searchInput = screen.getByPlaceholderText(/Tìm kiếm nhà cung cấp.../i);
    fireEvent.change(searchInput, { target: { value: 'Supplier A' } });

    await waitFor(() => {
      const table = screen.getByRole('table');
      expect(within(table).getByText('Supplier A')).toBeInTheDocument();
      expect(within(table).queryByText('Supplier B')).not.toBeInTheDocument();
    }, { timeout: 5000 });
  });

  test('thêm nhà cung cấp mới', async () => {
    axios.post.mockResolvedValue({ data: {} });

    render(<Suppliers />);

    const addButton = screen.getByText(/THÊM/i);
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/Tên nhà cung cấp/i)).toBeInTheDocument();
    }, { timeout: 5000 });

    // Tìm form chứa nút "Thêm mới"
    const submitButton = screen.getByText(/Thêm mới/i);
    const form = submitButton.closest('form');
    if (!form) throw new Error('Form not found');

    const nameInput = within(form).getByPlaceholderText(/Tên nhà cung cấp/i);
    const phoneInput = within(form).getByPlaceholderText(/Số điện thoại/i);
    const addressInput = within(form).getByPlaceholderText(/Địa chỉ/i);

    // Debug: Log tất cả input trong form
    const textboxes = within(form).getAllByRole('textbox');
    console.log('Form inputs:', textboxes.map(input => ({
      placeholder: input.placeholder,
      value: input.value
    })));

    fireEvent.change(nameInput, { target: { value: 'Supplier C' } });
    fireEvent.change(phoneInput, { target: { value: '1234567890' } });
    fireEvent.change(addressInput, { target: { value: '789 Pine Rd' } });

    await act(async () => {
      fireEvent.click(submitButton);
    });

    await waitFor(() => {
      console.log('POST call:', axios.post.mock.calls);
      expect(axios.post).toHaveBeenCalledWith(
        'http://localhost:8000/api/medicines/suppliers/',
        expect.objectContaining({
          supplierName: 'Supplier C',
          phoneNumber: '1234567890',
          address: '789 Pine Rd',
          supplierID: expect.any(String),
        }),
        expect.any(Object)
      );
      expect(screen.queryByPlaceholderText(/Tên nhà cung cấp/i)).not.toBeInTheDocument();
    }, { timeout: 5000 });
  });

  test('sửa nhà cung cấp', async () => {
    axios.put.mockResolvedValue({ data: {} });

    render(<Suppliers />);

    await waitFor(() => {
      expect(screen.getByText('Supplier A')).toBeInTheDocument();
    }, { timeout: 5000 });

    const editButton = within(screen.getByText('Supplier A').closest('tr')).getByText(/Sửa/i);
    fireEvent.click(editButton);

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/Tên nhà cung cấp/i)).toHaveValue('Supplier A');
    }, { timeout: 5000 });

    const nameInput = screen.getByPlaceholderText(/Tên nhà cung cấp/i);
    fireEvent.change(nameInput, { target: { value: 'Supplier A Updated' } });

    const updateButton = screen.getByText(/Cập nhật/i);
    await act(async () => {
      fireEvent.click(updateButton);
    });

    await waitFor(() => {
      expect(axios.put).toHaveBeenCalledWith(
        'http://localhost:8000/api/medicines/suppliers/AB-123456/',
        expect.objectContaining({
          supplierName: 'Supplier A Updated',
          phoneNumber: '0123456789',
          address: '123 Main St',
          supplierID: 'AB-123456',
        }),
        expect.any(Object)
      );
      expect(screen.queryByPlaceholderText(/Tên nhà cung cấp/i)).not.toBeInTheDocument();
    }, { timeout: 5000 });
  });

  test('xóa nhà cung cấp', async () => {
    axios.delete.mockResolvedValue({ data: {} });

    render(<Suppliers />);

    await waitFor(() => {
      expect(screen.getByText('Supplier A')).toBeInTheDocument();
    }, { timeout: 5000 });

    const deleteButton = within(screen.getByText('Supplier A').closest('tr')).getByText(/Xóa/i);
    mockConfirm.mockReturnValue(true);

    await act(async () => {
      fireEvent.click(deleteButton);
    });

    await waitFor(() => {
      expect(mockConfirm).toHaveBeenCalledWith('Bạn có chắc chắn muốn xóa nhà cung cấp này?');
      expect(axios.delete).toHaveBeenCalledWith(
        'http://localhost:8000/api/medicines/suppliers/AB-123456/',
        expect.any(Object)
      );
    }, { timeout: 5000 });
  });

  test('xuất danh sách nhà cung cấp dưới dạng Excel', async () => {
    render(<Suppliers />);

    await waitFor(() => {
      expect(screen.getByText('Supplier A')).toBeInTheDocument();
    }, { timeout: 5000 });

    const downloadButton = screen.getByText(/Tải xuống/i);
    await act(async () => {
      fireEvent.click(downloadButton);
    });

    await waitFor(() => {
      expect(XLSX.utils.json_to_sheet).toHaveBeenCalledWith(mockSuppliers);
      expect(XLSX.utils.book_new).toHaveBeenCalled();
      expect(XLSX.utils.book_append_sheet).toHaveBeenCalledWith('mockWorkbook', 'mockWorksheet', 'Suppliers');
      expect(XLSX.write).toHaveBeenCalledWith('mockWorkbook', { bookType: 'xlsx', type: 'array' });
      expect(saveAs).toHaveBeenCalledWith(expect.any(Blob), 'Suppliers.xlsx');
    }, { timeout: 5000 });
  });

  test('xử lý lỗi khi lấy dữ liệu nhà cung cấp', async () => {
    axios.get.mockRejectedValue(new Error('Network error'));

    render(<Suppliers />);

    await waitFor(() => {
      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining('Error fetching suppliers:'),
        expect.anything()
      );
    }, { timeout: 5000 });

    const table = screen.getByRole('table');
    expect(within(table).queryByText('Supplier A')).not.toBeInTheDocument();
  });

  test('xử lý lỗi khi thêm nhà cung cấp', async () => {
    axios.post.mockRejectedValue(new Error('API error'));

    render(<Suppliers />);

    const addButton = screen.getByText(/THÊM/i);
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/Tên nhà cung cấp/i)).toBeInTheDocument();
    }, { timeout: 5000 });

    // Tìm form chứa nút "Thêm mới"
    const submitButton = screen.getByText(/Thêm mới/i);
    const form = submitButton.closest('form');
    if (!form) throw new Error('Form not found');

    const nameInput = within(form).getByPlaceholderText(/Tên nhà cung cấp/i);
    const phoneInput = within(form).getByPlaceholderText(/Số điện thoại/i);
    const addressInput = within(form).getByPlaceholderText(/Địa chỉ/i);

    // Debug: Log tất cả input trong form
    const textboxes = within(form).getAllByRole('textbox');
    console.log('Form inputs:', textboxes.map(input => ({
      placeholder: input.placeholder,
      value: input.value
    })));

    fireEvent.change(nameInput, { target: { value: 'Supplier C' } });
    fireEvent.change(phoneInput, { target: { value: '1234567890' } });
    fireEvent.change(addressInput, { target: { value: '789 Pine Rd' } });

    await act(async () => {
      fireEvent.click(submitButton);
    });

    await waitFor(() => {
      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining('Error saving supplier:'),
        expect.anything()
      );
      expect(screen.getByPlaceholderText(/Tên nhà cung cấp/i)).toBeInTheDocument();
    }, { timeout: 5000 });
  });

  test('snapshot của giao diện Suppliers', async () => {
    const { container } = render(<Suppliers />);

    await waitFor(() => {
      expect(screen.getByText('Supplier A')).toBeInTheDocument();
    }, { timeout: 5000 });

    expect(container).toMatchSnapshot();
  });
});