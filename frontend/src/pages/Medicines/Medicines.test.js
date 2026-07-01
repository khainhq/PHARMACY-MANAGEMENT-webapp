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
      if (url.includes('/api/medicines/medicines/')) {
        resolve({ data: mockMedicines });
      } else {
        resolve({ data: null });
      }
    }, 100)));

    axios.post.mockImplementation((url, data, config) => {
      const getField = (name) => (typeof data.get === 'function' ? data.get(name) : data[name]);
      if (typeof data.get !== 'function') data.get = (name) => data[name];
      const newMedicine = {
        medicineID: data.get('medicineID') || `MED${mockMedicines.length + 1}`, // Táº¡o ID má»›i náº¿u khÃ´ng cÃ³
        medicineName: getField('medicineName'),
        ingredients: getField('ingredients'),
        catalog: getField('catalog'),
        origin: getField('origin'),
        unit: getField('unit'),
        stockQuantity: parseInt(getField('stockQuantity')),
        unitPrice: parseInt(getField('unitPrice')),
        expiryDate: getField('expiryDate'),
      };
      mockMedicines.push(newMedicine);
      return Promise.resolve({ data: newMedicine });
    });

    axios.put.mockImplementation((url, data, config) => {
      if (typeof data.get !== 'function') data.get = (name) => data[name];
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

  test('hiá»ƒn thá»‹ Sidebar, tiÃªu Ä‘á» vÃ  báº£ng danh sÃ¡ch thuá»‘c', async () => {
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

    // Kiá»ƒm tra dá»¯ liá»‡u thuá»‘c
    await screen.findByText('MED001', { timeout: 5000 });
    const row1 = screen.getByText('MED001').closest('tr');
    const cells1 = within(row1).getAllByRole('cell');
    expect(cells1[0]).toHaveTextContent('1'); // STT
    expect(cells1[1]).toHaveTextContent('MED001'); // MÃ£ thuá»‘c
    expect(cells1[2]).toHaveTextContent('Paracetamol'); // TÃªn thuá»‘c
    expect(cells1[3]).toHaveTextContent('Paracetamol 500mg'); // ThÃ nh pháº§n
    expect(cells1[4]).toHaveTextContent('Thuốc kê đơn'); // Danh má»¥c
    expect(cells1[5]).toHaveTextContent('Việt Nam'); // Xuáº¥t xá»©
    expect(cells1[6]).toHaveTextContent('Viên'); // ÄÆ¡n vá»‹ tÃ­nh
    expect(cells1[7]).toHaveTextContent('100'); // Sá»‘ lÆ°á»£ng
    expect(cells1[8]).toHaveTextContent('5.000 VND'); // ÄÆ¡n giÃ¡
    expect(cells1[9]).toHaveTextContent('31/12/2025'); // Háº¡n sá»­ dá»¥ng

    const row2 = screen.getByText('MED002').closest('tr');
    const cells2 = within(row2).getAllByRole('cell');
    expect(cells2[0]).toHaveTextContent('2'); // STT
    expect(cells2[1]).toHaveTextContent('MED002'); // MÃ£ thuá»‘c
    expect(cells2[2]).toHaveTextContent('Amoxicillin'); // TÃªn thuá»‘c
    expect(cells2[3]).toHaveTextContent('Amoxicillin 250mg'); // ThÃ nh pháº§n
    expect(cells2[4]).toHaveTextContent('Thuốc không kê đơn'); // Danh má»¥c
    expect(cells2[5]).toHaveTextContent('Nhật Bản'); // Xuáº¥t xá»©
    expect(cells2[6]).toHaveTextContent('Hộp'); // ÄÆ¡n vá»‹ tÃ­nh
    expect(cells2[7]).toHaveTextContent('50'); // Sá»‘ lÆ°á»£ng
    expect(cells2[8]).toHaveTextContent('10.000 VND'); // ÄÆ¡n giÃ¡
    expect(cells2[9]).toHaveTextContent('30/06/2025'); // Háº¡n sá»­ dá»¥ng
  });

  test('tÃ¬m kiáº¿m thuá»‘c theo tÃªn hoáº·c mÃ£ thuá»‘c', async () => {
    render(<Medicines />);

    await screen.findByText(/MED001/i, { timeout: 5000 });
    const row1 = screen.getByText(/MED001/i).closest('tr');
    const row2 = screen.getByText(/MED002/i).closest('tr');
    const cells1 = within(row1).getAllByRole('cell');
    const cells2 = within(row2).getAllByRole('cell');
    expect(cells1[2]).toHaveTextContent('Paracetamol'); // TÃªn thuá»‘c
    expect(cells2[2]).toHaveTextContent('Amoxicillin'); // TÃªn thuá»‘c

    const searchInput = screen.getByPlaceholderText(/Tìm kiếm thuốc.../i);
    fireEvent.change(searchInput, { target: { value: 'Paracetamol' } });

    expect(cells1[2]).toHaveTextContent('Paracetamol'); // TÃªn thuá»‘c
    expect(screen.queryByText(/Amoxicillin/i)).not.toBeInTheDocument();

    fireEvent.change(searchInput, { target: { value: 'MED002' } });
    expect(screen.queryByText(/Paracetamol/i)).not.toBeInTheDocument();
    expect(cells2[2]).toHaveTextContent('Amoxicillin'); // TÃªn thuá»‘c
  });

  test('thÃªm thuá»‘c má»›i', async () => {
    render(<Medicines />);

    await screen.findByText(/MED001/i, { timeout: 5000 });

    // Má»Ÿ form thÃªm thuá»‘c
    const addButton = screen.getByRole('button', { name: /THÊM/i });
    fireEvent.click(addButton);
    expect(screen.getByRole('button', { name: /Thêm mới/i })).toBeInTheDocument();

    // Äiá»n form
    fireEvent.change(screen.getByPlaceholderText(/Tên thuốc/i), { target: { value: 'Ibuprofen' } });
    fireEvent.change(screen.getByPlaceholderText(/Thành phần/i), { target: { value: 'Ibuprofen 400mg' } });
    fireEvent.change(screen.getByPlaceholderText(/Số lượng/i), { target: { value: '200' } });
    fireEvent.change(screen.getByPlaceholderText(/Giá nhập/i), { target: { value: '3000' } });
    fireEvent.change(screen.getByPlaceholderText(/Đơn giá/i), { target: { value: '6000' } });
    fireEvent.change(screen.getByPlaceholderText(/Hạn sử dụng/i), { target: { value: '2026-01-01' } });

    // TÃ¬m cÃ¡c <select> vÃ  chá»n giÃ¡ trá»‹
    const selects = screen.getAllByRole('combobox');
    // ÄÆ¡n vá»‹ tÃ­nh (select Ä‘áº§u tiÃªn)
    fireEvent.change(selects[0], { target: { value: 'UNIT001' } });
    // Danh má»¥c (select thá»© hai)
    fireEvent.change(selects[1], { target: { value: 'CAT001' } });
    // Xuáº¥t xá»© (select thá»© ba)
    fireEvent.change(selects[2], { target: { value: 'ORG001' } });

    // Gá»­i form
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Thêm mới/i }));
    });

    // Kiá»ƒm tra thuá»‘c má»›i Ä‘Æ°á»£c thÃªm
    await screen.findByText('Ibuprofen', { timeout: 5000 });
    const newRow = screen.getByText('Ibuprofen').closest('tr');
    const cells = within(newRow).getAllByRole('cell');
    expect(cells[2]).toHaveTextContent('Ibuprofen'); // TÃªn thuá»‘c
    expect(cells[3]).toHaveTextContent('Ibuprofen 400mg'); // ThÃ nh pháº§n
    expect(cells[4]).toHaveTextContent('Thuốc kê đơn'); // Danh má»¥c
    expect(cells[5]).toHaveTextContent('Việt Nam'); // Xuáº¥t xá»©
    expect(cells[6]).toHaveTextContent('Viên'); // ÄÆ¡n vá»‹ tÃ­nh
    expect(cells[7]).toHaveTextContent('200'); // Sá»‘ lÆ°á»£ng
    expect(cells[8]).toHaveTextContent('6.000 VND'); // ÄÆ¡n giÃ¡
    expect(cells[9]).toHaveTextContent('01/01/2026'); // Háº¡n sá»­ dá»¥ng
  });

  test('sá»­a thuá»‘c', async () => {
    render(<Medicines />);

    await screen.findByText(/MED001/i, { timeout: 5000 });
    const row = screen.getByText(/MED001/i).closest('tr');
    const cells = within(row).getAllByRole('cell');
    expect(cells[2]).toHaveTextContent('Paracetamol'); // TÃªn thuá»‘c

    // Má»Ÿ form sá»­a thuá»‘c
    const editButton = within(row).getByRole('button', { name: /Sửa/i });
    fireEvent.click(editButton);
    expect(screen.getByRole('button', { name: /Cập nhật/i })).toBeInTheDocument();

    // Kiá»ƒm tra dá»¯ liá»‡u Ä‘Ã£ Ä‘Æ°á»£c Ä‘iá»n sáºµn
    expect(screen.getByPlaceholderText(/Tên thuốc/i)).toHaveValue('Paracetamol');
    expect(screen.getByPlaceholderText(/Thành phần/i)).toHaveValue('Paracetamol 500mg');
    expect(screen.getByPlaceholderText(/Số lượng/i)).toHaveValue(100); // Sá»‘ lÆ°á»£ng lÃ  sá»‘
    expect(screen.getByPlaceholderText(/Đơn giá/i)).toHaveValue(5000); // ÄÆ¡n giÃ¡ lÃ  sá»‘
    expect(screen.getByPlaceholderText(/Hạn sử dụng/i)).toHaveValue('2025-12-31');
    const selects = screen.getAllByRole('combobox');
    expect(selects[0]).toHaveValue('UNIT001'); // ÄÆ¡n vá»‹ tÃ­nh
    expect(selects[1]).toHaveValue('CAT001'); // Danh má»¥c
    expect(selects[2]).toHaveValue('ORG001'); // Xuáº¥t xá»©

    // Cáº­p nháº­t dá»¯ liá»‡u
    fireEvent.change(screen.getByPlaceholderText(/Tên thuốc/i), { target: { value: 'Paracetamol Updated' } });
    fireEvent.change(screen.getByPlaceholderText(/Số lượng/i), { target: { value: '150' } });
    fireEvent.change(screen.getByPlaceholderText(/Đơn giá/i), { target: { value: '7000' } });

    // Gá»­i form
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Cập nhật/i }));
    });

    // Kiá»ƒm tra thuá»‘c Ä‘Ã£ Ä‘Æ°á»£c cáº­p nháº­t
    await screen.findByText(/Paracetamol Updated/i, { timeout: 5000 });
    const updatedRow = screen.getByText(/Paracetamol Updated/i).closest('tr');
    const updatedCells = within(updatedRow).getAllByRole('cell');
    expect(updatedCells[2]).toHaveTextContent('Paracetamol Updated'); // TÃªn thuá»‘c
    expect(updatedCells[7]).toHaveTextContent('150'); // Sá»‘ lÆ°á»£ng
    expect(updatedCells[8]).toHaveTextContent('7.000 VND'); // ÄÆ¡n giÃ¡
  });

  test('xÃ³a thuá»‘c', async () => {
    render(<Medicines />);

    await screen.findByText(/MED001/i, { timeout: 5000 });
    const row = screen.getByText(/MED001/i).closest('tr');
    const cells = within(row).getAllByRole('cell');
    expect(cells[2]).toHaveTextContent('Paracetamol'); // TÃªn thuá»‘c

    const deleteButton = within(row).getByRole('button', { name: /Xóa/i });
    await act(async () => {
      fireEvent.click(deleteButton);
    });

    // Äá»£i báº£ng cáº­p nháº­t vÃ  chá»‰ hiá»ƒn thá»‹ Amoxicillin
    await waitFor(async () => {
      const rows = screen.getAllByRole('row');
      // Mong Ä‘á»£i chá»‰ cÃ³ 1 hÃ ng dá»¯ liá»‡u (cá»™ng vá»›i hÃ ng tiÃªu Ä‘á», tá»•ng 2 hÃ ng)
      expect(rows.length).toBe(2); // TiÃªu Ä‘á» + 1 hÃ ng dá»¯ liá»‡u
      const remainingRow = screen.getByText('MED002').closest('tr');
      const remainingCells = within(remainingRow).getAllByRole('cell');
      expect(remainingCells[2]).toHaveTextContent('Amoxicillin'); // TÃªn thuá»‘c
    }, { timeout: 5000 });

    // Kiá»ƒm tra tÃªn thuá»‘c "Paracetamol" khÃ´ng cÃ²n trong cá»™t tÃªn thuá»‘c
    await waitFor(() => {
      const medicineNameCells = screen.getAllByRole('cell').filter((cell, index) => index % 11 === 2); // TÃªn thuá»‘c á»Ÿ cá»™t thá»© 3 (index 2)
      expect(medicineNameCells.some(cell => cell.textContent === 'Paracetamol')).toBe(false);
    }, { timeout: 5000 });
  });

  test('táº£i xuá»‘ng file Excel', async () => {
    render(<Medicines />);

    await screen.findByText(/MED001/i, { timeout: 5000 });
    const row = screen.getByText(/MED001/i).closest('tr');
    const cells = within(row).getAllByRole('cell');
    expect(cells[2]).toHaveTextContent('Paracetamol'); // TÃªn thuá»‘c

    const downloadButton = screen.getByRole('button', { name: /Tải xuống/i });
    fireEvent.click(downloadButton);

    expect(XLSX.utils.json_to_sheet).toHaveBeenCalledWith(mockMedicines);
    expect(XLSX.utils.book_new).toHaveBeenCalled();
    expect(XLSX.utils.book_append_sheet).toHaveBeenCalledWith('mockedWorkbook', 'mockedWorksheet', 'Medicines');
    expect(XLSX.write).toHaveBeenCalledWith('mockedWorkbook', { bookType: 'xlsx', type: 'array' });
    expect(saveAs).toHaveBeenCalledWith(expect.any(Blob), 'Medicines.xlsx');
  });

  test('snapshot cá»§a giao diá»‡n Medicines', async () => {
    const { container } = render(<Medicines />);

    await screen.findByText(/MED001/i, { timeout: 5000 });
    const row = screen.getByText(/MED001/i).closest('tr');
    const cells = within(row).getAllByRole('cell');
    expect(cells[2]).toHaveTextContent('Paracetamol'); // TÃªn thuá»‘c

    expect(container).toMatchSnapshot();
  });
});
