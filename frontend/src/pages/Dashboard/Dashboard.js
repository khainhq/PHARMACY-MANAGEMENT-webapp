import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FaMoneyBillWave, FaUserTie, FaPills, FaExclamationTriangle } from 'react-icons/fa'; // Import icons
import { Link } from 'react-router-dom';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';
import Sidebar from '../../components/Sidebar';
import {
  Container,
  Content,
  StatsGrid,
  StatCard,
  StatTitle,
  StatValue,
  RecentSection,
  Table,
  TableHeader,
  TableCell,
  IconWrapper,
  ViewDetail,
} from './DashboardStyles';
import { unitMap } from '../Medicines/MedicinesStyles';

const Dashboard = () => {
  const [stats, setStats] = useState({});
  const [recentInvoices, setRecentInvoices] = useState([]);
  const [expiringMedicines, setExpiringMedicines] = useState([]);
  const [expiredMedicinesCount, setExpiredMedicinesCount] = useState(0);
  const [topSellingMedicines, setTopSellingMedicines] = useState([]);
  const [paymentData, setPaymentData] = useState([]);
  const [employeeCount, setEmployeeCount] = useState(0); // Thêm số lượng nhân viên

  const fetchStats = async () => {
    const token = sessionStorage.getItem('token');
    const headers = { Authorization: `Token ${token}` };

    try {
      // Lấy dữ liệu từ API
      const [
        invoiceDetailsRes,
        invoicesRes,
        medicinesRes,
        employeesRes,
        paymentsRes,
        paymentDetailsRes,
      ] = await Promise.all([
        axios.get('http://127.0.0.1:8000/api/sales/invoice-details/', { headers }),
        axios.get('http://127.0.0.1:8000/api/sales/invoices/', { headers }),
        axios.get('http://127.0.0.1:8000/api/medicines/medicines/', { headers }),
        axios.get('http://127.0.0.1:8000/api/auth/employees/', { headers }), // Lấy danh sách nhân viên
        axios.get('http://127.0.0.1:8000/api/medicines/payments/', { headers }),
        axios.get('http://127.0.0.1:8000/api/medicines/payment-details/', { headers }),
      ]);

      // Cập nhật số lượng nhân viên
      setEmployeeCount(employeesRes.data.length);

      // Tính tổng thu nhập từ chi tiết hóa đơn
      const totalRevenue = invoiceDetailsRes.data.reduce(
        (sum, detail) => sum + detail.quantity * parseFloat(detail.unitPrice || 0),
        0
      );

      // Tính tổng tiền cho từng hóa đơn
      const invoiceTotals = invoiceDetailsRes.data.reduce((acc, detail) => {
        const invoiceID = detail.invoice;
        const total = detail.quantity * parseFloat(detail.unitPrice || 0);
        acc[invoiceID] = (acc[invoiceID] || 0) + total;
        return acc;
      }, {});

      // Gắn tổng tiền vào danh sách hóa đơn gần đây
      const recentInvoicesWithTotal = invoicesRes.data.slice(-5).reverse().map((invoice) => ({
        ...invoice,
        totalAmount: invoiceTotals[invoice.invoiceID] || 0,
      }));

      setRecentInvoices(recentInvoicesWithTotal);

      // Tính số lượng thuốc đã hết hạn
      const expiredMedicines = medicinesRes.data.filter(
        (medicine) => new Date(medicine.expiryDate) < new Date()
      );

      // Lọc 5 thuốc gần hết hạn nhất (không bao gồm thuốc đã hết hạn)
      const upcomingExpiringMedicines = medicinesRes.data
        .filter((medicine) => new Date(medicine.expiryDate) >= new Date())
        .sort((a, b) => new Date(a.expiryDate) - new Date(b.expiryDate))
        .slice(0, 5);

      setExpiredMedicinesCount(expiredMedicines.length);
      setExpiringMedicines(upcomingExpiringMedicines);

      // Lấy top thuốc bán chạy nhất
      const medicineSales = invoiceDetailsRes.data.reduce((acc, detail) => {
        const medicineID = detail.medicine;
        acc[medicineID] = (acc[medicineID] || 0) + detail.quantity;
        return acc;
      }, {});

      // const medicineMap = medicinesRes.data.reduce((acc, medicine) => {
      //   acc[medicine.medicineID] = medicine.medicineName;
      //   return acc;
      // }, {});

      const topSelling = Object.entries(medicineSales)
        .map(([medicineID, quantity]) => {
          const medicine = medicinesRes.data.find((m) => m.medicineID === medicineID);
          return {
            name: medicine?.medicineName || `Không xác định (ID: ${medicineID})`,
            quantity,
            unit: medicine?.unit ? unitMap[medicine.unit] : 'Không xác định', // Gắn đơn vị tính từ unitMap
          };
        })
        .sort((a, b) => b.quantity - a.quantity)
        .slice(0, 5);

      setTopSellingMedicines(topSelling);

      // Dữ liệu chi phí nhập thuốc theo thời gian
      const paymentDetails = paymentDetailsRes.data.reduce((acc, detail) => {
        const payment = paymentsRes.data.find((p) => p.paymentID === detail.payment);
        if (!payment) return acc;

        const paymentDate = new Date(payment.paymentTime).toLocaleDateString();
        const cost = detail.quantity * parseFloat(detail.unitPrice);

        acc[paymentDate] = (acc[paymentDate] || 0) + cost;
        return acc;
      }, {});

      const paymentData = Object.entries(paymentDetails).map(([date, totalCost]) => ({
        date,
        totalCost,
      }));

      setPaymentData(paymentData);

      setStats({
        totalRevenue,
        totalMedicines: medicinesRes.data?.length || 0,
      });
    } catch (error) {
      console.error('Error fetching stats:', error.response?.data || error.message);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <Container>
      <Sidebar />
      <Content>
        <h1>Dashboard</h1>
        <StatsGrid>
          <StatCard className="success" as={Link} to="/invoices/list">
            <IconWrapper>
              <FaMoneyBillWave />
            </IconWrapper>
            <StatTitle>Tổng thu nhập</StatTitle>
            <StatValue>{stats.totalRevenue?.toLocaleString()} VND</StatValue>
            <ViewDetail>View Detailed Report &raquo;</ViewDetail>
          </StatCard>
          <StatCard className="info" as={Link} to="/employees">
            <IconWrapper>
              <FaUserTie />
            </IconWrapper>
            <StatTitle>Số nhân viên</StatTitle>
            <StatValue>{employeeCount}</StatValue>
            <ViewDetail>View Detailed Employees &raquo;</ViewDetail>
          </StatCard>
          <StatCard className="danger" as={Link} to="/medicines">
            <IconWrapper>
              <FaExclamationTriangle />
            </IconWrapper>
            <StatTitle>Thuốc đã hết hạn</StatTitle>
            <StatValue>{expiredMedicinesCount}</StatValue>
            <ViewDetail>Resolve Now &raquo;</ViewDetail>
          </StatCard>
          <StatCard className="warning" as={Link} to="/medicines">
            <IconWrapper>
              <FaPills />
            </IconWrapper>
            <StatTitle>Số loại thuốc</StatTitle>
            <StatValue>{stats.totalMedicines}</StatValue>
            <ViewDetail>Visit Inventory &raquo;</ViewDetail>
          </StatCard>
        </StatsGrid>

        {/* Biểu đồ chi phí nhập thuốc */}
        <RecentSection>
          <h2>Chi phí nhập thuốc theo thời gian</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart
              data={paymentData}
              margin={{ left: 50 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis tickFormatter={(value) => value.toLocaleString()} />
              <Tooltip formatter={(value) => value.toLocaleString()} />
              <Line type="monotone" dataKey="totalCost" stroke="#8884d8" />
            </LineChart>
          </ResponsiveContainer>
        </RecentSection>

        <RecentSection>
          <div style={{ display: 'flex', gap: '2rem' }}>
            <div style={{ flex: 1 }}>
              <h2>Hóa đơn gần đây</h2>
              <Table>
                <thead>
                  <tr>
                    <TableHeader>Mã hóa đơn</TableHeader>
                    <TableHeader>Thời gian</TableHeader>
                    <TableHeader>Khách hàng</TableHeader>
                    <TableHeader>Tổng tiền</TableHeader>
                  </tr>
                </thead>
                <tbody>
                  {recentInvoices.map((invoice) => (
                    <tr key={invoice.invoiceID}>
                      <TableCell>{invoice.invoiceID}</TableCell>
                      <TableCell>{new Date(invoice.invoiceTime).toLocaleString()}</TableCell>
                      <TableCell>{invoice.customer}</TableCell>
                      <TableCell>
                        {invoice.totalAmount
                          ? parseFloat(invoice.totalAmount).toLocaleString()
                          : '0'}{' '}
                        VND
                      </TableCell>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>

            <div style={{ flex: 1 }}>
              <h2>Thuốc gần hết hạn</h2>
              <Table>
                <thead>
                  <tr>
                    <TableHeader>Mã thuốc</TableHeader>
                    <TableHeader>Tên thuốc</TableHeader>
                    <TableHeader>Hạn sử dụng</TableHeader>
                    <TableHeader>Số lượng</TableHeader>
                  </tr>
                </thead>
                <tbody>
                  {expiringMedicines.map((medicine) => (
                    <tr key={medicine.medicineID}>
                      <TableCell>{medicine.medicineID}</TableCell>
                      <TableCell>{medicine.medicineName}</TableCell>
                      <TableCell>{new Date(medicine.expiryDate).toLocaleDateString()}</TableCell>
                      <TableCell>{medicine.stockQuantity}</TableCell>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          </div>
        </RecentSection>

        <RecentSection>
          <h2>Top thuốc bán chạy nhất</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topSellingMedicines}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip
                formatter={(value, name, props) => {
                  const unit = props.payload.unit || 'Không xác định'; // Lấy đơn vị tính từ dữ liệu
                  return [`${value} (${unit})`, 'Số lượng'];
                }}
              />
              <Bar dataKey="quantity" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </RecentSection>
      </Content>
    </Container>
  );
};

export default Dashboard;