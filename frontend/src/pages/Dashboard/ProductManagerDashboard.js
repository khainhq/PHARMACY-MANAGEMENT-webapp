import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { FaPills, FaTruck, FaExclamationTriangle } from 'react-icons/fa';
import Sidebar from '../../components/Sidebar';
import {
  Container,
  Content,
  StatsGrid,
  StatCard,
  StatTitle,
  StatValue,
  ChartContainer,
  Table,
  TableHeader,
  TableCell,
  IconWrapper,
  ViewDetail,
} from './DashboardStyles';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid, XAxis, YAxis, Legend } from 'recharts';

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#8dd1e1'];

const catalogMap = {
  ZXC311QWE: 'Hệ tim mạch & tạo máu',
  ZXC321QWE: 'Hệ tiêu hóa & gan mật',
  ZAQ321QWE: 'Thuốc giảm đau',
};

const originMap = {
  XCVSDF123: 'Việt Nam',
  XCVSDF122: 'Mỹ',
  XCVSDF125: 'Pháp',
  XCVSDF124: 'Nhật Bản',
};

const unitMap = {
  CVBDF123T: 'Viên',
  CV123GERT: 'Chai',
  CVB123ERT: 'Hộp',
  CVB141ERT: 'Gói',
  CV1223ERT: 'Vỉ',
};

