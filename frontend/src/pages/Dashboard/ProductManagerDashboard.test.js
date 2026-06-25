import React from 'react';
import { render, screen, waitFor, cleanup } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import axios from 'axios';
import ProductManagerDashboard from './ProductManagerDashboard';
import { act } from 'react';

// Mock axios
jest.mock('axios');

// Mock Sidebar
jest.mock('../../components/Sidebar', () => () => <div data-testid="sidebar">Sidebar</div>);

// Mock recharts để tránh lỗi render
jest.mock('recharts', () => ({
  PieChart: ({ children }) => <div data-testid="pie-chart">{children}</div>,
  Pie: () => <div data-testid="pie" />,
  Cell: () => null,
  Tooltip: () => null,
  Legend: () => <div data-testid="legend" />,
  ResponsiveContainer: ({ children }) => <div data-testid="responsive-container">{children}</div>,
  LineChart: ({ children }) => <div data-testid="line-chart">{children}</div>,
  Line: () => <div data-testid="line" />,
  CartesianGrid: () => null,
  XAxis: () => null,
  YAxis: () => null,
}));

// Error boundary để bắt lỗi render
const ErrorBoundary = ({ children }) => {
  try {
    return children;
  } catch (error) {
    console.error('ErrorBoundary caught:', error);
    return <div>Lỗi khi render</div>;
  }
};

