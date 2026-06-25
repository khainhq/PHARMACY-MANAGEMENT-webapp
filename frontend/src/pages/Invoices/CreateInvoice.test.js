import React from 'react';
import { render, screen, waitFor, fireEvent, act, within } from '@testing-library/react';
import axios from 'axios';
import CreateInvoice from './CreateInvoice';

// Mock các module cần thiết
jest.mock('axios');
jest.mock('../../components/Sidebar', () => () => <div>Mocked Sidebar</div>);
jest.mock('react-router-dom', () => ({
  useNavigate: () => jest.fn(),
}));

describe('CreateInvoice component', () => {
  beforeEach(() => {
    // Reset các mock
    axios.get.mockReset();
    axios.post.mockReset();
    axios.delete.mockReset();

    // Thiết lập token trong sessionStorage
    sessionStorage.setItem('token', 'dummyToken');

    // Mock dữ liệu API dựa trên URL
    axios.get.mockImplementation((url, config) => {
      if (url === 'http://localhost:8000/api/medicines/medicines/') {
        return Promise.resolve({
          data: [
            {
              medicineID: 'MED001',
              medicineName: 'Paracetamol',
              ingredients: 'Paracetamol 500mg',
              unit: 'Box',
              unitPrice: 5000,
              stockQuantity: 100,
              image: 'https://example.com/image.jpg',
            },
            {
              medicineID: 'MED002',
              medicineName: 'Ibuprofen',
              ingredients: 'Ibuprofen 200mg',
              unit: 'Box',
              unitPrice: 7000,
              stockQuantity: 50,
              image: 'https://example.com/image2.jpg',
            },
          ],
        });
      }
      if (url === 'http://localhost:8000/api/sales/customers/') {
        return Promise.resolve({ data: [] }); // Không có khách hàng hiện tại
      }
      return Promise.reject(new Error('Not mocked'));
    });

    // Mock API cho tạo khách hàng và hóa đơn
    axios.post.mockImplementation((url) => {
      if (url === 'http://localhost:8000/api/sales/customers/') {
        return Promise.resolve({ data: { customerID: 'CUST123' } });
      }
      if (url === 'http://localhost:8000/api/sales/invoices/') {
        return Promise.resolve({ data: { invoiceID: 'INV001' } });
      }
      if (url === 'http://localhost:8000/api/sales/invoice-details/') {
        return Promise.resolve({ data: {} });
      }
      return Promise.reject(new Error('Not mocked'));
    });

    // Mock window.alert
    window.alert = jest.fn();
  });

  afterEach(() => {
    sessionStorage.clear();
    jest.clearAllMocks();
  });

  test('hiển thị Sidebar, danh sách thuốc, giỏ hàng và thông tin hóa đơn', async () => {
    render(<CreateInvoice />);

    await waitFor(() => {
      expect(screen.getByText(/Mocked Sidebar/i)).toBeInTheDocument();
      expect(screen.getByText(/Danh sách thuốc/i)).toBeInTheDocument();
      expect(screen.getByText(/Giỏ hàng/i)).toBeInTheDocument();
      expect(screen.getByText(/Thông tin hóa đơn/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/Tên khách hàng/i)).toBeInTheDocument();
      expect(screen.getByText(/Paracetamol/i)).toBeInTheDocument();
      expect(screen.getByText(/Ibuprofen/i)).toBeInTheDocument();
    });
  });

  test('tìm kiếm thuốc theo từ khóa', async () => {
    render(<CreateInvoice />);

    await waitFor(() => {
      expect(screen.getByText(/Paracetamol/i)).toBeInTheDocument();
      expect(screen.getByText(/Ibuprofen/i)).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(/Tìm kiếm thuốc.../i);
    fireEvent.change(searchInput, { target: { value: 'Para' } });

    expect(screen.getByText(/Paracetamol/i)).toBeInTheDocument();
    expect(screen.queryByText(/Ibuprofen/i)).not.toBeInTheDocument();
  });

  test('thêm thuốc vào giỏ hàng', async () => {
    render(<CreateInvoice />);

    await waitFor(() => {
      expect(screen.getByText(/Paracetamol/i)).toBeInTheDocument();
    });

    const selectButton = screen.getAllByRole('button', { name: /Chọn/i })[0];
    fireEvent.click(selectButton);

    // Chờ và kiểm tra phần "THÔNG TIN THUỐC"
    await waitFor(() => {
      const medicineDetails = screen.getByText(/THÔNG TIN THUỐC/i);
      expect(medicineDetails).toBeInTheDocument();
      const nameParagraph = within(medicineDetails.parentElement.parentElement).getByText(/Tên thuốc:/i).closest('p');
      console.log('Nội dung của nameParagraph:', nameParagraph.innerHTML); // Log để kiểm tra
      expect(within(nameParagraph).getByText(/Paracetamol/i)).toBeInTheDocument();
    }, { timeout: 2000 });

    const quantityInput = screen.getByRole('spinbutton');
    fireEvent.change(quantityInput, { target: { value: '2' } });

    const addToCartButton = screen.getByRole('button', { name: /Thêm vào giỏ hàng/i });
    fireEvent.click(addToCartButton);

    // Chờ và kiểm tra trong giỏ hàng
    await waitFor(() => {
      const cartSection = screen.getByText(/Giỏ hàng/i).parentElement;
      expect(within(cartSection).getByText(/Paracetamol/i)).toBeInTheDocument();
      expect(within(cartSection).getByText(/2/i)).toBeInTheDocument();
      expect(within(cartSection).getByText(/10\.000 VND/i)).toBeInTheDocument();
    }, { timeout: 2000 });
  });

  test('xóa thuốc khỏi giỏ hàng', async () => {
    render(<CreateInvoice />);

    await waitFor(() => {
      expect(screen.getByText(/Paracetamol/i)).toBeInTheDocument();
    });

    const selectButton = screen.getAllByRole('button', { name: /Chọn/i })[0];
    fireEvent.click(selectButton);

    const addToCartButton = screen.getByRole('button', { name: /Thêm vào giỏ hàng/i });
    fireEvent.click(addToCartButton);

    // Chờ và kiểm tra trong giỏ hàng
    await waitFor(() => {
      const cartSection = screen.getByText(/Giỏ hàng/i).parentElement;
      expect(within(cartSection).getByText(/Paracetamol/i)).toBeInTheDocument();
    }, { timeout: 2000 });

    const removeButton = screen.getByRole('button', { name: /Xóa/i });
    fireEvent.click(removeButton);

    // Kiểm tra rằng thuốc đã bị xóa khỏi giỏ hàng
    await waitFor(() => {
      const cartSection = screen.getByText(/Giỏ hàng/i).parentElement;
      expect(within(cartSection).queryByText(/Paracetamol/i)).not.toBeInTheDocument();
    }, { timeout: 2000 });
  });

  test('tạo hóa đơn và hiển thị modal', async () => {
    render(<CreateInvoice />);

    await waitFor(() => {
      expect(screen.getByText(/Paracetamol/i)).toBeInTheDocument();
    });

    const selectButton = screen.getAllByRole('button', { name: /Chọn/i })[0];
    fireEvent.click(selectButton);

    const addToCartButton = screen.getByRole('button', { name: /Thêm vào giỏ hàng/i });
    fireEvent.click(addToCartButton);

    // Chờ và kiểm tra trong giỏ hàng
    await waitFor(() => {
      const cartSection = screen.getByText(/Giỏ hàng/i).parentElement;
      expect(within(cartSection).getByText(/Paracetamol/i)).toBeInTheDocument();
    }, { timeout: 2000 });

    fireEvent.change(screen.getByPlaceholderText(/Tên khách hàng/i), { target: { value: 'Nguyen Van A' } });
    fireEvent.change(screen.getByPlaceholderText(/Số điện thoại/i), { target: { value: '0123456789' } });
    const genderSelect = screen.getByRole('combobox', { name: /Chọn giới tính/i });
    fireEvent.change(genderSelect, { target: { value: 'Male' } });
    fireEvent.change(screen.getByPlaceholderText(/Địa chỉ/i), { target: { value: '123 Ha Noi' } });

    const checkoutButton = screen.getByRole('button', { name: /TẠO HÓA ĐƠN/i });
    await act(async () => {
      fireEvent.click(checkoutButton);
    });

    await waitFor(() => {
      const invoiceModal = screen.getByText(/HÓA ĐƠN THANH TOÁN/i).closest('div');
      console.log('Nội dung của invoiceModal:', invoiceModal.innerHTML); // Log để kiểm tra
      expect(invoiceModal).toBeInTheDocument();
      expect(within(invoiceModal).getByText(/Nguyen Van A/i)).toBeInTheDocument();
      expect(within(invoiceModal).getByText(/0123456789/i)).toBeInTheDocument();
      expect(within(invoiceModal).getByText(/123 Ha Noi/i)).toBeInTheDocument();
      expect(within(invoiceModal).getByText(/Cash/i)).toBeInTheDocument();
      expect(within(invoiceModal).getByText(/Chưa thanh toán/i)).toBeInTheDocument();
      expect(within(invoiceModal).getByText(/Paracetamol/i)).toBeInTheDocument();

      // Scope the price check to the "Đơn giá" cell in the table row for Paracetamol
      const tableRow = within(invoiceModal).getByText(/Paracetamol/i).closest('tr');
      const unitPriceCell = within(tableRow).getAllByRole('cell')[3]; // "Đơn giá" is the 4th column
      expect(unitPriceCell).toHaveTextContent(/5\.000 VND/i);

      // Optionally, verify the total in the "Tổng tiền" section
      expect(within(invoiceModal).getByText(/Tổng tiền:/i).closest('h3')).toHaveTextContent(/5\.000 VND/i);
    }, { timeout: 3000 });
  });

  test('snapshot của giao diện CreateInvoice', async () => {
    const { container } = render(<CreateInvoice />);

    await waitFor(() => {
      expect(screen.getByText(/Paracetamol/i)).toBeInTheDocument();
    });

    expect(container).toMatchSnapshot();
  });
});