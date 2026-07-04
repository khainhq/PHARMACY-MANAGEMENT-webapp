import React, { useCallback, useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import Sidebar from '../../components/Sidebar';
import { useToast } from '../../components/ToastProvider';
import {
  ListContainer,
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
import { applyListFilters, formatVietnamDate } from '../../utils/listFilters';

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
const buildSavedInvoiceImageFileName = (invoice) => `hoa-don-${invoice?.InvoiceID || invoice?.invoiceID || 'chua-luu'}.png`;

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
  const { showSuccess, showError } = useToast();

  const fetchInvoices = useCallback(async () => {
    try {
      const response = await axios.get(`${API_BASE}/api/sales/invoices/`, {
        headers: authHeaders(),
      });
      setInvoices(response.data);
    } catch (fetchError) {
      showError('Không tải được danh sách hóa đơn. Vui lòng thử lại.');
    }
  }, [showError]);

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
            formatVietnamDate(invoice.invoiceTime),
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
        invoiceID,
        customerName: invoiceRes.data.customerName || invoiceRes.data.customer,
        customerPhone: invoiceRes.data.customerPhone,
        address: invoiceRes.data.address,
        paymentMethod: invoiceRes.data.paymentMethod,
        status: invoiceRes.data.status,
        receiptImage: invoiceRes.data.receiptImage || '',
        receiptFileName: invoiceRes.data.receiptFileName || buildSavedInvoiceImageFileName(invoiceRes.data),
        details: medicines,
        totalAmount,
      });
      setIsModalOpen(true);
    } catch (fetchError) {
      showError('Không tải được chi tiết hóa đơn. Vui lòng thử lại.');
    }
  };

  const handlePrintSavedInvoiceImage = () => {
    if (!selectedInvoiceDetails?.receiptImage) return;

    const printWindow = window.open('', '_blank', 'width=480,height=720');
    if (!printWindow) {
      showError('Không mở được cửa sổ in ảnh hóa đơn. Vui lòng cho phép popup và thử lại.');
      return;
    }

    printWindow.document.write(`
      <html>
        <head>
          <title>${selectedInvoiceDetails.receiptFileName || 'hoa-don.png'}</title>
          <style>
            body { margin: 0; padding: 16px; text-align: center; font-family: Arial, sans-serif; }
            img { max-width: 100%; height: auto; }
          </style>
        </head>
        <body>
          <img src="${selectedInvoiceDetails.receiptImage}" alt="Ảnh hóa đơn đã lưu" />
          <script>
            window.onload = function () {
              window.focus();
              window.print();
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleDownloadSavedInvoiceImage = () => {
    if (!selectedInvoiceDetails?.receiptImage) return;

    const downloadLink = document.createElement('a');
    downloadLink.href = selectedInvoiceDetails.receiptImage;
    downloadLink.download = selectedInvoiceDetails.receiptFileName || buildSavedInvoiceImageFileName(selectedInvoiceDetails);
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    showSuccess('Tải ảnh hóa đơn thành công.');
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
      showSuccess('Cập nhật trạng thái hóa đơn thành công.');
    } catch (updateError) {
      showError('Không cập nhật được trạng thái hóa đơn. Vui lòng thử lại.');
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
      showSuccess('Xóa hóa đơn thành công.');
    } catch (deleteError) {
      showError('Không xóa được hóa đơn. Vui lòng thử lại.');
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
    <ListContainer data-testid="main-content">
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
        <TableViewport>
          <Table data-testid="invoices-table" $minWidth="1180px">
            <colgroup>
              <col style={{ width: '120px' }} />
              <col style={{ width: '170px' }} />
              <col style={{ width: '170px' }} />
              <col style={{ width: '190px' }} />
              <col style={{ width: '180px' }} />
              <col style={{ width: '150px' }} />
              <col style={{ width: '260px' }} />
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
                  <TableCell>{formatVietnamDate(invoice.invoiceTime)}</TableCell>
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
              <div
                data-testid="saved-invoice-image-panel"
                style={{
                  marginTop: '1rem',
                  padding: '1rem',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  backgroundColor: '#f8fafc',
                }}
              >
                <h4 style={{ margin: '0 0 0.75rem', color: '#0f172a' }}>Ảnh hóa đơn đã lưu</h4>
                {selectedInvoiceDetails.receiptImage ? (
                  <>
                    <img
                      src={selectedInvoiceDetails.receiptImage}
                      alt={`Ảnh hóa đơn đã lưu ${selectedInvoiceDetails.invoiceID || ''}`.trim()}
                      style={{
                        display: 'block',
                        width: '100%',
                        maxWidth: '360px',
                        maxHeight: '420px',
                        objectFit: 'contain',
                        margin: '0 auto 0.75rem',
                        border: '1px solid #cbd5e1',
                        borderRadius: '6px',
                        backgroundColor: '#ffffff',
                      }}
                    />
                    <p style={{ margin: '0 0 0.75rem', color: '#475569', fontSize: '0.9rem' }}>
                      File: {selectedInvoiceDetails.receiptFileName || buildSavedInvoiceImageFileName(selectedInvoiceDetails)}
                    </p>
                    <ActionGroup>
                      <Button type="button" onClick={handlePrintSavedInvoiceImage}>In lại ảnh hóa đơn</Button>
                      <Button type="button" onClick={handleDownloadSavedInvoiceImage}>Tải ảnh hóa đơn</Button>
                    </ActionGroup>
                  </>
                ) : (
                  <p style={{ margin: 0, color: '#64748b', fontWeight: 700 }}>
                    Chưa có ảnh hóa đơn được lưu cho hóa đơn này.
                  </p>
                )}
              </div>
            </ModalBody>
            <ModalFooter>
              <Button onClick={() => setIsModalOpen(false)}>Đóng</Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}
    </ListContainer>
  );
};

export default ListInvoices;
