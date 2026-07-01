import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from '../../components/Sidebar';
import { FaUserPlus, FaSearch } from 'react-icons/fa';
import {
  Container,
  Content,
  Toolbar,
  Button,
  SearchInput,
  Table,
  TableHeader,
  TableCell,
  Form,
  Input,
  Select,
  genderMap,
} from './EmployeesStyles';

const API_BASE = 'http://127.0.0.1:8000';
const emptyForm = { fullName: '', phoneNumber: '', gender: '', yearOfBirth: '', hireDate: '' };

const Employees = () => {
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [form, setForm] = useState(emptyForm);
  const [showForm, setShowForm] = useState(false);
  const [editingEmployeeID, setEditingEmployeeID] = useState(null);
  const [error, setError] = useState('');

  const authHeaders = () => ({ Authorization: `Token ${sessionStorage.getItem('token')}` });

  const fetchEmployees = async () => {
    try {
      const response = await axios.get(`${API_BASE}/api/auth/employees/`, { headers: authHeaders() });
      setEmployees(response.data);
      setFilteredEmployees(response.data);
    } catch (fetchError) {
      setError('Không tải được danh sách nhân viên.');
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleSearch = (e) => {
    const keyword = e.target.value.toLowerCase();
    setSearchKeyword(keyword);
    setFilteredEmployees(employees.filter((employee) =>
      employee.fullName.toLowerCase().includes(keyword) ||
      employee.phoneNumber.includes(keyword) ||
      employee.employeeID.toLowerCase().includes(keyword)
    ));
  };

  const generateEmployeeID = () => {
    const prefix = Math.random().toString(36).substring(2, 4).toUpperCase();
    const middle = Math.floor(10 + Math.random() * 90);
    const suffix = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `${prefix}${middle}${suffix}`;
  };

  const buildPayload = (employeeID) => ({
    employeeID,
    fullName: form.fullName.trim(),
    phoneNumber: form.phoneNumber.trim(),
    gender: form.gender,
    yearOfBirth: Number(form.yearOfBirth),
    hireDate: form.hireDate,
    is_active: true,
  });

  const resetForm = () => {
    setForm(emptyForm);
    setShowForm(false);
    setEditingEmployeeID(null);
  };

  const handleAddEmployee = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await axios.post(`${API_BASE}/api/auth/employees/`, buildPayload(generateEmployeeID()), { headers: authHeaders() });
      resetForm();
      await fetchEmployees();
    } catch (addError) {
      setError(addError.response?.data?.error || 'Không thêm được nhân viên. Vui lòng kiểm tra số điện thoại hoặc dữ liệu nhập.');
    }
  };

  const handleEditEmployee = (employee) => {
    setForm({
      fullName: employee.fullName,
      phoneNumber: employee.phoneNumber,
      gender: employee.gender,
      yearOfBirth: employee.yearOfBirth,
      hireDate: employee.hireDate ? employee.hireDate.split('T')[0] : '',
    });
    setShowForm(true);
    setEditingEmployeeID(employee.employeeID);
  };

  const handleUpdateEmployee = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await axios.put(`${API_BASE}/api/auth/employees/${editingEmployeeID}/`, buildPayload(editingEmployeeID), { headers: authHeaders() });
      resetForm();
      await fetchEmployees();
    } catch (updateError) {
      setError(updateError.response?.data?.error || 'Không cập nhật được nhân viên. Vui lòng kiểm tra lại dữ liệu.');
    }
  };

  const handleDeleteEmployee = async (employeeID) => {
    const confirmDelete = window.confirm('Bạn có chắc chắn muốn xóa nhân viên này?');
    if (!confirmDelete) return;
    setError('');
    try {
      await axios.delete(`${API_BASE}/api/auth/employees/${employeeID}/`, { headers: authHeaders() });
      await fetchEmployees();
    } catch (deleteError) {
      setError('Không xóa được nhân viên này vì có thể đang liên kết với tài khoản hoặc chứng từ.');
    }
  };

  return (
    <Container>
      <Sidebar />
      <Content>
        <Toolbar>
          <div>
            <Button onClick={() => { setShowForm(!showForm); setEditingEmployeeID(null); }}>
              <FaUserPlus /> Thêm nhân viên
            </Button>
          </div>
          <div>
            <SearchInput type="text" placeholder="Tìm kiếm nhân viên..." value={searchKeyword} onChange={handleSearch} />
            <FaSearch style={{ marginLeft: '0.5rem', color: '#374151' }} />
          </div>
        </Toolbar>

        {error && <div role="alert" style={{ marginBottom: '1rem', color: '#b91c1c', fontWeight: 700 }}>{error}</div>}

        {showForm && (
          <Form onSubmit={editingEmployeeID ? handleUpdateEmployee : handleAddEmployee}>
            <Input type="text" placeholder="Họ tên" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} required />
            <Input type="text" placeholder="Số điện thoại" value={form.phoneNumber} onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })} required />
            <Select value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })} required>
              <option value="">Chọn giới tính</option>
              <option value="Male">Nam</option>
              <option value="Female">Nữ</option>
              <option value="Other">Khác</option>
            </Select>
            <Input type="number" placeholder="Năm sinh" value={form.yearOfBirth} onChange={(e) => setForm({ ...form, yearOfBirth: e.target.value })} required />
            <Input type="date" placeholder="Ngày vào làm" value={form.hireDate} onChange={(e) => setForm({ ...form, hireDate: e.target.value })} required />
            <div style={{ display: 'flex', gap: '1rem' }}>
              <Button type="submit">{editingEmployeeID ? 'Cập nhật' : 'Thêm nhân viên'}</Button>
              <Button type="button" onClick={resetForm}>Hủy</Button>
            </div>
          </Form>
        )}

        <h2>DANH SÁCH THÔNG TIN NHÂN VIÊN</h2>
        <Table>
          <colgroup>
            <col style={{ width: '5%' }} />
            <col style={{ width: '12%' }} />
            <col style={{ width: '20%' }} />
            <col style={{ width: '14%' }} />
            <col style={{ width: '9%' }} />
            <col style={{ width: '9%' }} />
            <col style={{ width: '15%' }} />
            <col style={{ width: '16%' }} />
          </colgroup>
          <thead>
            <tr>
              <TableHeader>STT</TableHeader>
              <TableHeader>Mã nhân viên</TableHeader>
              <TableHeader>Họ tên</TableHeader>
              <TableHeader>Số điện thoại</TableHeader>
              <TableHeader>Giới tính</TableHeader>
              <TableHeader>Năm sinh</TableHeader>
              <TableHeader>Ngày vào làm</TableHeader>
              <TableHeader>Hành động</TableHeader>
            </tr>
          </thead>
          <tbody>
            {filteredEmployees.map((employee, index) => (
              <tr key={employee.employeeID}>
                <TableCell>{index + 1}</TableCell>
                <TableCell>{employee.employeeID}</TableCell>
                <TableCell>{employee.fullName}</TableCell>
                <TableCell>{employee.phoneNumber}</TableCell>
                <TableCell>{genderMap[employee.gender] || employee.gender}</TableCell>
                <TableCell>{employee.yearOfBirth}</TableCell>
                <TableCell>{employee.hireDate ? employee.hireDate.split('T')[0] : ''}</TableCell>
                <TableCell>
                  <Button onClick={() => handleEditEmployee(employee)}>Sửa</Button>
                  <Button onClick={() => handleDeleteEmployee(employee.employeeID)} style={{ marginLeft: '0.5rem' }}>Xóa</Button>
                </TableCell>
              </tr>
            ))}
          </tbody>
        </Table>
      </Content>
    </Container>
  );
};

export default Employees;
