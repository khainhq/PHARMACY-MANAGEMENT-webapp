import React from 'react';
import { render, screen, waitFor, cleanup } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import axios from 'axios';
import SalesDashboard from './SalesDashboard';
import { act } from 'react';

// Mock các thành phần phụ thuộc
jest.mock('axios');
jest.mock('../../components/Sidebar', () => () => <div data-testid="sidebar">Sidebar</div>);

// Mock recharts để tránh lỗi render
jest.mock('recharts', () => ({
  PieChart: ({ children, 'data-testid': testId }) => <div data-testid={testId}>{children}</div>,
  Pie: () => <div data-testid="pie" />,
  Cell: () => null,
  Tooltip: () => null,
  Legend: () => <div data-testid="legend" />,
  ResponsiveContainer: ({ children }) => <div data-testid="responsive-container">{children}</div>,
  BarChart: ({ children, 'data-testid': testId }) => <div data-testid={testId}>{children}</div>,
  Bar: () => <div data-testid="bar" />,
  XAxis: () => null,
  YAxis: () => null,
  CartesianGrid: () => null,
}));

// Mock sessionStorage
const mockToken = 'mockToken';
Object.defineProperty(window, 'sessionStorage', {
  value: {
    getItem: jest.fn((key) => {
      console.log(`sessionStorage.getItem được gọi với key: ${key}`);
      return key === 'token' ? mockToken : null;
    }),
  },
  writable: true,
});

// Error boundary để bắt lỗi render
const ErrorBoundary = ({ children }) => {
  try {
    return children;
  } catch (error) {
    console.error('ErrorBoundary caught:', error);
    return <div>Lỗi khi render</div>;
  }
};

