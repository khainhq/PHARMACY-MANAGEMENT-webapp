import React from 'react';
import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import axios from 'axios';
import ListInvoices from './ListInvoices';

jest.mock('axios');
jest.mock('../../components/Sidebar', () => () => <div>Mocked Sidebar</div>);

const API_BASE = 'http://127.0.0.1:8000';

describe('ListInvoices component', () => {
  let mockInvoices;

  beforeEach(() => {
    sessionStorage.setItem('token', 'dummyToken');
    window.confirm = jest.fn(() => true);
    window.open = jest.fn(() => ({
      document: {
        write: jest.fn(),
        close: jest.fn(),
      },
    }));

    mockInvoices = [
      {
        invoiceID: 1001,
        invoiceTime: '2026-06-29T10:00:00Z',
        customer: 'CUS100',
        customerName: 'Nguyen Van A',
        customerPhone: '0900000001',
        address: '123 Ha Noi',
        paymentMethod: 'Cash',
        status: 'Pending',
        totalAmount: 5000,
        receiptImage: 'data:image/png;base64,saved-invoice',
        receiptFileName: 'hoa-don-1001.png',
      },
      {
        invoiceID: 1002,
        invoiceTime: '2026-06-29T10:05:00Z',
        customer: 'CUS101',
        customerName: 'Tran Thi B',
        customerPhone: '0900000002',
        address: '456 Da Nang',
        paymentMethod: 'Card',
        status: 'Paid',
        totalAmount: 10000,
        receiptImage: '',
        receiptFileName: '',
      },
    ];

    axios.get.mockImplementation((url) => {
      if (url === `${API_BASE}/api/sales/invoices/`) {
        return Promise.resolve({ data: mockInvoices });
      }
      if (url === `${API_BASE}/api/sales/invoice-details/?invoice=1001`) {
        return Promise.resolve({
          data: [{ id: 1, invoice: 1001, medicine: 'MED001', quantity: 1, unitPrice: 5000 }],
        });
      }
      if (url === `${API_BASE}/api/sales/invoices/1001/`) {
        return Promise.resolve({ data: mockInvoices[0] });
      }
      if (url === `${API_BASE}/api/medicines/medicines/MED001/`) {
        return Promise.resolve({
          data: { medicineID: 'MED001', medicineName: 'Paracetamol', unit: 'UNT001' },
        });
      }
      return Promise.reject(new Error(`No mock for URL: ${url}`));
    });

    axios.patch.mockImplementation((url, payload) => {
      if (url === `${API_BASE}/api/sales/invoices/1001/`) {
        mockInvoices = mockInvoices.map((invoice) =>
          invoice.invoiceID === 1001 ? { ...invoice, status: payload.status } : invoice
        );
        return Promise.resolve({ data: mockInvoices[0] });
      }
      return Promise.reject(new Error(`No mock for URL: ${url}`));
    });

    axios.delete.mockImplementation((url) => {
      if (url === `${API_BASE}/api/sales/invoices/1001/`) {
        mockInvoices = mockInvoices.filter((invoice) => invoice.invoiceID !== 1001);
        return Promise.resolve({});
      }
      return Promise.reject(new Error(`No mock for URL: ${url}`));
    });
  });

  afterEach(() => {
    sessionStorage.clear();
    jest.clearAllMocks();
  });

  test('hiển thị đúng tên khách hàng và trạng thái thanh toán trong danh sách', async () => {
    render(<ListInvoices />);

    const row1 = (await screen.findByTestId('view-details-1001')).closest('tr');
    const row2 = screen.getByTestId('view-details-1002').closest('tr');

    expect(within(row1).getAllByRole('cell')[0]).toHaveTextContent('1');
    expect(within(row2).getAllByRole('cell')[0]).toHaveTextContent('2');
    expect(within(row1).getByText('Nguyen Van A')).toBeInTheDocument();
    expect(within(row1).getByText('Chưa thanh toán')).toBeInTheDocument();
    expect(within(row1).getByRole('button', { name: 'Chuyển đã thanh toán' })).toBeInTheDocument();

    expect(within(row2).getByText('Tran Thi B')).toBeInTheDocument();
    expect(within(row2).getByText('Đã thanh toán')).toBeInTheDocument();
    expect(within(row2).queryByRole('button', { name: 'Chuyển đã thanh toán' })).not.toBeInTheDocument();
  });

  test('tìm kiếm hóa đơn theo tên khách hàng', async () => {
    render(<ListInvoices />);

    expect(await screen.findByTestId('view-details-1001')).toBeInTheDocument();
    fireEvent.change(screen.getByTestId('search-input'), { target: { value: 'Tran Thi B' } });

    expect(screen.queryByTestId('view-details-1001')).not.toBeInTheDocument();
    expect(screen.getByTestId('view-details-1002')).toBeInTheDocument();
  });

  test('chuyển hóa đơn chưa thanh toán sang đã thanh toán và refresh danh sách', async () => {
    render(<ListInvoices />);

    const row = (await screen.findByTestId('view-details-1001')).closest('tr');
    await act(async () => {
      fireEvent.click(within(row).getByRole('button', { name: 'Chuyển đã thanh toán' }));
    });

    await waitFor(() => {
      expect(axios.patch).toHaveBeenCalledWith(
        `${API_BASE}/api/sales/invoices/1001/`,
        { status: 'Paid' },
        expect.any(Object)
      );
      expect(within(screen.getByTestId('view-details-1001').closest('tr')).getByText('Đã thanh toán')).toBeInTheDocument();
    });
  });

  test('xem chi tiết hóa đơn dùng đúng tên khách hàng từ API danh sách', async () => {
    render(<ListInvoices />);

    const row = (await screen.findByTestId('view-details-1001')).closest('tr');
    await act(async () => {
      fireEvent.click(within(row).getByRole('button', { name: 'Xem chi tiết' }));
    });

    const modal = await screen.findByTestId('invoice-details-modal');
    expect(within(modal).getByTestId('customer-name')).toHaveTextContent('Khách hàng: Nguyen Van A');
    expect(within(modal).getByText('Paracetamol')).toBeInTheDocument();
    expect(within(modal).getByText('5.000 VND')).toBeInTheDocument();
    expect(within(modal).getByAltText('Ảnh hóa đơn đã lưu 1001')).toHaveAttribute(
      'src',
      'data:image/png;base64,saved-invoice'
    );
    expect(within(modal).getByRole('button', { name: 'In lại ảnh hóa đơn' })).toBeInTheDocument();
    expect(within(modal).getByRole('button', { name: 'Tải ảnh hóa đơn' })).toBeInTheDocument();
  });

  test('xóa hóa đơn và refresh danh sách', async () => {
    render(<ListInvoices />);

    const row = (await screen.findByTestId('view-details-1001')).closest('tr');
    await act(async () => {
      fireEvent.click(within(row).getByRole('button', { name: 'Xóa' }));
    });

    await waitFor(() => {
      expect(axios.delete).toHaveBeenCalledWith(
        `${API_BASE}/api/sales/invoices/1001/`,
        expect.any(Object)
      );
      expect(screen.queryByTestId('view-details-1001')).not.toBeInTheDocument();
      expect(screen.getByTestId('view-details-1002')).toBeInTheDocument();
    });
  });
});
