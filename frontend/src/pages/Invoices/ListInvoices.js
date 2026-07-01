import React, { useCallback, useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import Sidebar from '../../components/Sidebar';
import {
  Container,
  Table,
  TableHeader,
  TableCell,
  Button,
  Input,
  Select,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ListContent,
  ListToolbar,
  FilterBar,
  FilterField,
  TableViewport,
  ActionGroup,
  EmptyCell,
  unitMap,
} from './InvoicesStyles';
import { applyListFilters, formatVietnamDateTime } from '../../utils/listFilters';

const API_BASE = 'http://127.0.0.1:8000';
const INVOICES_UPDATED_EVENT = 'pharmacare:invoices-updated';

const invoiceStatusLabels = {
  Paid: 'Đã thanh toán',
  Pending: 'Chưa thanh toán',
  'Đã thanh toán': 'Đã thanh toán',
  'Chưa thanh toán': 'Chưa thanh toán',
};

const formatInvoiceStatus = (status) => invoiceStatusLabels[status] || status || '';
const formatMoney = (value) => Number(value || 0).toLocaleString('vi-VN');
const isPendingStatus = (status) => status === 'Pending' || status === 'Chưa thanh toán';

const authHeaders = () => ({ Authorization: `Token ${sessionStorage.getItem('token')}` });

const ListInvoices = () => {
  const [invoices, setInvoices] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [sortOrder, setSortOrder] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [selectedInvoiceDetails, setSelectedInvoiceDetails] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState('');

  const fetchInvoices = useCallback(async () => {
    try {
      const response = await axios.get(`${API_BASE}/api/sales/invoices/`, {
        headers: authHeaders(),
      });
      setInvoices(response.data);
      setError('');
    } catch (fetchError) {
      setError('Không tải được danh sách hóa đơn. Vui lòng thử lại.');
    }
  }, []);

  const filteredInvoices = useMemo(
    () =>
      applyListFilters(invoices, {
        keyword: searchKeyword,
        sortOrder,
        selectedDate,
        fromDate,
        toDate,
        getDate: (invoice) => invoice.invoiceTime,
        getSearchText: (invoice) =>
          [
            invoice.invoiceID,
            invoice.customerName,
            invoice.customer,
            invoice.customerPhone,
            invoice.address,
            invoice.paymentMethod,
            formatInvoiceStatus(invoice.status),
            formatVietnamDateTime(invoice.invoiceTime),
          ]
            .filter(Boolean)
            .join(' '),
      }),
    [invoices, searchKeyword, sortOrder, selectedDate, fromDate, toDate]
  );

  const fetchInvoiceDetails = async (invoiceID) => {
    try {
      const headers = authHeaders();
      const [invoiceDetailsRes, invoiceRes] = await Promise.all([
        axios.get(`${API_BASE}/api/sales/invoice-details/?invoice=${invoiceID}`, { headers }),
        axios.get(`${API_BASE}/api/sales/invoices/${invoiceID}/`, { headers }),
      ]);

      const filteredDetails = invoiceDetailsRes.data.filter(
        (detail) => Number(detail.invoice) === Number(invoiceID)
      );

      const medicines = await Promise.all(
        filteredDetails.map(async (detail) => {
          const medicineRes = await axios.get(
            `${API_BASE}/api/medicines/medicines/${detail.medicine}/`,
            { headers }
          );

          return {
            medicineName: medicineRes.data.medicineName,
            unit: medicineRes.data.unit,
            quantity: detail.quantity,
            unitPrice: Number(detail.unitPrice),
          };
        })
      );

      const totalAmount = medicines.reduce(
        (sum, medicine) => sum + medicine.unitPrice * medicine.quantity,
        0
      );

      setSelectedInvoiceDetails({
        customerName: invoiceRes.data.customerName || invoiceRes.data.customer,
        status: invoiceRes.data.status,
        details: medicines,
        totalAmount,
      });
      setIsModalOpen(true);
      setError('');
    } catch (fetchError) {
      setError('Không tải được chi tiết hóa đơn. Vui lòng thử lại.');
    }
  };

  const handleSearch = (e) => {
    setSearchKeyword(e.target.value);
  };

  const clearFilters = () => {
    setSearchKeyword('');
    setSortOrder('');
    setSelectedDate('');
    setFromDate('');
    setToDate('');
  };

  const handleMarkAsPaid = async (invoiceID) => {
    try {
      await axios.patch(
        `${API_BASE}/api/sales/invoices/${invoiceID}/`,
        { status: 'Paid' },
        { headers: authHeaders() }
      );
      window.localStorage.setItem(INVOICES_UPDATED_EVENT, String(Date.now()));
      window.dispatchEvent(new Event(INVOICES_UPDATED_EVENT));
      await fetchInvoices();
    } catch (updateError) {
      setError('Không cập nhật được trạng thái hóa đơn. Vui lòng thử lại.');
    }
  };

  const handleDeleteInvoice = async (invoiceID) => {
    const confirmDelete = window.confirm('Bạn có chắc chắn muốn xóa hóa đơn này?');
    if (!confirmDelete) return;

    try {
      await axios.delete(`${API_BASE}/api/sales/invoices/${invoiceID}/`, {
        headers: authHeaders(),
      });
      window.localStorage.setItem(INVOICES_UPDATED_EVENT, String(Date.now()));
      window.dispatchEvent(new Event(INVOICES_UPDATED_EVENT));
      await fetchInvoices();
    } catch (deleteError) {
      setError('Không xóa được hóa đơn. Vui lòng thử lại.');
    }
  };

  useEffect(() => {
    fetchInvoices();

    const refreshInvoices = () => fetchInvoices();
    const refreshWhenVisible = () => {
      if (document.visibilityState === 'visible') fetchInvoices();
    };
    const refreshFromStorage = (event) => {
      if (event.key === INVOICES_UPDATED_EVENT) fetchInvoices();
    };

    window.addEventListener('focus', refreshInvoices);
    window.addEventListener(INVOICES_UPDATED_EVENT, refreshInvoices);
    window.addEventListener('storage', refreshFromStorage);
    document.addEventListener('visibilitychange', refreshWhenVisible);
    const timer = window.setInterval(refreshInvoices, 10000);

    return () => {
      window.removeEventListener('focus', refreshInvoices);
      window.removeEventListener(INVOICES_UPDATED_EVENT, refreshInvoices);
      window.removeEventListener('storage', refreshFromStorage);
      document.removeEventListener('visibilitychange', refreshWhenVisible);
      window.clearInterval(timer);
    };
  }, [fetchInvoices]);

  return (
    <Container data-testid="main-content">
      <Sidebar />
      <ListContent data-testid="content-wrapper">
        <ListToolbar>
          <h2>Danh sách hóa đơn</h2>
          <Input
            type="text"
            placeholder="Tìm kiếm hóa đơn theo mã, khách hàng..."
            value={searchKeyword}
            onChange={handleSearch}
            data-testid="search-input"
          />
        </ListToolbar>

        <FilterBar>
          <FilterField>
            Sắp xếp
            <Select aria-label="Sắp xếp hóa đơn" value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
              <option value="">Mặc định</option>
              <option value="newest">Mới nhất</option>
              <option value="oldest">Cũ nhất</option>
            </Select>
          </FilterField>
          <FilterField>
            Ngày cụ thể
            <Input
              aria-label="Lọc hóa đơn theo ngày cụ thể"
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </FilterField>
          <FilterField>
            Từ ngày
            <Input
              aria-label="Lọc hóa đơn từ ngày"
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
            />
          </FilterField>
          <FilterField>
            Đến ngày
            <Input
              aria-label="Lọc hóa đơn đến ngày"
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
            />
          </FilterField>
          <Button type="button" onClick={clearFilters}>Bỏ lọc</Button>
        </FilterBar>

        {error && <div role="alert" style={{ marginBottom: '1rem', color: '#b91c1c', fontWeight: 700 }}>{error}</div>}

        <TableViewport>
          <Table data-testid="invoices-table">
            <colgroup>
              <col style={{ width: '8%' }} />
              <col style={{ width: '14%' }} />
              <col style={{ width: '13%' }} />
              <col style={{ width: '14%' }} />
              <col style={{ width: '15%' }} />
              <col style={{ width: '12%' }} />
              <col style={{ width: '24%' }} />
            </colgroup>
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
                  <TableCell>{formatVietnamDateTime(invoice.invoiceTime)}</TableCell>
                  <TableCell>{invoice.customerName || invoice.customer}</TableCell>
                  <TableCell>{invoice.address}</TableCell>
                  <TableCell>{invoice.paymentMethod}</TableCell>
                  <TableCell>{formatInvoiceStatus(invoice.status)}</TableCell>
                  <TableCell>
                    <ActionGroup>
                      <Button
                        data-testid={`view-details-${invoice.invoiceID}`}
                        onClick={() => fetchInvoiceDetails(invoice.invoiceID)}
                      >
                        Xem chi tiết
                      </Button>
                      {isPendingStatus(invoice.status) && (
                        <Button
                          data-testid={`mark-paid-${invoice.invoiceID}`}
                          aria-label="Chuyển đã thanh toán"
                          title="Chuyển đã thanh toán"
                          onClick={() => handleMarkAsPaid(invoice.invoiceID)}
                        >
                          Đã thanh toán
                        </Button>
                      )}
                      <Button onClick={() => handleDeleteInvoice(invoice.invoiceID)}>
                        Xóa
                      </Button>
                    </ActionGroup>
                  </TableCell>
                </tr>
              ))}
              {filteredInvoices.length === 0 && (
                <tr>
                  <EmptyCell colSpan={7}>Chưa có dữ liệu phù hợp với bộ lọc.</EmptyCell>
                </tr>
              )}
            </tbody>
          </Table>
        </TableViewport>
      </ListContent>

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
              <p>
                <strong>Trạng thái:</strong> {formatInvoiceStatus(selectedInvoiceDetails.status)}
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
                  {selectedInvoiceDetails.details.map((detail) => (
                    <tr key={detail.medicineName}>
                      <TableCell>{detail.medicineName}</TableCell>
                      <TableCell>{unitMap[detail.unit] || detail.unit}</TableCell>
                      <TableCell>{detail.quantity}</TableCell>
                      <TableCell>{formatMoney(detail.unitPrice)} VND</TableCell>
                    </tr>
                  ))}
                </tbody>
              </Table>
              <p data-testid="total-amount" style={{ marginTop: '1rem', fontWeight: 'bold' }}>
                Tổng tiền: {formatMoney(selectedInvoiceDetails.totalAmount)} VND
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
