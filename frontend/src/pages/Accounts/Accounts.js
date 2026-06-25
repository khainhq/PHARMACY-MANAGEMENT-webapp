import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from '../../components/Sidebar';
import { FaPlus } from 'react-icons/fa';
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
  Form,
  Input,
  Select,
} from './AccountsStyles';

const Accounts = () => {
  const [accounts, setAccounts] = useState([]);
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
  // Thêm trạng thái formError để hiển thị thông báo lỗi khi form không hợp lệ (khắc phục lỗi kiểm thử)
  const [formError, setFormError] = useState('');

  const fetchAccounts = async () => {
    const token = sessionStorage.getItem('token');
    const headers = { Authorization: `Token ${token}` };

    try {
      const response = await axios.get('http://localhost:8000/api/auth/accounts/', { headers });
      setAccounts(response.data);
      setFilteredAccounts(response.data);
    } catch (error) {
      console.error('Error fetching accounts:', error);
    }
  };

  const handleSearch = (e) => {
    const keyword = e.target.value.toLowerCase();
    setSearchKeyword(keyword);

    const filtered = accounts.filter((account) => {
      const roleName = typeof account.role === 'string' ? account.role : account.role?.roleName || '';
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
    if (!editingAccountID && (!form.username || !form.password || !form.role)) {
      setFormError('Vui lòng điền đầy đủ tên tài khoản, mật khẩu và quyền.');
      return; // Thoát nếu thiếu dữ liệu khi thêm tài khoản
    }
    if (editingAccountID && (!form.username || !form.role)) {
      setFormError('Vui lòng điền đầy đủ tên tài khoản và quyền.');
      return; // Thoát nếu thiếu dữ liệu khi sửa tài khoản
    }

    try {
      const payload = { ...form };
      if (!form.password) {
        delete payload.password;
      }
      if (editingAccountID) {
        await axios.put(`http://localhost:8000/api/auth/accounts/${editingAccountID}/`, payload, { headers });
      } else {
        await axios.post('http://localhost:8000/api/auth/accounts/', payload, { headers });
      }
      setForm({ username: '', password: '', role: '', employee: '' });
      setShowForm(false);
      setEditingAccountID(null);
      // Xóa thông báo lỗi sau khi lưu thành công
      setFormError('');
      fetchAccounts();
    } catch (error) {
      console.error('Error saving account:', error.response?.data || error.message);
      // Hiển thị lỗi API trong giao diện
      setFormError('Có lỗi xảy ra khi lưu tài khoản.');
    }
  };

  const handleEditAccount = (account) => {
    setForm({
      username: account.username,
      password: '',
      role: account.role,
      employee: account.employee,
    });
    setShowForm(true);
    setEditingAccountID(account.accountID);
    // Xóa thông báo lỗi khi mở form sửa
    setFormError('');
  };

  const handleDeleteAccount = async (accountID) => {
    const confirmDelete = window.confirm('Bạn có chắc chắn muốn xóa tài khoản này?');
    if (!confirmDelete) return;

    const token = sessionStorage.getItem('token');
    const headers = { Authorization: `Token ${token}` };

    try {
      await axios.delete(`http://localhost:8000/api/auth/accounts/${accountID}/`, { headers });
      fetchAccounts();
    } catch (error) {
      console.error('Error deleting account:', error.response?.data || error.message);
    }
  };

  const handleToggleAccountStatus = async (accountID, currentStatus) => {
    const token = sessionStorage.getItem('token');
    const headers = { Authorization: `Token ${token}` };

    try {
      await axios.patch(`http://localhost:8000/api/auth/accounts/${accountID}/`, { is_active: !currentStatus }, { headers });
      fetchAccounts();
    } catch (error) {
      console.error('Error toggling account status:', error.response?.data || error.message);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  return (
    <Container>
      <Sidebar />
      <Content>
        <Toolbar>
          <div>
            <Button onClick={() => {
              setShowForm(!showForm);
              setEditingAccountID(null);
              // Xóa thông báo lỗi khi mở form thêm
              setFormError('');
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
            {/* Hiển thị thông báo lỗi nếu form không hợp lệ hoặc API thất bại */}
            {formError && <div style={{ color: 'red', marginBottom: '1rem' }}>{formError}</div>}
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
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
              required
            >
              <option value="">Chọn quyền</option>
              <option value="2">Nhân viên bán hàng</option>
              <option value="3">Nhân viên quản lý sản phẩm</option>
            </Select>
            <Input
              type="text"
              placeholder="Nhân viên (ID)"
              value={form.employee}
              onChange={(e) => setForm({ ...form, employee: e.target.value })}
            />
            <div style={{ display: 'flex', gap: '1rem' }}>
              <Button type="submit">{editingAccountID ? 'Cập nhật tài khoản' : 'Tạo tài khoản'}</Button>
              <Button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setForm({ username: '', password: '', role: '', employee: '' });
                  setEditingAccountID(null);
                  // Xóa thông báo lỗi khi hủy form
                  setFormError('');
                }}
              >
                Hủy
              </Button>
            </div>
          </Form>
        )}

        <h2>DANH SÁCH TÀI KHOẢN</h2>
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
                <TableCell>{account.employee || 'N/A'}</TableCell>
                <TableCell>{roleMap[account.role]}</TableCell>
                <TableCell>{account.is_active ? 'Hoạt động' : 'Vô hiệu'}</TableCell>
                <TableCell>
                  <Button onClick={() => handleEditAccount(account)}>Sửa</Button>
                  <Button onClick={() => handleDeleteAccount(account.accountID)} style={{ marginLeft: '0.25rem' }}>Xóa</Button>
                  <Button
                    onClick={() => handleToggleAccountStatus(account.accountID, account.is_active)}
                    style={{ marginLeft: '0.25rem' }}
                  >
                    {account.is_active ? 'Vô hiệu hóa' : 'Kích hoạt'}
                  </Button>
                </TableCell>
              </tr>
            ))}
          </tbody>
        </Table>
      </Content>
    </Container>
  );
};

export default Accounts;