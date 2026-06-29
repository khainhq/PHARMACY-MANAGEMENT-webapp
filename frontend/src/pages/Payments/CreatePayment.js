import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from '../../components/Sidebar';
import {
  Container,
  LeftSection,
  RightSection,
  MedicineDetails,
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
} from './PaymentsStyles';

const API_BASE_URL = 'http://127.0.0.1:8000';
const PAYMENTS_UPDATED_EVENT = 'pharmacare:payments-updated';

const formatMoney = (value) =>
  Number(value || 0).toLocaleString('vi-VN', {
    maximumFractionDigits: 0,
  });

const getErrorMessage = (error, fallback) =>
  error.response?.data?.error ||
  error.response?.data?.message ||
  error.message ||
  fallback;

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
        alert(getErrorMessage(error, 'Không thể tải dữ liệu tạo phiếu nhập.'));
      }
    };

    fetchInitialData();
  }, []);

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
      alert('Vui lòng chọn thuốc cần nhập.');
      return;
    }

    const quantity = Number(selectedMedicine.quantity || 1);
    if (!Number.isInteger(quantity) || quantity <= 0) {
      alert('Số lượng nhập phải lớn hơn 0.');
      return;
    }

    if (paymentDetails.some((item) => item.medicine === selectedMedicine.medicineID)) {
      alert('Thuốc này đã được thêm vào phiếu nhập.');
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.employee || !form.supplier) {
      alert('Vui lòng chọn nhân viên và nhà cung cấp.');
      return;
    }

    if (paymentDetails.length === 0) {
      alert('Vui lòng thêm ít nhất một sản phẩm');
      return;
    }

    try {
      const payload = {
        employee: form.employee,
        supplier: form.supplier,
        status: form.status,
        items: paymentDetails.map(({ medicine, quantity, unitPrice }) => ({
          medicine,
          quantity,
          unitPrice,
        })),
      };

      await axios.post(`${API_BASE_URL}/api/medicines/payment-checkout/`, payload, {
        headers: getHeaders(),
      });

      await fetchMedicines();
      window.localStorage.setItem(PAYMENTS_UPDATED_EVENT, String(Date.now()));
      window.dispatchEvent(new Event(PAYMENTS_UPDATED_EVENT));
      alert('Tạo phiếu nhập thành công');
      setPaymentDetails([]);
      setForm({ employee: '', supplier: '', status: 'Paid' });
    } catch (error) {
      alert(getErrorMessage(error, 'Không thể tạo phiếu nhập.'));
    }
  };

  const totalAmount = paymentDetails.reduce(
    (sum, item) => sum + item.quantity * item.unitPrice,
    0
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
    </Container>
  );
};

export default CreatePayment;
