import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from '../../components/Sidebar';
import { useToast } from '../../components/ToastProvider';
import { FaTimes } from 'react-icons/fa';
import {
  Container,
  LeftSection,
  RightSection,
  MedicineDetails,
  ClosePanelButton,
  MedicineList,
  PaymentDetailsTable,
  PaymentInfo,
  Table,
  TableHeader,
  TableCell,
  Button,
  Input,
  Select,
  CenteredButton,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from './PaymentsStyles';

const API_BASE_URL = '';
const PAYMENTS_UPDATED_EVENT = 'pharmacare:payments-updated';

const formatMoney = (value) =>
  Number(value || 0).toLocaleString('vi-VN', {
    maximumFractionDigits: 0,
  });

const formatDateTime = (value) => {
  if (!value) return '';

  return new Intl.DateTimeFormat('vi-VN', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(value));
};

const getErrorMessage = (error, fallback) =>
  error.response?.data?.error ||
  error.response?.data?.message ||
  error.message ||
  fallback;

const paymentStatusLabels = {
  Paid: 'Đã thanh toán',
  Pending: 'Chưa thanh toán',
};

const receiptStyles = {
  paper: {
    width: '360px',
    maxWidth: '100%',
    margin: '0 auto',
    padding: '18px 16px',
    color: '#111827',
    background: '#ffffff',
    border: '1px solid #d1d5db',
    borderRadius: '4px',
    boxShadow: '0 14px 35px rgba(15, 23, 42, 0.14)',
    fontFamily: "'Tahoma', 'Arial', 'Segoe UI', sans-serif",
    lineHeight: 1.45,
  },
  center: {
    textAlign: 'center',
  },
  brand: {
    margin: 0,
    fontSize: '1.25rem',
    fontWeight: 700,
    letterSpacing: '0',
    color: '#0369a1',
  },
  title: {
    margin: '0.75rem 0 0.25rem',
    fontSize: '1rem',
    fontWeight: 700,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  muted: {
    margin: '0.15rem 0',
    color: '#4b5563',
    fontSize: '0.82rem',
  },
  divider: {
    border: 0,
    borderTop: '1px dashed #9ca3af',
    margin: '0.85rem 0',
  },
  row: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '0.75rem',
    margin: '0.35rem 0',
    fontSize: '0.86rem',
  },
  label: {
    color: '#4b5563',
    whiteSpace: 'nowrap',
  },
  value: {
    textAlign: 'right',
    fontWeight: 700,
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '0.78rem',
  },
  th: {
    borderBottom: '1px dashed #9ca3af',
    padding: '0.35rem 0.2rem',
    textAlign: 'right',
    fontWeight: 700,
  },
  firstTh: {
    borderBottom: '1px dashed #9ca3af',
    padding: '0.35rem 0.2rem',
    textAlign: 'left',
    fontWeight: 700,
  },
  td: {
    borderBottom: '1px dotted #d1d5db',
    padding: '0.45rem 0.2rem',
    textAlign: 'right',
    verticalAlign: 'top',
  },
  firstTd: {
    borderBottom: '1px dotted #d1d5db',
    padding: '0.45rem 0.2rem',
    textAlign: 'left',
    verticalAlign: 'top',
  },
  itemName: {
    fontWeight: 700,
  },
  itemUnit: {
    display: 'block',
    marginTop: '0.15rem',
    color: '#6b7280',
    fontSize: '0.72rem',
  },
  totalRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '1rem',
    marginTop: '0.7rem',
    paddingTop: '0.7rem',
    borderTop: '2px solid #111827',
    fontSize: '1rem',
    fontWeight: 700,
  },
  note: {
    margin: '0.75rem 0 0',
    color: '#4b5563',
    fontSize: '0.78rem',
    textAlign: 'center',
  },
};

const receiptPrintStyle = `
  @media print {
    body * {
      visibility: hidden;
    }

    #payment-print-area,
    #payment-print-area * {
      visibility: visible;
    }

    #payment-print-area {
      position: absolute;
      left: 0;
      top: 0;
      width: 100%;
      padding: 0;
      margin: 0;
      background: #ffffff;
    }

    #payment-print-area .receipt-paper {
      width: 76mm;
      border: 0;
      border-radius: 0;
      box-shadow: none;
      margin: 0 auto;
    }

    .receipt-actions {
      display: none !important;
    }
  }
`;

