import React from 'react';
import { render, screen, fireEvent, act, within, waitFor } from '@testing-library/react';
import axios from 'axios';
import ListPayments from './ListPayments';

// Mock dependencies
jest.mock('axios');
jest.mock('../../components/Sidebar', () => () => <div>Mocked Sidebar</div>);

// Tăng timeout toàn cục
jest.setTimeout(30000);

describe('ListPayments component', () => {
  let mockPaymentDetails, mockPayments, mockMedicines, mockSuppliers, mockEmployees;

  beforeEach(() => {
    // Reset mocks
    axios.get.mockReset();
    axios.delete.mockReset();

    // Set up mock data
    mockPaymentDetails = [
      {
        id: 1,
        payment: 'PAY001',
        medicine: 'MED001',
        quantity: 10,
        unitPrice: 5000,
      },
      {
        id: 2,
        payment: 'PAY002',
        medicine: 'MED002',
        quantity: 20,
        unitPrice: 10000,
      },
    ];

    mockPayments = [
      {
        paymentID: 'PAY001',
        supplier: 'SUP001',
        employee: 'EMP001',
      },
      {
        paymentID: 'PAY002',
        supplier: 'SUP002',
        employee: 'EMP002',
      },
    ];

    mockMedicines = [
      {
        medicineID: 'MED001',
        medicineName: 'Paracetamol',
      },
      {
        medicineID: 'MED002',
        medicineName: 'Amoxicillin',
      },
    ];

    mockSuppliers = [
      {
        supplierID: 'SUP001',
        supplierName: 'Công ty Dược A',
      },
      {
        supplierID: 'SUP002',
        supplierName: 'Công ty Dược B',
      },
    ];

    mockEmployees = [
      {
        employeeID: 'EMP001',
        fullName: 'Nguyễn Văn A',
      },
      {
        employeeID: 'EMP002',
        fullName: 'Trần Thị B',
      },
    ];

    // Set up token in sessionStorage
    sessionStorage.setItem('token', 'dummyToken');

    // Mock API responses
    axios.get.mockImplementation((url) => {
      if (url === 'http://localhost:8000/api/medicines/payment-details/') {
        return Promise.resolve({ data: mockPaymentDetails });
      } else if (url === 'http://localhost:8000/api/medicines/payments/PAY001/') {
        return Promise.resolve({ data: mockPayments[0] });
      } else if (url === 'http://localhost:8000/api/medicines/payments/PAY002/') {
        return Promise.resolve({ data: mockPayments[1] });
      } else if (url === 'http://localhost:8000/api/medicines/medicines/MED001/') {
        return Promise.resolve({ data: mockMedicines[0] });
      } else if (url === 'http://localhost:8000/api/medicines/medicines/MED002/') {
        return Promise.resolve({ data: mockMedicines[1] });
      } else if (url === 'http://localhost:8000/api/medicines/suppliers/SUP001/') {
        return Promise.resolve({ data: mockSuppliers[0] });
      } else if (url === 'http://localhost:8000/api/medicines/suppliers/SUP002/') {
        return Promise.resolve({ data: mockSuppliers[1] });
      } else if (url === 'http://localhost:8000/api/auth/employees/EMP001/') {
        return Promise.resolve({ data: mockEmployees[0] });
      } else if (url === 'http://localhost:8000/api/auth/employees/EMP002/') {
        return Promise.resolve({ data: mockEmployees[1] });
      }
      return Promise.resolve({ data: null });
    });

    axios.delete.mockImplementation((url) => {
      if (url.includes('/api/medicines/payments/')) {
        return Promise.resolve({ data: {} });
      }
      return Promise.reject(new Error('Not found'));
    });

    // Mock window.confirm
    window.confirm = jest.fn();

    // Bỏ qua lỗi console trong kiểm thử
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    sessionStorage.clear();
    jest.clearAllMocks();
    console.error.mockRestore();
  });

  test('hiển thị Sidebar, tiêu đề và bảng danh sách phiếu thu', async () => {
    render(<ListPayments />);

    await waitFor(() => {
      expect(screen.getByText(/Mocked Sidebar/i)).toBeInTheDocument();
      expect(screen.getByText(/DANH SÁCH PHIẾU THU/i)).toBeInTheDocument();
    }, { timeout: 5000 });

    const table = screen.getByRole('table');
    expect(within(table).getByText(/STT/i)).toBeInTheDocument();
    expect(within(table).getByText(/Mã phiếu thu/i)).toBeInTheDocument();
    expect(within(table).getByText(/Tên thuốc/i)).toBeInTheDocument();
    expect(within(table).getByText(/Nhà cung cấp/i)).toBeInTheDocument();
    expect(within(table).getByText(/Nhân viên/i)).toBeInTheDocument();
    expect(within(table).getByText(/Số lượng/i)).toBeInTheDocument();
    expect(within(table).getByText(/Đơn giá/i)).toBeInTheDocument();
    expect(within(table).getByText(/Hành động/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('PAY001')).toBeInTheDocument();
      expect(screen.getByText('PAY002')).toBeInTheDocument();
    }, { timeout: 5000 });

    const row1 = within(table).getByText('PAY001').closest('tr');
    const cells1 = within(row1).getAllByRole('cell');
    expect(cells1[0]).toHaveTextContent('1');
    expect(cells1[1]).toHaveTextContent('PAY001');
    expect(cells1[2]).toHaveTextContent('Paracetamol');
    expect(cells1[3]).toHaveTextContent('Công ty Dược A');
    expect(cells1[4]).toHaveTextContent('Nguyễn Văn A');
    expect(cells1[5]).toHaveTextContent('10');
    expect(cells1[6]).toHaveTextContent('5.000 VND');

    const row2 = within(table).getByText('PAY002').closest('tr');
    const cells2 = within(row2).getAllByRole('cell');
    expect(cells2[0]).toHaveTextContent('2');
    expect(cells2[1]).toHaveTextContent('PAY002');
    expect(cells2[2]).toHaveTextContent('Amoxicillin');
    expect(cells2[3]).toHaveTextContent('Công ty Dược B');
    expect(cells2[4]).toHaveTextContent('Trần Thị B');
    expect(cells2[5]).toHaveTextContent('20');
    expect(cells2[6]).toHaveTextContent('10.000 VND');
  });

  test('tìm kiếm phiếu thu theo mã phiếu thu', async () => {
    render(<ListPayments />);

    await waitFor(() => {
      expect(screen.getByText('PAY001')).toBeInTheDocument();
      expect(screen.getByText('PAY002')).toBeInTheDocument();
    }, { timeout: 5000 });

    const searchInput = screen.getByPlaceholderText(/Tìm kiếm phiếu thu.../i);
    await act(async () => {
      fireEvent.change(searchInput, { target: { value: 'PAY001' } });
    });

    const table = screen.getByRole('table');
    expect(within(table).getByText('PAY001')).toBeInTheDocument();
    expect(within(table).queryByText('PAY002')).not.toBeInTheDocument();

    await act(async () => {
      fireEvent.change(searchInput, { target: { value: 'PAY002' } });
    });

    expect(within(table).queryByText('PAY001')).not.toBeInTheDocument();
    expect(within(table).getByText('PAY002')).toBeInTheDocument();

    await act(async () => {
      fireEvent.change(searchInput, { target: { value: 'INVALID' } });
    });

    expect(within(table).queryByText('PAY001')).not.toBeInTheDocument();
    expect(within(table).queryByText('PAY002')).not.toBeInTheDocument();
  });

  test('xóa phiếu thu với xác nhận', async () => {
    render(<ListPayments />);

    await waitFor(() => {
      expect(screen.getByText('PAY001')).toBeInTheDocument();
    }, { timeout: 5000 });

    const table = screen.getByRole('table');
    const row = within(table).getByText('PAY001').closest('tr');
    const deleteButton = within(row).getByRole('button', { name: /Xóa/i });

    // Mock window.confirm trả về true
    window.confirm.mockReturnValue(true);

    await act(async () => {
      fireEvent.click(deleteButton);
    });

    await waitFor(() => {
      expect(window.confirm).toHaveBeenCalledWith('Bạn có chắc chắn muốn xóa phiếu nhập này?');
      expect(axios.delete).toHaveBeenCalledWith(
        'http://localhost:8000/api/medicines/payments/PAY001/',
        expect.any(Object)
      );
    }, { timeout: 5000 });

    // Kiểm tra fetchPayments được gọi lại
    expect(axios.get).toHaveBeenCalledWith(
      'http://localhost:8000/api/medicines/payment-details/',
      expect.any(Object)
    );
  });

  test('hủy xóa phiếu thu', async () => {
    render(<ListPayments />);

    await waitFor(() => {
      expect(screen.getByText('PAY001')).toBeInTheDocument();
    }, { timeout: 5000 });

    const table = screen.getByRole('table');
    const row = within(table).getByText('PAY001').closest('tr');
    const deleteButton = within(row).getByRole('button', { name: /Xóa/i });

    // Mock window.confirm trả về false
    window.confirm.mockReturnValue(false);

    await act(async () => {
      fireEvent.click(deleteButton);
    });

    await waitFor(() => {
      expect(window.confirm).toHaveBeenCalledWith('Bạn có chắc chắn muốn xóa phiếu nhập này?');
      expect(axios.delete).not.toHaveBeenCalled();
    }, { timeout: 5000 });
  });

  test('xử lý lỗi khi lấy danh sách phiếu thu', async () => {
    // Mock API get payment-details lỗi
    axios.get.mockImplementation((url) => {
      if (url === 'http://localhost:8000/api/medicines/payment-details/') {
        return Promise.reject(new Error('Network error'));
      }
      return Promise.resolve({ data: null });
    });

    render(<ListPayments />);

    await waitFor(() => {
      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining('Error fetching payments:'),
        expect.anything()
      );
    }, { timeout: 5000 });

    // Kiểm tra bảng rỗng
    const table = screen.getByRole('table');
    expect(within(table).queryByText('PAY001')).not.toBeInTheDocument();
  });

  test('xử lý lỗi khi xóa phiếu thu', async () => {
    // Mock API delete lỗi
    axios.delete.mockImplementation(() => Promise.reject(new Error('Delete error')));

    render(<ListPayments />);

    await waitFor(() => {
      expect(screen.getByText('PAY001')).toBeInTheDocument();
    }, { timeout: 5000 });

    const table = screen.getByRole('table');
    const row = within(table).getByText('PAY001').closest('tr');
    const deleteButton = within(row).getByRole('button', { name: /Xóa/i });

    window.confirm.mockReturnValue(true);

    await act(async () => {
      fireEvent.click(deleteButton);
    });

    await waitFor(() => {
      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining('Error deleting payment:'),
        expect.anything()
      );
    }, { timeout: 5000 });
  });

  test('snapshot của giao diện ListPayments', async () => {
    const { container } = render(<ListPayments />);

    await waitFor(() => {
      expect(screen.getByText('PAY001')).toBeInTheDocument();
    }, { timeout: 5000 });

    expect(container).toMatchSnapshot();
  });
});