import React from 'react';
import { render, screen, fireEvent, act, within, waitFor } from '@testing-library/react';
import axios from 'axios';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import Reports from './Reports';
import { ToastProvider } from '../../components/ToastProvider';

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
  PieChart: ({ children }) => <div data-testid="pie-chart">{children}</div>,
  Pie: ({ children }) => <div>Pie{children}</div>,
  Cell: () => <div>Cell</div>,
  Legend: () => <div>Legend</div>,
}));

jest.setTimeout(30000);

const mockInvoices = [
  {
    invoiceID: 'INV001',
    invoiceTime: '2025-05-01T10:00:00Z',
    customerName: 'Nguyen Van A',
    status: 'Paid',
    totalAmount: 100000,
  },
  {
    invoiceID: 'INV002',
    invoiceTime: '2025-05-02T12:00:00Z',
    customerName: 'Nguyen Van A',
    status: 'Paid',
    totalAmount: 200000,
  },
  {
    invoiceID: 'INV003',
    invoiceTime: '2025-05-02T14:00:00Z',
    customerName: 'Tran Thi B',
    status: 'Pending',
    totalAmount: 150000,
  },
];

const mockInvoiceDetails = [
  { invoice: 'INV001', medicine: 'MED001', quantity: 2, unitPrice: 50000 },
  { invoice: 'INV002', medicine: 'MED002', quantity: 4, unitPrice: 50000 },
  { invoice: 'INV003', medicine: 'MED001', quantity: 3, unitPrice: 50000 },
];

const mockMedicines = [
  { medicineID: 'MED001', medicineName: 'Paracetamol' },
  { medicineID: 'MED002', medicineName: 'Ibuprofen' },
];

const renderReports = () => render(
  <ToastProvider>
    <Reports />
  </ToastProvider>
);