const ProductManagerDashboard = () => {
  const [stats, setStats] = useState({
    totalMedicines: 0,
    totalSuppliers: 0,
    expiredMedicinesCount: 0,
  });
  const [categoryStats, setCategoryStats] = useState([]);
  const [originStats, setOriginStats] = useState([]);
  const [unitStats, setUnitStats] = useState([]);
  const [lowStockMedicines, setLowStockMedicines] = useState([]);
  const [paymentData, setPaymentData] = useState([]);

  const fetchStats = async () => {
    console.log('fetchStats started');
    const token = sessionStorage.getItem('token');
    const headers = { Authorization: `Token ${token}` };

    try {
      const [medicinesRes, suppliersRes, paymentsRes, paymentDetailsRes] = await Promise.all([
        axios.get('http://localhost:8000/api/medicines/medicines/', { headers }),
        axios.get('http://localhost:8000/api/medicines/suppliers/', { headers }),
        axios.get('http://localhost:8000/api/medicines/payments/', { headers }),
        axios.get('http://localhost:8000/api/medicines/payment-details/', { headers }),
      ]);
      console.log('API calls completed', {
        medicines: medicinesRes.data,
        suppliers: suppliersRes.data,
        payments: paymentsRes.data,
        paymentDetails: paymentDetailsRes.data,
      });

      const expiredMedicines = medicinesRes.data.filter(
        (medicine) => new Date(medicine.expiryDate) < new Date()
      );

      const categoryStats = medicinesRes.data.reduce((acc, medicine) => {
        const name = catalogMap[medicine.catalog] || 'Không xác định';
        acc[name] = (acc[name] || 0) + 1;
        return acc;
      }, {});

      const originStats = medicinesRes.data.reduce((acc, medicine) => {
        const name = originMap[medicine.origin] || 'Không xác định';
        acc[name] = (acc[name] || 0) + 1;
        return acc;
      }, {});

      const unitStats = medicinesRes.data.reduce((acc, medicine) => {
        const name = unitMap[medicine.unit] || 'Không xác định';
        acc[name] = (acc[name] || 0) + 1;
        return acc;
      }, {});

      const lowStockMedicines = medicinesRes.data
        .sort((a, b) => a.stockQuantity - b.stockQuantity)
        .slice(0, 5);

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

      console.log('Setting state with stats:', {
        totalMedicines: medicinesRes.data.length,
        totalSuppliers: suppliersRes.data.length,
        expiredMedicinesCount: expiredMedicines.length,
      });
      setStats({
        totalMedicines: medicinesRes.data.length,
        totalSuppliers: suppliersRes.data.length,
        expiredMedicinesCount: expiredMedicines.length,
      });
      setCategoryStats(Object.entries(categoryStats).map(([key, value]) => ({ name: key, value })));
      setOriginStats(Object.entries(originStats).map(([key, value]) => ({ name: key, value })));
      setUnitStats(Object.entries(unitStats).map(([key, value]) => ({ name: key, value })));
      setLowStockMedicines(lowStockMedicines);
      setPaymentData(paymentData);
      console.log('State updated');
    } catch (error) {
      console.log('fetchStats error:', error);
      console.error('Error fetching stats:', error.response?.data || error.message);
    }
  };

  useEffect(() => {
    console.log('useEffect triggered');
    fetchStats();
  }, []);

  console.log('Rendering ProductManagerDashboard with stats:', stats);
  return (
    <Container>
      <Sidebar />
      <Content>
        <h1>Dashboard</h1>
        <StatsGrid>
          <StatCard className="info" as={Link} to="/medicines">
            <IconWrapper>
              <FaPills />
            </IconWrapper>
            <StatTitle>Số loại thuốc trong kho</StatTitle>
            <StatValue data-testid="medicines-value">{stats.totalMedicines}</StatValue>
            <ViewDetail>View Medicines &raquo;</ViewDetail>
          </StatCard>
          <StatCard className="success" as={Link} to="/suppliers">
            <IconWrapper>
              <FaTruck />
            </IconWrapper>
            <StatTitle>Số lượng nhà cung cấp</StatTitle>
            <StatValue data-testid="suppliers-value">{stats.totalSuppliers}</StatValue>
            <ViewDetail>View Suppliers &raquo;</ViewDetail>
          </StatCard>
          <StatCard className="danger" as={Link} to="/medicines">
            <IconWrapper>
              <FaExclamationTriangle />
            </IconWrapper>
            <StatTitle>Thuốc hết hạn</StatTitle>
            <StatValue data-testid="expired-value">{stats.expiredMedicinesCount}</StatValue>
            <ViewDetail>Resolve Now &raquo;</ViewDetail>
          </StatCard>
        </StatsGrid>
        <h2>Thống kê thuốc</h2>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem' }}>
          <ChartContainer style={{ flex: 1 }}>
            <h3 data-testid="category-chart-title">Danh mục</h3>
            <ResponsiveContainer width="100%" height={355}>
              <PieChart>
                <Pie
                  data={categoryStats}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  label
                >
                  {categoryStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend layout="horizontal" verticalAlign="bottom" align="center" />
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>
          <ChartContainer style={{ flex: 1 }}>
            <h3 data-testid="origin-chart-title">Xuất xứ</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={originStats}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#82ca9d"
                  label
                >
                  {originStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>
          <ChartContainer style={{ flex: 1 }}>
            <h3 data-testid="unit-chart-title">Đơn vị tính</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={unitStats}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#ffc658"
                  label
                >
                  {unitStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={50} />
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>
        <h2>Chi phí nhập thuốc theo thời gian</h2>
        <ChartContainer>
          <ResponsiveContainer width="95%" height={300}>
            <LineChart data={paymentData} margin={{ left: 50 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis tickFormatter={(value) => value.toLocaleString()} />
              <Tooltip formatter={(value) => value.toLocaleString()} />
              <Line type="monotone" dataKey="totalCost" stroke="#8884d8" />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
        <h2>Thuốc tồn kho thấp</h2>
        <Table>
          <thead><tr><TableHeader>Mã thuốc</TableHeader><TableHeader>Tên thuốc</TableHeader><TableHeader>Số lượng</TableHeader><TableHeader>Đơn vị tính</TableHeader></tr></thead>
          <tbody>
            {lowStockMedicines.map((medicine) => (
              <tr key={medicine.medicineID}>
                <TableCell data-testid={`medicine-table-id-${medicine.medicineID}`}>{medicine.medicineID}</TableCell>
                <TableCell data-testid={`medicine-table-name-${medicine.medicineID}`}>{medicine.medicineName}</TableCell>
                <TableCell data-testid={`medicine-table-quantity-${medicine.medicineID}`}>{medicine.stockQuantity}</TableCell>
                <TableCell data-testid={`medicine-table-unit-${medicine.medicineID}`}>{unitMap[medicine.unit]}</TableCell>
              </tr>
            ))}
          </tbody>
        </Table>
      </Content>
    </Container>
  );
};

export default ProductManagerDashboard;