import React, { useCallback, useState, useEffect } from 'react';
import axios from 'axios';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import { FaFileExcel, FaFilePdf } from 'react-icons/fa';
import html2canvas from 'html2canvas';
import Sidebar from '../../components/Sidebar';
import { useToast } from '../../components/ToastProvider';
import {
  Container,
  Content,
  SummaryGrid,
  SummaryCard,
  StatsGrid,
  StatCard,
  Table,
  TableHeader,
  TableCell,
  Toolbar,
  Button,
  EmptyCell,
  TableScroll,
} from './ReportStyles';
import { formatVietnamDate, formatVietnamDateTime, toVietnamDate } from '../../utils/listFilters';

const API_BASE = 'http://127.0.0.1:8000';
const REFRESH_INTERVAL_MS = 5000;
const INVOICES_UPDATED_EVENT = 'pharmacare:invoices-updated';
const PAYMENTS_UPDATED_EVENT = 'pharmacare:payments-updated';
const PIE_COLORS = ['#2563eb', '#16a34a', '#f97316', '#dc2626'];

const formatMoney = (value) => Number(value || 0).toLocaleString('vi-VN');
const toNumber = (value) => Number(value || 0);
const invoiceStatusLabels = {
  Paid: 'Đã thanh toán',
  Pending: 'Chưa thanh toán',
  'Đã thanh toán': 'Đã thanh toán',
  'Chưa thanh toán': 'Chưa thanh toán',
};

const formatInvoiceStatus = (status) => invoiceStatusLabels[status] || status || 'Không xác định';

const shortenLabel = (value, maxLength = 18) => {
  const text = String(value || '');
  return text.length > maxLength ? `${text.slice(0, maxLength - 1)}…` : text;
};

