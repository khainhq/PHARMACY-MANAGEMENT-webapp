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
    window.print = jest.fn();
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
        payment: {
          paymentID: 'PAY001',
          paymentTime: '2026-06-29T12:30:00Z',
          status: 'Pending',
        },
        paymentDetails: [{ medicine: 'MED001', quantity: 1, unitPrice: 5000 }],
      },
    });
  });

  afterEach(() => {
    sessionStorage.clear();
    jest.clearAllMocks();
    console.error.mockRestore();
  });

  const renderPayment = async () => {
    render(<CreatePayment />);
    await screen.findByText('MED001');
  };

  const addFirstMedicineToPayment = async () => {
    const medicineList = screen.getByText('Danh sách thuốc').closest('div');
    const row = within(medicineList).getByText('MED001').closest('tr');
    fireEvent.click(within(row).getByRole('button', { name: 'Chọn' }));

    expect(await screen.findByText('THÔNG TIN THUỐC')).toBeInTheDocument();
    expect(screen.getByRole('spinbutton')).toHaveValue(1);
    fireEvent.click(screen.getByRole('button', { name: 'Thêm vào phiếu nhập' }));
  };

  const fillPaymentForm = ({ status = 'Paid' } = {}) => {
    const selects = screen.getAllByRole('combobox');
    fireEvent.change(selects[0], { target: { value: 'EMP001' } });
    fireEvent.change(selects[1], { target: { value: 'SUP001' } });
    fireEvent.change(selects[2], { target: { value: status } });
  };

  test('hiển thị dữ liệu tạo phiếu nhập', async () => {
    await renderPayment();

    expect(screen.getByText('Mocked Sidebar')).toBeInTheDocument();
    expect(screen.getByText('Danh sách thuốc')).toBeInTheDocument();
    expect(screen.getByText('Chi tiết phiếu nhập')).toBeInTheDocument();
    expect(screen.getByText('Thông tin phiếu nhập')).toBeInTheDocument();
    expect(screen.getByText('Paracetamol')).toBeInTheDocument();
    expect(screen.getByText('5.000 VND')).toBeInTheDocument();
  });

  test('không tạo phiếu khi chưa thêm sản phẩm', async () => {
    await renderPayment();
    fillPaymentForm();

    fireEvent.click(screen.getByRole('button', { name: 'Tạo Phiếu Nhập' }));

    expect(window.alert).toHaveBeenCalledWith('Vui lòng thêm ít nhất một sản phẩm');
    expect(axios.post).not.toHaveBeenCalled();
  });

  test('bấm tạo phiếu nhập chỉ mở bản xem lại và nút chỉnh sửa giữ nguyên dữ liệu', async () => {
    await renderPayment();
    await addFirstMedicineToPayment();
    fillPaymentForm({ status: 'Pending' });

    fireEvent.click(screen.getByRole('button', { name: 'Tạo Phiếu Nhập' }));

    expect(await screen.findByText('Kiểm tra phiếu nhập trước khi lưu')).toBeInTheDocument();
    const reviewModal = screen.getByText('Kiểm tra phiếu nhập trước khi lưu').parentElement;
    expect(axios.post).not.toHaveBeenCalled();
    expect(within(reviewModal).getByText('Chưa lưu')).toBeInTheDocument();
    expect(within(reviewModal).getByText('Nguyễn Văn A')).toBeInTheDocument();
    expect(within(reviewModal).getByText('Công ty Dược A')).toBeInTheDocument();
    expect(within(reviewModal).getByText('Chưa thanh toán')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Chỉnh sửa' }));

    await waitFor(() => {
      expect(screen.queryByText('Kiểm tra phiếu nhập trước khi lưu')).not.toBeInTheDocument();
    });

    const selects = screen.getAllByRole('combobox');
    expect(selects[0]).toHaveValue('EMP001');
    expect(selects[1]).toHaveValue('SUP001');
    expect(selects[2]).toHaveValue('Pending');
    expect(within(screen.getByText('Chi tiết phiếu nhập').closest('div')).getByText('MED001')).toBeInTheDocument();
  });

  test('xác nhận lưu phiếu nhập mới gọi API và hiển thị phiếu in chi tiết', async () => {
    await renderPayment();
    await addFirstMedicineToPayment();
    fillPaymentForm({ status: 'Pending' });

    fireEvent.click(screen.getByRole('button', { name: 'Tạo Phiếu Nhập' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Xác nhận lưu' }));

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
    });

    expect(await screen.findByText('Phiếu in nhập hàng')).toBeInTheDocument();
    const receipt = screen.getByText('Phiếu in nhập hàng').parentElement;
    expect(within(receipt).getByText('Phiếu nhập hàng')).toBeInTheDocument();
    expect(within(receipt).getByText('PAY001')).toBeInTheDocument();
    expect(within(receipt).getByText('Nguyễn Văn A')).toBeInTheDocument();
    expect(within(receipt).getByText('Công ty Dược A')).toBeInTheDocument();
    expect(within(receipt).getByText('Chưa thanh toán')).toBeInTheDocument();
    expect(within(receipt).getByText('Paracetamol')).toBeInTheDocument();
    expect(within(receipt).getByText('5.000 VND')).toBeInTheDocument();
    expect(within(receipt).getByRole('button', { name: 'In phiếu nhập' })).toBeInTheDocument();

    const selects = screen.getAllByRole('combobox');
    expect(selects[0]).toHaveValue('');
    expect(selects[1]).toHaveValue('');
    expect(selects[2]).toHaveValue('Paid');
  });
});
