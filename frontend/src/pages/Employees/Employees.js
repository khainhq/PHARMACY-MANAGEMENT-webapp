import React, { useCallback, useMemo, useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from '../../components/Sidebar';
import { FaUserPlus, FaSearch } from 'react-icons/fa';
import { useToast } from '../../components/ToastProvider';
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
  TableViewport,
  Form,
  FormField,
  HelpText,
  Input,
  Select,
  ActionGroup,
  EmptyCell,
  genderMap,
  SectionTitle,
  StatusBadge,
} from './EmployeesStyles';
import { applyListFilters, formatVietnamDate } from '../../utils/listFilters';
import {
  EMPLOYEE_DATE_ERROR,
  PHONE_FORMAT_ERROR,
  isValidEmployeeBirthDateAndHireDate,
  isValidVietnamPhoneNumber,
} from '../../utils/validation';

const API_BASE = 'http://127.0.0.1:8000';
const emptyForm = { fullName: '', phoneNumber: '', gender: '', birthDate: '', hireDate: '' };

const toDateInputValue = (value) => (value ? String(value).split('T')[0] : '');
const getBirthDateInputValue = (employee) =>
  toDateInputValue(employee.birthDate) || (employee.yearOfBirth ? `${employee.yearOfBirth}-01-01` : '');
