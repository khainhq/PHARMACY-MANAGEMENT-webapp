import React from 'react';
import { render, screen, fireEvent, within, waitFor } from '@testing-library/react';
import axios from 'axios';
import CreatePayment from './CreatePayment';

jest.mock('axios');
jest.mock('../../components/Sidebar', () => () => <div>Mocked Sidebar</div>);

const API_BASE_URL = 'http://127.0.0.1:8000';

describe('CreatePayment component', () => {
  const employees = [
    { employeeID: 'EMP001', fullName: 'Nguyễn Văn A' },
    { employeeID: 'EMP002', fullName: 'Trần Thị B' },
  ];

  const suppliers = [
    { supplierID: 'SUP001', supplierName: 'Công ty Dược A' },
    { supplierID: 'SUP002', supplierName: 'Công ty Dược B' },
  ];

  const medicines = [
    {
      medicineID: 'MED001',
      medicineName: 'Paracetamol',
      ingredients: 'Paracetamol 500mg',
      stockQuantity: 100,
      importPrice: 5000,
      image: 'paracetamol.jpg',
    },
    {
      medicineID: 'MED002',
      medicineName: 'Amoxicillin',
      ingredients: 'Amoxicillin 250mg',
      stockQuantity: 50,
      importPrice: 10000,
      image: 'amoxicillin.jpg',
    },
  ];

  beforeEach(() => {
    sessionStorage.setItem('token', 'dummyToken');
    window.alert = jest.fn();
    jest.spyOn(console, 'error').mockImplementation(() => {});

    axios.get.mockImplementation((url) => {
      if (url === `${API_BASE_URL}/api/auth/employees/`) {
        return Promise.resolve({ data: employees });
      }
      if (url === `${API_BASE_URL}/api/medicines/suppliers/`) {
        return Promise.resolve({ data: suppliers });
      }
      if (url === `${API_BASE_URL}/api/medicines/medicines/`) {
        return Promise.resolve({ data: medicines });
      }
      return Promise.resolve({ data: [] });
    });

    axios.post.mockResolvedValue({
      data: {
        message: 'Tạo phiếu nhập thành công',
        payment: { paymentID: 'PAY001' },
        paymentDetails: [{ medicine: 'MED001', quantity: 1, unitPrice: 5000 }],
      },
    });
  });

  afterEach(() => {
    sessionStorage.clear();
    jest.clearAllMocks();
    console.error.mockRestore();
  });

  test('hiển thị dữ liệu tạo phiếu nhập', async () => {
    render(<CreatePayment />);

    expect(await screen.findByText('Mocked Sidebar')).toBeInTheDocument();
    expect(await screen.findByText('Danh sách thuốc')).toBeInTheDocument();
    expect(screen.getByText('Chi tiết phiếu nhập')).toBeInTheDocument();
    expect(screen.getByText('Thông tin phiếu nhập')).toBeInTheDocument();
    expect(await screen.findByText('MED001')).toBeInTheDocument();
    expect(screen.getByText('Paracetamol')).toBeInTheDocument();
    expect(screen.getByText('5.000 VND')).toBeInTheDocument();
  });

  test('không tạo phiếu khi chưa thêm sản phẩm', async () => {
    render(<CreatePayment />);

    await screen.findByText('MED001');
    const selects = screen.getAllByRole('combobox');
    fireEvent.change(selects[0], { target: { value: 'EMP001' } });
    fireEvent.change(selects[1], { target: { value: 'SUP001' } });

    fireEvent.click(screen.getByRole('button', { name: 'Tạo Phiếu Nhập' }));

    expect(window.alert).toHaveBeenCalledWith('Vui lòng thêm ít nhất một sản phẩm');
    expect(axios.post).not.toHaveBeenCalled();
  });

  test('tạo phiếu thành công khi sản phẩm có số lượng bằng 1', async () => {
    render(<CreatePayment />);

    await screen.findByText('MED001');
    const medicineList = screen.getByText('Danh sách thuốc').closest('div');
    const row = within(medicineList).getByText('MED001').closest('tr');
    fireEvent.click(within(row).getByRole('button', { name: 'Chọn' }));

    expect(await screen.findByText('THÔNG TIN THUỐC')).toBeInTheDocument();
    expect(screen.getByRole('spinbutton')).toHaveValue(1);
    fireEvent.click(screen.getByRole('button', { name: 'Thêm vào phiếu nhập' }));

    const detailTable = screen.getByText('Chi tiết phiếu nhập').closest('div');
    const detailRow = within(detailTable).getByText('MED001').closest('tr');
    const detailCells = within(detailRow).getAllByRole('cell');
    expect(detailCells[1]).toHaveTextContent('MED001');
    expect(detailCells[2]).toHaveTextContent('1');

    const selects = screen.getAllByRole('combobox');
    fireEvent.change(selects[0], { target: { value: 'EMP001' } });
    fireEvent.change(selects[1], { target: { value: 'SUP001' } });
    fireEvent.change(selects[2], { target: { value: 'Pending' } });
    fireEvent.click(screen.getByRole('button', { name: 'Tạo Phiếu Nhập' }));

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        `${API_BASE_URL}/api/medicines/payment-checkout/`,
        {
          employee: 'EMP001',
          supplier: 'SUP001',
          status: 'Pending',
          items: [{ medicine: 'MED001', quantity: 1, unitPrice: 5000 }],
        },
        expect.any(Object)
      );
      expect(window.alert).toHaveBeenCalledWith('Tạo phiếu nhập thành công');
    });

    expect(selects[0]).toHaveValue('');
    expect(selects[1]).toHaveValue('');
    expect(selects[2]).toHaveValue('Paid');
  });
});
