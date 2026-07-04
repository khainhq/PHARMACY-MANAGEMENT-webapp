import React from 'react';
import { render, screen, waitFor, fireEvent, within } from '@testing-library/react';
import axios from 'axios';
import html2canvas from 'html2canvas';
import CreateInvoice, { buildInvoiceImageFileName } from './CreateInvoice';
import { ToastProvider } from '../../components/ToastProvider';

jest.mock('axios');
jest.mock('html2canvas', () => jest.fn());
jest.mock('../../components/Sidebar', () => () => <div>Mocked Sidebar</div>);
jest.mock('react-router-dom', () => ({
  useNavigate: () => jest.fn(),
}));

const API_BASE = 'http://127.0.0.1:8000';

const medicines = [
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
];

const renderInvoice = async () => {
  render(
    <ToastProvider>
      <CreateInvoice />
    </ToastProvider>
  );
  await screen.findByText('Paracetamol');
};

const addFirstMedicineToCart = async (quantity = '1') => {
  const medicineList = screen.getByText('Danh sách thuốc').closest('div');
  const row = within(medicineList).getByText('MED001').closest('tr');
  fireEvent.click(within(row).getByRole('button', { name: 'Chọn' }));

  expect(await screen.findByText('THÔNG TIN THUỐC')).toBeInTheDocument();
  const quantityInput = screen.getByRole('spinbutton');
  fireEvent.change(quantityInput, { target: { value: quantity } });
  fireEvent.click(screen.getByRole('button', { name: 'Thêm vào giỏ hàng' }));
};

const fillInvoiceForm = ({ status = 'Paid', phoneNumber = '0123456789' } = {}) => {
  fireEvent.change(screen.getByPlaceholderText('Tên khách hàng'), { target: { value: 'Nguyen Van A' } });
  fireEvent.change(screen.getByPlaceholderText('Số điện thoại'), { target: { value: phoneNumber } });
  fireEvent.change(screen.getByRole('combobox', { name: 'Chọn giới tính' }), { target: { value: 'Male' } });
  fireEvent.change(screen.getByPlaceholderText('Địa chỉ'), { target: { value: '123 Ha Noi' } });
  fireEvent.change(screen.getAllByRole('combobox')[2], { target: { value: status } });
};

