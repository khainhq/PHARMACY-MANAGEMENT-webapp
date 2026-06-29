import React from 'react';
import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import axios from 'axios';
import ListPayments from './ListPayments';

jest.mock('axios');
jest.mock('../../components/Sidebar', () => () => <div>Mocked Sidebar</div>);

const API_BASE_URL = 'http://127.0.0.1:8000';

describe('ListPayments component', () => {
  let mockPayments;

  beforeEach(() => {
    sessionStorage.setItem('token', 'dummyToken');
    window.confirm = jest.fn(() => true);

    mockPayments = [
      {
        paymentID: 'PAY001',
        paymentTime: '2026-06-29T11:00:00Z',
        supplier: 'SUP001',
        supplierName: 'Công ty Dược A',
        employee: 'EMP001',
        employeeName: 'Nguyễn Văn A',
        totalAmount: 50000,
        status: 'Pending',
        medicineSummary: 'Paracetamol x10',
        details: [{ id: 1, payment: 'PAY001', medicine: 'MED001', medicineName: 'Paracetamol', quantity: 10, unitPrice: 5000 }],
      },
      {
        paymentID: 'PAY002',
        paymentTime: '2026-06-29T11:05:00Z',
        supplier: 'SUP002',
        supplierName: 'Công ty Dược B',
        employee: 'EMP002',
        employeeName: 'Trần Thị B',
        totalAmount: 200000,
        status: 'Paid',
        medicineSummary: 'Amoxicillin x20',
        details: [{ id: 2, payment: 'PAY002', medicine: 'MED002', medicineName: 'Amoxicillin', quantity: 20, unitPrice: 10000 }],
      },
    ];

    axios.get.mockImplementation((url) => {
      if (url === `${API_BASE_URL}/api/medicines/payments/`) {
        return Promise.resolve({ data: mockPayments });
      }
      return Promise.reject(new Error(`No mock for URL: ${url}`));
    });

    axios.patch.mockImplementation((url, payload) => {
      if (url === `${API_BASE_URL}/api/medicines/payments/PAY001/`) {
        mockPayments = mockPayments.map((payment) =>
          payment.paymentID === 'PAY001' ? { ...payment, status: payload.status } : payment
        );
        return Promise.resolve({ data: mockPayments[0] });
      }
      return Promise.reject(new Error(`No mock for URL: ${url}`));
    });

    axios.delete.mockImplementation((url) => {
      if (url === `${API_BASE_URL}/api/medicines/payments/PAY001/`) {
        mockPayments = mockPayments.filter((payment) => payment.paymentID !== 'PAY001');
        return Promise.resolve({});
      }
      return Promise.reject(new Error(`No mock for URL: ${url}`));
    });
  });

  afterEach(() => {
    sessionStorage.clear();
    jest.clearAllMocks();
  });

  test('hiển thị đúng danh sách phiếu nhập và tên nhà cung cấp, nhân viên', async () => {
    render(<ListPayments />);

    expect(await screen.findByText('PAY001')).toBeInTheDocument();
    expect(screen.getByText('PAY002')).toBeInTheDocument();
    expect(screen.getByText('DANH SÁCH PHIẾU NHẬP')).toBeInTheDocument();

    const row1 = screen.getByText('PAY001').closest('tr');
    expect(within(row1).getByText('Công ty Dược A')).toBeInTheDocument();
    expect(within(row1).getByText('Nguyễn Văn A')).toBeInTheDocument();
    expect(within(row1).getByText('Paracetamol x10')).toBeInTheDocument();
    expect(within(row1).getByText('50.000 VND')).toBeInTheDocument();
    expect(within(row1).getByText('Chưa thanh toán')).toBeInTheDocument();
    expect(within(row1).getByRole('button', { name: 'Chuyển đã thanh toán' })).toBeInTheDocument();

    const row2 = screen.getByText('PAY002').closest('tr');
    expect(within(row2).getByText('Công ty Dược B')).toBeInTheDocument();
    expect(within(row2).getByText('Đã thanh toán')).toBeInTheDocument();
    expect(within(row2).queryByRole('button', { name: 'Chuyển đã thanh toán' })).not.toBeInTheDocument();
  });

  test('tìm kiếm phiếu nhập theo nhà cung cấp', async () => {
    render(<ListPayments />);

    expect(await screen.findByText('PAY001')).toBeInTheDocument();
    fireEvent.change(screen.getByPlaceholderText(/Tìm kiếm phiếu nhập/i), {
      target: { value: 'Dược B' },
    });

    expect(screen.queryByText('PAY001')).not.toBeInTheDocument();
    expect(screen.getByText('PAY002')).toBeInTheDocument();
  });

  test('chuyển phiếu nhập chưa thanh toán sang đã thanh toán và refresh danh sách', async () => {
    render(<ListPayments />);

    const row = (await screen.findByText('PAY001')).closest('tr');
    await act(async () => {
      fireEvent.click(within(row).getByRole('button', { name: 'Chuyển đã thanh toán' }));
    });

    await waitFor(() => {
      expect(axios.patch).toHaveBeenCalledWith(
        `${API_BASE_URL}/api/medicines/payments/PAY001/`,
        { status: 'Paid' },
        expect.any(Object)
      );
      expect(within(screen.getByText('PAY001').closest('tr')).getByText('Đã thanh toán')).toBeInTheDocument();
    });
  });

  test('xóa phiếu nhập và refresh danh sách', async () => {
    render(<ListPayments />);

    const row = (await screen.findByText('PAY001')).closest('tr');
    await act(async () => {
      fireEvent.click(within(row).getByRole('button', { name: 'Xóa' }));
    });

    await waitFor(() => {
      expect(axios.delete).toHaveBeenCalledWith(
        `${API_BASE_URL}/api/medicines/payments/PAY001/`,
        expect.any(Object)
      );
      expect(screen.queryByText('PAY001')).not.toBeInTheDocument();
      expect(screen.getByText('PAY002')).toBeInTheDocument();
    });
  });
});