const Reports = () => {
  const [salesData, setSalesData] = useState([]);
  const [invoiceRows, setInvoiceRows] = useState([]);
  const [customerStats, setCustomerStats] = useState([]);
  const [medicineStats, setMedicineStats] = useState([]);
  const [statusStats, setStatusStats] = useState([]);
  const [summary, setSummary] = useState({
    revenue: 0,
    invoices: 0,
    soldItems: 0,
    averageInvoice: 0,
  });
  const { showSuccess, showError } = useToast();

  const fetchReportData = useCallback(async () => {
    const token = sessionStorage.getItem('token');
    const headers = { Authorization: `Token ${token}` };

    try {
      const [invoicesResponse, invoiceDetailsResponse, medicinesResponse] = await Promise.all([
        axios.get(`${API_BASE}/api/sales/invoices/`, { headers }),
        axios.get(`${API_BASE}/api/sales/invoice-details/`, { headers }),
        axios.get(`${API_BASE}/api/medicines/medicines/`, { headers }),
      ]);

      const invoices = invoicesResponse.data || [];
      const invoiceDetails = invoiceDetailsResponse.data || [];
      const medicines = medicinesResponse.data || [];
      const medicineByID = new Map(medicines.map((medicine) => [medicine.medicineID, medicine]));

      const invoiceTotals = invoiceDetails.reduce((acc, detail) => {
        const invoiceID = detail.invoice || detail.invoiceID;
        acc[invoiceID] = (acc[invoiceID] || 0) + toNumber(detail.quantity) * toNumber(detail.unitPrice);
        return acc;
      }, {});

      const rows = [...invoices]
        .sort((left, right) => (toVietnamDate(right.invoiceTime)?.getTime() || 0) - (toVietnamDate(left.invoiceTime)?.getTime() || 0))
        .map((invoice) => ({
          invoiceID: invoice.invoiceID,
          invoiceTime: invoice.invoiceTime,
          customerName: invoice.customerName || invoice.customer || 'Khách lẻ',
          status: invoice.status,
          statusLabel: formatInvoiceStatus(invoice.status),
          totalAmount: toNumber(invoice.totalAmount) || invoiceTotals[invoice.invoiceID] || 0,
        }));

      const groupedSales = rows.reduce((acc, invoice) => {
        const date = formatVietnamDate(invoice.invoiceTime);
        acc[date] = (acc[date] || 0) + invoice.totalAmount;
        return acc;
      }, {});

      const chartData = Object.entries(groupedSales).map(([date, total]) => ({ date, total }));

      const groupedCustomers = rows.reduce((acc, invoice) => {
        const customer = invoice.customerName || 'Khách lẻ';
        acc[customer] = (acc[customer] || 0) + 1;
        return acc;
      }, {});

      const customerData = Object.entries(groupedCustomers)
        .map(([customer, totalInvoices]) => ({ customer, customerLabel: shortenLabel(customer), totalInvoices }))
        .sort((left, right) => right.totalInvoices - left.totalInvoices)
        .slice(0, 8);

      const groupedMedicines = invoiceDetails.reduce((acc, detail) => {
        const medicineID = detail.medicine || detail.medicineID;
        if (!medicineID) return acc;
        acc[medicineID] = (acc[medicineID] || 0) + toNumber(detail.quantity);
        return acc;
      }, {});

      const medicineData = Object.entries(groupedMedicines)
        .map(([medicineID, quantity]) => ({
          medicineID,
          medicineName: medicineByID.get(medicineID)?.medicineName || medicineID,
          chartLabel: medicineID,
          quantity,
        }))
        .sort((left, right) => right.quantity - left.quantity)
        .slice(0, 8);

      const revenue = rows.reduce((sum, invoice) => sum + invoice.totalAmount, 0);
      const soldItems = invoiceDetails.reduce((sum, detail) => sum + toNumber(detail.quantity), 0);
      const statusData = Object.entries(
        rows.reduce((acc, invoice) => {
          acc[invoice.statusLabel] = (acc[invoice.statusLabel] || 0) + 1;
          return acc;
        }, {})
      ).map(([name, value]) => ({ name, value }));

      setSalesData(chartData);
      setInvoiceRows(rows);
      setCustomerStats(customerData);
      setMedicineStats(medicineData);
      setStatusStats(statusData);
      setSummary({
        revenue,
        invoices: rows.length,
        soldItems,
        averageInvoice: rows.length ? revenue / rows.length : 0,
      });
    } catch (error) {
      console.error('Error fetching report data:', error.response?.data || error.message);
      showError('Không tải được dữ liệu báo cáo. Vui lòng thử lại.');
    }
  }, [showError]);

  const handleDownloadExcel = () => {
    try {
      const worksheet = XLSX.utils.json_to_sheet(invoiceRows);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Invoices');
      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      const data = new Blob([excelBuffer], { type: 'application/octet-stream' });
      saveAs(data, 'Invoices_Report.xlsx');
      showSuccess('Tải báo cáo Excel thành công.');
    } catch (error) {
      console.error('Error generating Excel file:', error);
      showError('Đã xảy ra lỗi khi tạo file Excel.');
    }
  };

  const handleDownloadPDF = async () => {
    try {
      const reportElement = document.getElementById('report-sections');
      if (!reportElement) {
        throw new Error('Report sections not found');
      }
      const canvas = await html2canvas(reportElement, { scale: 2 });
      const imgData = canvas.toDataURL('image/png');

      const pdf = new jsPDF('landscape', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save('Report.pdf');
      showSuccess('Tải báo cáo PDF thành công.');
    } catch (error) {
      console.error('Error generating PDF:', error);
      showError('Đã xảy ra lỗi khi tạo file PDF.');
    }
  };

  useEffect(() => {
    fetchReportData();

    const refreshWhenVisible = () => {
      if (document.visibilityState === 'visible') fetchReportData();
    };
    const refreshFromStorage = (event) => {
      if ([INVOICES_UPDATED_EVENT, PAYMENTS_UPDATED_EVENT].includes(event.key)) fetchReportData();
    };

    window.addEventListener('focus', fetchReportData);
    window.addEventListener(INVOICES_UPDATED_EVENT, fetchReportData);
    window.addEventListener(PAYMENTS_UPDATED_EVENT, fetchReportData);
    window.addEventListener('storage', refreshFromStorage);
    document.addEventListener('visibilitychange', refreshWhenVisible);
    const timer = window.setInterval(fetchReportData, REFRESH_INTERVAL_MS);

    return () => {
      window.removeEventListener('focus', fetchReportData);
      window.removeEventListener(INVOICES_UPDATED_EVENT, fetchReportData);
      window.removeEventListener(PAYMENTS_UPDATED_EVENT, fetchReportData);
      window.removeEventListener('storage', refreshFromStorage);
      document.removeEventListener('visibilitychange', refreshWhenVisible);
      window.clearInterval(timer);
    };
  }, [fetchReportData]);

  return (
    <Container>
      <Sidebar />
      <Content>
        <Toolbar>
          <h1>Báo Cáo</h1>
          <div>
            <Button onClick={handleDownloadExcel}>
              <FaFileExcel style={{ marginRight: '0.5rem' }} />
              Tải xuống Excel
            </Button>
            <Button onClick={handleDownloadPDF}>
              <FaFilePdf style={{ marginRight: '0.5rem' }} />
              Tải xuống PDF
            </Button>
          </div>
        </Toolbar>
        <div id="report-sections">
          <SummaryGrid>
            <SummaryCard>
              <span>Tổng doanh thu</span>
              <strong>{formatMoney(summary.revenue)} VND</strong>
            </SummaryCard>
            <SummaryCard>
              <span>Số hóa đơn</span>
              <strong>{summary.invoices}</strong>
            </SummaryCard>
            <SummaryCard>
              <span>Thuốc đã bán</span>
              <strong>{summary.soldItems}</strong>
            </SummaryCard>
            <SummaryCard>
              <span>Trung bình hóa đơn</span>
              <strong>{formatMoney(summary.averageInvoice)} VND</strong>
            </SummaryCard>
          </SummaryGrid>

          <StatsGrid>
            <StatCard>
              <h3>Doanh thu theo ngày</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={salesData} margin={{ top: 16, right: 28, bottom: 28, left: 82 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis width={88} tickFormatter={(value) => formatMoney(value)} />
                  <Tooltip formatter={(value) => `${formatMoney(value)} VND`} />
                  <Line type="monotone" dataKey="total" name="Doanh thu" stroke="#2563eb" activeDot={{ r: 8 }} />
                </LineChart>
              </ResponsiveContainer>
            </StatCard>

            <StatCard>
              <h3>Khách hàng theo số hóa đơn</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={customerStats} layout="vertical" margin={{ top: 12, right: 28, bottom: 18, left: 18 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" allowDecimals={false} />
                  <YAxis dataKey="customerLabel" type="category" width={130} interval={0} />
                  <Tooltip labelFormatter={(_, payload) => payload?.[0]?.payload?.customer || ''} />
                  <Bar dataKey="totalInvoices" name="Số hóa đơn" fill="#0ea5e9" />
                </BarChart>
              </ResponsiveContainer>
            </StatCard>

            <StatCard>
              <h3>Cơ cấu trạng thái hóa đơn</h3>
              {statusStats.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart margin={{ top: 8, right: 16, bottom: 18, left: 16 }}>
                    <Pie
                      data={statusStats}
                      dataKey="value"
                      nameKey="name"
                      outerRadius={90}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {statusStats.map((entry, index) => (
                        <Cell key={entry.name} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value} hóa đơn`, 'Số lượng']} />
                    <Legend verticalAlign="bottom" height={36} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <EmptyCell as="p">Chưa có dữ liệu trạng thái hóa đơn.</EmptyCell>
              )}
            </StatCard>

            <StatCard>
              <h3>Thuốc đã bán</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={medicineStats} layout="vertical" margin={{ top: 12, right: 28, bottom: 18, left: 18 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" allowDecimals={false} />
                  <YAxis dataKey="chartLabel" type="category" width={92} interval={0} />
                  <Tooltip labelFormatter={(_, payload) => payload?.[0]?.payload?.medicineName || ''} />
                  <Bar dataKey="quantity" name="Đã bán" fill="#16a34a" />
                </BarChart>
              </ResponsiveContainer>
            </StatCard>

            <StatCard>
              <h3>Chi tiết hóa đơn</h3>
              <TableScroll>
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
                    {invoiceRows.map((invoice) => (
                      <tr key={invoice.invoiceID}>
                        <TableCell>{invoice.invoiceID}</TableCell>
                        <TableCell>{formatVietnamDateTime(invoice.invoiceTime)}</TableCell>
                        <TableCell>{invoice.customerName}</TableCell>
                        <TableCell>{formatMoney(invoice.totalAmount)} VND</TableCell>
                      </tr>
                    ))}
                    {invoiceRows.length === 0 && (
                      <tr>
                        <EmptyCell colSpan={4}>Chưa có dữ liệu hóa đơn.</EmptyCell>
                      </tr>
                    )}
                  </tbody>
                </Table>
              </TableScroll>
            </StatCard>
          </StatsGrid>
        </div>
      </Content>
    </Container>
  );
};

export default Reports;
