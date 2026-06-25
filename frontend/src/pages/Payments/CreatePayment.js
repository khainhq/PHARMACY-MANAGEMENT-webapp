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
    totalAmount: 0,
  });

  // Fetch initial data
  useEffect(() => {
    const fetchInitialData = async () => {
      const token = sessionStorage.getItem('token');
      const headers = { Authorization: `Token ${token}` };

      try {
        const [employeesRes, suppliersRes, medicinesRes] = await Promise.all([
          axios.get('http://localhost:8000/api/auth/employees/', { headers }),
          axios.get('http://localhost:8000/api/medicines/suppliers/', { headers }),
          axios.get('http://localhost:8000/api/medicines/medicines/', { headers }),
        ]);

        setEmployees(employeesRes.data);
        setSuppliers(suppliersRes.data);
        setMedicines(medicinesRes.data);
        setFilteredMedicines(medicinesRes.data);
      } catch (error) {
        console.error('Error fetching initial data:', error.response?.data || error.message);
      }
    };

    fetchInitialData();
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

  // Add medicine to payment details
  const handleAddMedicine = () => {
  if (!selectedMedicine) {
    console.log('No selected medicine');
    return;
  }

  console.log('Before adding - selectedMedicine:', selectedMedicine);
  console.log('Before adding - paymentDetails:', paymentDetails);
  const existingItem = paymentDetails.find((item) => item.medicine === selectedMedicine.medicineID);
  console.log('existingItem:', existingItem);

  if (existingItem) {
    alert('Thuốc này đã được thêm vào chi tiết phiếu nhập.');
    return;
  }

  const newItem = {
    id: paymentDetails.length + 1,
    medicine: selectedMedicine.medicineID,
    quantity: selectedMedicine.quantity || 1,
    unitPrice: selectedMedicine.importPrice,
  };

  setPaymentDetails((prevDetails) => {
    const updatedDetails = [...prevDetails, newItem];
    console.log('After adding - paymentDetails:', updatedDetails);
    return updatedDetails;
  });
  setSelectedMedicine(null);
};

  // Remove medicine from payment details
  const handleRemoveMedicine = (id) => {
    setPaymentDetails(paymentDetails.filter((item) => item.id !== id));
  };

  // Handle submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = sessionStorage.getItem('token');
    const headers = { Authorization: `Token ${token}` };

    const paymentID = Math.random().toString(36).substring(2, 10).toUpperCase();
    const paymentTime = new Date().toISOString();

    try {
      // Tạo phiếu nhập
      const paymentPayload = {
        paymentID,
        paymentTime,
        totalAmount: paymentDetails.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0),
        employee: form.employee,
        supplier: form.supplier,
      };
      await axios.post('http://localhost:8000/api/medicines/payments/', paymentPayload, { headers });

      // Tạo chi tiết phiếu nhập
      await Promise.all(
        paymentDetails.map((detail) =>
          axios.post(
            'http://localhost:8000/api/medicines/payment-details/',
            {
              ...detail,
              payment: paymentID,
            },
            { headers }
          )
        )
      );

      // Gửi yêu cầu cập nhật số lượng tồn kho
      await Promise.all(
        paymentDetails.map((detail) => {
          const medicine = medicines.find((med) => med.medicineID === detail.medicine);
          if (medicine) {
            return axios.patch(
              `http://localhost:8000/api/medicines/medicines/${medicine.medicineID}/`,
              { stockQuantity: medicine.stockQuantity + detail.quantity },
              { headers }
            );
          }
          return null;
        })
      );

      // Làm mới danh sách thuốc
      const medicinesRes = await axios.get('http://localhost:8000/api/medicines/medicines/', { headers });
      setMedicines(medicinesRes.data);
      setFilteredMedicines(medicinesRes.data);

      alert('Phiếu nhập đã được tạo thành công!');
      setPaymentDetails([]);
      setForm({ employee: '', supplier: '', totalAmount: 0 });
    } catch (error) {
      console.error('Error creating payment:', error.response?.data || error.message);
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
                <p><strong>Đơn giá:</strong> {selectedMedicine.importPrice.toLocaleString()} VND</p>
                <Input
                  type="number"
                  value={selectedMedicine.quantity || 1}
                  min="1"
                  max={selectedMedicine.stockQuantity}
                  onChange={(e) =>
                    setSelectedMedicine({ ...selectedMedicine, quantity: Number(e.target.value) })
                  }
                />
                <Button onClick={handleAddMedicine}>Thêm vào phiếu nhập</Button>
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
                  <TableCell>{medicine.importPrice.toLocaleString()} VND</TableCell>
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
        {/* Payment Details */}
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
                  <TableCell>{detail.quantity}</TableCell> {/* Hiển thị số lượng mà không cho chỉnh sửa */}
                  <TableCell>{detail.unitPrice.toLocaleString()} VND</TableCell>
                  <TableCell>{(detail.quantity * detail.unitPrice).toLocaleString()} VND</TableCell>
                  <TableCell>
                    <Button onClick={() => handleRemoveMedicine(detail.id)}>Xóa</Button>
                  </TableCell>
                </tr>
              ))}
            </tbody>
          </Table>
        </PaymentDetailsTable>

        {/* Payment Info */}
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
          <h3>
            Tổng tiền: {paymentDetails.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0).toLocaleString()} VND
          </h3>
          <CenteredButton onClick={handleSubmit}>Tạo Phiếu Nhập</CenteredButton>        </PaymentInfo>
      </RightSection>
    </Container>
  );
};

export default CreatePayment;