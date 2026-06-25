import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from '../../components/Sidebar';
import {
  Container,
  Table,
  TableHeader,
  TableCell,
  Button,
  Input,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  unitMap,
} from './InvoicesStyles';

const ListInvoices = () => {
  const [invoices, setInvoices] = useState([]);
  const [filteredInvoices, setFilteredInvoices] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedInvoiceDetails, setSelectedInvoiceDetails] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch all invoices
  const fetchInvoices = async () => {
    console.log('fetchInvoices started');
    const token = sessionStorage.getItem('token');
    const headers = { Authorization: `Token ${token}` };

    try {
      const response = await axios.get('http://localhost:8000/api/sales/invoices/', { headers });
      console.log('fetchInvoices response:', response.data);
      setInvoices(response.data);
      setFilteredInvoices(response.data);
      console.log('fetchInvoices set state:', { invoices: response.data, filteredInvoices: response.data });
    } catch (error) {
      console.error('Error fetching invoices:', error.response?.data || error.message);
    }
  };

  // Fetch invoice details
  const fetchInvoiceDetails = async (invoiceID) => {
    console.log('fetchInvoiceDetails started for invoiceID:', invoiceID);
    const token = sessionStorage.getItem('token');
    const headers = { Authorization: `Token ${token}` };

    try {
      const invoiceDetailsUrl = `http://localhost:8000/api/sales/invoice-details/?invoice=${invoiceID}`;
      console.log('Calling API:', invoiceDetailsUrl);
      const invoiceDetailsRes = await axios.get(invoiceDetailsUrl, { headers });
      console.log('invoiceDetailsRes:', invoiceDetailsRes.data);

      const filteredDetails = invoiceDetailsRes.data.filter(
        (detail) => detail.invoice === invoiceID
      );
      console.log('filteredDetails:', filteredDetails);

      const invoiceUrl = `http://localhost:8000/api/sales/invoices/${invoiceID}/`;
      console.log('Calling API:', invoiceUrl);
      const invoiceRes = await axios.get(invoiceUrl, { headers });
      console.log('invoiceRes:', invoiceRes.data);
      const customerID = invoiceRes.data.customer;
      const customerUrl = `http://localhost:8000/api/sales/customers/${customerID}/`;
      console.log('Calling API:', customerUrl);
      const customerRes = await axios.get(customerUrl, { headers });
      console.log('customerRes:', customerRes.data);

      const medicines = await Promise.all(
        filteredDetails.map(async (detail) => {
          const medicineUrl = `http://localhost:8000/api/medicines/medicines/${detail.medicine}/`;
          console.log('Calling API:', medicineUrl);
          const medicineRes = await axios.get(medicineUrl, { headers });
          console.log('medicineRes for', detail.medicine, ':', medicineRes.data);
          return {
            medicineName: medicineRes.data.medicineName,
            unit: medicineRes.data.unit,
            quantity: detail.quantity,
            unitPrice: parseFloat(detail.unitPrice),
          };
        })
      );
      console.log('medicines:', medicines);

      const totalAmount = medicines.reduce(
        (sum, medicine) => sum + medicine.unitPrice * medicine.quantity,
        0
      );
      console.log('totalAmount:', totalAmount);

      const details = {
        customerName: customerRes.data.fullName,
        details: medicines,
        totalAmount,
      };
      console.log('setSelectedInvoiceDetails:', details);
      setSelectedInvoiceDetails(details);
      setIsModalOpen(true);
      console.log('setIsModalOpen: true');
    } catch (error) {
      console.error('Error fetching invoice details:', error.response?.data || error.message);
    }
  };

  // Handle search functionality
  const handleSearch = (e) => {
    const keyword = e.target.value.toLowerCase();
    console.log('handleSearch keyword:', keyword);
    setSearchKeyword(keyword);

    const filtered = invoices.filter((invoice) =>
      invoice.invoiceID.toString().toLowerCase().includes(keyword)
    );
    console.log('handleSearch filtered:', filtered);
    setFilteredInvoices(filtered);
  };

  // Handle invoice deletion
  const handleDeleteInvoice = async (invoiceID) => {
    console.log('handleDeleteInvoice for invoiceID:', invoiceID);
    const confirmDelete = window.confirm('Bạn có chắc chắn muốn xóa hóa đơn này?');
    console.log('confirmDelete:', confirmDelete);
    if (!confirmDelete) return;

    const token = sessionStorage.getItem('token');
    const headers = { Authorization: `Token ${token}` };

    try {
      await axios.delete(`http://localhost:8000/api/sales/invoices/${invoiceID}/`, { headers });
      console.log('delete successful, refetching invoices');
      fetchInvoices();
    } catch (error) {
      console.error('Error deleting invoice:', error.response?.data || error.message);
    }
  };

  useEffect(() => {
    console.log('useEffect triggered for fetchInvoices');
    fetchInvoices();
  }, []);

  console.log('Rendering ListInvoices with state:', {
    invoices,
    filteredInvoices,
    searchKeyword,
    selectedInvoiceDetails,
    isModalOpen,
  });

  return (
    <Container data-testid="main-content">
      <Sidebar />
      <div style={{ flex: 1, padding: '1rem' }} data-testid="content-wrapper">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2>Danh sách hóa đơn</h2>
          <Input
            type="text"
            placeholder="Tìm kiếm hóa đơn theo mã..."
            value={searchKeyword}
            onChange={handleSearch}
            style={{ width: '300px' }}
            data-testid="search-input"
          />
        </div>

        <Table data-testid="invoices-table">
          <thead>
            <tr>
              <TableHeader>Mã hóa đơn</TableHeader>
              <TableHeader>Thời gian</TableHeader>
              <TableHeader>Khách hàng</TableHeader>
              <TableHeader>Địa chỉ</TableHeader>
              <TableHeader>Phương thức thanh toán</TableHeader>
              <TableHeader>Trạng thái</TableHeader>
              <TableHeader>Hành động</TableHeader>
            </tr>
          </thead>
          <tbody>
            {filteredInvoices.map((invoice) => (
              <tr key={invoice.invoiceID}>
                <TableCell>{invoice.invoiceID}</TableCell>
                <TableCell>
                  {invoice.invoiceTime
                    ? new Date(invoice.invoiceTime).toLocaleString()
                    : ''}
                </TableCell>
                <TableCell>{invoice.customer}</TableCell>
                <TableCell>{invoice.address}</TableCell>
                <TableCell>{invoice.paymentMethod}</TableCell>
                <TableCell>{invoice.status}</TableCell>
                <TableCell>
                  <Button
                    data-testid={`view-details-${invoice.invoiceID}`}
                    onClick={() => {
                      console.log('View details button clicked for invoiceID:', invoice.invoiceID);
                      fetchInvoiceDetails(invoice.invoiceID);
                      console.log('fetchInvoiceDetails called for invoiceID:', invoice.invoiceID);
                    }}
                  >
                    Xem chi tiết
                  </Button>
                  <Button onClick={() => handleDeleteInvoice(invoice.invoiceID)} style={{ marginLeft: '0.5rem' }}>
                    Xóa
                  </Button>
                </TableCell>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>

      {isModalOpen && selectedInvoiceDetails && (
        <Modal data-testid="invoice-details-modal">
          <ModalContent>
            <ModalHeader>
              <h3>Chi tiết hóa đơn</h3>
            </ModalHeader>
            <ModalBody>
              <p data-testid="customer-name">
                <strong>Khách hàng:</strong> {selectedInvoiceDetails.customerName}
              </p>
              <Table data-testid="details-table">
                <thead>
                  <tr>
                    <TableHeader>Tên thuốc</TableHeader>
                    <TableHeader>Đơn vị tính</TableHeader>
                    <TableHeader>Số lượng</TableHeader>
                    <TableHeader>Đơn giá</TableHeader>
                  </tr>
                </thead>
                <tbody>
                  {selectedInvoiceDetails.details.map((detail, index) => (
                    <tr key={index}>
                      <TableCell>{detail.medicineName}</TableCell>
                      <TableCell>{unitMap[detail.unit] || detail.unit}</TableCell>
                      <TableCell>{detail.quantity}</TableCell>
                      <TableCell>{detail.unitPrice.toLocaleString()} VND</TableCell>
                    </tr>
                  ))}
                </tbody>
              </Table>
              <p data-testid="total-amount" style={{ marginTop: '1rem', fontWeight: 'bold' }}>
                Tổng tiền: {selectedInvoiceDetails.totalAmount.toLocaleString()} VND
              </p>
            </ModalBody>
            <ModalFooter>
              <Button onClick={() => setIsModalOpen(false)}>Đóng</Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}
    </Container>
  );
};

export default ListInvoices;