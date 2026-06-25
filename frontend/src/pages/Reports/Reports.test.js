import React from 'react';
import { render, screen, fireEvent, act, within, waitFor } from '@testing-library/react';
import axios from 'axios';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import Reports from './Reports';

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
jest.mock('jspdf', () => {
  const mockAddImage = jest.fn();
  const mockSave = jest.fn();
  function MockJsPDF(...args) {
    this.args = args;
    this.internal = { pageSize: { getWidth: jest.fn(() => 297), getHeight: jest.fn(() => 210) } };
    this.addImage = mockAddImage;
    this.save = mockSave;
  }
  return MockJsPDF;
});
jest.mock('html2canvas', () => jest.fn());
jest.mock('../../components/Sidebar', () => () => <div>Mocked Sidebar</div>);

// Mock recharts components
jest.mock('recharts', () => ({
  LineChart: ({ children }) => <div data-testid="line-chart">{children}</div>,
  Line: () => <div>Line</div>,
  BarChart: ({ children }) => <div data-testid="bar-chart">{children}</div>,
  Bar: () => <div>Bar</div>,
  XAxis: () => <div>XAxis</div>,
  YAxis: () => <div>YAxis</div>,
  CartesianGrid: () => <div>CartesianGrid</div>,
  Tooltip: () => <div>Tooltip</div>,
  ResponsiveContainer: ({ children }) => <div data-testid="responsive-container">{children}</div>,
}));

// Tăng timeout toàn cục
jest.setTimeout(30000);

