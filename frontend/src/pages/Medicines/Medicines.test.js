import React from 'react';
import { render, screen, fireEvent, act, within, waitFor } from '@testing-library/react';
import axios from 'axios';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import Medicines from './Medicines';

// Mock dependencies
jest.mock('axios');
jest.mock('file-saver');
jest.mock('xlsx');
jest.mock('../../components/Sidebar', () => () => <div>Mocked Sidebar</div>);

// Mock catalogMap, originMap, unitMap
jest.mock('./MedicinesStyles', () => ({
  ...jest.requireActual('./MedicinesStyles'),
  catalogMap: { 'CAT001': 'Thuốc kê đơn', 'CAT002': 'Thuốc không kê đơn' },
  originMap: { 'ORG001': 'Việt Nam', 'ORG002': 'Nhật Bản' },
  unitMap: { 'UNIT001': 'Viên', 'UNIT002': 'Hộp' },
}));

describe('Medicines component', () => {
  let mockMedicines;

  beforeEach(() => {
    // Reset mocks
    axios.get.mockReset();
    axios.post.mockReset();
    axios.put.mockReset();
    axios.delete.mockReset();
    saveAs.mockReset();
    XLSX.utils.json_to_sheet.mockReset();
    XLSX.utils.book_new.mockReset();
    XLSX.utils.book_append_sheet.mockReset();
    XLSX.write.mockReset();

    // Set up initial mock medicines data
    mockMedicines = [
      {
        medicineID: 'MED001',
        medicineName: 'Paracetamol',
        ingredients: 'Paracetamol 500mg',
        catalog: 'CAT001',
        origin: 'ORG001',
        unit: 'UNIT001',
        stockQuantity: 100,
        unitPrice: 5000,
        expiryDate: '2025-12-31',
      },
      {
        medicineID: 'MED002',
        medicineName: 'Amoxicillin',
        ingredients: 'Amoxicillin 250mg',
        catalog: 'CAT002',
        origin: 'ORG002',
        unit: 'UNIT002',
        stockQuantity: 50,
        unitPrice: 10000,
        expiryDate: '2025-06-30',
      },
    ];

    // Set up token in sessionStorage
    sessionStorage.setItem('token', 'dummyToken');

    // Mock API responses with delay to simulate real API
    axios.get.mockImplementation((url) => new Promise(resolve => setTimeout(() => {
      if (url === 'http://localhost:8000/api/medicines/medicines/') {
        resolve({ data: mockMedicines });
      } else {
        resolve({ data: null });
      }
    }, 100)));

    axios.post.mockImplementation((url, data, config) => {
      const newMedicine = {
        medicineID: data.get('medicineID') || `MED${mockMedicines.length + 1}`, // Tạo ID mới nếu không có
        medicineName: data.get('medicineName'),
        ingredients: data.get('ingredients'),
        catalog: data.get('catalog'),
        origin: data.get('origin'),
        unit: data.get('unit'),
        stockQuantity: parseInt(data.get('stockQuantity')),
        unitPrice: parseInt(data.get('unitPrice')),
        expiryDate: data.get('expiryDate'),
      };
      mockMedicines.push(newMedicine);
      return Promise.resolve({ data: newMedicine });
    });

    axios.put.mockImplementation((url, data, config) => {
      const updatedMedicine = {
        medicineID: data.get('medicineID'),
        medicineName: data.get('medicineName'),
        ingredients: data.get('ingredients'),
        catalog: data.get('catalog'),
        origin: data.get('origin'),
        unit: data.get('unit'),
        stockQuantity: parseInt(data.get('stockQuantity')),
        unitPrice: parseInt(data.get('unitPrice')),
        expiryDate: data.get('expiryDate'),
      };
      mockMedicines = mockMedicines.map(med =>
        med.medicineID === updatedMedicine.medicineID ? updatedMedicine : med
      );
      return Promise.resolve({ data: updatedMedicine });
    });

    axios.delete.mockImplementation((url) => {
      const medicineID = url.split('/').slice(-2)[0];
      mockMedicines = mockMedicines.filter(med => med.medicineID !== medicineID);
      return Promise.resolve({});
    });

    // Mock window.confirm
    window.confirm = jest.fn(() => true);

    // Mock XLSX and saveAs for download
    XLSX.utils.json_to_sheet.mockReturnValue('mockedWorksheet');
    XLSX.utils.book_new.mockReturnValue('mockedWorkbook');
    XLSX.utils.book_append_sheet.mockImplementation(() => {});
    XLSX.write.mockReturnValue('mockedExcelBuffer');
    saveAs.mockImplementation(() => {});
  });

  afterEach(() => {
    sessionStorage.clear();
    jest.clearAllMocks();
  });

  test('hiển thị Sidebar, tiêu đề và bảng danh sách thuốc', async () => {
    render(<Medicines />);

    await screen.findByText(/Mocked Sidebar/i, { timeout: 5000 });
    expect(screen.getByText(/Mocked Sidebar/i)).toBeInTheDocument();
    expect(screen.getByText(/DANH SÁCH THÔNG TIN THUỐC/i)).toBeInTheDocument();
    expect(screen.getByText(/STT/i)).toBeInTheDocument();
    expect(screen.getByText(/Mã thuốc/i)).toBeInTheDocument();
    expect(screen.getByText(/Tên thuốc/i)).toBeInTheDocument();
    expect(screen.getByText(/Thành phần/i)).toBeInTheDocument();
    expect(screen.getByText(/Danh mục/i)).toBeInTheDocument();
    expect(screen.getByText(/Xuất xứ/i)).toBeInTheDocument();
    expect(screen.getByText(/Đơn vị tính/i)).toBeInTheDocument();
    expect(screen.getByText(/Số lượng/i)).toBeInTheDocument();
    expect(screen.getByText(/Đơn giá/i)).toBeInTheDocument();
    expect(screen.getByText(/Hạn sử dụng/i)).toBeInTheDocument();
    expect(screen.getByText(/Hành động/i)).toBeInTheDocument();

    // Kiểm tra dữ liệu thuốc
    await screen.findByText('MED001', { timeout: 5000 });
    const row1 = screen.getByText('MED001').closest('tr');
    const cells1 = within(row1).getAllByRole('cell');
    expect(cells1[0]).toHaveTextContent('1'); // STT
    expect(cells1[1]).toHaveTextContent('MED001'); // Mã thuốc
    expect(cells1[2]).toHaveTextContent('Paracetamol'); // Tên thuốc
    expect(cells1[3]).toHaveTextContent('Paracetamol 500mg'); // Thành phần
    expect(cells1[4]).toHaveTextContent('Thuốc kê đơn'); // Danh mục
    expect(cells1[5]).toHaveTextContent('Việt Nam'); // Xuất xứ
    expect(cells1[6]).toHaveTextContent('Viên'); // Đơn vị tính
    expect(cells1[7]).toHaveTextContent('100'); // Số lượng
    expect(cells1[8]).toHaveTextContent('5.000 VND'); // Đơn giá
    expect(cells1[9]).toHaveTextContent('2025-12-31'); // Hạn sử dụng

    const row2 = screen.getByText('MED002').closest('tr');
    const cells2 = within(row2).getAllByRole('cell');
    expect(cells2[0]).toHaveTextContent('2'); // STT
    expect(cells2[1]).toHaveTextContent('MED002'); // Mã thuốc
    expect(cells2[2]).toHaveTextContent('Amoxicillin'); // Tên thuốc
    expect(cells2[3]).toHaveTextContent('Amoxicillin 250mg'); // Thành phần
    expect(cells2[4]).toHaveTextContent('Thuốc không kê đơn'); // Danh mục
    expect(cells2[5]).toHaveTextContent('Nhật Bản'); // Xuất xứ
    expect(cells2[6]).toHaveTextContent('Hộp'); // Đơn vị tính
    expect(cells2[7]).toHaveTextContent('50'); // Số lượng
    expect(cells2[8]).toHaveTextContent('10.000 VND'); // Đơn giá
    expect(cells2[9]).toHaveTextContent('2025-06-30'); // Hạn sử dụng
  });

  test('tìm kiếm thuốc theo tên hoặc mã thuốc', async () => {
    render(<Medicines />);

    await screen.findByText(/MED001/i, { timeout: 5000 });
    const row1 = screen.getByText(/MED001/i).closest('tr');
    const row2 = screen.getByText(/MED002/i).closest('tr');
    const cells1 = within(row1).getAllByRole('cell');
    const cells2 = within(row2).getAllByRole('cell');
    expect(cells1[2]).toHaveTextContent('Paracetamol'); // Tên thuốc
    expect(cells2[2]).toHaveTextContent('Amoxicillin'); // Tên thuốc

    const searchInput = screen.getByPlaceholderText(/Tìm kiếm thuốc.../i);
    fireEvent.change(searchInput, { target: { value: 'Paracetamol' } });

    expect(cells1[2]).toHaveTextContent('Paracetamol'); // Tên thuốc
    expect(screen.queryByText(/Amoxicillin/i)).not.toBeInTheDocument();

    fireEvent.change(searchInput, { target: { value: 'MED002' } });
    expect(screen.queryByText(/Paracetamol/i)).not.toBeInTheDocument();
    expect(cells2[2]).toHaveTextContent('Amoxicillin'); // Tên thuốc
  });

  test('thêm thuốc mới', async () => {
    render(<Medicines />);

    await screen.findByText(/MED001/i, { timeout: 5000 });

    // Mở form thêm thuốc
    const addButton = screen.getByRole('button', { name: /THÊM/i });
    fireEvent.click(addButton);
    expect(screen.getByRole('button', { name: /Thêm mới/i })).toBeInTheDocument();

    // Điền form
    fireEvent.change(screen.getByPlaceholderText(/Tên thuốc/i), { target: { value: 'Ibuprofen' } });
    fireEvent.change(screen.getByPlaceholderText(/Thành phần/i), { target: { value: 'Ibuprofen 400mg' } });
    fireEvent.change(screen.getByPlaceholderText(/Số lượng/i), { target: { value: '200' } });
    fireEvent.change(screen.getByPlaceholderText(/Giá nhập/i), { target: { value: '3000' } });
    fireEvent.change(screen.getByPlaceholderText(/Đơn giá/i), { target: { value: '6000' } });
    fireEvent.change(screen.getByPlaceholderText(/Hạn sử dụng/i), { target: { value: '2026-01-01' } });

    // Tìm các <select> và chọn giá trị
    const selects = screen.getAllByRole('combobox');
    // Đơn vị tính (select đầu tiên)
    fireEvent.change(selects[0], { target: { value: 'UNIT001' } });
    // Danh mục (select thứ hai)
    fireEvent.change(selects[1], { target: { value: 'CAT001' } });
    // Xuất xứ (select thứ ba)
    fireEvent.change(selects[2], { target: { value: 'ORG001' } });

    // Gửi form
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Thêm mới/i }));
    });

    // Kiểm tra thuốc mới được thêm
    await screen.findByText('Ibuprofen', { timeout: 5000 });
    const newRow = screen.getByText('Ibuprofen').closest('tr');
    const cells = within(newRow).getAllByRole('cell');
    expect(cells[2]).toHaveTextContent('Ibuprofen'); // Tên thuốc
    expect(cells[3]).toHaveTextContent('Ibuprofen 400mg'); // Thành phần
    expect(cells[4]).toHaveTextContent('Thuốc kê đơn'); // Danh mục
    expect(cells[5]).toHaveTextContent('Việt Nam'); // Xuất xứ
    expect(cells[6]).toHaveTextContent('Viên'); // Đơn vị tính
    expect(cells[7]).toHaveTextContent('200'); // Số lượng
    expect(cells[8]).toHaveTextContent('6.000 VND'); // Đơn giá
    expect(cells[9]).toHaveTextContent('2026-01-01'); // Hạn sử dụng
  });

  test('sửa thuốc', async () => {
    render(<Medicines />);

    await screen.findByText(/MED001/i, { timeout: 5000 });
    const row = screen.getByText(/MED001/i).closest('tr');
    const cells = within(row).getAllByRole('cell');
    expect(cells[2]).toHaveTextContent('Paracetamol'); // Tên thuốc

    // Mở form sửa thuốc
    const editButton = within(row).getByRole('button', { name: /Sửa/i });
    fireEvent.click(editButton);
    expect(screen.getByRole('button', { name: /Cập nhật/i })).toBeInTheDocument();

    // Kiểm tra dữ liệu đã được điền sẵn
    expect(screen.getByPlaceholderText(/Tên thuốc/i)).toHaveValue('Paracetamol');
    expect(screen.getByPlaceholderText(/Thành phần/i)).toHaveValue('Paracetamol 500mg');
    expect(screen.getByPlaceholderText(/Số lượng/i)).toHaveValue(100); // Số lượng là số
    expect(screen.getByPlaceholderText(/Đơn giá/i)).toHaveValue(5000); // Đơn giá là số
    expect(screen.getByPlaceholderText(/Hạn sử dụng/i)).toHaveValue('2025-12-31');
    const selects = screen.getAllByRole('combobox');
    expect(selects[0]).toHaveValue('UNIT001'); // Đơn vị tính
    expect(selects[1]).toHaveValue('CAT001'); // Danh mục
    expect(selects[2]).toHaveValue('ORG001'); // Xuất xứ

    // Cập nhật dữ liệu
    fireEvent.change(screen.getByPlaceholderText(/Tên thuốc/i), { target: { value: 'Paracetamol Updated' } });
    fireEvent.change(screen.getByPlaceholderText(/Số lượng/i), { target: { value: '150' } });
    fireEvent.change(screen.getByPlaceholderText(/Đơn giá/i), { target: { value: '7000' } });

    // Gửi form
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Cập nhật/i }));
    });

    // Kiểm tra thuốc đã được cập nhật
    await screen.findByText(/Paracetamol Updated/i, { timeout: 5000 });
    const updatedRow = screen.getByText(/Paracetamol Updated/i).closest('tr');
    const updatedCells = within(updatedRow).getAllByRole('cell');
    expect(updatedCells[2]).toHaveTextContent('Paracetamol Updated'); // Tên thuốc
    expect(updatedCells[7]).toHaveTextContent('150'); // Số lượng
    expect(updatedCells[8]).toHaveTextContent('7.000 VND'); // Đơn giá
  });

  test('xóa thuốc', async () => {
    render(<Medicines />);

    await screen.findByText(/MED001/i, { timeout: 5000 });
    const row = screen.getByText(/MED001/i).closest('tr');
    const cells = within(row).getAllByRole('cell');
    expect(cells[2]).toHaveTextContent('Paracetamol'); // Tên thuốc

    const deleteButton = within(row).getByRole('button', { name: /Xóa/i });
    await act(async () => {
      fireEvent.click(deleteButton);
    });

    // Đợi bảng cập nhật và chỉ hiển thị Amoxicillin
    await waitFor(async () => {
      const rows = screen.getAllByRole('row');
      // Mong đợi chỉ có 1 hàng dữ liệu (cộng với hàng tiêu đề, tổng 2 hàng)
      expect(rows.length).toBe(2); // Tiêu đề + 1 hàng dữ liệu
      const remainingRow = screen.getByText('MED002').closest('tr');
      const remainingCells = within(remainingRow).getAllByRole('cell');
      expect(remainingCells[2]).toHaveTextContent('Amoxicillin'); // Tên thuốc
    }, { timeout: 5000 });

    // Kiểm tra tên thuốc "Paracetamol" không còn trong cột tên thuốc
    await waitFor(() => {
      const medicineNameCells = screen.getAllByRole('cell').filter((cell, index) => index % 11 === 2); // Tên thuốc ở cột thứ 3 (index 2)
      expect(medicineNameCells.some(cell => cell.textContent === 'Paracetamol')).toBe(false);
    }, { timeout: 5000 });
  });

  test('tải xuống file Excel', async () => {
    render(<Medicines />);

    await screen.findByText(/MED001/i, { timeout: 5000 });
    const row = screen.getByText(/MED001/i).closest('tr');
    const cells = within(row).getAllByRole('cell');
    expect(cells[2]).toHaveTextContent('Paracetamol'); // Tên thuốc

    const downloadButton = screen.getByRole('button', { name: /Tải xuống/i });
    fireEvent.click(downloadButton);

    expect(XLSX.utils.json_to_sheet).toHaveBeenCalledWith(mockMedicines);
    expect(XLSX.utils.book_new).toHaveBeenCalled();
    expect(XLSX.utils.book_append_sheet).toHaveBeenCalledWith('mockedWorkbook', 'mockedWorksheet', 'Medicines');
    expect(XLSX.write).toHaveBeenCalledWith('mockedWorkbook', { bookType: 'xlsx', type: 'array' });
    expect(saveAs).toHaveBeenCalledWith(expect.any(Blob), 'Medicines.xlsx');
  });

  test('snapshot của giao diện Medicines', async () => {
    const { container } = render(<Medicines />);

    await screen.findByText(/MED001/i, { timeout: 5000 });
    const row = screen.getByText(/MED001/i).closest('tr');
    const cells = within(row).getAllByRole('cell');
    expect(cells[2]).toHaveTextContent('Paracetamol'); // Tên thuốc

    expect(container).toMatchSnapshot();
  });
});