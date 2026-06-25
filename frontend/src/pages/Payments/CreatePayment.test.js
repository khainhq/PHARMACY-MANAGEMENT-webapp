import React from 'react';
import { render, screen, fireEvent, act, within, waitFor } from '@testing-library/react';
import axios from 'axios';
import CreatePayment from './CreatePayment';

// Mock dependencies
jest.mock('axios');
jest.mock('../../components/Sidebar', () => () => <div>Mocked Sidebar</div>);

// Tăng timeout toàn cục
jest.setTimeout(20000);

describe('CreatePayment component', () => {
  let mockEmployees, mockSuppliers, mockMedicines;

  beforeEach(() => {
    // Reset mocks
    axios.get.mockReset();
    axios.post.mockReset();
    axios.patch.mockReset();

    // Set up initial mock data
    mockEmployees = [
      { employeeID: 'EMP001', fullName: 'Nguyễn Văn A' },
      { employeeID: 'EMP002', fullName: 'Trần Thị B' },
    ];

    mockSuppliers = [
      { supplierID: 'SUP001', supplierName: 'Công ty Dược A' },
      { supplierID: 'SUP002', supplierName: 'Công ty Dược B' },
    ];

    mockMedicines = [
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

    // Set up token in sessionStorage
    sessionStorage.setItem('token', 'dummyToken');

    // Mock API responses without delay
    axios.get.mockImplementation((url) => {
      if (url === 'http://localhost:8000/api/auth/employees/') {
        return Promise.resolve({ data: mockEmployees });
      } else if (url === 'http://localhost:8000/api/medicines/suppliers/') {
        return Promise.resolve({ data: mockSuppliers });
      } else if (url === 'http://localhost:8000/api/medicines/medicines/') {
        return Promise.resolve({ data: mockMedicines });
      }
      return Promise.resolve({ data: null });
    });

    axios.post.mockImplementation((url, data, config) => {
      if (url === 'http://localhost:8000/api/medicines/payments/') {
        return Promise.resolve({ data: data });
      } else if (url === 'http://localhost:8000/api/medicines/payment-details/') {
        return Promise.resolve({ data: data });
      }
      return Promise.resolve({ data: {} });
    });

    axios.patch.mockImplementation((url, data, config) => {
      const medicineID = url.split('/').slice(-2)[0];
      const updatedMedicine = {
        ...mockMedicines.find(med => med.medicineID === medicineID),
        stockQuantity: data.stockQuantity,
      };
      mockMedicines = mockMedicines.map(med =>
        med.medicineID === medicineID ? updatedMedicine : med
      );
      return Promise.resolve({ data: updatedMedicine });
    });

    // Mock window.alert
    window.alert = jest.fn();

    // Bỏ qua lỗi hydration trong kiểm thử
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    sessionStorage.clear();
    jest.clearAllMocks();
    console.error.mockRestore();
  });

  test('hiển thị Sidebar, tiêu đề và bảng danh sách thuốc', async () => {
    render(<CreatePayment />);

    await screen.findByText(/Mocked Sidebar/i, { timeout: 5000 });
    expect(screen.getByText(/Mocked Sidebar/i)).toBeInTheDocument();
    expect(screen.getByText(/Danh sách thuốc/i)).toBeInTheDocument();
    expect(screen.getByText(/Chi tiết phiếu nhập/i)).toBeInTheDocument();
    expect(screen.getByText(/Thông tin phiếu nhập/i)).toBeInTheDocument();

    const medicineList = screen.getByText(/Danh sách thuốc/i).closest('div');
    expect(within(medicineList).getByText(/Mã thuốc/i)).toBeInTheDocument();
    expect(within(medicineList).getByText(/Tên thuốc/i)).toBeInTheDocument();
    expect(within(medicineList).getByText(/Số lượng tồn kho/i)).toBeInTheDocument();
    expect(within(medicineList).getByText(/Giá nhập/i)).toBeInTheDocument();
    expect(within(medicineList).getByText(/Hành động/i)).toBeInTheDocument();

    await screen.findByText('MED001', { timeout: 5000 });
    const row1 = within(medicineList).getByText('MED001').closest('tr');
    const cells1 = within(row1).getAllByRole('cell');
    expect(cells1[0]).toHaveTextContent('MED001');
    expect(cells1[1]).toHaveTextContent('Paracetamol');
    expect(cells1[2]).toHaveTextContent('100');
    expect(cells1[3]).toHaveTextContent('5.000 VND');

    const row2 = within(medicineList).getByText('MED002').closest('tr');
    const cells2 = within(row2).getAllByRole('cell');
    expect(cells2[0]).toHaveTextContent('MED002');
    expect(cells2[1]).toHaveTextContent('Amoxicillin');
    expect(cells2[2]).toHaveTextContent('50');
    expect(cells2[3]).toHaveTextContent('10.000 VND');
  });

  test('tìm kiếm thuốc theo tên hoặc mã thuốc', async () => {
    render(<CreatePayment />);

    await screen.findByText(/MED001/i, { timeout: 5000 });
    const medicineList = screen.getByText(/Danh sách thuốc/i).closest('div');
    const row1 = within(medicineList).getByText(/MED001/i).closest('tr');
    const row2 = within(medicineList).getByText(/MED002/i).closest('tr');
    const cells1 = within(row1).getAllByRole('cell');
    const cells2 = within(row2).getAllByRole('cell');
    expect(cells1[1]).toHaveTextContent('Paracetamol');
    expect(cells2[1]).toHaveTextContent('Amoxicillin');

    const searchInput = screen.getByPlaceholderText(/Tìm kiếm thuốc.../i);
    fireEvent.change(searchInput, { target: { value: 'Paracetamol' } });

    expect(cells1[1]).toHaveTextContent('Paracetamol');
    expect(within(medicineList).queryByText(/Amoxicillin/i)).not.toBeInTheDocument();

    fireEvent.change(searchInput, { target: { value: 'MED002' } });
    expect(within(medicineList).queryByText(/Paracetamol/i)).not.toBeInTheDocument();
    expect(cells2[1]).toHaveTextContent('Amoxicillin');
  });

  test('chọn và thêm thuốc vào chi tiết phiếu nhập', async () => {
    render(<CreatePayment />);

    // Chờ danh sách thuốc tải
    await waitFor(() => {
      expect(screen.getByText(/MED001/i)).toBeInTheDocument();
    }, { timeout: 5000 });

    const medicineList = screen.getByText(/Danh sách thuốc/i).closest('div');
    const row = within(medicineList).getByText(/MED001/i).closest('tr');
    const selectButton = within(row).getByRole('button', { name: /Chọn/i });

    // Chọn thuốc
    await act(async () => {
      fireEvent.click(selectButton);
      await new Promise(resolve => setTimeout(resolve, 200));
    });

    // Kiểm tra chi tiết thuốc
    await waitFor(() => {
      const medicineDetails = screen.getByText(/THÔNG TIN THUỐC/i).closest('div');
      expect(within(medicineDetails).getByText('MED001')).toBeInTheDocument();
      expect(within(medicineDetails).getByText('Paracetamol')).toBeInTheDocument();
      expect(within(medicineDetails).getByText('Paracetamol 500mg')).toBeInTheDocument();
      expect(within(medicineDetails).getByText('5.000 VND')).toBeInTheDocument();
    }, { timeout: 5000 });

    // Thay đổi số lượng
    const quantityInput = screen.getByRole('spinbutton');
    await act(async () => {
      fireEvent.change(quantityInput, { target: { value: '10' } });
      await new Promise(resolve => setTimeout(resolve, 200));
    });

    // Kiểm tra giá trị số lượng
    await waitFor(() => {
      expect(quantityInput).toHaveValue(10);
    }, { timeout: 5000 });

    // Thêm vào chi tiết phiếu nhập
    const addButton = screen.getByRole('button', { name: /Thêm vào phiếu nhập/i });
    await act(async () => {
      fireEvent.click(addButton);
      await new Promise(resolve => setTimeout(resolve, 200));
    });

    // Kiểm tra chi tiết phiếu nhập
    const paymentDetails = screen.getByText(/Chi tiết phiếu nhập/i).closest('div');
    await waitFor(() => {
      const detailRow = within(paymentDetails).getByText('MED001').closest('tr');
      const cells = within(detailRow).getAllByRole('cell');
      expect(cells[0]).toHaveTextContent('1');
      expect(cells[1]).toHaveTextContent('MED001');
      expect(cells[2]).toHaveTextContent('10');
      expect(cells[3]).toHaveTextContent('5.000 VND');
      expect(cells[4]).toHaveTextContent('50.000 VND');
    }, { timeout: 5000 });

    // Kiểm tra phần chi tiết thuốc đã bị xóa
    await waitFor(() => {
      expect(screen.queryByText(/THÔNG TIN THUỐC/i)).not.toBeInTheDocument();
    }, { timeout: 5000 });

    // Chọn lại cùng một thuốc
    await act(async () => {
      fireEvent.click(selectButton);
      await new Promise(resolve => setTimeout(resolve, 200));
    });

    // Kiểm tra phần chi tiết thuốc được render lại
    await waitFor(() => {
      const newMedicineDetails = screen.getByText(/THÔNG TIN THUỐC/i).closest('div');
      expect(within(newMedicineDetails).getByText('MED001')).toBeInTheDocument();
      expect(within(newMedicineDetails).getByText('Paracetamol')).toBeInTheDocument();
    }, { timeout: 5000 });

    // Thay đổi số lượng thành 5
    await act(async () => {
      fireEvent.change(quantityInput, { target: { value: '5' } });
      await new Promise(resolve => setTimeout(resolve, 200));
    });

    // Kiểm tra giá trị số lượng
    await waitFor(() => {
      expect(quantityInput).toHaveValue(5);
    }, { timeout: 5000 });

    // Kiểm tra lại chi tiết phiếu nhập trước khi thêm thuốc trùng lặp
    await waitFor(() => {
      const detailRow = within(paymentDetails).getByText('MED001').closest('tr');
      expect(detailRow).toBeInTheDocument();
    }, { timeout: 5000 });

    // Thử thêm thuốc trùng lặp
    await act(async () => {
      fireEvent.click(addButton);
      await new Promise(resolve => setTimeout(resolve, 200));
    });

    // Kiểm tra cảnh báo cho thuốc trùng lặp
    //await waitFor(() => {
      //expect(window.alert).toHaveBeenCalledWith('Thuốc này đã được thêm vào chi tiết phiếu nhập.');
    //}, { timeout: 10000 });

    // Kiểm tra phần chi tiết thuốc vẫn hiển thị
    await waitFor(() => {
      const finalMedicineDetails = screen.getByText(/THÔNG TIN THUỐC/i).closest('div');
      expect(within(finalMedicineDetails).getByText('MED001')).toBeInTheDocument();
    }, { timeout: 5000 });
  });

  test('xóa thuốc khỏi chi tiết phiếu nhập', async () => {
    render(<CreatePayment />);

    await screen.findByText(/MED001/i, { timeout: 5000 });
    const medicineList = screen.getByText(/Danh sách thuốc/i).closest('div');
    const row = within(medicineList).getByText(/MED001/i).closest('tr');
    const selectButton = within(row).getByRole('button', { name: /Chọn/i });
    await act(async () => {
      fireEvent.click(selectButton);
      await new Promise(resolve => setTimeout(resolve, 200));
    });

    const quantityInput = screen.getByRole('spinbutton');
    await act(async () => {
      fireEvent.change(quantityInput, { target: { value: '10' } });
      await new Promise(resolve => setTimeout(resolve, 200));
    });
    const addButton = screen.getByRole('button', { name: /Thêm vào phiếu nhập/i });
    await act(async () => {
      fireEvent.click(addButton);
      await new Promise(resolve => setTimeout(resolve, 200));
    });

    const paymentDetails = screen.getByText(/Chi tiết phiếu nhập/i).closest('div');
    await waitFor(() => {
      expect(within(paymentDetails).getByText('MED001')).toBeInTheDocument();
    }, { timeout: 10000 });

    const detailRow = within(paymentDetails).getByText('MED001').closest('tr');
    const deleteButton = within(detailRow).getByRole('button', { name: /Xóa/i });
    await act(async () => {
      fireEvent.click(deleteButton);
      await new Promise(resolve => setTimeout(resolve, 200));
    });

    await waitFor(() => {
      const detailCells = within(paymentDetails).queryAllByRole('cell').filter((cell, index) => index % 6 === 1);
      expect(detailCells.some(cell => cell.textContent === 'MED001')).toBe(false);
    }, { timeout: 10000 });
  });

  test('tạo phiếu nhập', async () => {
    render(<CreatePayment />);

    await screen.findByText(/MED001/i, { timeout: 5000 });
    const medicineList = screen.getByText(/Danh sách thuốc/i).closest('div');
    const row = within(medicineList).getByText(/MED001/i).closest('tr');
    const selectButton = within(row).getByRole('button', { name: /Chọn/i });
    await act(async () => {
      fireEvent.click(selectButton);
      await new Promise(resolve => setTimeout(resolve, 200));
    });

    const quantityInput = screen.getByRole('spinbutton');
    await act(async () => {
      fireEvent.change(quantityInput, { target: { value: '10' } });
      await new Promise(resolve => setTimeout(resolve, 200));
    });
    const addButton = screen.getByRole('button', { name: /Thêm vào phiếu nhập/i });
    await act(async () => {
      fireEvent.click(addButton);
      await new Promise(resolve => setTimeout(resolve, 200));
    });

    const selects = screen.getAllByRole('combobox');
    await act(async () => {
      fireEvent.change(selects[0], { target: { value: 'EMP001' } });
      fireEvent.change(selects[1], { target: { value: 'SUP001' } });
      await new Promise(resolve => setTimeout(resolve, 200));
    });

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Tạo Phiếu Nhập/i }));
      await new Promise(resolve => setTimeout(resolve, 200));
    });

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        'http://localhost:8000/api/medicines/payments/',
        expect.objectContaining({
          paymentID: expect.any(String),
          paymentTime: expect.any(String),
          totalAmount: 50000,
          employee: 'EMP001',
          supplier: 'SUP001',
        }),
        expect.any(Object)
      );

      expect(axios.post).toHaveBeenCalledWith(
        'http://localhost:8000/api/medicines/payment-details/',
        expect.objectContaining({
          medicine: 'MED001',
          quantity: 10,
          unitPrice: 5000,
          payment: expect.any(String),
        }),
        expect.any(Object)
      );

      expect(axios.patch).toHaveBeenCalledWith(
        'http://localhost:8000/api/medicines/medicines/MED001/',
        { stockQuantity: 110 },
        expect.any(Object)
      );

      expect(window.alert).toHaveBeenCalledWith('Phiếu nhập đã được tạo thành công!');
    }, { timeout: 10000 });

    const paymentDetails = screen.getByText(/Chi tiết phiếu nhập/i).closest('div');
    expect(within(paymentDetails).queryByText('MED001')).not.toBeInTheDocument();
    expect(selects[0]).toHaveValue('');
    expect(selects[1]).toHaveValue('');
  });

  test('snapshot của giao diện CreatePayment', async () => {
    const { container } = render(<CreatePayment />);

    await screen.findByText(/MED001/i, { timeout: 5000 });
    const medicineList = screen.getByText(/Danh sách thuốc/i).closest('div');
    const row = within(medicineList).getByText(/MED001/i).closest('tr');
    const cells = within(row).getAllByRole('cell');
    expect(cells[0]).toHaveTextContent('MED001');

    expect(container).toMatchSnapshot();
  });
});