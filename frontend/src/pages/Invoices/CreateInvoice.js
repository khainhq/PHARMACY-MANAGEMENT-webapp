import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from '../../components/Sidebar';
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
  unitMap,
} from './InvoicesStyles';

const API_BASE = 'http://127.0.0.1:8000';
const formatMoney = (value) => Number(value || 0).toLocaleString('vi-VN');

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
  const [invoiceData, setInvoiceData] = useState(null);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [error, setError] = useState('');

  const authHeaders = () => ({ Authorization: `Token ${sessionStorage.getItem('token')}` });

  const fetchMedicines = async () => {
    try {
      const response = await axios.get(`${API_BASE}/api/medicines/medicines/`, { headers: authHeaders() });
      setMedicines(response.data);
      setFilteredMedicines(response.data);
    } catch (fetchError) {
      setError('Không tải được danh sách thuốc. Vui lòng thử lại.');
    }
  };

  useEffect(() => {
    fetchMedicines();
  }, []);

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
    setError('');
    if (!selectedMedicine || quantity <= 0) return;

    const currentQuantity = cart.find((item) => item.medicineID === selectedMedicine.medicineID)?.quantity || 0;
    if (currentQuantity + quantity > selectedMedicine.stockQuantity) {
      setError(`Thuốc ${selectedMedicine.medicineName} chỉ còn ${selectedMedicine.stockQuantity} trong kho.`);
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

  const validateCheckout = () => {
    if (cart.length === 0) return 'Giỏ hàng trống, không thể tạo hóa đơn.';
    if (!form.customerName.trim()) return 'Vui lòng nhập tên khách hàng.';
    if (!form.phoneNumber.trim()) return 'Vui lòng nhập số điện thoại.';
    if (!form.gender) return 'Vui lòng chọn giới tính.';
    if (!form.address.trim()) return 'Vui lòng nhập địa chỉ.';
    return '';
  };

  const handleCheckout = async () => {
    const validationError = validateCheckout();
    if (validationError) {
      setError(validationError);
      return;
    }

    setError('');
    try {
      const payload = {
        ...form,
        customerName: form.customerName.trim(),
        phoneNumber: form.phoneNumber.trim(),
        address: form.address.trim(),
        items: cart.map((item) => ({
          medicine: item.medicineID,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
        })),
      };

      const response = await axios.post(`${API_BASE}/api/sales/checkout/`, payload, { headers: authHeaders() });
      setInvoiceData({
        customerName: form.customerName,
        customerPhone: form.phoneNumber,
        address: form.address,
        paymentMethod: form.paymentMethod,
        status: form.status,
        medicines: cart,
        totalAmount: calculateTotal(),
        invoiceTime: response.data.invoiceTime,
      });
      setShowInvoiceModal(true);
      setCart([]);
      setForm({ customerName: '', phoneNumber: '', address: '', paymentMethod: 'Cash', status: 'Paid', gender: '' });
      await fetchMedicines();
    } catch (checkoutError) {
      setError(checkoutError.response?.data?.error || 'Không tạo được hóa đơn. Vui lòng thử lại.');
    }
  };

  return (
    <Container>
      <Sidebar />
      <LeftSection>
        {error && <div role="alert" style={{ marginBottom: '1rem', color: '#b91c1c', fontWeight: 700 }}>{error}</div>}

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
        </MedicineList>
      </LeftSection>

      <RightSection>
        <Cart>
          <h2>Giỏ hàng</h2>
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
        </Cart>

        <InvoiceInfo>
          <h2>Thông tin hóa đơn</h2>
          <Input type="text" placeholder="Tên khách hàng" value={form.customerName} onChange={(e) => setForm({ ...form, customerName: e.target.value })} required />
          <Input type="text" placeholder="Số điện thoại" value={form.phoneNumber} onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })} required />
          <Select aria-label="Chọn giới tính" value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })} required>
            <option value="">Chọn giới tính</option>
            <option value="Male">Nam</option>
            <option value="Female">Nữ</option>
            <option value="Other">Khác</option>
          </Select>
          <Input type="text" placeholder="Địa chỉ" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} required />
          <Select value={form.paymentMethod} onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })} required>
            <option value="Cash">Tiền mặt</option>
            <option value="Card">Thẻ</option>
          </Select>
          <Select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} required>
            <option value="Paid">Đã thanh toán</option>
            <option value="Pending">Chưa thanh toán</option>
          </Select>
          <h3>Tổng hóa đơn: {formatMoney(calculateTotal())} VND</h3>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem' }}>
            <Button style={{ backgroundColor: 'red' }} onClick={() => setCart([])}>HỦY BỎ</Button>
            <Button style={{ backgroundColor: 'green' }} onClick={handleCheckout}>TẠO HÓA ĐƠN</Button>
          </div>
        </InvoiceInfo>
      </RightSection>

      {showInvoiceModal && invoiceData && (
        <div id="invoice-print-area" style={{ padding: '1rem', backgroundColor: '#fff', borderRadius: '8px' }}>
          <h2>HÓA ĐƠN THANH TOÁN</h2>
          <p><strong>Thời gian tạo:</strong> {invoiceData.invoiceTime ? new Date(invoiceData.invoiceTime).toLocaleString() : ''}</p>
          <p><strong>Tên khách hàng:</strong> {invoiceData.customerName}</p>
          <p><strong>Số điện thoại:</strong> {invoiceData.customerPhone}</p>
          <p><strong>Địa chỉ:</strong> {invoiceData.address}</p>
          <p><strong>Phương thức thanh toán:</strong> {invoiceData.paymentMethod}</p>
          <p><strong>Trạng thái:</strong> {invoiceData.status === 'Paid' ? 'Đã thanh toán' : 'Chưa thanh toán'}</p>
          <hr />
          <h3>Danh sách thuốc:</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ border: '1px solid #ddd', padding: '8px' }}>Tên thuốc</th>
                <th style={{ border: '1px solid #ddd', padding: '8px' }}>Đơn vị tính</th>
                <th style={{ border: '1px solid #ddd', padding: '8px' }}>Số lượng</th>
                <th style={{ border: '1px solid #ddd', padding: '8px' }}>Đơn giá</th>
                <th style={{ border: '1px solid #ddd', padding: '8px' }}>Thành tiền</th>
              </tr>
            </thead>
            <tbody>
              {invoiceData.medicines.map((item) => (
                <tr key={item.medicineID}>
                  <td style={{ border: '1px solid #ddd', padding: '8px' }}>{item.medicineName}</td>
                  <td style={{ border: '1px solid #ddd', padding: '8px' }}>{unitMap[item.unit] || item.unit}</td>
                  <td style={{ border: '1px solid #ddd', padding: '8px' }}>{item.quantity}</td>
                  <td style={{ border: '1px solid #ddd', padding: '8px' }}>{formatMoney(item.unitPrice)} VND</td>
                  <td style={{ border: '1px solid #ddd', padding: '8px' }}>{formatMoney(item.quantity * item.unitPrice)} VND</td>
                </tr>
              ))}
            </tbody>
          </table>
          <h3>Tổng tiền: {formatMoney(invoiceData.totalAmount)} VND</h3>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem' }}>
            <button onClick={() => setShowInvoiceModal(false)}>Đóng</button>
            <button onClick={() => window.print()}>In hóa đơn</button>
          </div>
        </div>
      )}
    </Container>
  );
};

export default CreateInvoice;
