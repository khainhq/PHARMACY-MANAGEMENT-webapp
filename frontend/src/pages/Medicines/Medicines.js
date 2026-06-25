import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { saveAs } from 'file-saver';
import Sidebar from '../../components/Sidebar';
import { FaPlus, FaDownload } from 'react-icons/fa';
import * as XLSX from 'xlsx';
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

const Medicines = () => {
  const [medicines, setMedicines] = useState([]);
  const [filteredMedicines, setFilteredMedicines] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [form, setForm] = useState({
    medicineName: '',
    ingredients: '',
    stockQuantity: '',
    importPrice: '',
    unitPrice: '',
    expiryDate: '',
    unit: '',
    catalog: '',
    origin: '',
  });
  const [imageFile, setImageFile] = useState(null); // State để lưu ảnh
  const [showForm, setShowForm] = useState(false);
  const [editingMedicineID, setEditingMedicineID] = useState(null);

  const fetchMedicines = async () => {
    const token = sessionStorage.getItem('token');
    const headers = { Authorization: `Token ${token}` };

    try {
      const response = await axios.get('http://localhost:8000/api/medicines/medicines/', { headers });
      setMedicines(response.data);
      setFilteredMedicines(response.data); // Hiển thị tất cả thuốc ban đầu
    } catch (error) {
      console.error('Error fetching medicines:', error.response?.data || error.message);
    }
  };

  const handleSearch = (e) => {
    const keyword = e.target.value.toLowerCase();
    setSearchKeyword(keyword);
    const filtered = medicines.filter((medicine) =>
      medicine.medicineName.toLowerCase().includes(keyword) ||
      medicine.medicineID.toLowerCase().includes(keyword)
    );
    setFilteredMedicines(filtered);
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
    const prefix = Math.random().toString(36).substring(2, 4).toUpperCase(); // Hai ký tự chữ cái
    const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase(); // Tạo chuỗi ngẫu nhiên
    return `${prefix}${randomPart}`;
  };

  const handleAddOrUpdateMedicine = async (e) => {
    e.preventDefault();
    const token = sessionStorage.getItem('token');
    const headers = { Authorization: `Token ${token}` };

    try {
      const formData = new FormData();
      formData.append('medicineName', form.medicineName);
      formData.append('ingredients', form.ingredients);
      formData.append('stockQuantity', form.stockQuantity);
      formData.append('importPrice', form.importPrice);
      formData.append('unitPrice', form.unitPrice);
      formData.append('expiryDate', form.expiryDate);
      formData.append('unit', form.unit);
      formData.append('catalog', form.catalog);
      formData.append('origin', form.origin);

      if (imageFile) {
        formData.append('image', imageFile); // Thêm ảnh vào FormData
      }

      if (editingMedicineID) {
        // Update medicine
        formData.append('medicineID', editingMedicineID);
        await axios.put(
          `http://localhost:8000/api/medicines/medicines/${editingMedicineID}/`,
          formData,
          { headers }
        );
      } else {
        // Add new medicine
        const newMedicineID = generateMedicineID();
        formData.append('medicineID', newMedicineID);
        await axios.post(
          'http://localhost:8000/api/medicines/medicines/',
          formData,
          { headers }
        );
      }

      setForm({
        medicineName: '',
        ingredients: '',
        stockQuantity: '',
        importPrice: '',
        unitPrice: '',
        expiryDate: '',
        unit: '',
        catalog: '',
        origin: '',
      });
      setImageFile(null); // Reset ảnh
      setShowForm(false);
      setEditingMedicineID(null);
      fetchMedicines();
    } catch (error) {
      console.error('Error saving medicine:', error.response?.data || error.message);
    }
  };

  const handleEditMedicine = (medicine) => {
    setForm({
      medicineName: medicine.medicineName,
      ingredients: medicine.ingredients,
      stockQuantity: medicine.stockQuantity,
      importPrice: medicine.importPrice,
      unitPrice: medicine.unitPrice,
      expiryDate: medicine.expiryDate,
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

    const token = sessionStorage.getItem('token');
    const headers = { Authorization: `Token ${token}` };

    try {
      await axios.delete(`http://localhost:8000/api/medicines/medicines/${medicineID}/`, { headers });
      fetchMedicines();
    } catch (error) {
      console.error('Error deleting medicine:', error.response?.data || error.message);
    }
  };

  useEffect(() => {
    fetchMedicines();
  }, []);

  return (
    <Container>
      <Sidebar />
      <Content>
        <Toolbar>
          <div>
            <Button onClick={() => { setShowForm(!showForm); setEditingMedicineID(null); }}><FaPlus style={{ marginRight: '0.5rem' }} /> THÊM</Button>
          </div>
          <div>
            <Input
              type="text"
              placeholder="Tìm kiếm thuốc..."
              value={searchKeyword}
              onChange={handleSearch}
            />
            <Button onClick={handleDownloadExcel}>
              <FaDownload style={{ marginRight: '0.5rem' }} />
                Tải xuống
            </Button>
          </div>
        </Toolbar>

        {showForm && (
          <Form onSubmit={handleAddOrUpdateMedicine}>
            <Input
              type="text"
              placeholder="Tên thuốc"
              value={form.medicineName}
              onChange={(e) => setForm({ ...form, medicineName: e.target.value })}
              required
            />
            <Input
              type="text"
              placeholder="Thành phần"
              value={form.ingredients}
              onChange={(e) => setForm({ ...form, ingredients: e.target.value })}
              required
            />
            <Input
              type="file"
              accept="image/*"
              onChange={(e) => setImageFile(e.target.files[0])} // Lưu ảnh vào state
            />
            <Input
              type="number"
              placeholder="Số lượng"
              value={form.stockQuantity}
              onChange={(e) => setForm({ ...form, stockQuantity: e.target.value })}
              required
            />
            <Input
              type="number"
              placeholder="Giá nhập"
              value={form.importPrice}
              onChange={(e) => setForm({ ...form, importPrice: e.target.value })}
              required
            />
            <Input
              type="number"
              placeholder="Đơn giá"
              value={form.unitPrice}
              onChange={(e) => setForm({ ...form, unitPrice: e.target.value })}
              required
            />
            <Input
              type="date"
              placeholder="Hạn sử dụng"
              value={form.expiryDate}
              onChange={(e) => setForm({ ...form, expiryDate: e.target.value })}
              required
            />
            <Select
              value={form.unit}
              onChange={(e) => setForm({ ...form, unit: e.target.value })}
              required
            >
              <option value="">Chọn đơn vị tính</option>
              {Object.entries(unitMap).map(([key, value]) => (
                <option key={key} value={key}>
                  {value}
                </option>
              ))}
            </Select>
            <Select
              value={form.catalog}
              onChange={(e) => setForm({ ...form, catalog: e.target.value })}
              required
            >
              <option value="">Chọn danh mục</option>
              {Object.entries(catalogMap).map(([key, value]) => (
                <option key={key} value={key}>
                  {value}
                </option>
              ))}
            </Select>
            <Select
              value={form.origin}
              onChange={(e) => setForm({ ...form, origin: e.target.value })}
              required
            >
              <option value="">Chọn xuất xứ</option>
              {Object.entries(originMap).map(([key, value]) => (
                <option key={key} value={key}>
                  {value}
                </option>
              ))}
            </Select>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <Button type="submit">{editingMedicineID ? 'Cập nhật' : 'Thêm mới'}</Button>
              <Button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setForm({
                    medicineName: '',
                    ingredients: '',
                    stockQuantity: '',
                    importPrice: '',
                    unitPrice: '',
                    expiryDate: '',
                    unit: '',
                    catalog: '',
                    origin: '',
                  });
                  setImageFile(null);
                  setEditingMedicineID(null);
                }}
              >
                Hủy
              </Button>
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
                <TableCell>{catalogMap[medicine.catalog]}</TableCell>
                <TableCell>{originMap[medicine.origin]}</TableCell>
                <TableCell>{unitMap[medicine.unit]}</TableCell>
                <TableCell>{medicine.stockQuantity}</TableCell>
                <TableCell>{medicine.unitPrice.toLocaleString()} VND</TableCell>
                <TableCell>{medicine.expiryDate}</TableCell>
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