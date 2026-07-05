import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import html2canvas from 'html2canvas';
import Sidebar from '../../components/Sidebar';
import { useToast } from '../../components/ToastProvider';
import {
  countryDialOptions,
  isValidInternationalPhoneNumber,
  normalizeInternationalPhoneNumber,
} from '../../utils/validation';
import {
  Container,
  LeftSection,
  RightSection,
  MedicineDetails,
  MedicineList,
  Cart,
  InvoiceInfo,
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
  Field,
  FieldError,
  PhoneInputGroup,
  CountryPicker,
  CountryButton,
  CountryMenu,
  CountryOption,
  FlagMark,
  InvoiceActions,
  TableViewport,
  unitMap,
} from './InvoicesStyles';

const API_BASE = 'http://127.0.0.1:8000';
const INVOICES_UPDATED_EVENT = 'pharmacare:invoices-updated';
const REQUIRED_FIELD_ERROR = 'Không được để thiếu';
const PHONE_FIELD_ERROR = 'Vui lòng nhập đúng định dạng số điện thoại.';
const DEFAULT_COUNTRY_CODE = 'VN';

const formatMoney = (value) => Number(value || 0).toLocaleString('vi-VN');

const padDatePart = (value) => String(value).padStart(2, '0');

export const sanitizeFilePart = (value, fallback = 'khong-ro') => {
  const normalized = String(value || fallback)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);

  return normalized || fallback;
};

export const buildInvoiceImageFileName = (invoice, now = new Date()) => {
  const datePart = [
    now.getFullYear(),
    padDatePart(now.getMonth() + 1),
    padDatePart(now.getDate()),
  ].join('-');
  const timePart = [
    padDatePart(now.getHours()),
    padDatePart(now.getMinutes()),
    padDatePart(now.getSeconds()),
  ].join('-');

  return [
    'hoa-don',
    sanitizeFilePart(invoice?.invoiceID, 'chua-luu'),
    sanitizeFilePart(invoice?.customerName, 'khach-hang'),
    sanitizeFilePart(invoice?.customerPhone, 'khong-co-sdt'),
    datePart,
    timePart,
  ].join('_') + '.png';
};

const formatDateTime = (value) => {
  if (!value) return '';

  return new Intl.DateTimeFormat('vi-VN', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(value));
};

const paymentMethodLabels = {
  Cash: 'Tiền mặt',
  Card: 'Thẻ',
};

const invoiceStatusLabels = {
  Paid: 'Đã thanh toán',
  Pending: 'Chưa thanh toán',
};

const genderLabels = {
  Male: 'Nam',
  Female: 'Nữ',
  Other: 'Khác',
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
  imagePreviewWrap: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.85rem',
  },
  imagePreview: {
    width: '360px',
    maxWidth: '100%',
    border: '1px solid #d1d5db',
    borderRadius: '4px',
    backgroundColor: '#ffffff',
    boxShadow: '0 14px 35px rgba(15, 23, 42, 0.14)',
  },
  fileName: {
    width: '100%',
    wordBreak: 'break-word',
    margin: 0,
    color: '#334155',
    fontFamily: "'Tahoma', 'Arial', 'Segoe UI', sans-serif",
    fontSize: '0.82rem',
    textAlign: 'center',
  },
};

