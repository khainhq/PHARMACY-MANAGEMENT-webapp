import React, { useCallback, useMemo, useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from '../../components/Sidebar';
import { FaPlus } from 'react-icons/fa';
import { useToast } from '../../components/ToastProvider';
import {
  Container,
  Content,
  Toolbar,
  Table,
  TableHeader,
  TableCell,
  Button,
  SearchInput,
  roleMap,
  TableViewport,
  EmptyCell,
  Form,
  Input,
  Select,
} from './AccountsStyles';

const API_BASE = '';

const Accounts = () => {
  const [accounts, setAccounts] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [filteredAccounts, setFilteredAccounts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    username: '',
    password: '',
    role: '',
    employee: '',
  });
  const [editingAccountID, setEditingAccountID] = useState(null);
  const { showSuccess, showError } = useToast();

  const accountRoleID = (account) => {
    if (typeof account.role === 'object' && account.role !== null) return String(account.role.roleID || '');
    if (account.roleID) return String(account.roleID);
    return String(account.role || '');
  };

  const accountEmployeeID = (account) => {
    if (typeof account.employee === 'object' && account.employee !== null) return account.employee.employeeID || '';
    return account.employee || account.employeeID || '';
  };

  const accountEmployeeName = (account) => {
    if (typeof account.employee === 'object' && account.employee !== null) return account.employee.fullName || account.employee.employeeID || 'N/A';
    const employeeID = accountEmployeeID(account);
    const employee = employees.find((item) => item.employeeID === employeeID);
    return employee ? `${employee.employeeID} - ${employee.fullName || 'Chưa có tên'}` : employeeID || 'N/A';
  };

  const accountRoleName = (account) => {
    if (typeof account.role === 'object' && account.role !== null) return account.role.roleName || roleMap[account.role.roleID] || 'N/A';
    return roleMap[account.role] || roleMap[account.roleID] || account.role || 'N/A';
  };

  const isAccountActive = (account) => account.is_active ?? account.isActive ?? true;

  const usedEmployeeIDs = useMemo(
    () => new Set(accounts.map((account) => accountEmployeeID(account)).filter(Boolean)),
    [accounts]
  );

  const apiErrorMessage = (error) => error.response?.data?.error || 'Có lỗi xảy ra khi lưu tài khoản.';

  const fetchAccounts = useCallback(async () => {
    const token = sessionStorage.getItem('token');
    const headers = { Authorization: `Token ${token}` };

    try {
      const [accountsResponse, employeesResponse] = await Promise.all([
        axios.get(`${API_BASE}/api/auth/accounts/`, { headers }),
        axios.get(`${API_BASE}/api/auth/employees/`, { headers }),
      ]);
      setAccounts(accountsResponse.data);
      setFilteredAccounts(accountsResponse.data);
      setEmployees(employeesResponse.data);
    } catch (error) {
      console.error('Error fetching accounts:', error);
      showError('Không tải được danh sách tài khoản. Vui lòng thử lại.');
    }
  }, [showError]);

  const handleSearch = (e) => {
    const keyword = e.target.value.toLowerCase();
    setSearchKeyword(keyword);

    const filtered = accounts.filter((account) => {
      const roleName = accountRoleName(account);
      return (
        account.username.toLowerCase().includes(keyword) ||
        roleName.toLowerCase().includes(keyword)
      );
    });

    setFilteredAccounts(filtered);
  };

  const handleAddOrUpdateAccount = async (e) => {
    e.preventDefault();
    const token = sessionStorage.getItem('token');
    const headers = { Authorization: `Token ${token}` };

    // Kiểm tra tính hợp lệ của form trước khi gọi API (khắc phục lỗi kiểm thử)
    if (!editingAccountID && (!form.username.trim() || !form.password.trim() || !form.role)) {
      showError('Vui lòng điền đầy đủ tên tài khoản, mật khẩu và quyền.');
      return; // Thoát nếu thiếu dữ liệu khi thêm tài khoản
    }
    if (editingAccountID && (!form.username.trim() || !form.role)) {
      showError('Vui lòng điền đầy đủ tên tài khoản và quyền.');
      return; // Thoát nếu thiếu dữ liệu khi sửa tài khoản
    }

    try {
      const payload = {
        username: form.username.trim(),
        role: Number(form.role),
        employee: form.employee.trim() || null,
        password: form.password,
      };
      if (!form.password.trim()) {
        delete payload.password;
      }
      if (editingAccountID) {
        await axios.patch(`${API_BASE}/api/auth/accounts/${editingAccountID}/`, payload, { headers });
        showSuccess('Cập nhật tài khoản thành công.');
      } else {
        await axios.post(`${API_BASE}/api/auth/accounts/`, payload, { headers });
        showSuccess('Tạo tài khoản thành công.');
      }
      setForm({ username: '', password: '', role: '', employee: '' });
      setShowForm(false);
      setEditingAccountID(null);
      fetchAccounts();
    } catch (error) {
      console.error('Error saving account:', error.response?.data || error.message);
      showError(apiErrorMessage(error));
    }
  };

  const handleEditAccount = (account) => {
    setForm({
      username: account.username,
      password: '',
      role: accountRoleID(account),
      employee: accountEmployeeID(account),
    });
    setShowForm(true);
    setEditingAccountID(account.accountID);
  };

  const handleDeleteAccount = async (accountID) => {
    const confirmDelete = window.confirm('Bạn có chắc chắn muốn xóa tài khoản này?');
    if (!confirmDelete) return;

    const token = sessionStorage.getItem('token');
    const headers = { Authorization: `Token ${token}` };

    try {
      await axios.delete(`${API_BASE}/api/auth/accounts/${accountID}/`, { headers });
      showSuccess('Xóa tài khoản thành công.');
      fetchAccounts();
    } catch (error) {
      console.error('Error deleting account:', error.response?.data || error.message);
      showError('Không xóa được tài khoản. Vui lòng thử lại.');
    }
  };

  const handleToggleAccountStatus = async (accountID, currentStatus) => {
    const token = sessionStorage.getItem('token');
    const headers = { Authorization: `Token ${token}` };

    try {
      await axios.patch(`${API_BASE}/api/auth/accounts/${accountID}/`, { is_active: !currentStatus }, { headers });
      showSuccess(currentStatus ? 'Vô hiệu hóa tài khoản thành công.' : 'Kích hoạt tài khoản thành công.');
      fetchAccounts();
    } catch (error) {
      console.error('Error toggling account status:', error.response?.data || error.message);
      showError('Không cập nhật được trạng thái tài khoản. Vui lòng thử lại.');
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  return (
    <Container>
      <Sidebar />
      <Content>
        <Toolbar>
          <div>
            <Button onClick={() => {
              setShowForm(!showForm);
              setEditingAccountID(null);
            }}>
              <FaPlus /> THÊM
            </Button>
          </div>
          <div>
            <SearchInput
              type="text"
              placeholder="Tìm kiếm tài khoản..."
              value={searchKeyword}
              onChange={handleSearch}
            />
          </div>
        </Toolbar>

        {showForm && (
          <Form onSubmit={handleAddOrUpdateAccount}>
            <Input
              type="text"
              placeholder="Tên tài khoản"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              required
            />
            <Input
              type="password"
              placeholder="Mật khẩu"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required={!editingAccountID}
            />
            <Select
              aria-label="Chọn quyền"
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
              required
            >
              <option value="">Chọn quyền</option>
              <option value="2">Nhân viên bán hàng</option>
              <option value="3">Nhân viên quản lý sản phẩm</option>
            </Select>
            <Select
              aria-label="Chọn nhân viên"
              value={form.employee}
              onChange={(e) => setForm({ ...form, employee: e.target.value })}
            >
              <option value="">Không gắn nhân viên</option>
              {employees.filter((employee) => employee.employeeID).map((employee) => {
                const employeeID = employee.employeeID;
                const isCurrentEmployee = employeeID === form.employee;
                const isUsedByOtherAccount = usedEmployeeIDs.has(employeeID) && !isCurrentEmployee;

                return (
                  <option key={employeeID} value={employeeID} disabled={isUsedByOtherAccount}>
                    {`${employeeID} - ${employee.fullName || 'Chưa có tên'}${isUsedByOtherAccount ? ' (đã có tài khoản)' : ''}`}
                  </option>
                );
              })}
            </Select>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <Button type="submit">{editingAccountID ? 'Cập nhật tài khoản' : 'Tạo tài khoản'}</Button>
              <Button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setForm({ username: '', password: '', role: '', employee: '' });
                  setEditingAccountID(null);
                }}
              >
                Hủy
              </Button>
            </div>
          </Form>
        )}

        <h2>DANH SÁCH TÀI KHOẢN</h2>
        <TableViewport>
        <Table>
          <thead>
            <tr>
              <TableHeader>STT</TableHeader>
              <TableHeader>Tên tài khoản</TableHeader>
              <TableHeader>Nhân viên</TableHeader>
              <TableHeader>Quyền</TableHeader>
              <TableHeader>Trạng thái</TableHeader>
              <TableHeader>Hành động</TableHeader>
            </tr>
          </thead>
          <tbody>
            {filteredAccounts.map((account, index) => (
              <tr key={account.accountID}>
                <TableCell>{index + 1}</TableCell>
                <TableCell>{account.username}</TableCell>
                <TableCell>{accountEmployeeName(account)}</TableCell>
                <TableCell>{accountRoleName(account)}</TableCell>
                <TableCell>{isAccountActive(account) ? 'Hoạt động' : 'Vô hiệu'}</TableCell>
                <TableCell>
                  <Button onClick={() => handleEditAccount(account)}>Sửa</Button>
                  <Button onClick={() => handleDeleteAccount(account.accountID)} style={{ marginLeft: '0.25rem' }}>Xóa</Button>
                  <Button
                    onClick={() => handleToggleAccountStatus(account.accountID, isAccountActive(account))}
                    style={{ marginLeft: '0.25rem' }}
                  >
                    {isAccountActive(account) ? 'Vô hiệu hóa' : 'Kích hoạt'}
                  </Button>
                </TableCell>
              </tr>
            ))}
            {filteredAccounts.length === 0 && (
              <tr>
                <EmptyCell colSpan={6}>Chưa có tài khoản phù hợp để hiển thị.</EmptyCell>
              </tr>
            )}
          </tbody>
        </Table>
        </TableViewport>
      </Content>
    </Container>
  );
};

export default Accounts;
