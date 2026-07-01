import React, { useMemo, useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from '../../components/Sidebar';
import { FaPlus, FaDownload } from 'react-icons/fa';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import {
  Container,
  Content,
  Toolbar,
  ToolbarSide,
  FilterBar,
  FilterField,
  Table,
  TableHeader,
  TableCell,
  Button,
  Form,
  Input,
  Select,
  SearchInput,
  ActionGroup,
  EmptyCell,
} from './CustomersStyles';
import {
  applyListFilters,
  formatDateInputValue,
  formatVietnamDate,
} from '../../utils/listFilters';

const API_BASE = 'http://localhost:8000';
const emptyForm = { fullName: '', phoneNumber: '', gender: '', joinDate: '' };

const genderLabels = {
  Male: 'Nam',
  Female: 'Nữ',
  Other: 'Khác',
  Nam: 'Nam',
  Nữ: 'Nữ',
  Khác: 'Khác',
};

const formatGender = (gender) => genderLabels[gender] || gender || '';

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [sortOrder, setSortOrder] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editingCustomerID, setEditingCustomerID] = useState(null);

  const filteredCustomers = useMemo(
    () =>
      applyListFilters(customers, {
        keyword: searchKeyword,
        sortOrder,
        selectedDate,
        fromDate,
        toDate,
        getDate: (customer) => customer.joinDate,
        getSearchText: (customer) =>
          [
            customer.customerID,
            customer.fullName,
            customer.phoneNumber,
            customer.gender,
            formatGender(customer.gender),
            formatVietnamDate(customer.joinDate),
          ]
            .filter(Boolean)
            .join(' '),
      }),
    [customers, searchKeyword, sortOrder, selectedDate, fromDate, toDate]
  );

  const fetchCustomers = async () => {
    const token = sessionStorage.getItem('token');
    const headers = { Authorization: `Token ${token}` };

    try {
      const response = await axios.get(`${API_BASE}/api/sales/customers/`, { headers });
      setCustomers(response.data);
    } catch (error) {
      console.error('Error fetching customers:', error);
    }
  };

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
        await axios.put(`${API_BASE}/api/sales/customers/${editingCustomerID}/`, payload, { headers });
      } else {
        const customerID = generateCustomerID();
        await axios.post(`${API_BASE}/api/sales/customers/`, { ...payload, customerID }, { headers });
      }

      setForm(emptyForm);
      setShowForm(false);
      setEditingCustomerID(null);
      fetchCustomers();
    } catch (error) {
      console.error('Error saving customer:', error.response?.data || error.message);
    }
  };

  const generateCustomerID = () => {
    const letters = Array.from({ length: 6 }, () =>
      String.fromCharCode(65 + Math.floor(Math.random() * 26))
    ).join('');
    const numbers = Math.floor(100 + Math.random() * 900);
    return `${letters}${numbers}`;
  };

  const handleEditCustomer = (customer) => {
    setForm({
      fullName: customer.fullName,
      phoneNumber: customer.phoneNumber,
      gender: customer.gender,
      joinDate: formatDateInputValue(customer.joinDate),
    });
    setShowForm(true);
    setEditingCustomerID(customer.customerID);
  };

  const handleDeleteCustomer = async (customerID) => {
    const confirmDelete = window.confirm('Bạn có chắc chắn muốn xóa khách hàng này?');
    if (!confirmDelete) return;

    const token = sessionStorage.getItem('token');
    const headers = { Authorization: `Token ${token}` };

    try {
      await axios.delete(`${API_BASE}/api/sales/customers/${customerID}/`, { headers });
      fetchCustomers();
    } catch (error) {
      console.error('Error deleting customer:', error.response?.data || error.message);
    }
  };

  const handleDownloadExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(filteredCustomers);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Customers');
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const data = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(data, 'Customers.xlsx');
  };

  const clearFilters = () => {
    setSearchKeyword('');
    setSortOrder('');
    setSelectedDate('');
    setFromDate('');
    setToDate('');
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  return (
    <Container>
      <Sidebar />
      <Content>
        <Toolbar>
          <Button onClick={() => { setShowForm(!showForm); setEditingCustomerID(null); }}>
            <FaPlus /> THÊM
          </Button>
          <ToolbarSide>
            <SearchInput
              type="text"
              placeholder="Tìm kiếm khách hàng..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
            />
            <Button onClick={handleDownloadExcel}>
              <FaDownload /> Tải xuống
            </Button>
          </ToolbarSide>
        </Toolbar>

        <FilterBar>
          <FilterField>
            Sắp xếp
            <Select aria-label="Sắp xếp khách hàng" value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
              <option value="">Mặc định</option>
              <option value="newest">Mới nhất</option>
              <option value="oldest">Cũ nhất</option>
            </Select>
          </FilterField>
          <FilterField>
            Ngày cụ thể
            <Input
              aria-label="Lọc khách hàng theo ngày cụ thể"
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </FilterField>
          <FilterField>
            Từ ngày
            <Input
              aria-label="Lọc khách hàng từ ngày"
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
            />
          </FilterField>
          <FilterField>
            Đến ngày
            <Input
              aria-label="Lọc khách hàng đến ngày"
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
            />
          </FilterField>
          <Button type="button" onClick={clearFilters}>Bỏ lọc</Button>
        </FilterBar>

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
            <Select
              value={form.gender}
              onChange={(e) => setForm({ ...form, gender: e.target.value })}
              required
            >
              <option value="">Chọn giới tính</option>
              <option value="Male">Nam</option>
              <option value="Female">Nữ</option>
              <option value="Other">Khác</option>
            </Select>
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
                  setForm(emptyForm);
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
          <colgroup>
            <col style={{ width: '6%' }} />
            <col style={{ width: '24%' }} />
            <col style={{ width: '14%' }} />
            <col style={{ width: '10%' }} />
            <col style={{ width: '25%' }} />
            <col style={{ width: '21%' }} />
          </colgroup>
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
                <TableCell>{formatGender(customer.gender)}</TableCell>
                <TableCell>{formatVietnamDate(customer.joinDate)}</TableCell>
                <TableCell>
                  <ActionGroup>
                    <Button onClick={() => handleEditCustomer(customer)}>Sửa</Button>
                    <Button onClick={() => handleDeleteCustomer(customer.customerID)}>Xóa</Button>
                  </ActionGroup>
                </TableCell>
              </tr>
            ))}
            {filteredCustomers.length === 0 && (
              <tr>
                <EmptyCell colSpan={6}>Chưa có dữ liệu phù hợp với bộ lọc.</EmptyCell>
              </tr>
            )}
          </tbody>
        </Table>
      </Content>
    </Container>
  );
};

export default Customers;