const CreateInvoice = () => {
  const [medicines, setMedicines] = useState([]);
  const [filteredMedicines, setFilteredMedicines] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedMedicine, setSelectedMedicine] = useState(null);
  const [cart, setCart] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [form, setForm] = useState({
    customerName: '',
    phoneNumber: '',
    address: '',
    paymentMethod: 'Cash',
    status: 'Paid',
    gender: '',
  });
  const [selectedCountryCode, setSelectedCountryCode] = useState(DEFAULT_COUNTRY_CODE);
  const [formErrors, setFormErrors] = useState({});
  const [touchedFields, setTouchedFields] = useState({});
  const [isCountryMenuOpen, setIsCountryMenuOpen] = useState(false);
  const [reviewInvoiceData, setReviewInvoiceData] = useState(null);
  const [invoiceData, setInvoiceData] = useState(null);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [isSavingInvoice, setIsSavingInvoice] = useState(false);
  const [isGeneratingInvoiceImage, setIsGeneratingInvoiceImage] = useState(false);
  const [isSavingInvoiceImage, setIsSavingInvoiceImage] = useState(false);
  const [invoiceImagePreview, setInvoiceImagePreview] = useState(null);
  const savedInvoiceImageIds = useRef(new Set());
  const { showSuccess, showError } = useToast();

  const authHeaders = useCallback(() => ({ Authorization: `Token ${sessionStorage.getItem('token')}` }), []);
  const selectedCountry = countryDialOptions.find((country) => country.code === selectedCountryCode) || countryDialOptions[0];

  const validateField = useCallback((field, value = form[field]) => {
    if (field === 'customerName' && !String(value || '').trim()) return REQUIRED_FIELD_ERROR;
    if (field === 'address' && !String(value || '').trim()) return REQUIRED_FIELD_ERROR;
    if (field === 'gender' && !value) return REQUIRED_FIELD_ERROR;
    if (field === 'phoneNumber') {
      if (!String(value || '').trim()) return REQUIRED_FIELD_ERROR;
      if (!isValidInternationalPhoneNumber(value, selectedCountry)) return PHONE_FIELD_ERROR;
    }
    return '';
  }, [form, selectedCountry]);

  const updateFieldError = useCallback((field, value = form[field]) => {
    const message = validateField(field, value);
    setFormErrors((current) => {
      const next = { ...current };
      if (message) {
        next[field] = message;
      } else {
        delete next[field];
      }
      return next;
    });
    return message;
  }, [form, validateField]);

  const fetchMedicines = useCallback(async () => {
    try {
      const response = await axios.get(`${API_BASE}/api/medicines/medicines/`, { headers: authHeaders() });
      setMedicines(response.data);
      setFilteredMedicines(response.data);
    } catch (fetchError) {
      showError('Không tải được danh sách thuốc. Vui lòng thử lại.');
    }
  }, [authHeaders, showError]);

  const fetchInvoiceDisplayID = useCallback(async (actualInvoiceID) => {
    try {
      const response = await axios.get(`${API_BASE}/api/sales/invoices/`, { headers: authHeaders() });
      const sortedInvoices = [...(response.data || [])].sort((left, right) =>
        Number(String(left.invoiceID || '').replace(/\D/g, '')) -
        Number(String(right.invoiceID || '').replace(/\D/g, ''))
      );
      const displayIndex = sortedInvoices.findIndex((invoice) => Number(invoice.invoiceID) === Number(actualInvoiceID));
      return displayIndex >= 0 ? displayIndex + 1 : actualInvoiceID;
    } catch (error) {
      return actualInvoiceID;
    }
  }, [authHeaders]);

  useEffect(() => {
    fetchMedicines();
  }, [fetchMedicines]);

  const handleSearch = (e) => {
    const keyword = e.target.value.toLowerCase();
    setSearchKeyword(keyword);
    setFilteredMedicines(
      medicines.filter((medicine) =>
        medicine.medicineName.toLowerCase().includes(keyword) ||
        medicine.medicineID.toLowerCase().includes(keyword)
      )
    );
  };

  const handleAddToCart = () => {
    if (!selectedMedicine || quantity <= 0) return;

    const currentQuantity = cart.find((item) => item.medicineID === selectedMedicine.medicineID)?.quantity || 0;
    if (currentQuantity + quantity > selectedMedicine.stockQuantity) {
      showError(`Thuốc ${selectedMedicine.medicineName} chỉ còn ${selectedMedicine.stockQuantity} trong kho.`);
      return;
    }

    const existingItem = cart.find((item) => item.medicineID === selectedMedicine.medicineID);
    if (existingItem) {
      setCart(cart.map((item) =>
        item.medicineID === selectedMedicine.medicineID
          ? { ...item, quantity: item.quantity + quantity }
          : item
      ));
    } else {
      setCart([...cart, { ...selectedMedicine, quantity }]);
    }

    setSelectedMedicine(null);
    setQuantity(1);
  };

  const calculateTotal = () => cart.reduce((total, item) => total + item.quantity * item.unitPrice, 0);

  const updateFormField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
    if (touchedFields[field]) {
      updateFieldError(field, value);
    }
  };

  const handleFieldBlur = (field) => {
    setTouchedFields((current) => ({ ...current, [field]: true }));
    updateFieldError(field);
  };

  const validateCheckout = () => {
    const requiredFields = ['customerName', 'phoneNumber', 'gender', 'address'];
    const nextErrors = requiredFields.reduce((errors, field) => {
      const message = validateField(field);
      return message ? { ...errors, [field]: message } : errors;
    }, {});

    setTouchedFields(requiredFields.reduce((fields, field) => ({ ...fields, [field]: true }), {}));
    setFormErrors(nextErrors);

    if (cart.length === 0) return 'Giỏ hàng trống, không thể tạo hóa đơn.';
    return Object.values(nextErrors)[0] || '';
  };

  const createInvoiceSnapshot = () => ({
    customerName: form.customerName.trim(),
    customerPhone: normalizeInternationalPhoneNumber(form.phoneNumber, selectedCountry),
    customerCountry: selectedCountry,
    address: form.address.trim(),
    gender: form.gender,
    paymentMethod: form.paymentMethod,
    status: form.status,
    medicines: cart.map((item) => ({ ...item })),
    totalAmount: calculateTotal(),
    invoiceTime: new Date().toISOString(),
  });

  const createCheckoutPayload = (source) => ({
    customerName: source.customerName,
    phoneNumber: source.customerPhone,
    address: source.address,
    gender: source.gender,
    paymentMethod: source.paymentMethod,
    status: source.status,
    items: source.medicines.map((item) => ({
      medicine: item.medicineID,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
    })),
  });

  const handleCheckout = () => {
    const validationError = validateCheckout();
    if (validationError) {
      showError(validationError);
      return;
    }

    setInvoiceData(null);
    setShowInvoiceModal(false);
    setReviewInvoiceData(createInvoiceSnapshot());
  };

  const handleEditInvoice = () => {
    setReviewInvoiceData(null);
    setIsSavingInvoice(false);
  };

  const handleConfirmSaveInvoice = async () => {
    if (!reviewInvoiceData) return;

    setIsSavingInvoice(true);

    try {
      const response = await axios.post(
        `${API_BASE}/api/sales/checkout/`,
        createCheckoutPayload(reviewInvoiceData),
        { headers: authHeaders() }
      );

      const actualInvoiceID = response.data.invoiceID;
      const displayInvoiceID = await fetchInvoiceDisplayID(actualInvoiceID);

      setInvoiceData({
        ...reviewInvoiceData,
        invoiceID: displayInvoiceID,
        actualInvoiceID,
        invoiceTime: response.data.invoiceTime || reviewInvoiceData.invoiceTime,
        status: response.data.status || reviewInvoiceData.status,
        receiptImage: response.data.receiptImage || '',
        receiptFileName: response.data.receiptFileName || '',
      });
      setReviewInvoiceData(null);
      setInvoiceImagePreview(null);
      setShowInvoiceModal(true);
      window.localStorage.setItem(INVOICES_UPDATED_EVENT, String(Date.now()));
      window.dispatchEvent(new Event(INVOICES_UPDATED_EVENT));
      setCart([]);
      setForm({ customerName: '', phoneNumber: '', address: '', paymentMethod: 'Cash', status: 'Paid', gender: '' });
      setSelectedCountryCode(DEFAULT_COUNTRY_CODE);
      setFormErrors({});
      setTouchedFields({});
      setIsCountryMenuOpen(false);
      showSuccess('Tạo hóa đơn thành công.');
      await fetchMedicines();
    } catch (checkoutError) {
      showError(checkoutError.response?.data?.error || 'Không tạo được hóa đơn. Vui lòng thử lại.');
    } finally {
      setIsSavingInvoice(false);
    }
  };

  const buildInvoiceImagePreview = useCallback(async (sourceInvoice) => {
    const receiptElement = document.querySelector('#invoice-print-area .receipt-paper');
    if (!receiptElement) {
      throw new Error('missing-receipt');
    }

    if (document.fonts?.ready) {
      await document.fonts.ready;
    }

    const canvas = await html2canvas(receiptElement, {
      scale: 2,
      backgroundColor: '#ffffff',
      useCORS: true,
    });

    return {
      src: canvas.toDataURL('image/png'),
      fileName: buildInvoiceImageFileName(sourceInvoice),
    };
  }, []);

  const saveInvoiceImage = useCallback(async (preview, sourceInvoice) => {
    const targetInvoiceID = sourceInvoice?.actualInvoiceID || sourceInvoice?.invoiceID;
    if (!targetInvoiceID || !preview?.src) return;

    await axios.patch(
      `${API_BASE}/api/sales/invoices/${targetInvoiceID}/`,
      {
        receiptImage: preview.src,
        receiptFileName: preview.fileName,
      },
      { headers: authHeaders() }
    );

    savedInvoiceImageIds.current.add(targetInvoiceID);
    setInvoiceData((current) =>
      (current?.actualInvoiceID || current?.invoiceID) === targetInvoiceID
        ? { ...current, receiptImage: preview.src, receiptFileName: preview.fileName }
        : current
    );
  }, [authHeaders]);

  const createInvoiceImagePreview = async () => {
    if (!invoiceData) return;

    setIsGeneratingInvoiceImage(true);

    try {
      const preview = invoiceData.receiptImage
        ? {
            src: invoiceData.receiptImage,
            fileName: invoiceData.receiptFileName || buildInvoiceImageFileName(invoiceData),
          }
        : await buildInvoiceImagePreview(invoiceData);

      setInvoiceImagePreview(preview);

      if (!invoiceData.receiptImage) {
        await saveInvoiceImage(preview, invoiceData);
      }
    } catch (downloadError) {
      showError('Không tạo được ảnh hóa đơn. Vui lòng thử lại.');
    } finally {
      setIsGeneratingInvoiceImage(false);
    }
  };

  const handleDownloadInvoiceImage = () => {
    if (!invoiceImagePreview) return;

    try {
      const fileName = invoiceImagePreview.fileName || buildInvoiceImageFileName(invoiceData);
      const downloadLink = document.createElement('a');
      downloadLink.href = invoiceImagePreview.src;
      downloadLink.download = fileName;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      setInvoiceImagePreview((current) => current ? { ...current, fileName } : current);
      showSuccess('Tải ảnh hóa đơn thành công.');
    } catch (downloadError) {
      showError('Không tải được ảnh hóa đơn. Vui lòng thử lại.');
    }
  };

  useEffect(() => {
    const targetInvoiceID = invoiceData?.actualInvoiceID || invoiceData?.invoiceID;
    if (!showInvoiceModal || !targetInvoiceID || invoiceData.receiptImage) return;
    if (savedInvoiceImageIds.current.has(targetInvoiceID)) return;

    let cancelled = false;
    const timer = window.setTimeout(async () => {
      setIsSavingInvoiceImage(true);
      try {
        const preview = await buildInvoiceImagePreview(invoiceData);
        if (!cancelled) {
          await saveInvoiceImage(preview, invoiceData);
        }
      } catch (imageError) {
        if (!cancelled) {
          showError('Hóa đơn đã lưu nhưng chưa lưu được ảnh hóa đơn. Bạn vẫn có thể bấm In hóa đơn để tạo lại.');
        }
      } finally {
        if (!cancelled) setIsSavingInvoiceImage(false);
      }
    }, 0);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [showInvoiceModal, invoiceData, buildInvoiceImagePreview, saveInvoiceImage, showError]);

  const renderInvoiceReceipt = (data, { isReview = false } = {}) => (
    <div
      id={isReview ? undefined : 'invoice-print-area'}
      style={isReview ? undefined : { padding: '1rem', backgroundColor: '#f8fafc' }}
    >
      <div className="receipt-paper" style={receiptStyles.paper}>
        <div style={receiptStyles.center}>
          <h2 style={receiptStyles.brand}>PharmaCare Việt Nam</h2>
          <p style={receiptStyles.muted}>Nhà thuốc minh họa PharmaCare</p>
          <p style={receiptStyles.muted}>Điện thoại: +84 816151762</p>
          <p style={receiptStyles.muted}>Email: khainhq0310@ut.edu.vn</p>
        </div>

        <hr style={receiptStyles.divider} />
        <h3 style={receiptStyles.title}>Hóa đơn thanh toán</h3>
        <div style={receiptStyles.row}>
          <span style={receiptStyles.label}>Mã hóa đơn</span>
          <span style={receiptStyles.value}>{data.invoiceID || 'Chưa lưu'}</span>
        </div>
        <div style={receiptStyles.row}>
          <span style={receiptStyles.label}>Thời gian</span>
          <span style={receiptStyles.value}>{formatDateTime(data.invoiceTime)}</span>
        </div>
        <div style={receiptStyles.row}>
          <span style={receiptStyles.label}>Trạng thái</span>
          <span style={receiptStyles.value}>{invoiceStatusLabels[data.status] || data.status}</span>
        </div>
        <div style={receiptStyles.row}>
          <span style={receiptStyles.label}>Thanh toán</span>
          <span style={receiptStyles.value}>{paymentMethodLabels[data.paymentMethod] || data.paymentMethod}</span>
        </div>

        <hr style={receiptStyles.divider} />
        <div style={receiptStyles.row}>
          <span style={receiptStyles.label}>Khách hàng</span>
          <span style={receiptStyles.value}>{data.customerName}</span>
        </div>
        <div style={receiptStyles.row}>
          <span style={receiptStyles.label}>Số điện thoại</span>
          <span style={receiptStyles.value}>{data.customerPhone}</span>
        </div>
        <div style={receiptStyles.row}>
          <span style={receiptStyles.label}>Giới tính</span>
          <span style={receiptStyles.value}>{genderLabels[data.gender] || data.gender}</span>
        </div>
        <div style={receiptStyles.row}>
          <span style={receiptStyles.label}>Địa chỉ</span>
          <span style={receiptStyles.value}>{data.address}</span>
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
            {data.medicines.map((item) => (
              <tr key={item.medicineID}>
                <td style={receiptStyles.firstTd}>
                  <span style={receiptStyles.itemName}>{item.medicineName}</span>
                  <span style={receiptStyles.itemUnit}>
                    Mã: {item.medicineID} | ĐVT: {unitMap[item.unit] || item.unit}
                  </span>
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
        <p style={receiptStyles.note}>Cảm ơn quý khách. Vui lòng kiểm tra thuốc trước khi rời quầy.</p>
      </div>
    </div>
  );

  return (
    <Container>
      <Sidebar />
      <LeftSection>
        {selectedMedicine && (
          <MedicineDetails>
            <h2>THÔNG TIN THUỐC</h2>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
              {selectedMedicine.image && (
                <img
                  src={selectedMedicine.image}
                  alt={selectedMedicine.medicineName}
                  style={{ width: '200px', height: '200px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #ddd' }}
                />
              )}
              <div style={{ flex: 1 }}>
                <p><strong>Mã thuốc:</strong> {selectedMedicine.medicineID}</p>
                <p><strong>Tên thuốc:</strong> {selectedMedicine.medicineName}</p>
                <p><strong>Thành phần:</strong> {selectedMedicine.ingredients}</p>
                <p><strong>Đơn vị tính:</strong> {unitMap[selectedMedicine.unit] || selectedMedicine.unit}</p>
                <p><strong>Tồn kho:</strong> {selectedMedicine.stockQuantity}</p>
                <p><strong>Đơn giá:</strong> {formatMoney(selectedMedicine.unitPrice)} VND</p>
                <Input type="number" value={quantity} min="1" max={selectedMedicine.stockQuantity} onChange={(e) => setQuantity(Number(e.target.value))} />
                <Button onClick={handleAddToCart}>Thêm vào giỏ hàng</Button>
              </div>
            </div>
          </MedicineDetails>
        )}

        <MedicineList>
          <h2>Danh sách thuốc</h2>
          <Input type="text" placeholder="Tìm kiếm thuốc..." value={searchKeyword} onChange={handleSearch} />
          <TableViewport>
            <Table>
              <thead>
                <tr>
                  <TableHeader>Mã thuốc</TableHeader>
                  <TableHeader>Tên thuốc</TableHeader>
                  <TableHeader>Đơn vị tính</TableHeader>
                  <TableHeader>Tồn kho</TableHeader>
                  <TableHeader>Đơn giá</TableHeader>
                  <TableHeader>Hành động</TableHeader>
                </tr>
              </thead>
              <tbody>
                {filteredMedicines.map((medicine) => (
                  <tr key={medicine.medicineID}>
                    <TableCell>{medicine.medicineID}</TableCell>
                    <TableCell>{medicine.medicineName}</TableCell>
                    <TableCell>{unitMap[medicine.unit] || medicine.unit}</TableCell>
                    <TableCell>{medicine.stockQuantity}</TableCell>
                    <TableCell>{formatMoney(medicine.unitPrice)} VND</TableCell>
                    <TableCell><Button onClick={() => setSelectedMedicine(medicine)}>Chọn</Button></TableCell>
                  </tr>
                ))}
              </tbody>
            </Table>
          </TableViewport>
        </MedicineList>

        <Cart>
          <h2>Giỏ hàng</h2>
          <TableViewport>
            <Table>
              <thead>
                <tr>
                  <TableHeader>Tên thuốc</TableHeader>
                  <TableHeader>Số lượng</TableHeader>
                  <TableHeader>Đơn giá</TableHeader>
                  <TableHeader>Thành tiền</TableHeader>
                  <TableHeader>Hành động</TableHeader>
                </tr>
              </thead>
              <tbody>
                {cart.map((item) => (
                  <tr key={item.medicineID}>
                    <TableCell>{item.medicineName}</TableCell>
                    <TableCell>{item.quantity}</TableCell>
                    <TableCell>{formatMoney(item.unitPrice)} VND</TableCell>
                    <TableCell>{formatMoney(item.quantity * item.unitPrice)} VND</TableCell>
                    <TableCell><Button onClick={() => setCart(cart.filter((cartItem) => cartItem.medicineID !== item.medicineID))}>Xóa</Button></TableCell>
                  </tr>
                ))}
              </tbody>
            </Table>
          </TableViewport>
        </Cart>
      </LeftSection>

      <RightSection>
        <InvoiceInfo>
          <h2>Thông tin hóa đơn</h2>
          <Field>
            Tên khách hàng
            <Input
              type="text"
              placeholder="Tên khách hàng"
              value={form.customerName}
              onChange={(e) => updateFormField('customerName', e.target.value)}
              onBlur={() => handleFieldBlur('customerName')}
              required
              aria-invalid={Boolean(formErrors.customerName)}
            />
            {formErrors.customerName && <FieldError>{formErrors.customerName}</FieldError>}
          </Field>
          <Field>
            Số điện thoại
            <PhoneInputGroup>
              <CountryPicker
                onBlur={(event) => {
                  if (!event.currentTarget.contains(event.relatedTarget)) {
                    setIsCountryMenuOpen(false);
                    if (touchedFields.phoneNumber) updateFieldError('phoneNumber');
                  }
                }}
              >
                <CountryButton
                  type="button"
                  aria-label="Chọn mã quốc gia"
                  aria-haspopup="listbox"
                  aria-expanded={isCountryMenuOpen}
                  onClick={() => setIsCountryMenuOpen((open) => !open)}
                >
                  <FlagMark src={selectedCountry.flagUrl} alt="" />
                  <span>{selectedCountry.dialCode}</span>
                  <span>{selectedCountry.name}</span>
                </CountryButton>
                {isCountryMenuOpen && (
                  <CountryMenu role="listbox" aria-label="Danh sách mã quốc gia">
                    {countryDialOptions.map((country) => (
                      <CountryOption
                        type="button"
                        key={country.code}
                        role="option"
                        aria-selected={country.code === selectedCountryCode}
                        $active={country.code === selectedCountryCode}
                        onClick={() => {
                          setSelectedCountryCode(country.code);
                          setIsCountryMenuOpen(false);
                          if (touchedFields.phoneNumber) {
                            setTimeout(() => updateFieldError('phoneNumber', form.phoneNumber), 0);
                          }
                        }}
                      >
                        <FlagMark src={country.flagUrl} alt="" />
                        <span>{country.dialCode}</span>
                        <span>{country.name}</span>
                      </CountryOption>
                    ))}
                  </CountryMenu>
                )}
              </CountryPicker>
              <Input
                type="tel"
                aria-label="Số điện thoại"
                placeholder={`Ví dụ: ${selectedCountry.example}`}
                value={form.phoneNumber}
                onChange={(e) => updateFormField('phoneNumber', e.target.value)}
                onBlur={() => handleFieldBlur('phoneNumber')}
                required
                aria-invalid={Boolean(formErrors.phoneNumber)}
              />
            </PhoneInputGroup>
            {formErrors.phoneNumber && <FieldError>{formErrors.phoneNumber}</FieldError>}
          </Field>
          <Field>
            Giới tính
            <Select
              aria-label="Chọn giới tính"
              value={form.gender}
              onChange={(e) => updateFormField('gender', e.target.value)}
              onBlur={() => handleFieldBlur('gender')}
              required
              aria-invalid={Boolean(formErrors.gender)}
            >
              <option value="">Chọn giới tính</option>
              <option value="Male">Nam</option>
              <option value="Female">Nữ</option>
              <option value="Other">Khác</option>
            </Select>
            {formErrors.gender && <FieldError>{formErrors.gender}</FieldError>}
          </Field>
          <Field>
            Địa chỉ
            <Input
              type="text"
              placeholder="Địa chỉ"
              value={form.address}
              onChange={(e) => updateFormField('address', e.target.value)}
              onBlur={() => handleFieldBlur('address')}
              required
              aria-invalid={Boolean(formErrors.address)}
            />
            {formErrors.address && <FieldError>{formErrors.address}</FieldError>}
          </Field>
          <Field>
            Phương thức thanh toán
            <Select
              aria-label="Chọn phương thức thanh toán"
              value={form.paymentMethod}
              onChange={(e) => updateFormField('paymentMethod', e.target.value)}
              required
            >
              <option value="Cash">Tiền mặt</option>
              <option value="Card">Thẻ</option>
            </Select>
          </Field>
          <Field>
            Trạng thái
            <Select
              aria-label="Chọn trạng thái hóa đơn"
              value={form.status}
              onChange={(e) => updateFormField('status', e.target.value)}
              required
            >
              <option value="Paid">Đã thanh toán</option>
              <option value="Pending">Chưa thanh toán</option>
            </Select>
          </Field>
          <h3>Tổng hóa đơn: {formatMoney(calculateTotal())} VND</h3>
          <InvoiceActions>
            <Button style={{ backgroundColor: 'red' }} onClick={() => setCart([])}>HỦY BỎ</Button>
            <Button style={{ backgroundColor: 'green' }} onClick={handleCheckout}>TẠO HÓA ĐƠN</Button>
          </InvoiceActions>
        </InvoiceInfo>
      </RightSection>

      {reviewInvoiceData && (
        <Modal>
          <ModalContent style={{ width: '440px', maxHeight: '90%' }}>
            <ModalHeader>Kiểm tra hóa đơn trước khi lưu</ModalHeader>
            <ModalBody>{renderInvoiceReceipt(reviewInvoiceData, { isReview: true })}</ModalBody>
            <ModalFooter>
              <Button type="button" onClick={handleEditInvoice} disabled={isSavingInvoice}>Chỉnh sửa</Button>
              <Button type="button" onClick={handleConfirmSaveInvoice} disabled={isSavingInvoice}>
                {isSavingInvoice ? 'Đang lưu...' : 'Xác nhận lưu'}
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}

      {showInvoiceModal && invoiceData && (
        <Modal>
          <ModalContent style={{ width: '440px', maxHeight: '90%' }}>
            <ModalHeader>{invoiceImagePreview ? 'Xem trước ảnh hóa đơn PNG' : 'Phiếu in hóa đơn'}</ModalHeader>
            <ModalBody>
              {invoiceImagePreview ? (
                <div style={receiptStyles.imagePreviewWrap}>
                  <img
                    src={invoiceImagePreview.src}
                    alt={`Ảnh hóa đơn ${invoiceData.invoiceID || ''}`.trim()}
                    style={receiptStyles.imagePreview}
                  />
                  <p style={receiptStyles.fileName}>
                    Tên file: {invoiceImagePreview.fileName}
                  </p>
                </div>
              ) : (
                <>
                  {isSavingInvoiceImage && (
                    <p style={{ margin: '0 0 0.75rem', color: '#0369a1', fontWeight: 700, textAlign: 'center' }}>
                      Đang lưu ảnh hóa đơn để có thể in lại sau.
                    </p>
                  )}
                  {renderInvoiceReceipt(invoiceData)}
                </>
              )}
            </ModalBody>
            <ModalFooter className="receipt-actions">
              {invoiceImagePreview ? (
                <>
                  <Button type="button" onClick={() => setInvoiceImagePreview(null)}>Quay lại phiếu</Button>
                  <Button type="button" onClick={handleDownloadInvoiceImage}>Tải về</Button>
                </>
              ) : (
                <>
                  <Button type="button" onClick={() => {
                    setShowInvoiceModal(false);
                    setInvoiceImagePreview(null);
                  }}>Đóng</Button>
                  <Button type="button" onClick={createInvoiceImagePreview} disabled={isGeneratingInvoiceImage}>
                    {isGeneratingInvoiceImage ? 'Đang tạo ảnh...' : 'In hóa đơn'}
                  </Button>
                </>
              )}
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}
    </Container>
  );
};

export default CreateInvoice;
