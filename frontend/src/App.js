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
import Reports from './pages/Reports/Reports';
import CreateInvoice from './pages/Invoices/CreateInvoice';
import ListInvoices from './pages/Invoices/ListInvoices';
import SalesDashboard from './pages/Dashboard/SalesDashboard';
import ProductDashboard from './pages/Dashboard/ProductManagerDashboard';
import CreatePayment from './pages/Payments/CreatePayment';
import ListPayments from './pages/Payments/ListPayments';
import Customers from './pages/Customers/Customers';
import Chatbot from './components/Chatbot';
import { ToastProvider } from './components/ToastProvider';

function AppRoutes() {
  const location = useLocation();
  const hideChatbot = ['/login', '/admin-login'].includes(location.pathname);
  const isLandingPage = location.pathname === '/';

  return (
    <>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/admin-login" element={<Login />} />
        <Route path="/contact" element={<ContactUs />} />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/sales-dashboard" element={<SalesDashboard />} />
        <Route path="/product-manager-dashboard" element={<ProductDashboard />} />
        <Route path="/employees" element={<Employees />} />
        <Route path="/medicines" element={<Medicines />} />
        <Route path="/suppliers" element={<Suppliers />} />
        <Route path="/accounts" element={<Accounts />} />
        <Route path="/payments/create" element={<CreatePayment />} />
        <Route path="/payments/list" element={<ListPayments />} />
        <Route path="/customers" element={<Customers />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/invoices/create" element={<CreateInvoice />} />
        <Route path="/invoices/list" element={<ListInvoices />} />
      </Routes>
      {!hideChatbot && <Chatbot withContactDock={isLandingPage} />}
    </>
  );
}

function App() {
  return (
    <Router>
      <ToastProvider>
        <AppRoutes />
      </ToastProvider>
    </Router>
  );
}

export default App;
