import React, { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import { FaMoneyBillWave, FaUserTie, FaPills, FaExclamationTriangle, FaFileInvoiceDollar, FaChartLine } from 'react-icons/fa';
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
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import Sidebar from '../../components/Sidebar';
import {
  Container,
  Content,
  StatsGrid,
  StatCard,
  StatTitle,
  StatValue,
  RevenueReportCard,
  RevenueReportFilters,
  RevenueReportField,
  RevenueReportValue,
  RevenueReportMeta,
  RecentSection,
  SectionGrid,
  ChartGrid,
  InventoryInsightGrid,
  ResponsiveTableWrap,
  Table,
  TableHeader,
  TableCell,
  EmptyState,
  IconWrapper,
  ViewDetail,
} from './DashboardStyles';
import { unitMap } from '../Medicines/MedicinesStyles';
import { formatVietnamDate, formatVietnamDateTime, getVietnamDateKey, toVietnamDate } from '../../utils/listFilters';

const API_BASE = 'http://127.0.0.1:8000';
const REFRESH_INTERVAL_MS = 5000;
const INVOICES_UPDATED_EVENT = 'pharmacare:invoices-updated';
const PAYMENTS_UPDATED_EVENT = 'pharmacare:payments-updated';
const PIE_COLORS = ['#2563eb', '#16a34a', '#f97316', '#dc2626'];
const formatMoney = (value) => Number(value || 0).toLocaleString('vi-VN');
const toNumber = (value) => Number(value || 0);
const toInvoiceOrder = (value) => Number(String(value || '').replace(/\D/g, '')) || 0;
const invoiceStatusLabels = {
  Paid: 'Đã thanh toán',
  Pending: 'Chưa thanh toán',
  'Đã thanh toán': 'Đã thanh toán',
  'Chưa thanh toán': 'Chưa thanh toán',
};

const formatInvoiceStatus = (status) => invoiceStatusLabels[status] || status || 'Không xác định';

const shortenLabel = (value, maxLength = 24) => {
  const text = String(value || '');
  return text.length > maxLength ? `${text.slice(0, maxLength - 1)}…` : text;
};

const buildQuantityMap = (details) => details.reduce((acc, detail) => {
  const medicineID = detail.medicine || detail.medicineID;
  if (!medicineID) return acc;
  acc[medicineID] = (acc[medicineID] || 0) + toNumber(detail.quantity);
  return acc;
}, {});

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalMedicines: 0,
    totalInvoices: 0,
  });
  const [recentInvoices, setRecentInvoices] = useState([]);
  const [expiringMedicines, setExpiringMedicines] = useState([]);
  const [expiredMedicinesCount, setExpiredMedicinesCount] = useState(0);
  const [topSellingMedicines, setTopSellingMedicines] = useState([]);
  const [paymentData, setPaymentData] = useState([]);
  const [invoiceStatusData, setInvoiceStatusData] = useState([]);
  const [employeeCount, setEmployeeCount] = useState(0);
  const [inventoryMovement, setInventoryMovement] = useState([]);
  const [invoiceRevenueRows, setInvoiceRevenueRows] = useState([]);
  const [revenueFilter, setRevenueFilter] = useState({
    selectedDate: '',
    selectedMonth: '',
    fromDate: '',
    toDate: '',
  });

  const fetchStats = useCallback(async () => {
    const token = sessionStorage.getItem('token');
    const headers = { Authorization: `Token ${token}` };

    try {
      const [
        invoiceDetailsRes,
        invoicesRes,
        medicinesRes,
        employeesRes,
        paymentsRes,
        paymentDetailsRes,
      ] = await Promise.all([
        axios.get(`${API_BASE}/api/sales/invoice-details/`, { headers }),
        axios.get(`${API_BASE}/api/sales/invoices/`, { headers }),
        axios.get(`${API_BASE}/api/medicines/medicines/`, { headers }),
        axios.get(`${API_BASE}/api/auth/employees/`, { headers }),
        axios.get(`${API_BASE}/api/medicines/payments/`, { headers }),
        axios.get(`${API_BASE}/api/medicines/payment-details/`, { headers }),
      ]);

      const invoiceDetails = invoiceDetailsRes.data || [];
      const invoices = invoicesRes.data || [];
      const medicines = medicinesRes.data || [];
      const payments = paymentsRes.data || [];
      const paymentDetails = paymentDetailsRes.data || [];
      const medicineByID = new Map(medicines.map((medicine) => [medicine.medicineID, medicine]));
      const paymentByID = new Map(payments.map((payment) => [payment.paymentID, payment]));

      const invoiceTotals = invoiceDetails.reduce((acc, detail) => {
        const invoiceID = detail.invoice || detail.invoiceID;
        acc[invoiceID] = (acc[invoiceID] || 0) + toNumber(detail.quantity) * toNumber(detail.unitPrice);
        return acc;
      }, {});

      const invoiceDisplayMap = new Map(
        [...invoices]
          .sort((left, right) => toInvoiceOrder(left.invoiceID) - toInvoiceOrder(right.invoiceID))
          .map((invoice, index) => [String(invoice.invoiceID), index + 1])
      );

      const recentInvoicesWithTotal = [...invoices]
        .sort((left, right) => (toVietnamDate(right.invoiceTime)?.getTime() || 0) - (toVietnamDate(left.invoiceTime)?.getTime() || 0))
        .slice(0, 5)
        .map((invoice) => ({
          ...invoice,
          displayInvoiceID: invoiceDisplayMap.get(String(invoice.invoiceID)) || invoice.invoiceID,
          totalAmount: toNumber(invoice.totalAmount) || invoiceTotals[invoice.invoiceID] || 0,
        }));

      const revenueRows = invoices.map((invoice) => ({
        invoiceID: invoice.invoiceID,
        invoiceTime: invoice.invoiceTime,
        dateKey: getVietnamDateKey(invoice.invoiceTime),
        totalAmount: toNumber(invoice.totalAmount) || invoiceTotals[invoice.invoiceID] || 0,
      }));

      const now = new Date();
      const expiredMedicines = medicines.filter((medicine) => {
        const expiryDate = toVietnamDate(medicine.expiryDate);
        return expiryDate && expiryDate < now;
      });

      const upcomingExpiringMedicines = medicines
        .filter((medicine) => {
          const expiryDate = toVietnamDate(medicine.expiryDate);
          return expiryDate && expiryDate >= now;
        })
        .sort((left, right) => toVietnamDate(left.expiryDate) - toVietnamDate(right.expiryDate))
        .slice(0, 5);

      const soldQuantityByMedicine = buildQuantityMap(invoiceDetails);
      const importedQuantityByMedicine = buildQuantityMap(paymentDetails);

      const topSelling = Object.entries(soldQuantityByMedicine)
        .map(([medicineID, quantity]) => {
          const medicine = medicineByID.get(medicineID);
          const fullName = medicine?.medicineName || `Không xác định (${medicineID})`;
          return {
            medicineID,
            name: fullName,
            shortName: shortenLabel(fullName),
            chartLabel: medicineID,
            quantity,
            unit: medicine?.unit ? unitMap[medicine.unit] : '',
          };
        })
        .filter((item) => item.quantity > 0)
        .sort((left, right) => right.quantity - left.quantity)
        .slice(0, 8);

      const paymentTotalsByDate = paymentDetails.reduce((acc, detail) => {
        const payment = paymentByID.get(detail.payment || detail.paymentID);
        if (!payment) return acc;

        const paymentDate = formatVietnamDate(payment.paymentTime);
        const cost = toNumber(detail.quantity) * toNumber(detail.unitPrice);
        acc[paymentDate] = (acc[paymentDate] || 0) + cost;
        return acc;
      }, {});

      const paymentChartData = Object.entries(paymentTotalsByDate)
        .map(([date, totalCost]) => ({ date, totalCost }))
        .sort((left, right) => toVietnamDate(left.date) - toVietnamDate(right.date));

      const invoiceStatuses = invoices.reduce((acc, invoice) => {
        const status = formatInvoiceStatus(invoice.status);
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {});

      const invoiceStatusChartData = Object.entries(invoiceStatuses).map(([name, value]) => ({ name, value }));

      const movementData = medicines
        .map((medicine) => {
          const fullName = medicine.medicineName || medicine.medicineID;
          return {
            medicineID: medicine.medicineID,
            name: fullName,
            shortName: shortenLabel(fullName, 22),
            chartLabel: medicine.medicineID,
            stockQuantity: toNumber(medicine.stockQuantity),
            importedQuantity: importedQuantityByMedicine[medicine.medicineID] || 0,
            soldQuantity: soldQuantityByMedicine[medicine.medicineID] || 0,
          };
        })
        .sort((left, right) =>
          (right.importedQuantity + right.soldQuantity + right.stockQuantity) -
          (left.importedQuantity + left.soldQuantity + left.stockQuantity)
        );

      setEmployeeCount(employeesRes.data?.length || 0);
      setRecentInvoices(recentInvoicesWithTotal);
      setExpiredMedicinesCount(expiredMedicines.length);
      setExpiringMedicines(upcomingExpiringMedicines);
      setTopSellingMedicines(topSelling);
      setPaymentData(paymentChartData);
      setInvoiceStatusData(invoiceStatusChartData);
      setInventoryMovement(movementData.slice(0, 10));
      setInvoiceRevenueRows(revenueRows);
      setStats({
        totalRevenue: Object.values(invoiceTotals).reduce((sum, total) => sum + total, 0),
        totalMedicines: medicines.length,
        totalInvoices: invoices.length,
      });
    } catch (error) {
      console.error('Error fetching stats:', error.response?.data || error.message);
    }
  }, []);

  useEffect(() => {
    fetchStats();

    const refreshWhenVisible = () => {
      if (document.visibilityState === 'visible') fetchStats();
    };
    const refreshFromStorage = (event) => {
      if ([INVOICES_UPDATED_EVENT, PAYMENTS_UPDATED_EVENT].includes(event.key)) fetchStats();
    };

    window.addEventListener('focus', fetchStats);
    window.addEventListener(INVOICES_UPDATED_EVENT, fetchStats);
    window.addEventListener(PAYMENTS_UPDATED_EVENT, fetchStats);
    window.addEventListener('storage', refreshFromStorage);
    document.addEventListener('visibilitychange', refreshWhenVisible);
    const timer = window.setInterval(fetchStats, REFRESH_INTERVAL_MS);

    return () => {
      window.removeEventListener('focus', fetchStats);
      window.removeEventListener(INVOICES_UPDATED_EVENT, fetchStats);
      window.removeEventListener(PAYMENTS_UPDATED_EVENT, fetchStats);
      window.removeEventListener('storage', refreshFromStorage);
      document.removeEventListener('visibilitychange', refreshWhenVisible);
      window.clearInterval(timer);
    };
  }, [fetchStats]);

  const clearRevenueFilter = () => {
    setRevenueFilter({
      selectedDate: '',
      selectedMonth: '',
      fromDate: '',
      toDate: '',
    });
  };

  const revenueReport = (() => {
    const { selectedDate, selectedMonth, fromDate, toDate } = revenueFilter;
    let label = 'Toàn bộ doanh thu';
    let rows = invoiceRevenueRows;

    if (selectedDate) {
      rows = invoiceRevenueRows.filter((invoice) => invoice.dateKey === selectedDate);
      label = `Ngày ${formatVietnamDate(selectedDate)}`;
    } else if (selectedMonth) {
      rows = invoiceRevenueRows.filter((invoice) => invoice.dateKey.startsWith(selectedMonth));
      const [year, month] = selectedMonth.split('-');
      label = `Tháng ${month}/${year}`;
    } else if (fromDate || toDate) {
      rows = invoiceRevenueRows.filter((invoice) => {
        if (!invoice.dateKey) return false;
        const afterStart = !fromDate || invoice.dateKey >= fromDate;
        const beforeEnd = !toDate || invoice.dateKey <= toDate;
        return afterStart && beforeEnd;
      });
      const startLabel = fromDate ? formatVietnamDate(fromDate) : 'ngày đầu';
      const endLabel = toDate ? formatVietnamDate(toDate) : 'hiện tại';
      label = `${startLabel} - ${endLabel}`;
    }

    const total = rows.reduce((sum, invoice) => sum + invoice.totalAmount, 0);
    return { label, total, invoiceCount: rows.length };
  })();

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
              <StatTitle>Tổng doanh thu</StatTitle>
              <StatValue>{formatMoney(stats.totalRevenue)} VND</StatValue>
              <ViewDetail>Xem chi tiết hóa đơn &raquo;</ViewDetail>
            </StatCard>
            <StatCard className="info" as={Link} to="/employees">
              <IconWrapper>
                <FaUserTie />
              </IconWrapper>
              <StatTitle>Số nhân viên</StatTitle>
              <StatValue>{employeeCount}</StatValue>
              <ViewDetail>Xem nhân viên &raquo;</ViewDetail>
            </StatCard>
            <StatCard className="danger" as={Link} to="/medicines">
              <IconWrapper>
                <FaExclamationTriangle />
              </IconWrapper>
              <StatTitle>Thuốc đã hết hạn</StatTitle>
              <StatValue>{expiredMedicinesCount}</StatValue>
              <ViewDetail>Xử lý ngay &raquo;</ViewDetail>
            </StatCard>
            <StatCard className="warning" as={Link} to="/medicines">
              <IconWrapper>
                <FaPills />
              </IconWrapper>
              <StatTitle>Số loại thuốc</StatTitle>
              <StatValue>{stats.totalMedicines}</StatValue>
              <ViewDetail>Xem kho thuốc &raquo;</ViewDetail>
            </StatCard>
            <StatCard className="info" as={Link} to="/invoices/list">
              <IconWrapper>
                <FaFileInvoiceDollar />
              </IconWrapper>
              <StatTitle>Số hóa đơn</StatTitle>
              <StatValue>{stats.totalInvoices}</StatValue>
              <ViewDetail>Xem danh sách hóa đơn &raquo;</ViewDetail>
            </StatCard>
            <StatCard className="success">
              <IconWrapper>
                <FaChartLine />
              </IconWrapper>
              <StatTitle>Doanh thu đang lọc</StatTitle>
              <StatValue>{formatMoney(revenueReport.total)} VND</StatValue>
              <ViewDetail>{revenueReport.invoiceCount} hóa đơn</ViewDetail>
            </StatCard>
          </StatsGrid>

          <RevenueReportCard>
            <h2>Báo cáo doanh thu</h2>
            <RevenueReportValue>{formatMoney(revenueReport.total)} đồng</RevenueReportValue>
            <RevenueReportMeta>
              <span>{revenueReport.label}</span>
              <span>{revenueReport.invoiceCount} hóa đơn</span>
            </RevenueReportMeta>
            <RevenueReportFilters>
              <RevenueReportField>
                Ngày cụ thể
                <input
                  type="date"
                  value={revenueFilter.selectedDate}
                  onChange={(event) => setRevenueFilter((current) => ({
                    ...current,
                    selectedDate: event.target.value,
                    selectedMonth: event.target.value ? '' : current.selectedMonth,
                  }))}
                />
              </RevenueReportField>
              <RevenueReportField>
                Tháng và năm
                <input
                  type="month"
                  value={revenueFilter.selectedMonth}
                  onChange={(event) => setRevenueFilter((current) => ({
                    ...current,
                    selectedMonth: event.target.value,
                    selectedDate: event.target.value ? '' : current.selectedDate,
                  }))}
                />
              </RevenueReportField>
              <RevenueReportField>
                Từ ngày
                <input
                  type="date"
                  value={revenueFilter.fromDate}
                  onChange={(event) => setRevenueFilter((current) => ({
                    ...current,
                    fromDate: event.target.value,
                    selectedDate: '',
                    selectedMonth: '',
                  }))}
                />
              </RevenueReportField>
              <RevenueReportField>
                Đến ngày
                <input
                  type="date"
                  value={revenueFilter.toDate}
                  onChange={(event) => setRevenueFilter((current) => ({
                    ...current,
                    toDate: event.target.value,
                    selectedDate: '',
                    selectedMonth: '',
                  }))}
                />
              </RevenueReportField>
              <button type="button" onClick={clearRevenueFilter}>Bỏ lọc</button>
            </RevenueReportFilters>
          </RevenueReportCard>
        <RecentSection>
          <h2>Chi phí nhập thuốc theo thời gian</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={paymentData} margin={{ top: 16, right: 28, bottom: 24, left: 82 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis width={88} tickFormatter={(value) => formatMoney(value)} />
              <Tooltip formatter={(value) => `${formatMoney(value)} VND`} />
              <Line type="monotone" dataKey="totalCost" name="Chi phí nhập" stroke="#0ea5e9" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </RecentSection>

        <RecentSection>
          <SectionGrid>
            <div>
              <h2>Hóa đơn gần đây</h2>
              <ResponsiveTableWrap>
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
                        <TableCell>{invoice.displayInvoiceID}</TableCell>
                        <TableCell>{formatVietnamDateTime(invoice.invoiceTime)}</TableCell>
                        <TableCell>{invoice.customerName || invoice.customer}</TableCell>
                        <TableCell>{formatMoney(invoice.totalAmount)} VND</TableCell>
                      </tr>
                    ))}
                    {recentInvoices.length === 0 && (
                      <tr>
                        <EmptyState colSpan={4}>Chưa có hóa đơn gần đây.</EmptyState>
                      </tr>
                    )}
                  </tbody>
                </Table>
              </ResponsiveTableWrap>
            </div>

            <div>
              <h2>Thuốc gần hết hạn</h2>
              <ResponsiveTableWrap>
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
                        <TableCell>{formatVietnamDate(medicine.expiryDate)}</TableCell>
                        <TableCell>{medicine.stockQuantity}</TableCell>
                      </tr>
                    ))}
                    {expiringMedicines.length === 0 && (
                      <tr>
                        <EmptyState colSpan={4}>Chưa có thuốc gần hết hạn.</EmptyState>
                      </tr>
                    )}
                  </tbody>
                </Table>
              </ResponsiveTableWrap>
            </div>
          </SectionGrid>
        </RecentSection>

        <ChartGrid>
          <RecentSection>
            <h2>Top thuốc bán chạy nhất</h2>
            {topSellingMedicines.length > 0 ? (
              <ResponsiveContainer width="100%" height={340}>
                <BarChart data={topSellingMedicines} layout="vertical" margin={{ top: 12, right: 36, bottom: 18, left: 12 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" allowDecimals={false} />
                  <YAxis dataKey="chartLabel" type="category" width={88} interval={0} />
                  <Tooltip
                    formatter={(value, name, props) => {
                      const unit = props.payload.unit || 'đơn vị';
                      return [`${value} ${unit}`, 'Đã bán'];
                    }}
                    labelFormatter={(_, payload) => payload?.[0]?.payload?.name || ''}
                  />
                  <Bar dataKey="quantity" name="Đã bán" fill="#2563eb" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState as="p">Chưa có dữ liệu thuốc đã bán.</EmptyState>
            )}
          </RecentSection>

          <RecentSection>
            <h2>Cơ cấu trạng thái hóa đơn</h2>
            {invoiceStatusData.length > 0 ? (
              <ResponsiveContainer width="100%" height={340}>
                <PieChart margin={{ top: 8, right: 16, bottom: 18, left: 16 }}>
                  <Pie
                    data={invoiceStatusData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={48}
                    outerRadius={92}
                    labelLine={false}
                    label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                  >
                    {invoiceStatusData.map((entry, index) => (
                      <Cell key={entry.name} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} hóa đơn`, 'Số lượng']} />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState as="p">Chưa có dữ liệu trạng thái hóa đơn.</EmptyState>
            )}
          </RecentSection>
        </ChartGrid>

        <ChartGrid>
          <RecentSection $wide>
            <h2>Số lượng tồn, nhập, bán</h2>
            <InventoryInsightGrid>
              <ResponsiveContainer width="100%" height={380}>
                <BarChart data={inventoryMovement} layout="vertical" margin={{ top: 12, right: 42, bottom: 18, left: 18 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" allowDecimals={false} />
                  <YAxis dataKey="chartLabel" type="category" width={96} interval={0} />
                  <Tooltip labelFormatter={(_, payload) => payload?.[0]?.payload?.name || ''} />
                  <Legend verticalAlign="bottom" height={36} />
                  <Bar dataKey="stockQuantity" name="Tồn kho" fill="#16a34a" />
                  <Bar dataKey="importedQuantity" name="Đã nhập" fill="#0ea5e9" />
                  <Bar dataKey="soldQuantity" name="Đã bán" fill="#f97316" />
                </BarChart>
              </ResponsiveContainer>
            </InventoryInsightGrid>
          </RecentSection>
        </ChartGrid>
      </Content>
    </Container>
  );
};

export default Dashboard;
