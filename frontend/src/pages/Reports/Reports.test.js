import React from 'react';
import { render, screen, fireEvent, act, within, waitFor } from '@testing-library/react';
import axios from 'axios';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import Reports from './Reports';
import { ToastProvider } from '../../components/ToastProvider';

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

// TÄƒng timeout toÃ n cá»¥c
jest.setTimeout(30000);

const renderReports = () => render(
  <ToastProvider>
    <Reports />
  </ToastProvider>
);

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

    // Set up mock data (Ä‘iá»u chá»‰nh thá»i gian Ä‘á»ƒ khá»›p mÃºi giá» UTC+7)
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

  test('hiá»ƒn thá»‹ Sidebar, tiÃªu Ä‘á» vÃ  cÃ¡c thÃ nh pháº§n bÃ¡o cÃ¡o', async () => {
    renderReports();

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
      expect(cells1[1]).toHaveTextContent('01/05/2025 17:00:00');
    }, { timeout: 5000 });
  });

  test('hiá»ƒn thá»‹ dá»¯ liá»‡u bÃ¡o cÃ¡o tá»« API', async () => {
    renderReports();

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
      expect(cells1[1]).toHaveTextContent('01/05/2025 17:00:00');

      const row2 = within(table).getByText('ORD002').closest('tr');
      const cells2 = within(row2).getAllByRole('cell');
      console.log('Cells for ORD002:', cells2.map(cell => cell.textContent));
      expect(cells2[0]).toHaveTextContent('ORD002');
      expect(cells2[1]).toHaveTextContent('02/05/2025 19:00:00');

      const row3 = within(table).getByText('ORD003').closest('tr');
      const cells3 = within(row3).getAllByRole('cell');
      console.log('Cells for ORD003:', cells3.map(cell => cell.textContent));
      expect(cells3[0]).toHaveTextContent('ORD003');
      expect(cells3[1]).toHaveTextContent('02/05/2025 21:00:00');
    }, { timeout: 5000 });

    expect(screen.getByTestId('line-chart')).toBeInTheDocument();
    expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
  });

  test('xuáº¥t bÃ¡o cÃ¡o dÆ°á»›i dáº¡ng Excel', async () => {
    renderReports();

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

  test('xuáº¥t bÃ¡o cÃ¡o dÆ°á»›i dáº¡ng PDF', async () => {
    renderReports();

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

  test('xá»­ lÃ½ lá»—i khi láº¥y dá»¯ liá»‡u bÃ¡o cÃ¡o', async () => {
    axios.get.mockImplementation(() => Promise.reject(new Error('Network error')));

    renderReports();

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

  test('xá»­ lÃ½ lá»—i khi xuáº¥t Excel', async () => {
    XLSX.write.mockImplementation(() => {
      throw new Error('Excel generation error');
    });

    renderReports();

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
      expect(screen.getByRole('alert')).toHaveTextContent('Đã xảy ra lỗi khi tạo file Excel.');
    }, { timeout: 5000 });
  });

  test('xá»­ lÃ½ lá»—i khi xuáº¥t PDF', async () => {
    html2canvas.mockRejectedValue(new Error('Canvas error'));

    renderReports();

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
      expect(screen.getByRole('alert')).toHaveTextContent('Đã xảy ra lỗi khi tạo file PDF.');
    }, { timeout: 5000 });
  });

  test('snapshot cá»§a giao diá»‡n Reports', async () => {
    const { container } = renderReports();

    await waitFor(() => {
      expect(screen.getByText('ORD001')).toBeInTheDocument();
    }, { timeout: 5000 });

    console.log('Generating snapshot');
    expect(container).toMatchSnapshot();
  });

  test('xá»­ lÃ½ lá»—i khi report-sections khÃ´ng tá»“n táº¡i', async () => {
    jest.spyOn(document, 'getElementById').mockImplementation((id) => {
      if (id === 'report-sections') return null;
      return document.createElement('div');
    });

    renderReports();

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
      expect(screen.getByRole('alert')).toHaveTextContent('Đã xảy ra lỗi khi tạo file PDF.');
    }, { timeout: 5000 });

    document.getElementById.mockRestore();
  });
});
