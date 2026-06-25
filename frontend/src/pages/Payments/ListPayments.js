import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from '../../components/Sidebar';
import {
  Container,
  Content,
  Toolbar,
  Table,
  TableHeader,
  TableCell,
  Button,
  Input,
} from './PaymentsStyles';

const ListPayments = () => {
  const [payments, setPayments] = useState([]);
  const [filteredPayments, setFilteredPayments] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState('');

  const fetchPayments = async () => {
    const token = sessionStorage.getItem('token');
    const headers = { Authorization: `Token ${token}` };
  
    try {
      const response = await axios.get('http://localhost:8000/api/medicines/payment-details/', { headers });
      const paymentDetails = await Promise.all(
        response.data.map(async (detail) => {
          const paymentRes = await axios.get(`http://localhost:8000/api/medicines/payments/${detail.payment}/`, { headers });
          const medicineRes = await axios.get(`http://localhost:8000/api/medicines/medicines/${detail.medicine}/`, { headers });
          const supplierRes = await axios.get(`http://localhost:8000/api/medicines/suppliers/${paymentRes.data.supplier}/`, { headers });
          const employeeRes = await axios.get(`http://localhost:8000/api/auth/employees/${paymentRes.data.employee}/`, { headers });

          return {
            id: detail.id,
            paymentID: detail.payment,
            paymentTime: paymentRes.data.paymentTime, // Lấy thời gian tạo phiếu thu
            medicineName: medicineRes.data.medicineName,
            supplierName: supplierRes.data.supplierName,
            employeeName: employeeRes.data.fullName,
            quantity: detail.quantity,
            unitPrice: detail.unitPrice,
          };
        })
      );
      setPayments(paymentDetails);
      setFilteredPayments(paymentDetails);
    } catch (error) {
      console.error('Error fetching payments:', error.response?.data || error.message);
    }
  };

  const handleDeletePayment = async (paymentID) => {
    const confirmDelete = window.confirm('Bạn có chắc chắn muốn xóa phiếu nhập này?');
    if (!confirmDelete) return;

    const token = sessionStorage.getItem('token');
    const headers = { Authorization: `Token ${token}` };

    try {
      // Use the correct endpoint for deleting payments
      await axios.delete(`http://localhost:8000/api/medicines/payments/${paymentID}/`, { headers });
      fetchPayments(); // Refresh the list after deletion
    } catch (error) {
      console.error('Error deleting payment:', error.response?.data || error.message);
    }
  };

  const handleSearch = (e) => {
    const keyword = e.target.value.toLowerCase().trim();
    setSearchKeyword(keyword);
  
    // Lọc dữ liệu chỉ dựa trên `paymentID`
    const filtered = payments.filter((payment) => {
      const paymentID = payment.paymentID?.toString().toLowerCase() || '';
      return paymentID.includes(keyword);
    });
  
    setFilteredPayments(filtered);
  };
  
  useEffect(() => {
    fetchPayments();
  }, []);

  return (
    <Container>
      <Sidebar />
      <Content style={{ marginLeft: '0', padding: '1rem' }}>
        <Toolbar>
          <div>
            <Input
              type="text"
              placeholder="Tìm kiếm phiếu thu..."
              value={searchKeyword}
              onChange={handleSearch}
            />
          </div>
        </Toolbar>

        <h2>DANH SÁCH PHIẾU THU</h2>
        <Table>
          <thead>
            <tr>
              <TableHeader>STT</TableHeader>
              <TableHeader>Mã phiếu thu</TableHeader>
              <TableHeader>Thời gian</TableHeader> {/* Thêm cột thời gian */}
              <TableHeader>Tên thuốc</TableHeader>
              <TableHeader>Nhà cung cấp</TableHeader>
              <TableHeader>Nhân viên</TableHeader>
              <TableHeader>Số lượng</TableHeader>
              <TableHeader>Đơn giá</TableHeader>
              <TableHeader>Hành động</TableHeader>
            </tr>
          </thead>
          <tbody>
            {filteredPayments.map((payment, index) => (
              <tr key={payment.id}>
                <TableCell>{index + 1}</TableCell>
                <TableCell>{payment.paymentID}</TableCell>
                <TableCell>
                  {payment.paymentTime
                    ? new Date(payment.paymentTime).toLocaleString()
                    : ''}
                </TableCell>
                <TableCell>{payment.medicineName}</TableCell>
                <TableCell>{payment.supplierName}</TableCell>
                <TableCell>{payment.employeeName}</TableCell>
                <TableCell>{payment.quantity}</TableCell>
                <TableCell>{parseFloat(payment.unitPrice).toLocaleString()} VND</TableCell>
                <TableCell>
                  <Button onClick={() => handleDeletePayment(payment.paymentID)}>Xóa</Button>
                </TableCell>
              </tr>
            ))}
          </tbody>
        </Table>
      </Content>
    </Container>
  );
};

export default ListPayments;