import React, { useCallback, useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import Sidebar from '../../components/Sidebar';
import {
  Container,
  Content,
  Toolbar,
  Table,
  TableHeader,
  TableCell,
  Button,
  Input,
  Select,
  FilterBar,
  FilterField,
  TableViewport,
  ActionGroup,
  EmptyCell,
} from './PaymentsStyles';
import { applyListFilters, formatVietnamDateTime } from '../../utils/listFilters';

const API_BASE_URL = 'http://127.0.0.1:8000';
const PAYMENTS_UPDATED_EVENT = 'pharmacare:payments-updated';

const paymentStatusLabels = {
  Paid: 'Đã thanh toán',
  Pending: 'Chưa thanh toán',
  'Đã thanh toán': 'Đã thanh toán',
  'Chưa thanh toán': 'Chưa thanh toán',
};

const formatPaymentStatus = (status) => paymentStatusLabels[status] || status || '';
const formatMoney = (value) => Number(value || 0).toLocaleString('vi-VN');
const isPendingStatus = (status) => status === 'Pending' || status === 'Chưa thanh toán';
const authHeaders = () => ({ Authorization: `Token ${sessionStorage.getItem('token')}` });

const ListPayments = () => {
  const [payments, setPayments] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [sortOrder, setSortOrder] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [error, setError] = useState('');

  const fetchPayments = useCallback(async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/medicines/payments/`, {
        headers: authHeaders(),
      });
      setPayments(response.data);
      setError('');
    } catch (fetchError) {
      setError('Không tải được danh sách phiếu nhập. Vui lòng thử lại.');
    }
  }, []);

  const filteredPayments = useMemo(
    () =>
      applyListFilters(payments, {
        keyword: searchKeyword,
        sortOrder,
        selectedDate,
        fromDate,
        toDate,
        getDate: (payment) => payment.paymentTime,
        getSearchText: (payment) =>
          [
            payment.paymentID,
            payment.supplierName,
            payment.employeeName,
            payment.medicineSummary,
            formatPaymentStatus(payment.status),
            formatVietnamDateTime(payment.paymentTime),
          ]
            .filter(Boolean)
            .join(' '),
      }),
    [payments, searchKeyword, sortOrder, selectedDate, fromDate, toDate]
  );

  const handleDeletePayment = async (paymentID) => {
    const confirmDelete = window.confirm('Bạn có chắc chắn muốn xóa phiếu nhập này?');
    if (!confirmDelete) return;

    try {
      await axios.delete(`${API_BASE_URL}/api/medicines/payments/${paymentID}/`, {
        headers: authHeaders(),
      });
      window.localStorage.setItem(PAYMENTS_UPDATED_EVENT, String(Date.now()));
      window.dispatchEvent(new Event(PAYMENTS_UPDATED_EVENT));
      await fetchPayments();
    } catch (deleteError) {
      setError('Không xóa được phiếu nhập. Vui lòng thử lại.');
    }
  };

  const handleMarkAsPaid = async (paymentID) => {
    try {
      await axios.patch(
        `${API_BASE_URL}/api/medicines/payments/${paymentID}/`,
        { status: 'Paid' },
        { headers: authHeaders() }
      );
      window.localStorage.setItem(PAYMENTS_UPDATED_EVENT, String(Date.now()));
      window.dispatchEvent(new Event(PAYMENTS_UPDATED_EVENT));
      await fetchPayments();
    } catch (updateError) {
      setError('Không cập nhật được trạng thái phiếu nhập. Vui lòng thử lại.');
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

  useEffect(() => {
    fetchPayments();

    const refreshPayments = () => fetchPayments();
    const refreshWhenVisible = () => {
      if (document.visibilityState === 'visible') fetchPayments();
    };
    const refreshFromStorage = (event) => {
      if (event.key === PAYMENTS_UPDATED_EVENT) fetchPayments();
    };

    window.addEventListener('focus', refreshPayments);
    window.addEventListener(PAYMENTS_UPDATED_EVENT, refreshPayments);
    window.addEventListener('storage', refreshFromStorage);
    document.addEventListener('visibilitychange', refreshWhenVisible);
    const timer = window.setInterval(refreshPayments, 10000);

    return () => {
      window.removeEventListener('focus', refreshPayments);
      window.removeEventListener(PAYMENTS_UPDATED_EVENT, refreshPayments);
      window.removeEventListener('storage', refreshFromStorage);
      document.removeEventListener('visibilitychange', refreshWhenVisible);
      window.clearInterval(timer);
    };
  }, [fetchPayments]);

  return (
    <Container>
      <Sidebar />
      <Content>
        <Toolbar>
          <div>
            <Input
              type="text"
              placeholder="Tìm kiếm phiếu nhập theo mã, nhà cung cấp..."
              value={searchKeyword}
              onChange={handleSearch}
            />
          </div>
        </Toolbar>

        <FilterBar>
          <FilterField>
            Sắp xếp
            <Select aria-label="Sắp xếp phiếu nhập" value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
              <option value="">Mặc định</option>
              <option value="newest">Mới nhất</option>
              <option value="oldest">Cũ nhất</option>
            </Select>
          </FilterField>
          <FilterField>
            Ngày cụ thể
            <Input
              aria-label="Lọc phiếu nhập theo ngày cụ thể"
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </FilterField>
          <FilterField>
            Từ ngày
            <Input
              aria-label="Lọc phiếu nhập từ ngày"
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
            />
          </FilterField>
          <FilterField>
            Đến ngày
            <Input
              aria-label="Lọc phiếu nhập đến ngày"
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
            />
          </FilterField>
          <Button type="button" onClick={clearFilters}>Bỏ lọc</Button>
        </FilterBar>

        <h2>DANH SÁCH PHIẾU NHẬP</h2>
        {error && <div role="alert" style={{ marginBottom: '1rem', color: '#b91c1c', fontWeight: 700 }}>{error}</div>}
        <TableViewport>
          <Table>
            <colgroup>
              <col style={{ width: '5%' }} />
              <col style={{ width: '11%' }} />
              <col style={{ width: '13%' }} />
              <col style={{ width: '12%' }} />
              <col style={{ width: '12%' }} />
              <col style={{ width: '13%' }} />
              <col style={{ width: '10%' }} />
              <col style={{ width: '10%' }} />
              <col style={{ width: '14%' }} />
            </colgroup>
            <thead>
              <tr>
                <TableHeader>STT</TableHeader>
                <TableHeader>Mã phiếu nhập</TableHeader>
                <TableHeader>Thời gian</TableHeader>
                <TableHeader>Nhà cung cấp</TableHeader>
                <TableHeader>Nhân viên</TableHeader>
                <TableHeader>Thuốc nhập</TableHeader>
                <TableHeader>Tổng tiền</TableHeader>
                <TableHeader>Trạng thái</TableHeader>
                <TableHeader>Hành động</TableHeader>
              </tr>
            </thead>
            <tbody>
              {filteredPayments.map((payment, index) => (
                <tr key={payment.paymentID}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{payment.paymentID}</TableCell>
                  <TableCell>{formatVietnamDateTime(payment.paymentTime)}</TableCell>
                  <TableCell>{payment.supplierName || payment.supplier}</TableCell>
                  <TableCell>{payment.employeeName || payment.employee}</TableCell>
                  <TableCell>{payment.medicineSummary}</TableCell>
                  <TableCell>{formatMoney(payment.totalAmount)} VND</TableCell>
                  <TableCell>{formatPaymentStatus(payment.status)}</TableCell>
                  <TableCell>
                    <ActionGroup>
                      {isPendingStatus(payment.status) && (
                        <Button
                          data-testid={`mark-paid-${payment.paymentID}`}
                          aria-label="Chuyển đã thanh toán"
                          title="Chuyển đã thanh toán"
                          onClick={() => handleMarkAsPaid(payment.paymentID)}
                        >
                          Đã thanh toán
                        </Button>
                      )}
                      <Button onClick={() => handleDeletePayment(payment.paymentID)}>
                        Xóa
                      </Button>
                    </ActionGroup>
                  </TableCell>
                </tr>
              ))}
              {filteredPayments.length === 0 && (
                <tr>
                  <EmptyCell colSpan={9}>Chưa có dữ liệu phù hợp với bộ lọc.</EmptyCell>
                </tr>
              )}
            </tbody>
          </Table>
        </TableViewport>
      </Content>
    </Container>
  );
};

export default ListPayments;
