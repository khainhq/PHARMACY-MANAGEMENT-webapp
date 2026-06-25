import React from 'react';
import { render, screen, fireEvent, act, within, waitFor } from '@testing-library/react';
import axios from 'axios';
import Orders from './Orders';

// Mock dependencies
jest.mock('axios');
jest.mock('../../components/Sidebar', () => () => <div>Mocked Sidebar</div>);

describe('Orders component', () => {
  let mockOrders, mockEmployees, mockCustomers;

  beforeEach(() => {
    // Reset mocks
    axios.get.mockReset();
    axios.post.mockReset();
    axios.put.mockReset();
    axios.delete.mockReset();

    // Set up initial mock data
    mockOrders = [
      {
        orderID: 'ORD001',
        employee: 'EMP001',
        customer: 'CUS001',
        totalAmount: 500000,
        orderTime: '2025-01-01T10:00:00Z',
      },
      {
        orderID: 'ORD002',
        employee: 'EMP002',
        customer: 'CUS002',
        totalAmount: 750000,
        orderTime: '2025-01-02T12:00:00Z',
      },
    ];

    mockEmployees = [
      { employeeID: 'EMP001', fullName: 'Nguyễn Văn A' },
      { employeeID: 'EMP002', fullName: 'Trần Thị B' },
    ];

    mockCustomers = [
      { customerID: 'CUS001', fullName: 'Lê Văn C' },
      { customerID: 'CUS002', fullName: 'Phạm Thị D' },
    ];

    // Set up token in sessionStorage
    sessionStorage.setItem('token', 'dummyToken');

    // Mock API responses with delay to simulate real API
    axios.get.mockImplementation((url) => new Promise(resolve => setTimeout(() => {
      if (url === 'http://localhost:8000/api/sales/orders/') {
        resolve({ data: mockOrders });
      } else if (url === 'http://localhost:8000/api/auth/employees/') {
        resolve({ data: mockEmployees });
      } else if (url === 'http://localhost:8000/api/sales/customers/') {
        resolve({ data: mockCustomers });
      } else {
        resolve({ data: null });
      }
    }, 100)));

    axios.post.mockImplementation((url, data, config) => {
      const newOrder = {
        orderID: data.orderID || `ORD${mockOrders.length + 1}`,
        employee: data.employee,
        customer: data.customer,
        totalAmount: parseFloat(data.totalAmount),
        orderTime: new Date().toISOString(),
      };
      mockOrders.push(newOrder);
      return Promise.resolve({ data: newOrder });
    });

    axios.put.mockImplementation((url, data, config) => {
      const updatedOrder = {
        orderID: data.orderID,
        employee: data.employee,
        customer: data.customer,
        totalAmount: parseFloat(data.totalAmount),
        orderTime: mockOrders.find(o => o.orderID === data.orderID).orderTime,
      };
      mockOrders = mockOrders.map(order =>
        order.orderID === updatedOrder.orderID ? updatedOrder : order
      );
      return Promise.resolve({ data: updatedOrder });
    });

    axios.delete.mockImplementation((url) => {
      const orderID = url.split('/').slice(-2)[0];
      mockOrders = mockOrders.filter(order => order.orderID !== orderID);
      return Promise.resolve({});
    });

    // Mock window.confirm
    window.confirm = jest.fn(() => true);
  });

  afterEach(() => {
    sessionStorage.clear();
    jest.clearAllMocks();
  });

  test('hiển thị Sidebar, tiêu đề và bảng danh sách đơn hàng', async () => {
    render(<Orders />);

    // Kiểm tra các thành phần giao diện
    await screen.findByText(/Mocked Sidebar/i, { timeout: 5000 });
    expect(screen.getByText(/Mocked Sidebar/i)).toBeInTheDocument();
    expect(screen.getByText(/DANH SÁCH ĐƠN ĐẶT HÀNG/i)).toBeInTheDocument();
    expect(screen.getByText(/STT/i)).toBeInTheDocument();
    expect(screen.getByText(/Mã đơn hàng/i)).toBeInTheDocument();
    expect(screen.getByText(/Thời gian đặt/i)).toBeInTheDocument();
    expect(screen.getByText(/Nhân viên/i)).toBeInTheDocument();
    expect(screen.getByText(/Khách hàng/i)).toBeInTheDocument();
    expect(screen.getByText(/Tổng tiền/i)).toBeInTheDocument();
    expect(screen.getByText(/Hành động/i)).toBeInTheDocument();

    // Kiểm tra dữ liệu đơn hàng
    await screen.findByText('ORD001', { timeout: 5000 });
    const row1 = screen.getByText('ORD001').closest('tr');
    const cells1 = within(row1).getAllByRole('cell');
    expect(cells1[0]).toHaveTextContent('1'); // STT
    expect(cells1[1]).toHaveTextContent('ORD001'); // Mã đơn hàng
    expect(cells1[2]).toHaveTextContent(new Date('2025-01-01T10:00:00Z').toLocaleString()); // Thời gian đặt
    expect(cells1[3]).toHaveTextContent('EMP001'); // Nhân viên
    expect(cells1[4]).toHaveTextContent('CUS001'); // Khách hàng
    expect(cells1[5]).toHaveTextContent('500.000 VND'); // Tổng tiền

    const row2 = screen.getByText('ORD002').closest('tr');
    const cells2 = within(row2).getAllByRole('cell');
    expect(cells2[0]).toHaveTextContent('2'); // STT
    expect(cells2[1]).toHaveTextContent('ORD002'); // Mã đơn hàng
    expect(cells2[2]).toHaveTextContent(new Date('2025-01-02T12:00:00Z').toLocaleString()); // Thời gian đặt
    expect(cells2[3]).toHaveTextContent('EMP002'); // Nhân viên
    expect(cells2[4]).toHaveTextContent('CUS002'); // Khách hàng
    expect(cells2[5]).toHaveTextContent('750.000 VND'); // Tổng tiền
  });

  test('tìm kiếm đơn hàng theo mã đơn hàng, nhân viên hoặc khách hàng', async () => {
    render(<Orders />);

    await screen.findByText(/ORD001/i, { timeout: 5000 });
    const row1 = screen.getByText(/ORD001/i).closest('tr');
    const row2 = screen.getByText(/ORD002/i).closest('tr');
    const cells1 = within(row1).getAllByRole('cell');
    const cells2 = within(row2).getAllByRole('cell');
    expect(cells1[1]).toHaveTextContent('ORD001'); // Mã đơn hàng
    expect(cells2[1]).toHaveTextContent('ORD002'); // Mã đơn hàng

    const searchInput = screen.getByPlaceholderText(/Tìm kiếm đơn đặt hàng.../i);
    fireEvent.change(searchInput, { target: { value: 'ORD001' } });

    expect(cells1[1]).toHaveTextContent('ORD001');
    expect(screen.queryByText(/ORD002/i)).not.toBeInTheDocument();

    fireEvent.change(searchInput, { target: { value: 'EMP002' } });
    expect(screen.queryByText(/ORD001/i)).not.toBeInTheDocument();
    expect(cells2[1]).toHaveTextContent('ORD002');

    fireEvent.change(searchInput, { target: { value: 'CUS002' } });
    expect(screen.queryByText(/ORD001/i)).not.toBeInTheDocument();
    expect(cells2[1]).toHaveTextContent('ORD002');
  });

  test('thêm đơn hàng mới', async () => {
    render(<Orders />);

    await screen.findByText(/ORD001/i, { timeout: 5000 });

    // Mở form thêm đơn hàng
    const addButton = screen.getByRole('button', { name: /THÊM/i });
    fireEvent.click(addButton);
    expect(screen.getByRole('button', { name: /Thêm mới/i })).toBeInTheDocument();

    // Điền form
    const selects = screen.getAllByRole('combobox');
    fireEvent.change(selects[0], { target: { value: 'EMP001' } }); // Nhân viên
    fireEvent.change(selects[1], { target: { value: 'CUS001' } }); // Khách hàng
    fireEvent.change(screen.getByPlaceholderText(/Tổng tiền/i), { target: { value: '1000000' } });

    // Gửi form
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Thêm mới/i }));
    });

    // Kiểm tra đơn hàng mới được thêm
    await waitFor(async () => {
      const rows = screen.getAllByRole('row');
      expect(rows.length).toBe(4); // Header + 3 data rows
      const newRow = rows[rows.length - 1]; // Hàng cuối cùng
      const cells = within(newRow).getAllByRole('cell');
      expect(cells[3]).toHaveTextContent('EMP001'); // Nhân viên
      expect(cells[4]).toHaveTextContent('CUS001'); // Khách hàng
      expect(cells[5]).toHaveTextContent('1.000.000 VND'); // Tổng tiền
    }, { timeout: 5000 });
  });

  test('sửa đơn hàng', async () => {
    render(<Orders />);

    await screen.findByText(/ORD001/i, { timeout: 5000 });
    const row = screen.getByText(/ORD001/i).closest('tr');
    const cells = within(row).getAllByRole('cell');
    expect(cells[1]).toHaveTextContent('ORD001'); // Mã đơn hàng

    // Mở form sửa đơn hàng
    const editButton = within(row).getByRole('button', { name: /Sửa/i });
    fireEvent.click(editButton);
    expect(screen.getByRole('button', { name: /Cập nhật/i })).toBeInTheDocument();

    // Kiểm tra dữ liệu đã được điền sẵn
    const selects = screen.getAllByRole('combobox');
    expect(selects[0]).toHaveValue('EMP001'); // Nhân viên
    expect(selects[1]).toHaveValue('CUS001'); // Khách hàng
    expect(screen.getByPlaceholderText(/Tổng tiền/i)).toHaveValue(500000); // Tổng tiền

    // Cập nhật dữ liệu
    fireEvent.change(selects[0], { target: { value: 'EMP002' } });
    fireEvent.change(selects[1], { target: { value: 'CUS002' } });
    fireEvent.change(screen.getByPlaceholderText(/Tổng tiền/i), { target: { value: '600000' } });

    // Gửi form
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Cập nhật/i }));
    });

    // Kiểm tra đơn hàng đã được cập nhật
    await waitFor(async () => {
      const updatedRow = screen.getByText(/ORD001/i).closest('tr');
      const updatedCells = within(updatedRow).getAllByRole('cell');
      expect(updatedCells[3]).toHaveTextContent('EMP002'); // Nhân viên
      expect(updatedCells[4]).toHaveTextContent('CUS002'); // Khách hàng
      expect(updatedCells[5]).toHaveTextContent('600.000 VND'); // Tổng tiền
    }, { timeout: 5000 });
  });

  test('xóa đơn hàng', async () => {
    render(<Orders />);

    await screen.findByText(/ORD001/i, { timeout: 5000 });
    const row = screen.getByText(/ORD001/i).closest('tr');
    const cells = within(row).getAllByRole('cell');
    expect(cells[1]).toHaveTextContent('ORD001'); // Mã đơn hàng

    const deleteButton = within(row).getByRole('button', { name: /Xóa/i });
    await act(async () => {
      fireEvent.click(deleteButton);
    });

    // Đợi bảng cập nhật và chỉ hiển thị ORD002
    await waitFor(async () => {
      const rows = screen.getAllByRole('row');
      expect(rows.length).toBe(2); // Header + 1 data row
      const remainingRow = screen.getByText('ORD002').closest('tr');
      const remainingCells = within(remainingRow).getAllByRole('cell');
      expect(remainingCells[1]).toHaveTextContent('ORD002'); // Mã đơn hàng
    }, { timeout: 5000 });

    // Kiểm tra ORD001 không còn trong bảng
    await waitFor(() => {
      const orderIDCells = screen.getAllByRole('cell').filter((cell, index) => index % 7 === 1); // Mã đơn hàng ở cột thứ 2 (index 1)
      expect(orderIDCells.some(cell => cell.textContent === 'ORD001')).toBe(false);
    }, { timeout: 5000 });
  });

  test('snapshot của giao diện Orders', async () => {
    const { container } = render(<Orders />);

    await screen.findByText(/ORD001/i, { timeout: 5000 });
    const row = screen.getByText(/ORD001/i).closest('tr');
    const cells = within(row).getAllByRole('cell');
    expect(cells[1]).toHaveTextContent('ORD001'); // Mã đơn hàng

    expect(container).toMatchSnapshot();
  });
});