describe('Reports component', () => {
  let consoleErrorSpy;

  beforeEach(() => {
    axios.get.mockReset();
    saveAs.mockReset();
    XLSX.utils.json_to_sheet.mockReset();
    XLSX.utils.book_new.mockReset();
    XLSX.utils.book_append_sheet.mockReset();
    XLSX.write.mockReset();
    html2canvas.mockReset();

    const mockJsPDF = require('jspdf');
    if (mockJsPDF.prototype.addImage) mockJsPDF.prototype.addImage.mockReset();
    if (mockJsPDF.prototype.save) mockJsPDF.prototype.save.mockReset();

    sessionStorage.setItem('token', 'dummyToken');

    axios.get.mockImplementation((url) => {
      if (url === 'http://127.0.0.1:8000/api/sales/invoices/') {
        return Promise.resolve({ data: mockInvoices });
      }
      if (url === 'http://127.0.0.1:8000/api/sales/invoice-details/') {
        return Promise.resolve({ data: mockInvoiceDetails });
      }
      if (url === 'http://127.0.0.1:8000/api/medicines/medicines/') {
        return Promise.resolve({ data: mockMedicines });
      }
      return Promise.resolve({ data: [] });
    });

    html2canvas.mockResolvedValue({
      toDataURL: jest.fn(() => 'data:image/png;base64,mockImage'),
      width: 800,
      height: 600,
    });

    XLSX.utils.json_to_sheet.mockReturnValue('mockWorksheet');
    XLSX.utils.book_new.mockReturnValue('mockWorkbook');
    XLSX.utils.book_append_sheet.mockReturnValue(undefined);
    XLSX.write.mockReturnValue('mockExcelBuffer');
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    sessionStorage.clear();
    jest.clearAllMocks();
    consoleErrorSpy.mockRestore();
  });

  test('hiển thị Sidebar, tiêu đề và các phần báo cáo hóa đơn', async () => {
    renderReports();

    await waitFor(() => {
      expect(screen.getByText(/Mocked Sidebar/i)).toBeInTheDocument();
      expect(screen.getByText(/Báo Cáo/i)).toBeInTheDocument();
      expect(screen.getByText(/Tổng doanh thu/i)).toBeInTheDocument();
      expect(screen.getByText(/Doanh thu theo ngày/i)).toBeInTheDocument();
      expect(screen.getByText(/Khách hàng theo số hóa đơn/i)).toBeInTheDocument();
      expect(screen.getByText(/Cơ cấu trạng thái hóa đơn/i)).toBeInTheDocument();
      expect(screen.getAllByText(/Thuốc đã bán/i).length).toBeGreaterThanOrEqual(2);
      expect(screen.getByText(/Chi tiết hóa đơn/i)).toBeInTheDocument();
    }, { timeout: 5000 });

    expect(screen.getByText(/Tải xuống Excel/i)).toBeInTheDocument();
    expect(screen.getByText(/Tải xuống PDF/i)).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText('450.000 VND')).toBeInTheDocument();
    }, { timeout: 5000 });
    expect(screen.getByTestId('line-chart')).toBeInTheDocument();
    expect(screen.getAllByTestId('bar-chart')).toHaveLength(2);
    expect(screen.getByTestId('pie-chart')).toBeInTheDocument();

    const table = screen.getByRole('table');
    expect(within(table).getByText(/Mã hóa đơn/i)).toBeInTheDocument();
    expect(within(table).getByText(/Thời gian/i)).toBeInTheDocument();
  });

  test('hiển thị dữ liệu báo cáo từ API hóa đơn', async () => {
    renderReports();

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith(
        'http://127.0.0.1:8000/api/sales/invoices/',
        expect.any(Object)
      );
      expect(axios.get).toHaveBeenCalledWith(
        'http://127.0.0.1:8000/api/sales/invoice-details/',
        expect.any(Object)
      );
    }, { timeout: 5000 });

    const table = screen.getByRole('table');
    await waitFor(() => {
      const row1 = within(table).getByText('INV001').closest('tr');
      const row2 = within(table).getByText('INV002').closest('tr');
      const row3 = within(table).getByText('INV003').closest('tr');

      expect(within(row1).getAllByRole('cell')[0]).toHaveTextContent('INV001');
      expect(within(row2).getAllByRole('cell')[0]).toHaveTextContent('INV002');
      expect(within(row3).getAllByRole('cell')[0]).toHaveTextContent('INV003');
      expect(screen.getByText('450.000 VND')).toBeInTheDocument();
      expect(screen.getByText('9')).toBeInTheDocument();
    }, { timeout: 5000 });
  });

  test('xuất báo cáo dưới dạng Excel', async () => {
    renderReports();

    await waitFor(() => {
      expect(screen.getByText('INV001')).toBeInTheDocument();
    }, { timeout: 5000 });

    await act(async () => {
      fireEvent.click(screen.getByText(/Tải xuống Excel/i));
    });

    await waitFor(() => {
      expect(XLSX.utils.json_to_sheet).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ invoiceID: 'INV001', totalAmount: 100000 }),
          expect.objectContaining({ invoiceID: 'INV002', totalAmount: 200000 }),
          expect.objectContaining({ invoiceID: 'INV003', totalAmount: 150000 }),
        ])
      );
      expect(XLSX.utils.book_new).toHaveBeenCalled();
      expect(XLSX.utils.book_append_sheet).toHaveBeenCalledWith('mockWorkbook', 'mockWorksheet', 'Invoices');
      expect(XLSX.write).toHaveBeenCalledWith('mockWorkbook', { bookType: 'xlsx', type: 'array' });
      expect(saveAs).toHaveBeenCalledWith(expect.any(Blob), 'Invoices_Report.xlsx');
    }, { timeout: 5000 });
  });

  test('xuất báo cáo dưới dạng PDF', async () => {
    renderReports();

    await waitFor(() => {
      expect(screen.getByText('INV001')).toBeInTheDocument();
    }, { timeout: 5000 });

    await act(async () => {
      fireEvent.click(screen.getByText(/Tải xuống PDF/i));
    });

    await waitFor(() => {
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

    renderReports();

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Error fetching report data:'),
        expect.anything()
      );
    }, { timeout: 5000 });

    const table = screen.getByRole('table');
    expect(within(table).queryByText('INV001')).not.toBeInTheDocument();
  });

  test('xử lý lỗi khi xuất Excel', async () => {
    XLSX.write.mockImplementation(() => {
      throw new Error('Excel generation error');
    });

    renderReports();

    await waitFor(() => {
      expect(screen.getByText('INV001')).toBeInTheDocument();
    }, { timeout: 5000 });

    await act(async () => {
      fireEvent.click(screen.getByText(/Tải xuống Excel/i));
    });

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Error generating Excel file:'),
        expect.anything()
      );
      expect(screen.getByRole('alert')).toHaveTextContent('Đã xảy ra lỗi khi tạo file Excel.');
    }, { timeout: 5000 });
  });

  test('xử lý lỗi khi xuất PDF', async () => {
    html2canvas.mockRejectedValue(new Error('Canvas error'));

    renderReports();

    await waitFor(() => {
      expect(screen.getByText('INV001')).toBeInTheDocument();
    }, { timeout: 5000 });

    await act(async () => {
      fireEvent.click(screen.getByText(/Tải xuống PDF/i));
    });

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Error generating PDF:'),
        expect.anything()
      );
      expect(screen.getByRole('alert')).toHaveTextContent('Đã xảy ra lỗi khi tạo file PDF.');
    }, { timeout: 5000 });
  });

  test('snapshot của giao diện Reports', async () => {
    const { container } = renderReports();

    await waitFor(() => {
      expect(screen.getByText('INV001')).toBeInTheDocument();
    }, { timeout: 5000 });

    expect(container).toMatchSnapshot();
  });

  test('xử lý lỗi khi report-sections không tồn tại', async () => {
    const getElementSpy = jest.spyOn(document, 'getElementById').mockImplementation((id) => {
      if (id === 'report-sections') return null;
      return document.createElement('div');
    });

    renderReports();

    await waitFor(() => {
      expect(screen.getByText('INV001')).toBeInTheDocument();
    }, { timeout: 5000 });

    await act(async () => {
      fireEvent.click(screen.getByText(/Tải xuống PDF/i));
    });

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Error generating PDF:'),
        expect.any(Error)
      );
      expect(screen.getByRole('alert')).toHaveTextContent('Đã xảy ra lỗi khi tạo file PDF.');
    }, { timeout: 5000 });

    getElementSpy.mockRestore();
  });
});
