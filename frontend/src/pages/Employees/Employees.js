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

const Employees = () => {
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [form, setForm] = useState({
    fullName: '',
    phoneNumber: '',
    gender: '',
    yearOfBirth: '',
    hireDate: '',
  });
  const [showForm, setShowForm] = useState(false);
  const [editingEmployeeID, setEditingEmployeeID] = useState(null);

  // Fetch danh sách nhân viên
  const fetchEmployees = async () => {
    const token = sessionStorage.getItem('token');
    const headers = { Authorization: `Token ${token}` };
    try {
      const response = await axios.get('http://localhost:8000/api/auth/employees/', { headers });
      setEmployees(response.data);
      setFilteredEmployees(response.data); // Hiển thị tất cả nhân viên ban đầu
    } catch (error) {
      console.error('Error fetching employees:', error.response?.data || error.message);
    }
  };

  // Tìm kiếm nhân viên
  const handleSearch = (e) => {
    const keyword = e.target.value.toLowerCase();
    setSearchKeyword(keyword);
    const filtered = employees.filter((employee) =>
      employee.fullName.toLowerCase().includes(keyword) ||
      employee.phoneNumber.includes(keyword) ||
      employee.employeeID.toLowerCase().includes(keyword)
    );
    setFilteredEmployees(filtered);
  };

  // Tạo mã nhân viên ngẫu nhiên
  const generateEmployeeID = () => {
    const prefix = Math.random().toString(36).substring(2, 4).toUpperCase(); // Hai ký tự chữ cái
    const middle = Math.floor(10 + Math.random() * 90); // Hai chữ số
    const suffix = Math.random().toString(36).substring(2, 6).toUpperCase(); // Bốn ký tự chữ cái hoặc số
    return `${prefix}${middle}${suffix}`;
  };

  // Thêm nhân viên mới
  const handleAddEmployee = async (e) => {
    e.preventDefault();
    const token = sessionStorage.getItem('token');
    const headers = { Authorization: `Token ${token}` };
    const employeeID = generateEmployeeID();
    try {
      const payload = { ...form, employeeID };
      await axios.post('http://localhost:8000/api/auth/employees/', payload, { headers });
      setForm({ fullName: '', phoneNumber: '', gender: '', yearOfBirth: '', hireDate: '' });
      setShowForm(false);
      fetchEmployees();
    } catch (error) {
      console.error('Error adding employee:', error.response?.data || error.message);
    }
  };

  // Hiển thị form chỉnh sửa nhân viên
  const handleEditEmployee = (employee) => {
    setForm({
      fullName: employee.fullName,
      phoneNumber: employee.phoneNumber,
      gender: employee.gender,
      yearOfBirth: employee.yearOfBirth,
      hireDate: employee.hireDate,
    });
    setShowForm(true);
    setEditingEmployeeID(employee.employeeID); // Lưu ID nhân viên đang chỉnh sửa
  };

  // Cập nhật thông tin nhân viên
  const handleUpdateEmployee = async (e) => {
    e.preventDefault();
    const token = sessionStorage.getItem('token');
    const headers = { Authorization: `Token ${token}` };
  
    try {
      // Kiểm tra và chuẩn hóa dữ liệu trước khi gửi
      const payload = {
        employeeID: editingEmployeeID,
        fullName: form.fullName.trim(),
        phoneNumber: form.phoneNumber.trim(),
        gender: form.gender,
        yearOfBirth: parseInt(form.yearOfBirth, 10),
        hireDate: form.hireDate, // Đảm bảo định dạng YYYY-MM-DD
        is_active: true, // Thêm trường is_active nếu cần
      };
  
      // Gửi yêu cầu PUT đến API
      await axios.put(`http://localhost:8000/api/auth/employees/${editingEmployeeID}/`, payload, { headers });
  
      // Reset form và cập nhật danh sách nhân viên
      setForm({ fullName: '', phoneNumber: '', gender: '', yearOfBirth: '', hireDate: '' });
      setShowForm(false);
      setEditingEmployeeID(null);
      fetchEmployees();
    } catch (error) {
      console.error('Error updating employee:', error.response?.data || error.message);
    }
  };

  // Xóa nhân viên
  const handleDeleteEmployee = async (employeeID) => {
    const confirmDelete = window.confirm('Bạn có chắc chắn muốn xóa nhân viên này?');
    if (!confirmDelete) return;

    const token = sessionStorage.getItem('token');
    const headers = { Authorization: `Token ${token}` };
    try {
      await axios.delete(`http://localhost:8000/api/auth/employees/${employeeID}/`, { headers });
      fetchEmployees();
    } catch (error) {
      console.error('Error deleting employee:', error.response?.data || error.message);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  return (
    <Container>
      <Sidebar />
      <Content>
        <Toolbar>
        <div>
            <Button onClick={() => { setShowForm(!showForm); setEditingEmployeeID(null); }}>
              <FaUserPlus /> Thêm Nhân viên
            </Button>
          </div>
          <div>
            <SearchInput
              type="text"
              placeholder="Tìm kiếm nhân viên..."
              value={searchKeyword}
              onChange={handleSearch}
            />
            <FaSearch style={{ marginLeft: '0.5rem', color: '#374151' }} />
          </div>
        </Toolbar>

        {showForm && (
          <Form onSubmit={editingEmployeeID ? handleUpdateEmployee : handleAddEmployee}>
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
            </Select>
            <Input
              type="number"
              placeholder="Năm sinh"
              value={form.yearOfBirth}
              onChange={(e) => setForm({ ...form, yearOfBirth: e.target.value })}
              required
            />
            <Input
              type="date"
              placeholder="Ngày vào làm"
              value={form.hireDate}
              onChange={(e) => setForm({ ...form, hireDate: e.target.value })}
              required
            />
            <div style={{ display: 'flex', gap: '1rem' }}>
                  <Button type="submit">{editingEmployeeID ? 'Cập nhật' : 'Thêm nhân viên'}</Button>
                  <Button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      setForm({ fullName: '', phoneNumber: '', gender: '', yearOfBirth: '', hireDate: '' });
                      setEditingEmployeeID(null);
                    }}
                  >
                    Hủy
                  </Button>
                </div>
              </Form>
        )}

        <h2>DANH SÁCH THÔNG TIN NHÂN VIÊN</h2>
        <Table>
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
                <TableCell>{genderMap[employee.gender]}</TableCell>
                <TableCell>{employee.yearOfBirth}</TableCell>
                <TableCell>{employee.hireDate}</TableCell>
                <TableCell>
                  <Button onClick={() => handleEditEmployee(employee)}>Sửa</Button>
                  <Button onClick={() => handleDeleteEmployee(employee.employeeID)}style={{ marginLeft: '0.5rem' }}>Xóa</Button>
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