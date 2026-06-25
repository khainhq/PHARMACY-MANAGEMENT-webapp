import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from '../../components/Sidebar';
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
} from './OrdersStyles';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [employees, setEmployees] = useState([]); // Danh sách nhân viên
  const [customers, setCustomers] = useState([]); // Danh sách khách hàng
  const [searchKeyword, setSearchKeyword] = useState('');
  const [form, setForm] = useState({
    employee: '',
    customer: '',
    totalAmount: '',
  });
  const [showForm, setShowForm] = useState(false);
  const [editingOrderID, setEditingOrderID] = useState(null);

  const fetchOrders = async () => {
    const token = sessionStorage.getItem('token');
    const headers = { Authorization: `Token ${token}` };

    try {
      const response = await axios.get('http://localhost:8000/api/sales/orders/', { headers });
      setOrders(response.data);
      setFilteredOrders(response.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const fetchEmployees = async () => {
    const token = sessionStorage.getItem('token');
    const headers = { Authorization: `Token ${token}` };

    try {
      const response = await axios.get('http://localhost:8000/api/auth/employees/', { headers });
      setEmployees(response.data);
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };

  const fetchCustomers = async () => {
    const token = sessionStorage.getItem('token');
    const headers = { Authorization: `Token ${token}` };

    try {
      const response = await axios.get('http://localhost:8000/api/sales/customers/', { headers });
      setCustomers(response.data);
    } catch (error) {
      console.error('Error fetching customers:', error);
    }
  };

  const handleSearch = (e) => {
    const keyword = e.target.value.toLowerCase();
    setSearchKeyword(keyword);

    const filtered = orders.filter((order) =>
      order.orderID.toLowerCase().includes(keyword) ||
      order.customer.toLowerCase().includes(keyword) ||
      order.employee.toLowerCase().includes(keyword)
    );

    setFilteredOrders(filtered);
  };

  const generateOrderID = () => {
    const prefix = Math.random().toString(36).substring(2, 4).toUpperCase(); // Hai ký tự chữ cái
    const randomPart = Math.random().toString(36).substring(2, 9).toUpperCase(); // Tạo chuỗi ngẫu nhiên
    return `${prefix}${randomPart}`;
  };

  const handleAddOrUpdateOrder = async (e) => {
    e.preventDefault();
    const token = sessionStorage.getItem('token');
    const headers = { Authorization: `Token ${token}` };

    try {
      const payload = {
        ...form,
        totalAmount: parseFloat(form.totalAmount).toFixed(2), // Đảm bảo định dạng số thập phân
      };

      if (editingOrderID) {
        // Update order
        payload.orderID = editingOrderID;
        await axios.put(
          `http://localhost:8000/api/sales/orders/${editingOrderID}/`,
          payload,
          { headers }
        );
      } else {
        // Add new order
        payload.orderID = generateOrderID();
        await axios.post('http://localhost:8000/api/sales/orders/', payload, { headers });
      }

      setForm({ employee: '', customer: '', totalAmount: '' });
      setShowForm(false);
      setEditingOrderID(null);
      fetchOrders();
    } catch (error) {
      console.error('Error saving order:', error.response?.data || error.message);
    }
  };

  const handleEditOrder = (order) => {
    setForm({
      employee: order.employee,
      customer: order.customer,
      totalAmount: order.totalAmount,
    });
    setShowForm(true);
    setEditingOrderID(order.orderID);
  };

  const handleDeleteOrder = async (orderID) => {
    const confirmDelete = window.confirm('Bạn có chắc chắn muốn xóa đơn đặt hàng này?');
    if (!confirmDelete) return;

    const token = sessionStorage.getItem('token');
    const headers = { Authorization: `Token ${token}` };

    try {
      await axios.delete(`http://localhost:8000/api/sales/orders/${orderID}/`, { headers });
      fetchOrders();
    } catch (error) {
      console.error('Error deleting order:', error.response?.data || error.message);
    }
  };

  useEffect(() => {
    fetchOrders();
    fetchEmployees();
    fetchCustomers();
  }, []);

  return (
    <Container>
      <Sidebar />
      <Content>
        <Toolbar>
          <div>
            <Button onClick={() => { setShowForm(!showForm); setEditingOrderID(null); }}>THÊM</Button>
          </div>
          <div>
            <Input
              type="text"
              placeholder="Tìm kiếm đơn đặt hàng..."
              value={searchKeyword}
              onChange={handleSearch}
            />
          </div>
        </Toolbar>

        {showForm && (
          <Form onSubmit={handleAddOrUpdateOrder}>
            <Select
              value={form.employee}
              onChange={(e) => setForm({ ...form, employee: e.target.value })}
              required
            >
              <option value="">Chọn nhân viên</option>
              {employees.map((employee) => (
                <option key={employee.employeeID} value={employee.employeeID}>
                  {employee.fullName}
                </option>
              ))}
            </Select>
            <Select
              value={form.customer}
              onChange={(e) => setForm({ ...form, customer: e.target.value })}
              required
            >
              <option value="">Chọn khách hàng</option>
              {customers.map((customer) => (
                <option key={customer.customerID} value={customer.customerID}>
                  {customer.fullName}
                </option>
              ))}
            </Select>
            <Input
              type="number"
              placeholder="Tổng tiền"
              value={form.totalAmount}
              onChange={(e) => setForm({ ...form, totalAmount: e.target.value })}
              required
            />
            <Button type="submit">{editingOrderID ? 'Cập nhật' : 'Thêm mới'}</Button>
          </Form>
        )}

        <h2>DANH SÁCH ĐƠN ĐẶT HÀNG</h2>
        <Table>
          <thead>
            <tr>
              <TableHeader>STT</TableHeader>
              <TableHeader>Mã đơn hàng</TableHeader>
              <TableHeader>Thời gian đặt</TableHeader>
              <TableHeader>Nhân viên</TableHeader>
              <TableHeader>Khách hàng</TableHeader>
              <TableHeader>Tổng tiền</TableHeader>
              <TableHeader>Hành động</TableHeader>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map((order, index) => (
              <tr key={order.orderID}>
                <TableCell>{index + 1}</TableCell>
                <TableCell>{order.orderID}</TableCell>
                <TableCell>{new Date(order.orderTime).toLocaleString()}</TableCell>
                <TableCell>{order.employee}</TableCell>
                <TableCell>{order.customer}</TableCell>
                <TableCell>{parseFloat(order.totalAmount).toLocaleString()} VND</TableCell>
                <TableCell>
                  <Button onClick={() => handleEditOrder(order)}>Sửa</Button>
                  <Button onClick={() => handleDeleteOrder(order.orderID)}>Xóa</Button>
                </TableCell>
              </tr>
            ))}
          </tbody>
        </Table>
      </Content>
    </Container>
  );
};

export default Orders;