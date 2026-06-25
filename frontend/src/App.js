import React from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import ContactUs from './pages/ContactUs';
import AboutUs from './pages/AboutUs';
import Dashboard from './pages/Dashboard/Dashboard';
import Employees from './pages/Employees/Employees';
import Medicines from './pages/Medicines/Medicines';
import Suppliers from './pages/Suppliers/Suppliers';
import Accounts from './pages/Accounts/Accounts';
// import Orders from './pages/Orders/Orders';
import Reports from './pages/Reports/Reports';
import CreateInvoice from './pages/Invoices/CreateInvoice'; // Import trang con CreateInvoice
import ListInvoices from './pages/Invoices/ListInvoices'; // Import trang con ListInvoices
import SalesDashboard from './pages/Dashboard/SalesDashboard'; // Import trang con SalesDashboard
import ProductDashboard from './pages/Dashboard/ProductManagerDashboard'; // Import trang con ProductManagerDashboard
import CreatePayment from './pages/Payments/CreatePayment'; // Import trang CreatePayment
import ListPayments from './pages/Payments/ListPayments'; // Import trang ListPayments
import Customers from './pages/Customers/Customers'; // Import trang Customers

import Chatbot from './components/Chatbot';

function AppRoutes() {
  const location = useLocation();
  // Ẩn Chatbot trên trang login và landing page
  const hideChatbot = location.pathname === '/login' || location.pathname === '/';

  return (
    <>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/contact" element={<ContactUs />} />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/sales-dashboard" element={<SalesDashboard />} />
        <Route path="/product-manager-dashboard" element={<ProductDashboard />} />
        {/* Định nghĩa các route cho các trang khác */}
        <Route path="/employees" element={<Employees />} />
        <Route path="/medicines" element={<Medicines />} />
        <Route path="/suppliers" element={<Suppliers />} />
        <Route path="/accounts" element={<Accounts />} />
        <Route path="/payments/create" element={<CreatePayment />} />
        <Route path="/payments/list" element={<ListPayments />} />
        <Route path="/customers" element={<Customers />} />
        {/* <Route path="/orders" element={<Orders />} /> */}
        <Route path="/reports" element={<Reports />} />
        {/* Định nghĩa các route cho hóa đơn */}
        <Route path="/invoices/create" element={<CreateInvoice />} />
        <Route path="/invoices/list" element={<ListInvoices />} />
      </Routes>
      {!hideChatbot && <Chatbot />}
    </>
  );
}

function App() {
  return (
    <Router>
      <AppRoutes />
      {/* Các route khác có thể được thêm vào đây */}
    </Router>
  );
}

export default App;