describe('Reports component', () => {
  let mockOrders;
  let consoleErrorSpy;

  beforeEach(() => {
    // Reset mocks
    axios.get.mockReset();
    saveAs.mockReset();
    XLSX.utils.json_to_sheet.mockReset();
    XLSX.utils.book_new.mockReset();
    XLSX.utils.book_append_sheet.mockReset();
    XLSX.write.mockReset();
    html2canvas.mockReset();

    // Reset jsPDF methods
    const mockJsPDF = require('jspdf');
    if (mockJsPDF.prototype.addImage) mockJsPDF.prototype.addImage.mockReset();
    if (mockJsPDF.prototype.save) mockJsPDF.prototype.save.mockReset();

    // Set up mock data (điều chỉnh thời gian để khớp múi giờ UTC+7)
    mockOrders = [
      {
        orderID: 'ORD001',
        orderTime: '2025-05-01T10:00:00Z',
        totalAmount: 100000,
        customer: 'CUS001',
      },
      {
        orderID: 'ORD002',
        orderTime: '2025-05-02T12:00:00Z',
        totalAmount: 200000,
        customer: 'CUS001',
      },
      {
        orderID: 'ORD003',
        orderTime: '2025-05-02T14:00:00Z',
        totalAmount: 150000,
        customer: 'CUS002',
      },
    ];

    // Set up token in sessionStorage
    sessionStorage.setItem('token', 'dummyToken');

    // Mock API responses
    axios.get.mockImplementation((url) => {
      if (url === 'http://localhost:8000/api/sales/orders/') {
        console.log('Mock API /api/sales/orders/ called, returning:', mockOrders);
        return Promise.resolve({ data: mockOrders });
      }
      console.log('Unexpected API call:', url);
      return Promise.resolve({ data: null });
    });

    // Mock html2canvas
    html2canvas.mockResolvedValue({
      toDataURL: jest.fn(() => 'data:image/png;base64,mockImage'),
      width: 800,
      height: 600,
    });

    // Mock XLSX
    XLSX.utils.json_to_sheet.mockReturnValue('mockWorksheet');
    XLSX.utils.book_new.mockReturnValue('mockWorkbook');
    XLSX.utils.book_append_sheet.mockReturnValue(undefined);
    XLSX.write.mockReturnValue('mockExcelBuffer');

    // Mock window.alert
    window.alert = jest.fn();

    // Mock console.error
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    sessionStorage.clear();
    jest.clearAllMocks();
    consoleErrorSpy.mockRestore();
  });

  test('hiển thị Sidebar, tiêu đề và các thành phần báo cáo', async () => {
    render(<Reports />);

    await waitFor(() => {
      expect(screen.getByText(/Mocked Sidebar/i)).toBeInTheDocument();
      expect(screen.getByText(/Báo Cáo/i)).toBeInTheDocument();
      expect(screen.getByText(/Sales Made/i)).toBeInTheDocument();
      expect(screen.getByText(/Customer Statistics/i)).toBeInTheDocument();
      expect(screen.getByText(/Order Details/i)).toBeInTheDocument();
    }, { timeout: 5000 });

    expect(screen.getByText(/Tải xuống Excel/i)).toBeInTheDocument();
    expect(screen.getByText(/Tải xuống PDF/i)).toBeInTheDocument();

    expect(screen.getByTestId('line-chart')).toBeInTheDocument();
    expect(screen.getByTestId('bar-chart')).toBeInTheDocument();

    const table = screen.getByRole('table');
    expect(within(table).getByText(/Order ID/i)).toBeInTheDocument();
    expect(within(table).getByText(/Date & Time/i)).toBeInTheDocument();

    await waitFor(() => {
      console.log('Checking table data for ORD001');
      const row1 = within(table).getByText('ORD001').closest('tr');
      const cells1 = within(row1).getAllByRole('cell');
      console.log('Cells for ORD001:', cells1.map(cell => cell.textContent));
      expect(cells1[0]).toHaveTextContent('ORD001');
      expect(cells1[1]).toHaveTextContent('17:00:00 1/5/2025');
    }, { timeout: 5000 });
  });

  test('hiển thị dữ liệu báo cáo từ API', async () => {
    render(<Reports />);

    await waitFor(() => {
      console.log('Checking API call');
      expect(axios.get).toHaveBeenCalledWith(
        'http://localhost:8000/api/sales/orders/',
        expect.any(Object)
      );
    }, { timeout: 5000 });

    const table = screen.getByRole('table');
    await waitFor(() => {
      console.log('Checking table rows');
      const row1 = within(table).getByText('ORD001').closest('tr');
      const cells1 = within(row1).getAllByRole('cell');
      console.log('Cells for ORD001:', cells1.map(cell => cell.textContent));
      expect(cells1[0]).toHaveTextContent('ORD001');
      expect(cells1[1]).toHaveTextContent('17:00:00 1/5/2025');

      const row2 = within(table).getByText('ORD002').closest('tr');
      const cells2 = within(row2).getAllByRole('cell');
      console.log('Cells for ORD002:', cells2.map(cell => cell.textContent));
      expect(cells2[0]).toHaveTextContent('ORD002');
      expect(cells2[1]).toHaveTextContent('19:00:00 2/5/2025');

      const row3 = within(table).getByText('ORD003').closest('tr');
      const cells3 = within(row3).getAllByRole('cell');
      console.log('Cells for ORD003:', cells3.map(cell => cell.textContent));
      expect(cells3[0]).toHaveTextContent('ORD003');
      expect(cells3[1]).toHaveTextContent('21:00:00 2/5/2025');
    }, { timeout: 5000 });

    expect(screen.getByTestId('line-chart')).toBeInTheDocument();
    expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
  });

  test('xuất báo cáo dưới dạng Excel', async () => {
    render(<Reports />);

    await waitFor(() => {
      expect(screen.getByText('ORD001')).toBeInTheDocument();
    }, { timeout: 5000 });

    const excelButton = screen.getByText(/Tải xuống Excel/i);
    await act(async () => {
      console.log('Clicking Excel button');
      fireEvent.click(excelButton);
    });

    await waitFor(() => {
      expect(XLSX.utils.json_to_sheet).toHaveBeenCalledWith(mockOrders);
      expect(XLSX.utils.book_new).toHaveBeenCalled();
      expect(XLSX.utils.book_append_sheet).toHaveBeenCalledWith('mockWorkbook', 'mockWorksheet', 'Orders');
      expect(XLSX.write).toHaveBeenCalledWith('mockWorkbook', { bookType: 'xlsx', type: 'array' });
      expect(saveAs).toHaveBeenCalledWith(
        expect.any(Blob),
        'Orders_Report.xlsx'
      );
    }, { timeout: 5000 });
  });

  test('xuất báo cáo dưới dạng PDF', async () => {
    render(<Reports />);

    await waitFor(() => {
      expect(screen.getByText('ORD001')).toBeInTheDocument();
    }, { timeout: 5000 });

    const pdfButton = screen.getByText(/Tải xuống PDF/i);
    await act(async () => {
      console.log('Clicking PDF button');
      fireEvent.click(pdfButton);
    });

    await waitFor(() => {
      console.log('Checking PDF generation');
      console.log('html2canvas calls:', html2canvas.mock.calls);
      expect(html2canvas).toHaveBeenCalledWith(expect.any(HTMLElement), { scale: 2 });
      const pdfInstance = new jsPDF('landscape', 'mm', 'a4');
      expect(pdfInstance.addImage).toHaveBeenCalledWith(
        'data:image/png;base64,mockImage',
        'PNG',
        0,
        0,
        297,
        expect.any(Number)
      );
      expect(pdfInstance.save).toHaveBeenCalledWith('Report.pdf');
    }, { timeout: 5000 });
  });

  test('xử lý lỗi khi lấy dữ liệu báo cáo', async () => {
    axios.get.mockImplementation(() => Promise.reject(new Error('Network error')));

    render(<Reports />);

    await waitFor(() => {
      console.log('Checking error handling for API');
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Error fetching report data:'),
        expect.anything()
      );
    }, { timeout: 5000 });

    const table = screen.getByRole('table');
    expect(within(table).queryByText('ORD001')).not.toBeInTheDocument();
  });

  test('xử lý lỗi khi xuất Excel', async () => {
    XLSX.write.mockImplementation(() => {
      throw new Error('Excel generation error');
    });

    render(<Reports />);

    await waitFor(() => {
      expect(screen.getByText('ORD001')).toBeInTheDocument();
    }, { timeout: 5000 });

    const excelButton = screen.getByText(/Tải xuống Excel/i);
    await act(async () => {
      console.log('Clicking Excel button for error case');
      fireEvent.click(excelButton);
    });

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Error generating Excel file:'),
        expect.anything()
      );
      expect(window.alert).toHaveBeenCalledWith('Đã xảy ra lỗi khi tạo file Excel.');
    }, { timeout: 5000 });
  });

  test('xử lý lỗi khi xuất PDF', async () => {
    html2canvas.mockRejectedValue(new Error('Canvas error'));

    render(<Reports />);

    await waitFor(() => {
      expect(screen.getByText('ORD001')).toBeInTheDocument();
    }, { timeout: 5000 });

    const pdfButton = screen.getByText(/Tải xuống PDF/i);
    await act(async () => {
      console.log('Clicking PDF button for error case');
      fireEvent.click(pdfButton);
    });

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Error generating PDF:'),
        expect.anything()
      );
      expect(window.alert).toHaveBeenCalledWith('Đã xảy ra lỗi khi tạo file PDF.');
    }, { timeout: 5000 });
  });

  test('snapshot của giao diện Reports', async () => {
    const { container } = render(<Reports />);

    await waitFor(() => {
      expect(screen.getByText('ORD001')).toBeInTheDocument();
    }, { timeout: 5000 });

    console.log('Generating snapshot');
    expect(container).toMatchSnapshot();
  });

  test('xử lý lỗi khi report-sections không tồn tại', async () => {
    jest.spyOn(document, 'getElementById').mockImplementation((id) => {
      if (id === 'report-sections') return null;
      return document.createElement('div');
    });

    render(<Reports />);

    await waitFor(() => {
      expect(screen.getByText('ORD001')).toBeInTheDocument();
    }, { timeout: 5000 });

    const pdfButton = screen.getByText(/Tải xuống PDF/i);
    await act(async () => {
      console.log('Clicking PDF button with missing report-sections');
      fireEvent.click(pdfButton);
    });

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Error generating PDF:'),
        expect.any(Error)
      );
      expect(window.alert).toHaveBeenCalledWith('Đã xảy ra lỗi khi tạo file PDF.');
    }, { timeout: 5000 });

    document.getElementById.mockRestore();
  });
});