describe('ProductManagerDashboard component', () => {
  const mockMedicines = [
    {
      medicineID: 'MED001',
      medicineName: 'Paracetamol',
      stockQuantity: 10,
      unit: 'CVBDF123T',
      catalog: 'ZAQ321QWE',
      origin: 'XCVSDF123',
      expiryDate: '2026-01-01',
    },
    {
      medicineID: 'MED002',
      medicineName: 'Ibuprofen',
      stockQuantity: 5,
      unit: 'CV123GERT',
      catalog: 'ZXC311QWE',
      origin: 'XCVSDF122',
      expiryDate: '2024-01-01',
    },
  ];

  const mockSuppliers = [{ id: 1 }, { id: 2 }];
  const mockPayments = [{ paymentID: 'PAY001', paymentTime: '2025-01-01T00:00:00Z' }];
  const mockPaymentDetails = [{ payment: 'PAY001', quantity: 10, unitPrice: '1000' }];

  beforeEach(() => {
    jest.useFakeTimers();
    axios.get.mockReset();
    jest.spyOn(axios, 'get').mockImplementation((url) => {
      console.log(`Mock API call cho URL: ${url}`);
      if (url.includes('medicines/')) {
        return Promise.resolve({ data: mockMedicines });
      }
      if (url.includes('suppliers/')) {
        return Promise.resolve({ data: mockSuppliers });
      }
      if (url.includes('payments/')) {
        return Promise.resolve({ data: mockPayments });
      }
      if (url.includes('payment-details/')) {
        return Promise.resolve({ data: mockPaymentDetails });
      }
      return Promise.reject(new Error('Không tìm thấy URL'));
    });

    // Mock axios.post cho logout
    axios.post.mockImplementation((url) => {
      console.log(`Mock POST API call cho URL: ${url}`);
      if (url.includes('logout/')) {
        return Promise.resolve({ data: {} });
      }
      return Promise.reject(new Error('Không tìm thấy URL'));
    });

    // Mock sessionStorage
    Object.defineProperty(window, 'sessionStorage', {
      value: {
        getItem: jest.fn((key) => {
          console.log(`sessionStorage.getItem được gọi với key: ${key}`);
          if (key === 'token') return 'mock-token';
          if (key === 'role') return 'Nhân viên quản lý sản phẩm';
          return null;
        }),
        removeItem: jest.fn(),
      },
      writable: true,
    });
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
    jest.restoreAllMocks();
    cleanup();
    console.log('Dọn dẹp kiểm tra hoàn tất');
  });

  test('hiển thị số liệu thống kê chính xác', async () => {
    console.log('Bắt đầu kiểm tra: hiển thị số liệu thống kê chính xác');
    await act(async () => {
      render(
        <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <ErrorBoundary>
            <ProductManagerDashboard />
          </ErrorBoundary>
        </MemoryRouter>
      );
      console.log('Component được render');
      jest.advanceTimersByTime(1000);
    });

    await waitFor(() => {
      console.log('Kiểm tra nội dung thống kê');
      expect(screen.getByTestId('medicines-value')).toHaveTextContent('2');
      expect(screen.getByTestId('suppliers-value')).toHaveTextContent('2');
      expect(screen.getByTestId('expired-value')).toHaveTextContent('1');
    }, { timeout: 10000 });
    console.log('Kiểm tra hoàn tất: hiển thị số liệu thống kê chính xác');
  });

  test('snapshot giao diện ProductManagerDashboard', async () => {
    console.log('Bắt đầu kiểm tra: snapshot giao diện ProductManagerDashboard');
    await act(async () => {
      render(
        <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <ErrorBoundary>
            <ProductManagerDashboard />
          </ErrorBoundary>
        </MemoryRouter>
      );
      console.log('Component được render');
      jest.advanceTimersByTime(1000);
    });

    await waitFor(() => {
      console.log('Kiểm tra tiêu đề biểu đồ');
      expect(screen.getByTestId('category-chart-title')).toHaveTextContent('Danh mục');
      expect(screen.getByTestId('origin-chart-title')).toHaveTextContent('Xuất xứ');
      expect(screen.getByTestId('unit-chart-title')).toHaveTextContent('Đơn vị tính');
    }, { timeout: 10000 });
    console.log('Kiểm tra hoàn tất: snapshot giao diện ProductManagerDashboard');
  });

  test('kiểm tra điều hướng của các StatCard', async () => {
    console.log('Bắt đầu kiểm tra: kiểm tra điều hướng của các StatCard');
    await act(async () => {
      render(
        <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <ErrorBoundary>
            <ProductManagerDashboard />
          </ErrorBoundary>
        </MemoryRouter>
      );
      console.log('Component được render');
      jest.advanceTimersByTime(1000);
    });

    await waitFor(() => {
      console.log('Kiểm tra liên kết điều hướng');
      const medicinesCard = screen.getByTestId('medicines-value').closest('a');
      const suppliersCard = screen.getByTestId('suppliers-value').closest('a');
      const expiredCard = screen.getByTestId('expired-value').closest('a');
      expect(medicinesCard).toHaveAttribute('href', '/medicines');
      expect(suppliersCard).toHaveAttribute('href', '/suppliers');
      expect(expiredCard).toHaveAttribute('href', '/medicines');
    }, { timeout: 10000 });
    console.log('Kiểm tra hoàn tất: kiểm tra điều hướng của các StatCard');
  });

  test('kiểm tra bảng thuốc tồn kho thấp', async () => {
    console.log('Bắt đầu kiểm tra: kiểm tra bảng thuốc tồn kho thấp');
    await act(async () => {
      render(
        <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <ErrorBoundary>
            <ProductManagerDashboard />
          </ErrorBoundary>
        </MemoryRouter>
      );
      console.log('Component được render');
      jest.advanceTimersByTime(1000);
    });

    await waitFor(() => {
      console.log('Kiểm tra bảng thuốc tồn kho thấp');
      expect(screen.getByTestId('medicine-table-id-MED002')).toHaveTextContent('MED002');
      expect(screen.getByTestId('medicine-table-name-MED002')).toHaveTextContent('Ibuprofen');
      expect(screen.getByTestId('medicine-table-quantity-MED002')).toHaveTextContent('5');
      expect(screen.getByTestId('medicine-table-unit-MED002')).toHaveTextContent('Chai');
      expect(screen.getByTestId('medicine-table-id-MED001')).toHaveTextContent('MED001');
      expect(screen.getByTestId('medicine-table-name-MED001')).toHaveTextContent('Paracetamol');
      expect(screen.getByTestId('medicine-table-quantity-MED001')).toHaveTextContent('10');
      expect(screen.getByTestId('medicine-table-unit-MED001')).toHaveTextContent('Viên');
    }, { timeout: 10000 });
    console.log('Kiểm tra hoàn tất: kiểm tra bảng thuốc tồn kho thấp');
  });
});