import React, { useCallback, useMemo, useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from '../../components/Sidebar';
import { FaUserPlus, FaSearch } from 'react-icons/fa';
import {
  Container,
  Content,
  Toolbar,
  FilterBar,
  FilterField,
  Button,
  SearchInput,
  Table,
  TableHeader,
  TableCell,
  Form,
  Input,
  Select,
  ActionGroup,
  EmptyCell,
  genderMap,
} from './EmployeesStyles';
import { applyListFilters, formatVietnamDate } from '../../utils/listFilters';
import {
  EMPLOYEE_DATE_ERROR,
  PHONE_FORMAT_ERROR,
  isValidEmployeeYearAndHireDate,
  isValidVietnamPhoneNumber,
} from '../../utils/validation';

const API_BASE = 'http://127.0.0.1:8000';
const emptyForm = { fullName: '', phoneNumber: '', gender: '', yearOfBirth: '', hireDate: '' };

const Employees = () => {
  const [employees, setEmployees] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [sortOrder, setSortOrder] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [form, setForm] = useState(emptyForm);
  const [showForm, setShowForm] = useState(false);
  const [editingEmployeeID, setEditingEmployeeID] = useState(null);
  const [error, setError] = useState('');

  const authHeaders = useCallback(() => ({ Authorization: `Token ${sessionStorage.getItem('token')}` }), []);

  const filteredEmployees = useMemo(
    () =>
      applyListFilters(employees, {
        keyword: searchKeyword,
        sortOrder,
        selectedDate,
        fromDate,
        toDate,
        getDate: (employee) => employee.hireDate,
        getSearchText: (employee) =>
          [
            employee.employeeID,
            employee.fullName,
            employee.phoneNumber,
            genderMap[employee.gender] || employee.gender,
            employee.yearOfBirth,
            formatVietnamDate(employee.hireDate),
          ]
            .filter(Boolean)
            .join(' '),
      }),
    [employees, searchKeyword, sortOrder, selectedDate, fromDate, toDate]
  );

  const fetchEmployees = useCallback(async () => {
    try {
      const response = await axios.get(`${API_BASE}/api/auth/employees/`, { headers: authHeaders() });
      setEmployees(response.data);
    } catch (fetchError) {
      setError('Không tải được danh sách nhân viên.');
    }
  }, [authHeaders]);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  const handleSearch = (e) => {
    setSearchKeyword(e.target.value);
  };

  const clearFilters = () => {
    setSearchKeyword('');
    setSortOrder('');
    setSelectedDate('');
    setFromDate('');
    setToDate('');
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

  const validateForm = () => {
    const errors = [];
    if (!isValidVietnamPhoneNumber(form.phoneNumber)) errors.push(PHONE_FORMAT_ERROR);
    if (!isValidEmployeeYearAndHireDate(form.yearOfBirth, form.hireDate)) errors.push(EMPLOYEE_DATE_ERROR);
    return errors.join(' ');
  };

  const resetForm = () => {
    setForm(emptyForm);
    setShowForm(false);
    setEditingEmployeeID(null);
  };

  const handleAddEmployee = async (e) => {
    e.preventDefault();
    setError('');
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

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
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

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

        <FilterBar>
          <FilterField>
            Sắp xếp
            <Select aria-label="Sắp xếp nhân viên" value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
              <option value="">Mặc định</option>
              <option value="newest">Mới nhất</option>
              <option value="oldest">Cũ nhất</option>
            </Select>
          </FilterField>
          <FilterField>
            Ngày cụ thể
            <Input
              aria-label="Lọc nhân viên theo ngày cụ thể"
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </FilterField>
          <FilterField>
            Từ ngày
            <Input
              aria-label="Lọc nhân viên từ ngày"
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
            />
          </FilterField>
          <FilterField>
            Đến ngày
            <Input
              aria-label="Lọc nhân viên đến ngày"
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
            />
          </FilterField>
          <Button type="button" onClick={clearFilters}>Bỏ lọc</Button>
        </FilterBar>

        {error && <div role="alert" style={{ marginBottom: '1rem', color: '#b91c1c', fontWeight: 700 }}>{error}</div>}

        {showForm && (
          <Form onSubmit={editingEmployeeID ? handleUpdateEmployee : handleAddEmployee}>
            <Input type="text" placeholder="Họ tên" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} required />
            <Input type="text" placeholder="Số điện thoại" value={form.phoneNumber} onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })} required aria-invalid={error.includes(PHONE_FORMAT_ERROR)} />
            <Select aria-label="Chọn giới tính" value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })} required>
              <option value="">Chọn giới tính</option>
              <option value="Male">Nam</option>
              <option value="Female">Nữ</option>
              <option value="Other">Khác</option>
            </Select>
            <Input type="number" placeholder="Năm sinh" value={form.yearOfBirth} onChange={(e) => setForm({ ...form, yearOfBirth: e.target.value })} required aria-invalid={error.includes(EMPLOYEE_DATE_ERROR)} />
            <Input type="date" placeholder="Ngày vào làm" value={form.hireDate} onChange={(e) => setForm({ ...form, hireDate: e.target.value })} required aria-invalid={error.includes(EMPLOYEE_DATE_ERROR)} />
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
                <TableCell>{formatVietnamDate(employee.hireDate)}</TableCell>
                <TableCell>
                  <ActionGroup>
                    <Button onClick={() => handleEditEmployee(employee)}>Sửa</Button>
                    <Button onClick={() => handleDeleteEmployee(employee.employeeID)}>Xóa</Button>
                  </ActionGroup>
                </TableCell>
              </tr>
            ))}
            {filteredEmployees.length === 0 && (
              <tr>
                <EmptyCell colSpan={8}>Chưa có dữ liệu phù hợp với bộ lọc.</EmptyCell>
              </tr>
            )}
          </tbody>
        </Table>
      </Content>
    </Container>
  );
};

export default Employees;