const getBirthYear = (birthDate) => new Date(`${birthDate}T00:00:00`).getFullYear();
const formatEmployeeBirthDate = (employee) =>
  employee.birthDate ? formatVietnamDate(employee.birthDate) : employee.yearOfBirth || '';

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
  const [formError, setFormError] = useState('');
  const { showSuccess, showError } = useToast();

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
            formatEmployeeBirthDate(employee),
            formatVietnamDate(employee.hireDate),
            formatVietnamDate(employee.resignationDate),
            employee.is_active === false ? 'Đã nghỉ việc' : 'Đang làm việc',
          ]
            .filter(Boolean)
            .join(' '),
      }),
    [employees, searchKeyword, sortOrder, selectedDate, fromDate, toDate]
  );

  const activeEmployees = useMemo(
    () => filteredEmployees.filter((employee) => employee.is_active !== false),
    [filteredEmployees]
  );

  const resignedEmployees = useMemo(
    () => filteredEmployees.filter((employee) => employee.is_active === false),
    [filteredEmployees]
  );

  const fetchEmployees = useCallback(async () => {
    try {
      const response = await axios.get(`${API_BASE}/api/auth/employees/`, { headers: authHeaders() });
      setEmployees(response.data);
    } catch (fetchError) {
      showError('Không tải được danh sách nhân viên.');
    }
  }, [authHeaders, showError]);

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
    birthDate: form.birthDate,
    yearOfBirth: getBirthYear(form.birthDate),
    hireDate: form.hireDate,
    is_active: true,
    resignationDate: null,
  });

  const validateForm = () => {
    const errors = [];
    if (!isValidVietnamPhoneNumber(form.phoneNumber)) errors.push(PHONE_FORMAT_ERROR);
    if (!isValidEmployeeBirthDateAndHireDate(form.birthDate, form.hireDate)) errors.push(EMPLOYEE_DATE_ERROR);
    return errors.join(' ');
  };

  const resetForm = () => {
    setForm(emptyForm);
    setShowForm(false);
    setEditingEmployeeID(null);
    setFormError('');
  };

  const handleAddEmployee = async (e) => {
    e.preventDefault();
    setFormError('');
    const validationError = validateForm();
    if (validationError) {
      setFormError(validationError);
      showError(validationError);
      return;
    }

    try {
      await axios.post(`${API_BASE}/api/auth/employees/`, buildPayload(generateEmployeeID()), { headers: authHeaders() });
      resetForm();
      showSuccess('Thêm nhân viên thành công.');
      await fetchEmployees();
    } catch (addError) {
      showError(addError.response?.data?.error || 'Không thêm được nhân viên. Vui lòng kiểm tra số điện thoại hoặc dữ liệu nhập.');
    }
  };

  const handleEditEmployee = (employee) => {
    setFormError('');
    setForm({
      fullName: employee.fullName,
      phoneNumber: employee.phoneNumber,
      gender: employee.gender,
      birthDate: getBirthDateInputValue(employee),
      hireDate: employee.hireDate ? employee.hireDate.split('T')[0] : '',
    });
    setShowForm(true);
    setEditingEmployeeID(employee.employeeID);
  };

  const handleUpdateEmployee = async (e) => {
    e.preventDefault();
    setFormError('');
    const validationError = validateForm();
    if (validationError) {
      setFormError(validationError);
      showError(validationError);
      return;
    }

    try {
      await axios.put(`${API_BASE}/api/auth/employees/${editingEmployeeID}/`, buildPayload(editingEmployeeID), { headers: authHeaders() });
      resetForm();
      showSuccess('Cập nhật nhân viên thành công.');
      await fetchEmployees();
    } catch (updateError) {
      showError(updateError.response?.data?.error || 'Không cập nhật được nhân viên. Vui lòng kiểm tra lại dữ liệu.');
    }
  };

  const handleResignEmployee = async (employeeID) => {
    const confirmResign = window.confirm('Bạn có chắc chắn muốn chuyển nhân viên này sang danh sách nghỉ việc?');
    if (!confirmResign) return;
    setFormError('');
    try {
      await axios.delete(`${API_BASE}/api/auth/employees/${employeeID}/`, { headers: authHeaders() });
      showSuccess('Đã lưu nhân viên vào danh sách nghỉ việc.');
      await fetchEmployees();
    } catch (resignError) {
      showError('Không cập nhật trạng thái nghỉ việc cho nhân viên này.');
    }
  };

  return (
    <Container>
      <Sidebar />
      <Content>
        <Toolbar>
          <div>
            <Button onClick={() => { setShowForm(!showForm); setEditingEmployeeID(null); setFormError(''); }}>
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

        {showForm && (
          <Form onSubmit={editingEmployeeID ? handleUpdateEmployee : handleAddEmployee}>
            <FormField>
              Họ tên
              <Input type="text" placeholder="Họ tên" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} required />
            </FormField>
            <FormField>
              Số điện thoại
              <Input type="text" placeholder="Số điện thoại" value={form.phoneNumber} onChange={(e) => { setForm({ ...form, phoneNumber: e.target.value }); if (formError) setFormError(''); }} required aria-invalid={formError.includes(PHONE_FORMAT_ERROR)} />
            </FormField>
            <FormField>
              Giới tính
              <Select aria-label="Chọn giới tính" value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })} required>
                <option value="">Chọn giới tính</option>
                <option value="Male">Nam</option>
                <option value="Female">Nữ</option>
                <option value="Other">Khác</option>
              </Select>
            </FormField>
            <FormField>
              Ngày tháng năm sinh
              <Input type="date" value={form.birthDate} onChange={(e) => { setForm({ ...form, birthDate: e.target.value }); if (formError) setFormError(''); }} required aria-invalid={formError.includes(EMPLOYEE_DATE_ERROR)} />
            </FormField>
            <FormField>
              Ngày vào làm
              <Input type="date" value={form.hireDate} onChange={(e) => { setForm({ ...form, hireDate: e.target.value }); if (formError) setFormError(''); }} required aria-invalid={formError.includes(EMPLOYEE_DATE_ERROR)} />
              <HelpText>Ngày bắt đầu làm việc tại nhà thuốc.</HelpText>
            </FormField>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <Button type="submit">{editingEmployeeID ? 'Cập nhật' : 'Thêm nhân viên'}</Button>
              <Button type="button" onClick={resetForm}>Hủy</Button>
            </div>
          </Form>
        )}

        <SectionTitle>DANH SÁCH THÔNG TIN NHÂN VIÊN</SectionTitle>
        <TableViewport>
          <Table>
            <colgroup>
              <col style={{ width: '5%' }} />
              <col style={{ width: '11%' }} />
              <col style={{ width: '18%' }} />
              <col style={{ width: '13%' }} />
              <col style={{ width: '8%' }} />
              <col style={{ width: '12%' }} />
              <col style={{ width: '12%' }} />
              <col style={{ width: '9%' }} />
              <col style={{ width: '12%' }} />
            </colgroup>
            <thead>
              <tr>
                <TableHeader>STT</TableHeader>
                <TableHeader>Mã nhân viên</TableHeader>
                <TableHeader>Họ tên</TableHeader>
                <TableHeader>Số điện thoại</TableHeader>
                <TableHeader>Giới tính</TableHeader>
                <TableHeader>Ngày sinh</TableHeader>
                <TableHeader>Ngày vào làm</TableHeader>
                <TableHeader>Trạng thái</TableHeader>
                <TableHeader>Hành động</TableHeader>
              </tr>
            </thead>
            <tbody>
              {activeEmployees.map((employee, index) => (
                <tr key={employee.employeeID}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{employee.employeeID}</TableCell>
                  <TableCell>{employee.fullName}</TableCell>
                  <TableCell>{employee.phoneNumber}</TableCell>
                  <TableCell>{genderMap[employee.gender] || employee.gender}</TableCell>
                  <TableCell>{formatEmployeeBirthDate(employee)}</TableCell>
                  <TableCell>{formatVietnamDate(employee.hireDate)}</TableCell>
                  <TableCell><StatusBadge $active>Đang làm</StatusBadge></TableCell>
                  <TableCell>
                    <ActionGroup>
                      <Button onClick={() => handleEditEmployee(employee)}>Sửa</Button>
                      <Button onClick={() => handleResignEmployee(employee.employeeID)}>Nghỉ việc</Button>
                    </ActionGroup>
                  </TableCell>
                </tr>
              ))}
              {activeEmployees.length === 0 && (
                <tr>
                  <EmptyCell colSpan={9}>Chưa có dữ liệu phù hợp với bộ lọc.</EmptyCell>
                </tr>
              )}
            </tbody>
          </Table>
        </TableViewport>

        <SectionTitle>NHÂN VIÊN ĐÃ NGHỈ VIỆC</SectionTitle>
        <TableViewport>
          <Table>
            <colgroup>
              <col style={{ width: '5%' }} />
              <col style={{ width: '11%' }} />
              <col style={{ width: '19%' }} />
              <col style={{ width: '13%' }} />
              <col style={{ width: '8%' }} />
              <col style={{ width: '12%' }} />
              <col style={{ width: '12%' }} />
              <col style={{ width: '12%' }} />
              <col style={{ width: '8%' }} />
            </colgroup>
            <thead>
              <tr>
                <TableHeader>STT</TableHeader>
                <TableHeader>Mã nhân viên</TableHeader>
                <TableHeader>Họ tên</TableHeader>
                <TableHeader>Số điện thoại</TableHeader>
                <TableHeader>Giới tính</TableHeader>
                <TableHeader>Ngày sinh</TableHeader>
                <TableHeader>Ngày vào làm</TableHeader>
                <TableHeader>Ngày nghỉ việc</TableHeader>
                <TableHeader>Trạng thái</TableHeader>
              </tr>
            </thead>
            <tbody>
              {resignedEmployees.map((employee, index) => (
                <tr key={employee.employeeID}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{employee.employeeID}</TableCell>
                  <TableCell>{employee.fullName}</TableCell>
                  <TableCell>{employee.phoneNumber}</TableCell>
                  <TableCell>{genderMap[employee.gender] || employee.gender}</TableCell>
                  <TableCell>{formatEmployeeBirthDate(employee)}</TableCell>
                  <TableCell>{formatVietnamDate(employee.hireDate)}</TableCell>
                  <TableCell>{formatVietnamDate(employee.resignationDate)}</TableCell>
                  <TableCell><StatusBadge $active={false}>Đã nghỉ</StatusBadge></TableCell>
                </tr>
              ))}
              {resignedEmployees.length === 0 && (
                <tr>
                  <EmptyCell colSpan={9}>Chưa có nhân viên nghỉ việc phù hợp với bộ lọc.</EmptyCell>
                </tr>
              )}
            </tbody>
          </Table>
        </TableViewport>
      </Content>
    </Container>
  );
};

export default Employees;