const CreatePayment = () => {
  const [employees, setEmployees] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [filteredMedicines, setFilteredMedicines] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedMedicine, setSelectedMedicine] = useState(null);
  const [paymentDetails, setPaymentDetails] = useState([]);
  const [form, setForm] = useState({
    employee: '',
    supplier: '',
    status: 'Paid',
  });
  const [reviewPaymentData, setReviewPaymentData] = useState(null);
  const [paymentReceiptData, setPaymentReceiptData] = useState(null);
  const [showPaymentReceipt, setShowPaymentReceipt] = useState(false);
  const [isSavingPayment, setIsSavingPayment] = useState(false);
  const { showSuccess, showError } = useToast();

  const getHeaders = () => {
    const token = sessionStorage.getItem('token');
    return { Authorization: `Token ${token}` };
  };

  const fetchMedicines = async () => {
    const response = await axios.get(`${API_BASE_URL}/api/medicines/medicines/`, {
      headers: getHeaders(),
    });
    setMedicines(response.data);
    setFilteredMedicines(response.data);
  };

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const headers = getHeaders();
        const [employeesRes, suppliersRes, medicinesRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/api/auth/employees/`, { headers }),
          axios.get(`${API_BASE_URL}/api/medicines/suppliers/`, { headers }),
          axios.get(`${API_BASE_URL}/api/medicines/medicines/`, { headers }),
        ]);

        setEmployees(employeesRes.data);
        setSuppliers(suppliersRes.data);
        setMedicines(medicinesRes.data);
        setFilteredMedicines(medicinesRes.data);
      } catch (error) {
        showError(getErrorMessage(error, 'Không thể tải dữ liệu tạo phiếu nhập.'));
      }
    };

    fetchInitialData();
  }, [showError]);

  const handleSearch = (e) => {
    const keyword = e.target.value.toLowerCase();
    setSearchKeyword(keyword);
    setFilteredMedicines(
      medicines.filter(
        (medicine) =>
          medicine.medicineName.toLowerCase().includes(keyword) ||
          medicine.medicineID.toLowerCase().includes(keyword)
      )
    );
  };

  const handleAddMedicine = () => {
    if (!selectedMedicine) {
      showError('Vui lòng chọn thuốc cần nhập.');
      return;
    }

    const quantity = Number(selectedMedicine.quantity || 1);
    if (!Number.isInteger(quantity) || quantity <= 0) {
      showError('Số lượng nhập phải lớn hơn 0.');
      return;
    }

    if (paymentDetails.some((item) => item.medicine === selectedMedicine.medicineID)) {
      showError('Thuốc này đã được thêm vào phiếu nhập.');
      return;
    }

    const newItem = {
      id: paymentDetails.length + 1,
      medicine: selectedMedicine.medicineID,
      medicineName: selectedMedicine.medicineName,
      quantity,
      unitPrice: Number(selectedMedicine.importPrice || 0),
    };

    setPaymentDetails((prevDetails) => [...prevDetails, newItem]);
    setSelectedMedicine(null);
  };

  const handleRemoveMedicine = (id) => {
    setPaymentDetails((items) => items.filter((item) => item.id !== id));
  };

  const totalAmount = paymentDetails.reduce(
    (sum, item) => sum + item.quantity * item.unitPrice,
    0
  );

  const getEmployeeName = (employeeID) =>
    employees.find((employee) => employee.employeeID === employeeID)?.fullName || employeeID;

  const getSupplierName = (supplierID) =>
    suppliers.find((supplier) => supplier.supplierID === supplierID)?.supplierName || supplierID;

  const createPaymentSnapshot = () => ({
    employee: form.employee,
    employeeName: getEmployeeName(form.employee),
    supplier: form.supplier,
    supplierName: getSupplierName(form.supplier),
    status: form.status,
    details: paymentDetails.map((item) => ({ ...item })),
    totalAmount,
    paymentTime: new Date().toISOString(),
  });

  const createPaymentPayload = (source) => ({
    employee: source.employee,
    supplier: source.supplier,
    status: source.status,
    items: source.details.map(({ medicine, quantity, unitPrice }) => ({
      medicine,
      quantity,
      unitPrice,
    })),
  });

  const handleSubmit = (e) => {
    e?.preventDefault?.();

    if (!form.employee || !form.supplier) {
      showError('Vui lòng chọn nhân viên và nhà cung cấp.');
      return;
    }

    if (paymentDetails.length === 0) {
      showError('Vui lòng thêm ít nhất một sản phẩm.');
      return;
    }

    setPaymentReceiptData(null);
    setShowPaymentReceipt(false);
    setReviewPaymentData(createPaymentSnapshot());
  };

  const handleEditPayment = () => {
    setReviewPaymentData(null);
    setIsSavingPayment(false);
  };

  const handleConfirmSavePayment = async () => {
    if (!reviewPaymentData) return;

    setIsSavingPayment(true);

    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/medicines/payment-checkout/`,
        createPaymentPayload(reviewPaymentData),
        { headers: getHeaders() }
      );

      const payment = response.data.payment || {};
      setPaymentReceiptData({
        ...reviewPaymentData,
        paymentID: payment.paymentID,
        paymentTime: payment.paymentTime || reviewPaymentData.paymentTime,
        status: payment.status || reviewPaymentData.status,
      });
      setReviewPaymentData(null);
      setShowPaymentReceipt(true);
      await fetchMedicines();
      window.localStorage.setItem(PAYMENTS_UPDATED_EVENT, String(Date.now()));
      window.dispatchEvent(new Event(PAYMENTS_UPDATED_EVENT));
      setPaymentDetails([]);
      setForm({ employee: '', supplier: '', status: 'Paid' });
      showSuccess('Tạo phiếu nhập thành công.');
    } catch (error) {
      showError(getErrorMessage(error, 'Không thể tạo phiếu nhập.'));
    } finally {
      setIsSavingPayment(false);
    }
  };

  const renderPaymentReceipt = (data, { isReview = false } = {}) => (
    <div
      id={isReview ? undefined : 'payment-print-area'}
      style={isReview ? undefined : { padding: '1rem', backgroundColor: '#f8fafc' }}
    >
      {!isReview && <style>{receiptPrintStyle}</style>}
      <div className="receipt-paper" style={receiptStyles.paper}>
        <div style={receiptStyles.center}>
          <h2 style={receiptStyles.brand}>PharmaCare Việt Nam</h2>
          <p style={receiptStyles.muted}>Phiếu nhập kho nhà thuốc</p>
          <p style={receiptStyles.muted}>Điện thoại: +84 816151762</p>
          <p style={receiptStyles.muted}>Email: khainhq0310@ut.edu.vn</p>
        </div>

        <hr style={receiptStyles.divider} />
        <h3 style={receiptStyles.title}>Phiếu nhập hàng</h3>
        <div style={receiptStyles.row}>
          <span style={receiptStyles.label}>Mã phiếu nhập</span>
          <span style={receiptStyles.value}>{data.paymentID || 'Chưa lưu'}</span>
        </div>
        <div style={receiptStyles.row}>
          <span style={receiptStyles.label}>Thời gian</span>
          <span style={receiptStyles.value}>{formatDateTime(data.paymentTime)}</span>
        </div>
        <div style={receiptStyles.row}>
          <span style={receiptStyles.label}>Trạng thái</span>
          <span style={receiptStyles.value}>{paymentStatusLabels[data.status] || data.status}</span>
        </div>

        <hr style={receiptStyles.divider} />
        <div style={receiptStyles.row}>
          <span style={receiptStyles.label}>Nhân viên</span>
          <span style={receiptStyles.value}>{data.employeeName}</span>
        </div>
        <div style={receiptStyles.row}>
          <span style={receiptStyles.label}>Mã nhân viên</span>
          <span style={receiptStyles.value}>{data.employee}</span>
        </div>
        <div style={receiptStyles.row}>
          <span style={receiptStyles.label}>Nhà cung cấp</span>
          <span style={receiptStyles.value}>{data.supplierName}</span>
        </div>
        <div style={receiptStyles.row}>
          <span style={receiptStyles.label}>Mã nhà cung cấp</span>
          <span style={receiptStyles.value}>{data.supplier}</span>
        </div>

        <hr style={receiptStyles.divider} />
        <table style={receiptStyles.table}>
          <thead>
            <tr>
              <th style={receiptStyles.firstTh}>Thuốc</th>
              <th style={receiptStyles.th}>SL</th>
              <th style={receiptStyles.th}>Đơn giá</th>
              <th style={receiptStyles.th}>Thành tiền</th>
            </tr>
          </thead>
          <tbody>
            {data.details.map((item) => (
              <tr key={item.id}>
                <td style={receiptStyles.firstTd}>
                  <span style={receiptStyles.itemName}>{item.medicineName}</span>
                  <span style={receiptStyles.itemUnit}>Mã: {item.medicine}</span>
                </td>
                <td style={receiptStyles.td}>{item.quantity}</td>
                <td style={receiptStyles.td}>{formatMoney(item.unitPrice)}</td>
                <td style={receiptStyles.td}>{formatMoney(item.quantity * item.unitPrice)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div style={receiptStyles.totalRow}>
          <span>Tổng tiền</span>
          <span>{formatMoney(data.totalAmount)} VND</span>
        </div>
        <p style={receiptStyles.note}>Phiếu dùng để đối chiếu nhập kho và thanh toán với nhà cung cấp.</p>
      </div>
    </div>
  );

  return (
    <Container>
      <Sidebar />
      <LeftSection>
        {selectedMedicine && (
          <MedicineDetails>
            <ClosePanelButton
              type="button"
              aria-label="Đóng thông tin thuốc"
              onClick={() => setSelectedMedicine(null)}
            >
              <FaTimes aria-hidden="true" />
            </ClosePanelButton>
            <h2>THÔNG TIN THUỐC</h2>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
              {selectedMedicine.image && (
                <img
                  src={selectedMedicine.image}
                  alt={selectedMedicine.medicineName}
                  style={{
                    width: '200px',
                    height: '200px',
                    objectFit: 'cover',
                    borderRadius: '8px',
                    border: '1px solid #ddd',
                  }}
                />
              )}
              <div style={{ flex: 1 }}>
                <p><strong>Mã thuốc:</strong> {selectedMedicine.medicineID}</p>
                <p><strong>Tên thuốc:</strong> {selectedMedicine.medicineName}</p>
                <p><strong>Thành phần:</strong> {selectedMedicine.ingredients}</p>
                <p><strong>Giá nhập:</strong> {formatMoney(selectedMedicine.importPrice)} VND</p>
                <Input
                  type="number"
                  value={selectedMedicine.quantity || 1}
                  min="1"
                  onChange={(e) =>
                    setSelectedMedicine({
                      ...selectedMedicine,
                      quantity: Number(e.target.value),
                    })
                  }
                />
                <Button onClick={handleAddMedicine}>Thêm vào phiếu nhập</Button>
              </div>
            </div>
          </MedicineDetails>
        )}

        <MedicineList>
          <h2>Danh sách thuốc</h2>
          <Input
            type="text"
            placeholder="Tìm kiếm thuốc..."
            value={searchKeyword}
            onChange={handleSearch}
          />
          <Table>
            <thead>
              <tr>
                <TableHeader>Mã thuốc</TableHeader>
                <TableHeader>Tên thuốc</TableHeader>
                <TableHeader>Số lượng tồn kho</TableHeader>
                <TableHeader>Giá nhập</TableHeader>
                <TableHeader>Hành động</TableHeader>
              </tr>
            </thead>
            <tbody>
              {filteredMedicines.map((medicine) => (
                <tr key={medicine.medicineID}>
                  <TableCell>{medicine.medicineID}</TableCell>
                  <TableCell>{medicine.medicineName}</TableCell>
                  <TableCell>{medicine.stockQuantity}</TableCell>
                  <TableCell>{formatMoney(medicine.importPrice)} VND</TableCell>
                  <TableCell>
                    <Button onClick={() => setSelectedMedicine({ ...medicine, quantity: 1 })}>
                      Chọn
                    </Button>
                  </TableCell>
                </tr>
              ))}
            </tbody>
          </Table>
        </MedicineList>
      </LeftSection>

      <RightSection>
        <PaymentDetailsTable>
          <h2>Chi tiết phiếu nhập</h2>
          <Table>
            <colgroup>
              <col style={{ width: '10%' }} />
              <col style={{ width: '18%' }} />
              <col style={{ width: '16%' }} />
              <col style={{ width: '18%' }} />
              <col style={{ width: '22%' }} />
              <col style={{ width: '16%' }} />
            </colgroup>
            <thead>
              <tr>
                <TableHeader>ID</TableHeader>
                <TableHeader>Mã thuốc</TableHeader>
                <TableHeader>Số lượng</TableHeader>
                <TableHeader>Đơn giá</TableHeader>
                <TableHeader>Thành tiền</TableHeader>
                <TableHeader>Hành động</TableHeader>
              </tr>
            </thead>
            <tbody>
              {paymentDetails.map((detail) => (
                <tr key={detail.id}>
                  <TableCell>{detail.id}</TableCell>
                  <TableCell>{detail.medicine}</TableCell>
                  <TableCell>{detail.quantity}</TableCell>
                  <TableCell>{formatMoney(detail.unitPrice)} VND</TableCell>
                  <TableCell>{formatMoney(detail.quantity * detail.unitPrice)} VND</TableCell>
                  <TableCell>
                    <Button onClick={() => handleRemoveMedicine(detail.id)}>Xóa</Button>
                  </TableCell>
                </tr>
              ))}
            </tbody>
          </Table>
        </PaymentDetailsTable>

        <PaymentInfo>
          <h2>Thông tin phiếu nhập</h2>
          <Select
            value={form.employee}
            onChange={(e) => setForm({ ...form, employee: e.target.value })}
            required
          >
            <option value="">Chọn nhân viên</option>
            {employees.map((employee) => (
              <option key={employee.employeeID} value={employee.employeeID}>
                {employee.fullName}
              </option>
            ))}
          </Select>
          <Select
            value={form.supplier}
            onChange={(e) => setForm({ ...form, supplier: e.target.value })}
            required
          >
            <option value="">Chọn nhà cung cấp</option>
            {suppliers.map((supplier) => (
              <option key={supplier.supplierID} value={supplier.supplierID}>
                {supplier.supplierName}
              </option>
            ))}
          </Select>
          <Select
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value })}
            required
          >
            <option value="Paid">Đã thanh toán</option>
            <option value="Pending">Chưa thanh toán</option>
          </Select>
          <h3>Tổng tiền: {formatMoney(totalAmount)} VND</h3>
          <CenteredButton onClick={handleSubmit}>Tạo Phiếu Nhập</CenteredButton>
        </PaymentInfo>
      </RightSection>

      {reviewPaymentData && (
        <Modal>
          <ModalContent>
            <ModalHeader>Kiểm tra phiếu nhập trước khi lưu</ModalHeader>
            <ModalBody>{renderPaymentReceipt(reviewPaymentData, { isReview: true })}</ModalBody>
            <ModalFooter>
              <Button type="button" onClick={handleEditPayment} disabled={isSavingPayment}>Chỉnh sửa</Button>
              <Button type="button" onClick={handleConfirmSavePayment} disabled={isSavingPayment}>
                {isSavingPayment ? 'Đang lưu...' : 'Xác nhận lưu'}
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}

      {showPaymentReceipt && paymentReceiptData && (
        <Modal>
          <ModalContent>
            <ModalHeader>Phiếu in nhập hàng</ModalHeader>
            <ModalBody>{renderPaymentReceipt(paymentReceiptData)}</ModalBody>
            <ModalFooter className="receipt-actions">
              <Button type="button" onClick={() => setShowPaymentReceipt(false)}>Đóng</Button>
              <Button type="button" onClick={() => window.print()}>In phiếu nhập</Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}
    </Container>
  );
};

export default CreatePayment;
