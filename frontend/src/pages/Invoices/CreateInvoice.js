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

  // Fetch medicines from API
  useEffect(() => {
    const fetchMedicines = async () => {
      const token = sessionStorage.getItem('token');
      const headers = { Authorization: `Token ${token}` };

      try {
        const response = await axios.get('http://localhost:8000/api/medicines/medicines/', { headers });
        setMedicines(response.data);
        setFilteredMedicines(response.data);
      } catch (error) {
        console.error('Error fetching medicines:', error.response?.data || error.message);
      }
    };

    fetchMedicines();
  }, []);

  // Handle search
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

  // Add medicine to cart
  const handleAddToCart = () => {
    if (!selectedMedicine || quantity <= 0) return;

    const existingItem = cart.find((item) => item.medicineID === selectedMedicine.medicineID);
    if (existingItem) {
      setCart(
        cart.map((item) =>
          item.medicineID === selectedMedicine.medicineID
            ? { ...item, quantity: item.quantity + quantity }
            : item
        )
      );
    } else {
      setCart([...cart, { ...selectedMedicine, quantity }]);
    }
    setSelectedMedicine(null);
    setQuantity(1);
  };

  // Remove medicine from cart
  const handleRemoveFromCart = (medicineID) => {
    setCart(cart.filter((item) => item.medicineID !== medicineID));
  };

  // Calculate total amount
  const calculateTotal = () => {
    return cart.reduce((total, item) => total + item.quantity * item.unitPrice, 0);
  };

  // Generate unique customer ID
  const generateCustomerID = () => {
    const letters = Array.from({ length: 6 }, () =>
      String.fromCharCode(65 + Math.floor(Math.random() * 26))
    ).join('');
    const numbers = Math.floor(100 + Math.random() * 900);
    return `${letters}${numbers}`;
  };

  // Handle checkout
  const handleCheckout = async () => {
    const token = sessionStorage.getItem('token');
    const headers = { Authorization: `Token ${token}` };

    try {
      if (cart.length === 0) {
        alert('Giỏ hàng trống, không thể thực hiện thanh toán.');
        return;
      }

      // Check if customer exists
      let customerID;
      try {
        const customersRes = await axios.get('http://localhost:8000/api/sales/customers/', { headers });
        const existingCustomer = customersRes.data.find(
          (c) =>
            c.fullName.trim().toLowerCase() === form.customerName.trim().toLowerCase() &&
            c.phoneNumber.trim() === form.phoneNumber.trim()
        );
        if (existingCustomer) {
          customerID = existingCustomer.customerID;
        } else {
          const customerResponse = await axios.post(
            'http://localhost:8000/api/sales/customers/',
            {
              customerID: generateCustomerID(),
              fullName: form.customerName.trim(),
              phoneNumber: form.phoneNumber.trim(),
              gender: form.gender,
              joinDate: new Date().toISOString().split('T')[0],
            },
            { headers }
          );
          customerID = customerResponse.data.customerID;
        }
      } catch (error) {
        console.error('Error checking or creating customer:', error.response?.data || error.message);
        return;
      }

      // Create invoice
      const invoiceResponse = await axios.post(
        'http://localhost:8000/api/sales/invoices/',
        {
          customer: customerID,
          address: form.address,
          paymentMethod: form.paymentMethod,
          status: form.status,
        },
        { headers }
      );
      const invoiceID = invoiceResponse.data.invoiceID;
      const invoiceTime = invoiceResponse.data.invoiceTime; // Lấy thời gian tạo hóa đơn

      // Add invoice details
      await Promise.all(
        cart.map((item) =>
          axios.post(
            'http://localhost:8000/api/sales/invoice-details/',
            {
              invoice: invoiceID,
              medicine: item.medicineID,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
            },
            { headers }
          )
        )
      );

      // Save invoice data and show modal
      setInvoiceData({
        customerName: form.customerName,
        customerPhone: form.phoneNumber,
        address: form.address,
        paymentMethod: form.paymentMethod,
        status: form.status,
        medicines: cart,
        totalAmount: calculateTotal(),
        invoiceTime, // Thêm thời gian tạo hóa đơn
      });
      setShowInvoiceModal(true);

      // Reset form and cart
      setCart([]);
      setForm({
        customerName: '',
        phoneNumber: '',
        address: '',
        paymentMethod: 'Cash',
        status: 'Paid',
        gender: '',
      });
    } catch (error) {
      console.error('Error during checkout:', error.response?.data || error.message);
    }
  };

  return (
    <Container>
      <Sidebar />
      <LeftSection>
        {/* Medicine Details */}
        {selectedMedicine && (
          <MedicineDetails>
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
                <p><strong>Đơn vị tính:</strong> {unitMap[selectedMedicine.unit]}</p>
                <p><strong>Đơn giá:</strong> {selectedMedicine.unitPrice.toLocaleString()} VND</p>
                <Input
                  type="number"
                  value={quantity}
                  min="1"
                  max={selectedMedicine.stockQuantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                />
                <Button onClick={handleAddToCart}>Thêm vào giỏ hàng</Button>
              </div>
            </div>
          </MedicineDetails>
        )}

        {/* Medicine List */}
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
                <TableHeader>Đơn vị tính</TableHeader>
                <TableHeader>Đơn giá</TableHeader>
                <TableHeader>Hành động</TableHeader>
              </tr>
            </thead>
            <tbody>
              {filteredMedicines.map((medicine) => (
                <tr key={medicine.medicineID}>
                  <TableCell>{medicine.medicineID}</TableCell>
                  <TableCell>{medicine.medicineName}</TableCell>
                  <TableCell>{unitMap[medicine.unit]}</TableCell>
                  <TableCell>{medicine.unitPrice.toLocaleString()} VND</TableCell>
                  <TableCell>
                    <Button onClick={() => setSelectedMedicine(medicine)}>Chọn</Button>
                  </TableCell>
                </tr>
              ))}
            </tbody>
          </Table>
        </MedicineList>
      </LeftSection>

      <RightSection>
        {/* Cart */}
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
                  <TableCell>{item.unitPrice.toLocaleString()} VND</TableCell>
                  <TableCell>{(item.quantity * item.unitPrice).toLocaleString()} VND</TableCell>
                  <TableCell>
                    <Button onClick={() => handleRemoveFromCart(item.medicineID)}>Xóa</Button>
                  </TableCell>
                </tr>
              ))}
            </tbody>
          </Table>
        </Cart>

        {/* Invoice Info */}
        <InvoiceInfo>
          <h2>Thông tin hóa đơn</h2>
          <Input
            type="text"
            placeholder="Tên khách hàng"
            value={form.customerName}
            onChange={(e) => setForm({ ...form, customerName: e.target.value })}
            required
          />
          <Input
            type="text"
            placeholder="Số điện thoại"
            value={form.phoneNumber}
            onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
            required
          />
          <Select
            aria-label="Chọn giới tính"
            value={form.gender}
            onChange={(e) => setForm({ ...form, gender: e.target.value })}
            required
          >
            <option value="">Chọn giới tính</option>
            <option value="Male">Nam</option>
            <option value="Female">Nữ</option>
          </Select>
          <Input
            type="text"
            placeholder="Địa chỉ"
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
            required
          />
          <Select
            value={form.paymentMethod}
            onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })}
            required
          >
            <option value="Cash">Tiền mặt</option>
            <option value="Card">Thẻ</option>
          </Select>
          <Select
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value })}
            required
          >
            <option value="Paid">Đã thanh toán</option>
            <option value="Pending">Chưa thanh toán</option>
          </Select>
          <h3>Tổng hóa đơn: {calculateTotal().toLocaleString()} VND</h3>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem' }}>
            <Button style={{ backgroundColor: 'red' }} onClick={() => setCart([])}>HỦY BỎ</Button>
            <Button style={{ backgroundColor: 'green' }} onClick={handleCheckout}>TẠO HÓA ĐƠN</Button>
          </div>
        </InvoiceInfo>
      </RightSection>

      {/* Invoice Modal */}
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
              {invoiceData.medicines.map((item, index) => (
                <tr key={index}>
                  <td style={{ border: '1px solid #ddd', padding: '8px' }}>{item.medicineName}</td>
                  <td style={{ border: '1px solid #ddd', padding: '8px' }}>{unitMap[item.unit]}</td>
                  <td style={{ border: '1px solid #ddd', padding: '8px' }}>{item.quantity}</td>
                  <td style={{ border: '1px solid #ddd', padding: '8px' }}>{item.unitPrice.toLocaleString()} VND</td>
                  <td style={{ border: '1px solid #ddd', padding: '8px' }}>{(item.quantity * item.unitPrice).toLocaleString()} VND</td>
                </tr>
              ))}
            </tbody>
          </table>
          <h3>Tổng tiền: {invoiceData.totalAmount.toLocaleString()} VND</h3>
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