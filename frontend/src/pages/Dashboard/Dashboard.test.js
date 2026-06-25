import React from 'react';
import { render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import axios from 'axios';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import Dashboard from './Dashboard';

// Mock các module cần thiết
jest.mock('axios');
jest.mock('file-saver');
jest.mock('xlsx');
jest.mock('../../components/Sidebar', () => () => <div>Mocked Sidebar</div>);
jest.mock('recharts', () => ({
  BarChart: () => <div data-testid="mocked-barchart">Mocked BarChart</div>,
  Bar: () => null,
  XAxis: () => null,
  YAxis: () => null,
  Tooltip: () => null,
  CartesianGrid: () => null,
  ResponsiveContainer: ({ children }) => <div>{children}</div>,
  LineChart: () => <div data-testid="mocked-linechart">Mocked LineChart</div>,
  Line: () => null,
}));

describe('Dashboard component', () => {
  beforeEach(() => {
    axios.get.mockReset();
    axios.post.mockReset();
    axios.put.mockReset();
    axios.delete.mockReset();
    saveAs.mockReset();
    XLSX.utils.json_to_sheet.mockReset();
    XLSX.utils.book_new.mockReset();
    XLSX.utils.book_append_sheet.mockReset();
    XLSX.write.mockReset();

    sessionStorage.setItem('token', 'dummyToken');
    sessionStorage.setItem('role', 'Nhân viên bán hàng');

    axios.get.mockImplementation((url) => {
      if (url.includes('/api/sales/invoice-details/')) {
        return Promise.resolve({
          data: [
            { invoice: 'INV001', medicine: 'MED001', quantity: 2, unitPrice: '10000' },
            { invoice: 'INV002', medicine: 'MED002', quantity: 1, unitPrice: '10000' },
          ],
        });
      }
      if (url.includes('/api/sales/invoices/')) {
        return Promise.resolve({
          data: [
            { invoiceID: 'INV001', invoiceTime: '2025-05-04T10:00:00Z', customer: 'Nguyen Van A' },
            { invoiceID: 'INV002', invoiceTime: '2025-05-03T14:00:00Z', customer: 'Tran Thi B' },
          ],
        });
      }
      if (url.includes('/api/medicines/medicines/')) {
        return Promise.resolve({
          data: [
            { medicineID: 'MED001', medicineName: 'Paracetamol', expiryDate: '2026-06-01', stockQuantity: 50, unit: 'pill' },
            { medicineID: 'MED002', medicineName: 'Ibuprofen', expiryDate: '2025-06-01', stockQuantity: 30, unit: 'pill' },
          ],
        });
      }
      if (url.includes('/api/auth/employees/')) {
        return Promise.resolve({ data: [{ employeeID: 'EMP001' }, { employeeID: 'EMP002' }] });
      }
      if (url.includes('/api/medicines/payments/')) {
        return Promise.resolve({ data: [{ paymentID: 'PAY001', paymentTime: '2025-05-01T12:00:00Z' }] });
      }
      if (url.includes('/api/medicines/payment-details/')) {
        return Promise.resolve({ data: [{ payment: 'PAY001', quantity: 10, unitPrice: '5000' }] });
      }
      return Promise.reject(new Error('not found'));
    });
  });

  afterEach(() => {
    sessionStorage.clear();
    jest.clearAllMocks();
  });

  test('hiển thị Sidebar và tiêu đề Dashboard', async () => {
    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    );

    expect(screen.getByText(/Mocked Sidebar/i)).toBeInTheDocument();
    expect(screen.getByText(/Dashboard/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText(/Tổng thu nhập/i)).toBeInTheDocument();
      expect(screen.getByText(/Số nhân viên/i)).toBeInTheDocument();
      expect(screen.getByText(/Thuốc đã hết hạn/i)).toBeInTheDocument();
      expect(screen.getByText(/Số loại thuốc/i)).toBeInTheDocument();
    }, { timeout: 2000 });
  });

  test('hiển thị các thẻ thống kê với dữ liệu đúng', async () => {
    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    );

    await waitFor(() => {
      const revenueCard = screen.getByText(/Tổng thu nhập/i).closest('a');
      const employeeCard = screen.getByText(/Số nhân viên/i).closest('a');
      const expiredCard = screen.getByText(/Thuốc đã hết hạn/i).closest('a');
      const medicinesCard = screen.getByText(/Số loại thuốc/i).closest('a');

      expect(within(revenueCard).getByText(/30\.000 VND/i)).toBeInTheDocument();
      expect(within(employeeCard).getByText(/2/i)).toBeInTheDocument();
      expect(within(expiredCard).getByText(/0/i)).toBeInTheDocument();
      expect(within(medicinesCard).getByText(/2/i)).toBeInTheDocument();
    }, { timeout: 2000 });
  });

  test('snapshot của giao diện Dashboard', async () => {
    const { container } = render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Tổng thu nhập/i)).toBeInTheDocument();
    }, { timeout: 2000 });

    expect(container).toMatchSnapshot();
  });

  test('hiển thị biểu đồ chi phí nhập thuốc', async () => {
    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Chi phí nhập thuốc theo thời gian/i)).toBeInTheDocument();
      expect(screen.getByTestId('mocked-linechart')).toBeInTheDocument();
    }, { timeout: 2000 });
  });

  test('hiển thị bảng hóa đơn gần đây', async () => {
    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Hóa đơn gần đây/i)).toBeInTheDocument();
      expect(screen.getByText(/INV001/i)).toBeInTheDocument();
      expect(screen.getByText(/INV002/i)).toBeInTheDocument();
      expect(screen.getByText(/Nguyen Van A/i)).toBeInTheDocument();
      expect(screen.getByText(/Tran Thi B/i)).toBeInTheDocument();
      expect(screen.getByText(/20\.000 VND/i)).toBeInTheDocument();
      expect(screen.getByText(/10\.000 VND/i)).toBeInTheDocument();
    }, { timeout: 2000 });
  });

  test('hiển thị bảng thuốc gần hết hạn', async () => {
    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Thuốc gần hết hạn/i)).toBeInTheDocument();
      expect(screen.getByText(/MED001/i)).toBeInTheDocument();
      expect(screen.getByText(/Paracetamol/i)).toBeInTheDocument();
      expect(screen.getByText(/1\/6\/2026/i)).toBeInTheDocument();
      expect(screen.getByText(/50/i)).toBeInTheDocument();
      expect(screen.getByText(/MED002/i)).toBeInTheDocument();
      expect(screen.getByText(/Ibuprofen/i)).toBeInTheDocument();
      expect(screen.getByText(/1\/6\/2025/i)).toBeInTheDocument();
      expect(screen.queryByText(/30/i, { selector: 'td' })).toBeInTheDocument();
    }, { timeout: 2000 });
  });

  test('hiển thị biểu đồ top thuốc bán chạy', async () => {
    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Top thuốc bán chạy nhất/i)).toBeInTheDocument();
      expect(screen.getByTestId('mocked-barchart')).toBeInTheDocument();
    }, { timeout: 2000 });
  });

  test('kiểm tra điều hướng khi click vào StatCard', async () => {
    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Tổng thu nhập/i)).toBeInTheDocument();
    }, { timeout: 2000 });

    const totalRevenueLink = screen.getByText(/Tổng thu nhập/i).closest('a');
    expect(totalRevenueLink).toHaveAttribute('href', '/invoices/list');

    const employeeLink = screen.getByText(/Số nhân viên/i).closest('a');
    expect(employeeLink).toHaveAttribute('href', '/employees');

    const expiredLink = screen.getByText(/Thuốc đã hết hạn/i).closest('a');
    expect(expiredLink).toHaveAttribute('href', '/medicines');

    const medicinesLink = screen.getByText(/Số loại thuốc/i).closest('a');
    expect(medicinesLink).toHaveAttribute('href', '/medicines');
  });

  test('kiểm tra giao diện responsive trên màn hình nhỏ', async () => {
    global.innerWidth = 500;
    global.dispatchEvent(new Event('resize'));

    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Tổng thu nhập/i)).toBeInTheDocument();
      expect(screen.getByText(/Số nhân viên/i)).toBeInTheDocument();
      expect(screen.getByText(/Thuốc đã hết hạn/i)).toBeInTheDocument();
      expect(screen.getByText(/Số loại thuốc/i)).toBeInTheDocument();
      expect(screen.getByText(/Hóa đơn gần đây/i)).toBeInTheDocument();
      expect(screen.getByText(/Thuốc gần hết hạn/i)).toBeInTheDocument();
      expect(screen.getByText(/Top thuốc bán chạy nhất/i)).toBeInTheDocument();
    }, { timeout: 2000 });

    const { container } = render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    );
    expect(container).toMatchSnapshot();
  });
});