import React, { useCallback, useState, useEffect } from 'react';
import axios from 'axios';
import { saveAs } from 'file-saver';
import Sidebar from '../../components/Sidebar';
import { FaPlus, FaDownload } from 'react-icons/fa';
import * as XLSX from 'xlsx';
import { useToast } from '../../components/ToastProvider';
import {
  Container,
  Content,
  Toolbar,
  Button,
  Table,
  TableHeader,
  TableCell,
  Form,
  Input,
  Select,
  catalogMap,
  originMap,
  unitMap,
  ActionButton,
} from './MedicinesStyles';
import { formatVietnamDate } from '../../utils/listFilters';

const API_BASE = '';
const emptyForm = {
  medicineName: '',
  ingredients: '',
  stockQuantity: '',
  importPrice: '',
  unitPrice: '',
  expiryDate: '',
  unit: '',
  catalog: '',
  origin: '',
};
const formatMoney = (value) => Number(value || 0).toLocaleString('vi-VN');

const Medicines = () => {
  const [medicines, setMedicines] = useState([]);
  const [filteredMedicines, setFilteredMedicines] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [form, setForm] = useState(emptyForm);
  const [imageFile, setImageFile] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingMedicineID, setEditingMedicineID] = useState(null);
  const { showSuccess, showError } = useToast();

  const authHeaders = useCallback(() => ({ Authorization: `Token ${sessionStorage.getItem('token')}` }), []);

  const fetchMedicines = useCallback(async () => {
    try {
      const response = await axios.get(`${API_BASE}/api/medicines/medicines/`, { headers: authHeaders() });
      setMedicines(response.data);
      setFilteredMedicines(response.data);
    } catch (fetchError) {
      showError('Không tải được danh sách thuốc.');
    }
  }, [authHeaders, showError]);

  useEffect(() => {
    fetchMedicines();
  }, [fetchMedicines]);

  const handleSearch = (e) => {
    const keyword = e.target.value.toLowerCase();
    setSearchKeyword(keyword);
    setFilteredMedicines(medicines.filter((medicine) =>
      medicine.medicineName.toLowerCase().includes(keyword) ||
      medicine.medicineID.toLowerCase().includes(keyword)
    ));
  };

  const handleDownloadExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(filteredMedicines);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Medicines');
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const data = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(data, 'Medicines.xlsx');
  };

  const generateMedicineID = () => {
    const prefix = Math.random().toString(36).substring(2, 4).toUpperCase();
    const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `${prefix}${randomPart}`;
  };

  const buildPayload = (medicineID) => ({
    medicineID,
    medicineName: form.medicineName.trim(),
    ingredients: form.ingredients.trim(),
    image: imageFile ? `/images/medicines/${imageFile.name}` : null,
    stockQuantity: Number(form.stockQuantity),
    importPrice: Number(form.importPrice),
    unitPrice: Number(form.unitPrice),
    expiryDate: form.expiryDate,
    unit: form.unit,
    catalog: form.catalog,
    origin: form.origin,
  });

  const resetForm = () => {
    setForm(emptyForm);
    setImageFile(null);
    setShowForm(false);
    setEditingMedicineID(null);
  };

  const handleAddOrUpdateMedicine = async (e) => {
    e.preventDefault();
    try {
      if (editingMedicineID) {
        await axios.put(`${API_BASE}/api/medicines/medicines/${editingMedicineID}/`, buildPayload(editingMedicineID), { headers: authHeaders() });
        showSuccess('Cập nhật thuốc thành công.');
      } else {
        await axios.post(`${API_BASE}/api/medicines/medicines/`, buildPayload(generateMedicineID()), { headers: authHeaders() });
        showSuccess('Thêm thuốc thành công.');
      }
      resetForm();
      await fetchMedicines();
    } catch (saveError) {
      showError(saveError.response?.data?.error || 'Không lưu được thông tin thuốc. Vui lòng kiểm tra lại dữ liệu.');
    }
  };

  const handleEditMedicine = (medicine) => {
    setForm({
      medicineName: medicine.medicineName,
      ingredients: medicine.ingredients,
      stockQuantity: medicine.stockQuantity,
      importPrice: medicine.importPrice,
      unitPrice: medicine.unitPrice,
      expiryDate: medicine.expiryDate ? medicine.expiryDate.split('T')[0] : '',
      unit: medicine.unit,
      catalog: medicine.catalog,
      origin: medicine.origin,
    });
    setShowForm(true);
    setEditingMedicineID(medicine.medicineID);
  };

  const handleDeleteMedicine = async (medicineID) => {
    const confirmDelete = window.confirm('Bạn có chắc chắn muốn xóa thuốc này?');
    if (!confirmDelete) return;
    try {
      await axios.delete(`${API_BASE}/api/medicines/medicines/${medicineID}/`, { headers: authHeaders() });
      showSuccess('Xóa thuốc thành công.');
      await fetchMedicines();
    } catch (deleteError) {
      showError('Không xóa được thuốc này vì có thể thuốc đang được dùng trong hóa đơn hoặc phiếu nhập.');
    }
  };

  return (
    <Container>
      <Sidebar />
      <Content>
        <Toolbar>
          <div>
            <Button onClick={() => { setShowForm(!showForm); setEditingMedicineID(null); }}>
              <FaPlus style={{ marginRight: '0.5rem' }} /> THÊM
            </Button>
          </div>
          <div>
            <Input type="text" placeholder="Tìm kiếm thuốc..." value={searchKeyword} onChange={handleSearch} />
            <Button onClick={handleDownloadExcel}>
              <FaDownload style={{ marginRight: '0.5rem' }} />
              Tải xuống
            </Button>
          </div>
        </Toolbar>
        {showForm && (
          <Form onSubmit={handleAddOrUpdateMedicine}>
            <Input type="text" placeholder="Tên thuốc" value={form.medicineName} onChange={(e) => setForm({ ...form, medicineName: e.target.value })} required />
            <Input type="text" placeholder="Thành phần" value={form.ingredients} onChange={(e) => setForm({ ...form, ingredients: e.target.value })} required />
            <Input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files[0])} />
            <Input type="number" placeholder="Số lượng" value={form.stockQuantity} onChange={(e) => setForm({ ...form, stockQuantity: e.target.value })} required />
            <Input type="number" placeholder="Giá nhập" value={form.importPrice} onChange={(e) => setForm({ ...form, importPrice: e.target.value })} required />
            <Input type="number" placeholder="Đơn giá" value={form.unitPrice} onChange={(e) => setForm({ ...form, unitPrice: e.target.value })} required />
            <Input type="date" placeholder="Hạn sử dụng" value={form.expiryDate} onChange={(e) => setForm({ ...form, expiryDate: e.target.value })} required />
            <Select value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} required>
              <option value="">Chọn đơn vị tính</option>
              {Object.entries(unitMap).map(([key, value]) => <option key={key} value={key}>{value}</option>)}
            </Select>
            <Select value={form.catalog} onChange={(e) => setForm({ ...form, catalog: e.target.value })} required>
              <option value="">Chọn danh mục</option>
              {Object.entries(catalogMap).map(([key, value]) => <option key={key} value={key}>{value}</option>)}
            </Select>
            <Select value={form.origin} onChange={(e) => setForm({ ...form, origin: e.target.value })} required>
              <option value="">Chọn xuất xứ</option>
              {Object.entries(originMap).map(([key, value]) => <option key={key} value={key}>{value}</option>)}
            </Select>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <Button type="submit">{editingMedicineID ? 'Cập nhật' : 'Thêm mới'}</Button>
              <Button type="button" onClick={resetForm}>Hủy</Button>
            </div>
          </Form>
        )}

        <h2>DANH SÁCH THÔNG TIN THUỐC</h2>
        <Table>
          <thead>
            <tr>
              <TableHeader>STT</TableHeader>
              <TableHeader>Mã thuốc</TableHeader>
              <TableHeader>Tên thuốc</TableHeader>
              <TableHeader>Thành phần</TableHeader>
              <TableHeader>Danh mục</TableHeader>
              <TableHeader>Xuất xứ</TableHeader>
              <TableHeader>Đơn vị tính</TableHeader>
              <TableHeader>Số lượng</TableHeader>
              <TableHeader>Đơn giá</TableHeader>
              <TableHeader>Hạn sử dụng</TableHeader>
              <TableHeader>Hành động</TableHeader>
            </tr>
          </thead>
          <tbody>
            {filteredMedicines.map((medicine, index) => (
              <tr key={medicine.medicineID}>
                <TableCell>{index + 1}</TableCell>
                <TableCell>{medicine.medicineID}</TableCell>
                <TableCell>{medicine.medicineName}</TableCell>
                <TableCell>{medicine.ingredients}</TableCell>
                <TableCell>{catalogMap[medicine.catalog] || medicine.catalog}</TableCell>
                <TableCell>{originMap[medicine.origin] || medicine.origin}</TableCell>
                <TableCell>{unitMap[medicine.unit] || medicine.unit}</TableCell>
                <TableCell>{medicine.stockQuantity}</TableCell>
                <TableCell>{formatMoney(medicine.unitPrice)} VND</TableCell>
                <TableCell>{formatVietnamDate(medicine.expiryDate)}</TableCell>
                <TableCell>
                  <ActionButton onClick={() => handleEditMedicine(medicine)}>Sửa</ActionButton>
                  <ActionButton onClick={() => handleDeleteMedicine(medicine.medicineID)}>Xóa</ActionButton>
                </TableCell>
              </tr>
            ))}
          </tbody>
        </Table>
      </Content>
    </Container>
  );
};

export default Medicines;