describe('CreateInvoice component', () => {
  let anchorClickSpy;
  let downloadedFileName;
  let downloadedHref;

  beforeEach(() => {
    axios.get.mockReset();
    axios.post.mockReset();
    axios.patch.mockReset();
    html2canvas.mockReset();
    sessionStorage.setItem('token', 'dummyToken');
    window.alert = jest.fn();
    downloadedFileName = '';
    downloadedHref = '';

    html2canvas.mockResolvedValue({
      toDataURL: jest.fn(() => 'data:image/png;base64,invoice-image'),
    });
    anchorClickSpy = jest.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function click() {
      downloadedFileName = this.download;
      downloadedHref = this.href;
    });

    axios.get.mockImplementation((url) => {
      if (url === `${API_BASE}/api/medicines/medicines/`) {
        return Promise.resolve({ data: medicines });
      }

      return Promise.reject(new Error('Not mocked'));
    });

    axios.post.mockImplementation((url) => {
      if (url === `${API_BASE}/api/sales/checkout/`) {
        return Promise.resolve({
          data: {
            invoiceID: 'INV001',
            invoiceTime: '2026-06-29T12:00:00Z',
            status: 'Pending',
          },
        });
      }

      return Promise.reject(new Error('Not mocked'));
    });

    axios.patch.mockResolvedValue({ data: {} });
  });

  afterEach(() => {
    sessionStorage.clear();
    jest.clearAllMocks();
    anchorClickSpy.mockRestore();
  });

  test('tạo tên file ảnh hóa đơn có mã, tên khách, số điện thoại và ngày giờ', () => {
    expect(buildInvoiceImageFileName({
      invoiceID: 'INV001',
      customerName: 'Trần Thị B',
      customerPhone: '0987 654 321',
    }, new Date(2026, 5, 30, 9, 8, 7))).toBe('hoa-don_INV001_Tran-Thi-B_0987-654-321_2026-06-30_09-08-07.png');
  });

  test('hiển thị Sidebar, danh sách thuốc, giỏ hàng và thông tin hóa đơn', async () => {
    await renderInvoice();

    expect(screen.getByText('Mocked Sidebar')).toBeInTheDocument();
    expect(screen.getByText('Danh sách thuốc')).toBeInTheDocument();
    expect(screen.getByText('Giỏ hàng')).toBeInTheDocument();
    expect(screen.getByText('Thông tin hóa đơn')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Tên khách hàng')).toBeInTheDocument();
    expect(screen.getByText('Ibuprofen')).toBeInTheDocument();
  });

  test('tìm kiếm thuốc theo từ khóa', async () => {
    await renderInvoice();

    fireEvent.change(screen.getByPlaceholderText('Tìm kiếm thuốc...'), { target: { value: 'Para' } });

    expect(screen.getByText('Paracetamol')).toBeInTheDocument();
    expect(screen.queryByText('Ibuprofen')).not.toBeInTheDocument();
  });

  test('thêm và xóa thuốc trong giỏ hàng', async () => {
    await renderInvoice();
    await addFirstMedicineToCart('2');

    const cartSection = screen.getByText('Giỏ hàng').closest('div');
    expect(within(cartSection).getByText('Paracetamol')).toBeInTheDocument();
    expect(within(cartSection).getByText('10.000 VND')).toBeInTheDocument();

    fireEvent.click(within(cartSection).getByRole('button', { name: 'Xóa' }));

    await waitFor(() => {
      expect(within(cartSection).queryByText('Paracetamol')).not.toBeInTheDocument();
    });
  });

  test('không tạo hóa đơn khi số điện thoại khách hàng sai định dạng', async () => {
    await renderInvoice();
    await addFirstMedicineToCart();
    fillInvoiceForm({ status: 'Pending', phoneNumber: 'Thạch Sanh' });

    fireEvent.click(screen.getByRole('button', { name: 'TẠO HÓA ĐƠN' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Số điện thoại không đúng định dạng.');
    expect(screen.queryByText('Kiểm tra hóa đơn trước khi lưu')).not.toBeInTheDocument();
    expect(axios.post).not.toHaveBeenCalled();
  });

  test('bấm tạo hóa đơn chỉ mở bản xem lại và nút chỉnh sửa giữ nguyên dữ liệu', async () => {
    await renderInvoice();
    await addFirstMedicineToCart();
    fillInvoiceForm({ status: 'Pending' });

    fireEvent.click(screen.getByRole('button', { name: 'TẠO HÓA ĐƠN' }));

    expect(await screen.findByText('Kiểm tra hóa đơn trước khi lưu')).toBeInTheDocument();
    const reviewModal = screen.getByText('Kiểm tra hóa đơn trước khi lưu').parentElement;
    expect(axios.post).not.toHaveBeenCalled();
    expect(within(reviewModal).getByText('Chưa lưu')).toBeInTheDocument();
    expect(within(reviewModal).getByText('Chưa thanh toán')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Chỉnh sửa' }));

    await waitFor(() => {
      expect(screen.queryByText('Kiểm tra hóa đơn trước khi lưu')).not.toBeInTheDocument();
    });
    expect(screen.getByPlaceholderText('Tên khách hàng')).toHaveValue('Nguyen Van A');
    expect(within(screen.getByText('Giỏ hàng').closest('div')).getByText('Paracetamol')).toBeInTheDocument();
  });

  test('xác nhận lưu hóa đơn mới gọi API và hiển thị phiếu in chi tiết bằng font tiếng Việt đồng đều', async () => {
    await renderInvoice();
    await addFirstMedicineToCart();
    fillInvoiceForm({ status: 'Pending' });

    fireEvent.click(screen.getByRole('button', { name: 'TẠO HÓA ĐƠN' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Xác nhận lưu' }));

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        `${API_BASE}/api/sales/checkout/`,
        {
          customerName: 'Nguyen Van A',
          phoneNumber: '0123456789',
          address: '123 Ha Noi',
          gender: 'Male',
          paymentMethod: 'Cash',
          status: 'Pending',
          items: [{ medicine: 'MED001', quantity: 1, unitPrice: 5000 }],
        },
        expect.any(Object)
      );
    });

    expect(await screen.findByText('Phiếu in hóa đơn')).toBeInTheDocument();
    const receipt = screen.getByText('Phiếu in hóa đơn').parentElement;
    expect(within(receipt).getByText('Hóa đơn thanh toán')).toBeInTheDocument();
    expect(within(receipt).getByText('INV001')).toBeInTheDocument();
    expect(within(receipt).getByText('Nguyen Van A')).toBeInTheDocument();
    expect(within(receipt).getByText('0123456789')).toBeInTheDocument();
    expect(within(receipt).getByText('123 Ha Noi')).toBeInTheDocument();
    expect(within(receipt).getByText('Tiền mặt')).toBeInTheDocument();
    expect(within(receipt).getByText('Chưa thanh toán')).toBeInTheDocument();
    expect(within(receipt).getByText('Paracetamol')).toBeInTheDocument();
    expect(within(receipt).getByText('5.000 VND')).toBeInTheDocument();
    expect(receipt.querySelector('.receipt-paper').style.fontFamily).toContain('Tahoma');
    expect(within(receipt).getByRole('button', { name: 'In hóa đơn' })).toBeInTheDocument();
  });

  test('nút in hóa đơn mở ảnh PNG xem trước rồi mới tải về với tên file realtime', async () => {
    await renderInvoice();
    await addFirstMedicineToCart();
    fillInvoiceForm({ status: 'Pending' });

    fireEvent.click(screen.getByRole('button', { name: 'TẠO HÓA ĐƠN' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Xác nhận lưu' }));
    const receipt = (await screen.findByText('Phiếu in hóa đơn')).parentElement;

    fireEvent.click(within(receipt).getByRole('button', { name: 'In hóa đơn' }));

    await waitFor(() => {
      expect(html2canvas).toHaveBeenCalledWith(
        expect.any(HTMLElement),
        {
          scale: 2,
          backgroundColor: '#ffffff',
          useCORS: true,
        }
      );
    });
    expect(anchorClickSpy).not.toHaveBeenCalled();
    expect(await screen.findByText('Xem trước ảnh hóa đơn PNG')).toBeInTheDocument();
    const imagePreview = screen.getByAltText('Ảnh hóa đơn INV001');
    expect(imagePreview).toHaveAttribute('src', 'data:image/png;base64,invoice-image');
    expect(screen.getByText(/^Tên file:/)).toHaveTextContent(
      /^Tên file: hoa-don_INV001_Nguyen-Van-A_0123456789_\d{4}-\d{2}-\d{2}_\d{2}-\d{2}-\d{2}\.png$/
    );

    fireEvent.click(screen.getByRole('button', { name: 'Tải về' }));

    expect(downloadedHref).toBe('data:image/png;base64,invoice-image');
    expect(downloadedFileName).toMatch(
      /^hoa-don_INV001_Nguyen-Van-A_0123456789_\d{4}-\d{2}-\d{2}_\d{2}-\d{2}-\d{2}\.png$/
    );
  });
});
