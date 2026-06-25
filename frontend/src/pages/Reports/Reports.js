import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import { FaFileExcel, FaFilePdf } from 'react-icons/fa';
import html2canvas from 'html2canvas';
import Sidebar from '../../components/Sidebar';
import {
  Container,
  Content,
  StatsGrid,
  StatCard,
  Table,
  TableHeader,
  TableCell,
  Toolbar,
  Button,
} from './ReportStyles';

const Reports = () => {
  const [salesData, setSalesData] = useState([]);
  const [orders, setOrders] = useState([]);
  const [customerStats, setCustomerStats] = useState([]);

  const fetchReportData = async () => {
    const token = sessionStorage.getItem('token');
    const headers = { Authorization: `Token ${token}` };

    try {
      const salesResponse = await axios.get('http://localhost:8000/api/sales/orders/', { headers });
      const formattedSalesData = salesResponse.data.map((order) => ({
        date: new Date(order.orderTime).toLocaleDateString('en-GB'),
        total: parseFloat(order.totalAmount),
      }));

      const groupedSales = formattedSalesData.reduce((acc, curr) => {
        acc[curr.date] = (acc[curr.date] || 0) + curr.total;
        return acc;
      }, {});

      const chartData = Object.keys(groupedSales).map((date) => ({
        date,
        total: groupedSales[date],
      }));

      setSalesData(chartData);
      setOrders(salesResponse.data);

      const groupedCustomers = salesResponse.data.reduce((acc, curr) => {
        acc[curr.customer] = (acc[curr.customer] || 0) + 1;
        return acc;
      }, {});

      const customerData = Object.keys(groupedCustomers).map((customer) => ({
        customer,
        totalOrders: groupedCustomers[customer],
      }));

      setCustomerStats(customerData);
    } catch (error) {
      console.error('Error fetching report data:', error.response?.data || error.message);
    }
  };

  const handleDownloadExcel = () => {
    try {
      const worksheet = XLSX.utils.json_to_sheet(orders);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Orders');
      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      const data = new Blob([excelBuffer], { type: 'application/octet-stream' });
      saveAs(data, 'Orders_Report.xlsx');
    } catch (error) {
      console.error('Error generating Excel file:', error);
      alert('Đã xảy ra lỗi khi tạo file Excel.');
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
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Đã xảy ra lỗi khi tạo file PDF.');
    }
  };

  useEffect(() => {
    fetchReportData();
  }, []);

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
          <StatsGrid>
            <StatCard style={{ gridColumn: '1 / 2', gridRow: '1 / 2' }}>
              <h3>Sales Made</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis tickMargin={-3} />
                  <Tooltip />
                  <Line type="monotone" dataKey="total" stroke="#8884d8" activeDot={{ r: 8 }} />
                </LineChart>
              </ResponsiveContainer>
            </StatCard>
  
            <StatCard style={{ gridColumn: '1 / 2', gridRow: '2 / 3' }}>
              <h3>Customer Statistics</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={customerStats}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="customer" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="totalOrders" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </StatCard>
  
            <StatCard style={{ gridColumn: '2 / 3', gridRow: '1 / 3' }}>
              <h3>Order Details</h3>
              <Table>
                <thead>
                  <tr>
                    <TableHeader>Order ID</TableHeader>
                    <TableHeader>Date & Time</TableHeader>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.orderID}>
                      <TableCell>{order.orderID}</TableCell>
                      <TableCell>{new Date(order.orderTime).toLocaleString()}</TableCell>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </StatCard>
          </StatsGrid>
        </div>
      </Content>
    </Container>
  );
};

export default Reports;