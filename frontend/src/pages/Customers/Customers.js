import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from '../../components/Sidebar';
import { FaPlus, FaDownload } from 'react-icons/fa';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import {
  Container,
  Content,
  Toolbar,
  Table,
  TableHeader,
  TableCell,
  Button,
  Form,
  Input,
  SearchInput,
} from './CustomersStyles';

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    fullName: '',
    phoneNumber: '',
    gender: '',
    joinDate: '',
  });
  const [editingCustomerID, setEditingCustomerID] = useState(null);

  // Fetch customers from API
  const fetchCustomers = async () => {
    const token = sessionStorage.getItem('token');
    const headers = { Authorization: `Token ${token}` };

    try {
      const response = await axios.get('http://localhost:8000/api/sales/customers/', { headers });
      setCustomers(response.data);
      setFilteredCustomers(response.data);
    } catch (error) {
      console.error('Error fetching customers:', error);
    }
  };

  // Handle search functionality
  const handleSearch = (e) => {
    const keyword = e.target.value.toLowerCase();
    setSearchKeyword(keyword);

    const filtered = customers.filter((customer) =>
      customer.fullName.toLowerCase().includes(keyword) ||
      customer.phoneNumber.includes(keyword) ||
      customer.gender.toLowerCase().includes(keyword)
    );

    setFilteredCustomers(filtered);
  };

  // Handle add or update customer
  const handleAddOrUpdateCustomer = async (e) => {
    e.preventDefault();
    const token = sessionStorage.getItem('token');
    const headers = { Authorization: `Token ${token}` };

    try {
      const payload = {
        fullName: form.fullName.trim(),
        phoneNumber: form.phoneNumber.trim(),
        gender: form.gender,
        joinDate: form.joinDate || new Date().toISOString().split('T')[0],
      };

      if (editingCustomerID) {
        payload.customerID = editingCustomerID;
        // Update customer
        await axios.put(
          `http://localhost:8000/api/sales/customers/${editingCustomerID}/`,
          payload,
          { headers }
        );
      } else {
        // Add new customer
        const customerID = generateCustomerID(); // Generate unique customer ID
        await axios.post(
          'http://localhost:8000/api/sales/customers/',
          { ...payload, customerID },
          { headers }
        );
      }

      // Reset form and state
      setForm({ fullName: '', phoneNumber: '', gender: '', joinDate: '' });
      setShowForm(false);
      setEditingCustomerID(null);
      fetchCustomers();
    } catch (error) {
      console.error('Error saving customer:', error.response?.data || error.message);
    }
  };

  // Generate unique customer ID
  const generateCustomerID = () => {
    const letters = Array.from({ length: 6 }, () =>
      String.fromCharCode(65 + Math.floor(Math.random() * 26))
    ).join('');
    const numbers = Math.floor(100 + Math.random() * 900);
    return `${letters}${numbers}`;
  };

  // Handle edit customer
  const handleEditCustomer = (customer) => {
    setForm({
      fullName: customer.fullName,
      phoneNumber: customer.phoneNumber,
      gender: customer.gender,
      joinDate: customer.joinDate,
    });
    setShowForm(true);
    setEditingCustomerID(customer.customerID);
  };

  // Handle delete customer
  const handleDeleteCustomer = async (customerID) => {
    const confirmDelete = window.confirm('Bạn có chắc chắn muốn xóa khách hàng này?');
    if (!confirmDelete) return;

    const token = sessionStorage.getItem('token');
    const headers = { Authorization: `Token ${token}` };

    try {
      await axios.delete(`http://localhost:8000/api/sales/customers/${customerID}/`, { headers });
      fetchCustomers();
    } catch (error) {
      console.error('Error deleting customer:', error.response?.data || error.message);
    }
  };

  // Handle download Excel
  const handleDownloadExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(filteredCustomers);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Customers');
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const data = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(data, 'Customers.xlsx');
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  return (
    <Container>
      <Sidebar />
      <Content>
        <Toolbar>
        <div>
            <Button onClick={() => { setShowForm(!showForm); setEditingCustomerID(null); }}>
              <FaPlus style={{ marginRight: '0.5rem' }} /> THÊM
            </Button>
          </div>
          <div>
            <SearchInput
              type="text"
              placeholder="Tìm kiếm khách hàng..."
              value={searchKeyword}
              onChange={handleSearch}
            />
            <Button onClick={handleDownloadExcel}>
              <FaDownload style={{ marginRight: '0.5rem' }} /> Tải xuống
            </Button>
          </div>
        </Toolbar>

        {showForm && (
          <Form onSubmit={handleAddOrUpdateCustomer}>
            <Input
              type="text"
              placeholder="Họ tên"
              value={form.fullName}
              onChange={(e) => setForm({ ...form, fullName: e.target.value })}
              required
            />
            <Input
              type="text"
              placeholder="Số điện thoại"
              value={form.phoneNumber}
              onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
              required
            />
            <select
              value={form.gender}
              onChange={(e) => setForm({ ...form, gender: e.target.value })}
              required
              style={{
                padding: '0.5rem',
                border: '1px solid #ddd',
                borderRadius: '5px',
                marginBottom: '1rem',
              }}
            >
              <option value="">Chọn giới tính</option>
              <option value="Male">Nam</option>
              <option value="Female">Nữ</option>
            </select>
            <Input
              type="date"
              placeholder="Ngày tham gia"
              value={form.joinDate}
              onChange={(e) => setForm({ ...form, joinDate: e.target.value })}
            />
            <div style={{ display: 'flex', gap: '1rem' }}>
              <Button type="submit">{editingCustomerID ? 'Cập nhật' : 'Thêm mới'}</Button>
              <Button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setForm({ fullName: '', phoneNumber: '', gender: '', joinDate: '' });
                  setEditingCustomerID(null);
                }}
              >
                Hủy
            </Button>
            </div>
          </Form>
        )}

        <h2>DANH SÁCH KHÁCH HÀNG</h2>
        <Table>
          <thead>
            <tr>
              <TableHeader>STT</TableHeader>
              <TableHeader>Họ tên</TableHeader>
              <TableHeader>Số điện thoại</TableHeader>
              <TableHeader>Giới tính</TableHeader>
              <TableHeader>Ngày tham gia</TableHeader>
              <TableHeader>Hành động</TableHeader>
            </tr>
          </thead>
          <tbody>
            {filteredCustomers.map((customer, index) => (
              <tr key={customer.customerID}>
                <TableCell>{index + 1}</TableCell>
                <TableCell>{customer.fullName}</TableCell>
                <TableCell>{customer.phoneNumber}</TableCell>
                <TableCell>{customer.gender}</TableCell>
                <TableCell>{customer.joinDate}</TableCell>
                <TableCell>
                  <Button onClick={() => handleEditCustomer(customer)} >Sửa</Button>
                  <Button onClick={() => handleDeleteCustomer(customer.customerID)}style={{ marginLeft: '0.5rem' }}>Xóa</Button>
                </TableCell>
              </tr>
            ))}
          </tbody>
        </Table>
      </Content>
    </Container>
  );
};

export default Customers;