describe('SalesDashboard', () => {
  const mockInvoiceDetails = [
    { medicine: '1', quantity: 10 },
    { medicine: '2', quantity: 15 },
  ];

  const mockInvoices = [
    { invoiceID: '1', status: 'Paid', paymentMethod: 'Card', customer: 'C1', invoiceTime: '2023-10-01T10:00:00Z' },
    { invoiceID: '2', status: 'Pending', paymentMethod: 'Cash', customer: 'C2', invoiceTime: '2023-10-02T10:00:00Z' },
  ];

  const mockCustomers = [
    { customerID: 'C1', fullName: 'Nguyễn Văn A' },
    { customerID: 'C2', fullName: 'Trần Thị B' },
  ];

  const mockMedicines = [
    { medicineID: '1', medicineName: 'Thuốc A' },
    { medicineID: '2', medicineName: 'Thuốc B' },
  ];

  beforeEach(() => {
    jest.useFakeTimers();
    axios.get.mockReset();
    jest.spyOn(axios, 'get').mockImplementation((url) => {
      console.log(`Mock API call cho URL: ${url}`);
      if (url.includes('invoice-details')) {
        return Promise.resolve({ data: mockInvoiceDetails });
      }
      if (url.includes('invoices')) {
        return Promise.resolve({ data: mockInvoices });
      }
      if (url.includes('customers')) {
        return Promise.resolve({ data: mockCustomers });
      }
      if (url.includes('medicines')) {
        return Promise.resolve({ data: mockMedicines });
      }
      return Promise.reject(new Error('URL không xác định'));
    });
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
    jest.restoreAllMocks();
    cleanup();
    console.log('Dọn dẹp kiểm tra hoàn tất');
  });

  test('hiển thị SalesDashboard với trạng thái ban đầu', async () => {
    console.log('Bắt đầu kiểm tra: hiển thị SalesDashboard với trạng thái ban đầu');
    await act(async () => {
      render(
        <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <ErrorBoundary>
            <SalesDashboard />
          </ErrorBoundary>
        </MemoryRouter>
      );
      console.log('Component được render');
      jest.advanceTimersByTime(1000);
    });

    await waitFor(() => {
      console.log('Kiểm tra nội dung render ban đầu');
      expect(screen.getByText('Sales Dashboard')).toBeInTheDocument();
      expect(screen.getByTestId('sidebar')).toBeInTheDocument();
    }, { timeout: 15000 });
    console.log('Kiểm tra hoàn tất: hiển thị SalesDashboard với trạng thái ban đầu');
  });

  test('lấy và hiển thị thống kê chính xác', async () => {
    console.log('Bắt đầu kiểm tra: lấy và hiển thị thống kê chính xác');
    await act(async () => {
      render(
        <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <ErrorBoundary>
            <SalesDashboard />
          </ErrorBoundary>
        </MemoryRouter>
      );
      console.log('Component được render');
      jest.advanceTimersByTime(1000);
    });

    await waitFor(() => {
      console.log('Kiểm tra nội dung thống kê');
      expect(screen.getByTestId('customers-value')).toHaveTextContent('2');
      expect(screen.getByTestId('invoices-value')).toHaveTextContent('2');
      expect(screen.getByTestId('products-sold-value')).toHaveTextContent('25');
    }, { timeout: 15000 });
    console.log('Kiểm tra hoàn tất: lấy và hiển thị thống kê chính xác');
  });

  test('hiển thị bảng hóa đơn gần đây chính xác', async () => {
    console.log('Bắt đầu kiểm tra: hiển thị bảng hóa đơn gần đây chính xác');
    await act(async () => {
      render(
        <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <ErrorBoundary>
            <SalesDashboard />
          </ErrorBoundary>
        </MemoryRouter>
      );
      console.log('Component được render');
      jest.advanceTimersByTime(1000);
    });

    await waitFor(() => {
      console.log('Kiểm tra bảng hóa đơn gần đây');
      expect(screen.getByTestId('recent-invoices-title')).toHaveTextContent('5 Hóa đơn gần đây nhất');
      expect(screen.getByTestId('invoice-id-1')).toHaveTextContent('1');
      expect(screen.getByTestId('invoice-customer-1')).toHaveTextContent('C1');
      expect(screen.getByTestId('invoice-status-1')).toHaveTextContent('Paid');
      expect(screen.getByTestId('invoice-payment-1')).toHaveTextContent('Card');
    }, { timeout: 15000 });
    console.log('Kiểm tra hoàn tất: hiển thị bảng hóa đơn gần đây chính xác');
  });

  test('hiển thị dữ liệu biểu đồ sản phẩm bán chạy chính xác', async () => {
    console.log('Bắt đầu kiểm tra: hiển thị dữ liệu biểu đồ sản phẩm bán chạy chính xác');
    await act(async () => {
      render(
        <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <ErrorBoundary>
            <SalesDashboard />
          </ErrorBoundary>
        </MemoryRouter>
      );
      console.log('Component được render');
      jest.advanceTimersByTime(1000);
    });

    await waitFor(() => {
      console.log('Kiểm tra biểu đồ sản phẩm bán chạy');
      expect(screen.getByTestId('top-products-title')).toHaveTextContent('Top sản phẩm bán chạy');
      expect(screen.getByTestId('top-products-bar-chart')).toBeInTheDocument();
    }, { timeout: 15000 });
    console.log('Kiểm tra hoàn tất: hiển thị dữ liệu biểu đồ sản phẩm bán chạy chính xác');
  });

  test('hiển thị dữ liệu biểu đồ khách hàng tiềm năng chính xác', async () => {
    console.log('Bắt đầu kiểm tra: hiển thị dữ liệu biểu đồ khách hàng tiềm năng chính xác');
    await act(async () => {
      render(
        <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <ErrorBoundary>
            <SalesDashboard />
          </ErrorBoundary>
        </MemoryRouter>
      );
      console.log('Component được render');
      jest.advanceTimersByTime(1000);
    });

    await waitFor(() => {
      console.log('Kiểm tra biểu đồ khách hàng tiềm năng');
      expect(screen.getByTestId('potential-customers-title')).toHaveTextContent('Khách hàng tiềm năng');
      expect(screen.getByTestId('potential-customers-bar-chart')).toBeInTheDocument();
    }, { timeout: 15000 });
    console.log('Kiểm tra hoàn tất: hiển thị dữ liệu biểu đồ khách hàng tiềm năng chính xác');
  });

  test('xử lý lỗi API một cách an toàn', async () => {
    console.log('Bắt đầu kiểm tra: xử lý lỗi API một cách an toàn');
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    jest.spyOn(axios, 'get').mockRejectedValue(new Error('Lỗi API'));

    await act(async () => {
      render(
        <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <ErrorBoundary>
            <SalesDashboard />
          </ErrorBoundary>
        </MemoryRouter>
      );
      console.log('Component được render với lỗi API');
      jest.advanceTimersByTime(1000);
    });

    await waitFor(() => {
      console.log('Kiểm tra xử lý lỗi API');
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error fetching stats:',
        expect.anything()
      );
      expect(screen.getByTestId('customers-value')).toHaveTextContent('0');
      expect(screen.getByTestId('invoices-value')).toHaveTextContent('0');
      expect(screen.getByTestId('products-sold-value')).toHaveTextContent('0');
    }, { timeout: 15000 });

    consoleErrorSpy.mockRestore();
    console.log('Kiểm tra hoàn tất: xử lý lỗi API một cách an toàn');
  });

  test('hiển thị biểu đồ tròn cho tỷ lệ thanh toán', async () => {
    console.log('Bắt đầu kiểm tra: hiển thị biểu đồ tròn cho tỷ lệ thanh toán');
    await act(async () => {
      render(
        <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <ErrorBoundary>
            <SalesDashboard />
          </ErrorBoundary>
        </MemoryRouter>
      );
      console.log('Component được render');
      jest.advanceTimersByTime(1000);
    });

    await waitFor(() => {
      console.log('Kiểm tra biểu đồ tỷ lệ thanh toán');
      expect(screen.getByTestId('payment-ratio-title')).toHaveTextContent('Tỷ lệ thanh toán');
      expect(screen.getByTestId('paid-pending-pie-chart')).toBeInTheDocument();
      expect(screen.getByTestId('payment-method-pie-chart')).toBeInTheDocument();
    }, { timeout: 15000 });
    console.log('Kiểm tra hoàn tất: hiển thị biểu đồ tròn cho tỷ lệ thanh toán');
  });

  test('chuyển hướng đúng khi nhấp vào thẻ thống kê', async () => {
    console.log('Bắt đầu kiểm tra: chuyển hướng đúng khi nhấp vào thẻ thống kê');
    await act(async () => {
      render(
        <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <ErrorBoundary>
            <SalesDashboard />
          </ErrorBoundary>
        </MemoryRouter>
      );
      console.log('Component được render');
      jest.advanceTimersByTime(1000);
    });

    await waitFor(() => {
      console.log('Kiểm tra liên kết điều hướng');
      const customerLink = screen.getByTestId('customers-view-link').closest('a');
      const invoiceLink = screen.getByTestId('invoices-view-link').closest('a');
      const productsSoldLink = screen.getByTestId('products-sold-view-link').closest('a');
      expect(customerLink).toHaveAttribute('href', '/customers');
      expect(invoiceLink).toHaveAttribute('href', '/invoices/list');
      expect(productsSoldLink).toHaveAttribute('href', '/invoices/list');
    }, { timeout: 15000 });
    console.log('Kiểm tra hoàn tất: chuyển hướng đúng khi nhấp vào thẻ thống kê');
  });
});