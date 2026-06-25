import React from 'react';
import { render, screen, waitFor, fireEvent, act } from '@testing-library/react';
import { within } from '@testing-library/react';
import axios from 'axios';
import ListInvoices from './ListInvoices';

// Mock dependencies
jest.mock('axios');
jest.mock('../../components/Sidebar', () => () => <div>Mocked Sidebar</div>);

// Set global timeout for all tests
jest.setTimeout(30000);

describe('ListInvoices component', () => {
  let mockInvoices;

  beforeEach(async () => {
    console.log('beforeEach: Setting up test environment');

    // Use fake timers for async control
    jest.useFakeTimers();
    console.log('beforeEach: Enabled fake timers');

    // Reset mocks
    axios.get.mockReset();
    axios.delete.mockReset();

    // Set up initial mock invoices data
    mockInvoices = [
      {
        invoiceID: 'INV001',
        customer: 'Nguyen Van A',
        address: '123 Ha Noi',
        paymentMethod: 'Cash',
        status: 'Chưa thanh toán',
      },
      {
        invoiceID: 'INV002',
        customer: 'Tran Thi B',
        address: '456 Da Nang',
        paymentMethod: 'Cash',
        status: 'Đã thanh toán',
      },
    ];
    console.log('beforeEach: mockInvoices:', mockInvoices);

    // Set up token in sessionStorage
    sessionStorage.setItem('token', 'dummyToken');
    console.log('beforeEach: sessionStorage token set');

    // Mock API responses
    axios.get.mockImplementation((url, config) => {
      console.log('axios.get mock called for URL:', url, 'with headers:', config?.headers);
      if (url === 'http://localhost:8000/api/sales/invoices/') {
        console.log('Returning mock invoices:', mockInvoices);
        return Promise.resolve({ data: mockInvoices });
      } else if (url === 'http://localhost:8000/api/sales/invoice-details/?invoice=INV001') {
        console.log('Returning mock invoice details');
        return Promise.resolve({
          data: [
            {
              invoice: 'INV001',
              medicine: 'MED001',
              quantity: 1,
              unitPrice: 5000,
            },
          ],
        });
      } else if (url === 'http://localhost:8000/api/sales/invoices/INV001/') {
        console.log('Returning mock invoice');
        return Promise.resolve({
          data: {
            customer: 'CUST123',
          },
        });
      } else if (url === 'http://localhost:8000/api/sales/customers/CUST123/') {
        console.log('Returning mock customer');
        return Promise.resolve({
          data: {
            fullName: 'Nguyen Van A',
          },
        });
      } else if (url === 'http://localhost:8000/api/medicines/medicines/MED001/') {
        console.log('Returning mock medicine');
        return Promise.resolve({
          data: {
            medicineName: 'Paracetamol',
            unit: 'Box',
            unitPrice: 5000,
          },
        });
      } else {
        console.log('No mock for URL:', url);
        return Promise.reject(new Error(`No mock for URL: ${url}`));
      }
    });

    axios.delete.mockImplementation((url) => {
      console.log('axios.delete mock called for URL:', url);
      if (url === 'http://localhost:8000/api/sales/invoices/INV001/') {
        mockInvoices = mockInvoices.filter((invoice) => invoice.invoiceID !== 'INV001');
        console.log('Mock invoice deleted, new mockInvoices:', mockInvoices);
        return Promise.resolve({});
      }
      return Promise.reject(new Error('Not mocked'));
    });

    // Mock window.confirm
    window.confirm = jest.fn(() => true);
    console.log('beforeEach: window.confirm mocked');
  });

  afterEach(() => {
    sessionStorage.clear();
    jest.clearAllMocks();
    jest.useRealTimers();
    console.log('afterEach: Cleared mocks, sessionStorage, and restored real timers');
  });

  test('hiển thị Sidebar, tiêu đề và bảng danh sách hóa đơn', async () => {
    console.log('Test: hiển thị Sidebar, tiêu đề và bảng danh sách hóa đơn');
    await act(async () => {
      render(<ListInvoices />);
      console.log('Rendered ListInvoices');
      jest.advanceTimersByTime(1000);
    });

    await waitFor(
      () => {
        console.log('waitFor: Checking rendered elements');
        console.log('DOM contains main-content:', !!screen.queryByTestId('main-content'));
        console.log('DOM contains invoices-table:', !!screen.queryByTestId('invoices-table'));
        screen.debug();
        expect(screen.getByTestId('main-content')).toBeInTheDocument();
        expect(screen.getByText(/Danh sách hóa đơn/i)).toBeInTheDocument();
        expect(screen.getByTestId('invoices-table')).toBeInTheDocument();
        expect(screen.getByText(/Mã hóa đơn/i)).toBeInTheDocument();
        expect(screen.getByText(/Khách hàng/i)).toBeInTheDocument();
        expect(screen.getByText(/Địa chỉ/i)).toBeInTheDocument();
        expect(screen.getByText(/Phương thức thanh toán/i)).toBeInTheDocument();
        expect(screen.getByText(/Trạng thái/i)).toBeInTheDocument();
        expect(screen.getByText(/Hành động/i)).toBeInTheDocument();

        const row1 = screen.getByText(/INV001/i).closest('tr');
        expect(within(row1).getByText(/Nguyen Van A/i)).toBeInTheDocument();
        expect(within(row1).getByText(/123 Ha Noi/i)).toBeInTheDocument();
        expect(within(row1).getByText(/Cash/i)).toBeInTheDocument();
        expect(within(row1).getByText(/Chưa thanh toán/i)).toBeInTheDocument();

        const row2 = screen.getByText(/INV002/i).closest('tr');
        expect(within(row2).getByText(/Tran Thi B/i)).toBeInTheDocument();
        expect(within(row2).getByText(/456 Da Nang/i)).toBeInTheDocument();
        expect(within(row2).getByText(/Cash/i)).toBeInTheDocument();
        expect(within(row2).getByText(/Đã thanh toán/i)).toBeInTheDocument();
      },
      { timeout: 10000 }
    );
    console.log('Test completed: hiển thị Sidebar, tiêu đề và bảng danh sách hóa đơn');
  });

  test('tìm kiếm hóa đơn theo mã hóa đơn', async () => {
    console.log('Test: tìm kiếm hóa đơn theo mã hóa đơn');
    await act(async () => {
      render(<ListInvoices />);
      console.log('Rendered ListInvoices');
      jest.advanceTimersByTime(1000);
    });

    await waitFor(
      () => {
        console.log('waitFor: Checking initial invoices');
        console.log('DOM contains main-content:', !!screen.queryByTestId('main-content'));
        console.log('DOM contains search-input:', !!screen.queryByTestId('search-input'));
        screen.debug();
        expect(screen.getByTestId('main-content')).toBeInTheDocument();
        expect(screen.getByText(/INV001/i)).toBeInTheDocument();
        expect(screen.getByText(/INV002/i)).toBeInTheDocument();
      },
      { timeout: 10000 }
    );

    const searchInput = screen.getByTestId('search-input');
    console.log('Found search-input');
    await act(async () => {
      fireEvent.change(searchInput, { target: { value: 'INV001' } });
      console.log('Fired change event on search-input with value: INV001');
      jest.advanceTimersByTime(1000);
    });

    await waitFor(
      () => {
        console.log('waitFor: Checking filtered invoices');
        expect(screen.getByText(/INV001/i)).toBeInTheDocument();
        expect(screen.queryByText(/INV002/i)).not.toBeInTheDocument();
      },
      { timeout: 10000 }
    );
    console.log('Test completed: tìm kiếm hóa đơn theo mã hóa đơn');
  });

  test('xem chi tiết hóa đơn và hiển thị modal', async () => {
    console.log('Test: xem chi tiết hóa đơn và hiển thị modal');
    await act(async () => {
      render(<ListInvoices />);
      console.log('Rendered ListInvoices');
      jest.advanceTimersByTime(1000);
    });

    await waitFor(
      () => {
        console.log('waitFor: Checking initial render');
        console.log('DOM contains main-content:', !!screen.queryByTestId('main-content'));
        console.log('DOM contains view-details-INV001:', !!screen.queryByTestId('view-details-INV001'));
        screen.debug();
        expect(screen.getByTestId('main-content')).toBeInTheDocument();
        expect(screen.getByText(/INV001/i)).toBeInTheDocument();
        expect(screen.getByTestId('view-details-INV001')).toBeInTheDocument();
      },
      { timeout: 10000 }
    );

    const viewDetailsButton = screen.getByTestId('view-details-INV001');
    console.log('Found viewDetailsButton for INV001');
    await act(async () => {
      console.log('Before clicking viewDetailsButton, axios.get calls:', axios.get.mock.calls);
      fireEvent.click(viewDetailsButton);
      console.log('Clicked viewDetailsButton for INV001');
      jest.advanceTimersByTime(1000);
      console.log('After clicking viewDetailsButton, axios.get calls:', axios.get.mock.calls);
    });

    await waitFor(
      () => {
        console.log('waitFor: Checking modal render');
        console.log('DOM contains invoice-details-modal:', !!screen.queryByTestId('invoice-details-modal'));
        screen.debug();
        const modal = screen.getByTestId('invoice-details-modal');
        expect(modal).toBeInTheDocument();
        expect(within(modal).getByTestId('customer-name')).toHaveTextContent(/Khách hàng: Nguyen Van A/i);
        expect(within(modal).getByTestId('details-table')).toBeInTheDocument();
        
        const detailsTable = within(modal).getByTestId('details-table');
        expect(within(detailsTable).getByText(/Paracetamol/i)).toBeInTheDocument();
        expect(within(detailsTable).getByText(/Box/i)).toBeInTheDocument();
        expect(within(detailsTable).getByText(/1/i)).toBeInTheDocument();
        expect(within(detailsTable).getByText(/5\.000 VND/i)).toBeInTheDocument();
        
        expect(within(modal).getByTestId('total-amount')).toHaveTextContent(/Tổng tiền: 5\.000 VND/i);
      },
      { timeout: 30000 }
    );

    const closeButton = screen.getByRole('button', { name: /Đóng/i });
    console.log('Found closeButton');
    await act(async () => {
      fireEvent.click(closeButton);
      console.log('Clicked closeButton');
      jest.advanceTimersByTime(1000);
    });

    await waitFor(
      () => {
        console.log('waitFor: Checking modal closed');
        expect(screen.queryByTestId('invoice-details-modal')).not.toBeInTheDocument();
      },
      { timeout: 10000 }
    );
    console.log('Test completed: xem chi tiết hóa đơn và hiển thị modal');
  });

  test('xóa hóa đơn', async () => {
    console.log('Test: xóa hóa đơn');
    await act(async () => {
      render(<ListInvoices />);
      console.log('Rendered ListInvoices');
      jest.advanceTimersByTime(1000);
    });

    await waitFor(
      () => {
        console.log('waitFor: Checking initial render');
        console.log('DOM contains main-content:', !!screen.queryByTestId('main-content'));
        screen.debug();
        expect(screen.getByTestId('main-content')).toBeInTheDocument();
        expect(screen.getByText(/INV001/i)).toBeInTheDocument();
      },
      { timeout: 10000 }
    );

    const deleteButton = screen.getAllByRole('button', { name: /Xóa/i })[0];
    console.log('Found deleteButton');
    await act(async () => {
      fireEvent.click(deleteButton);
      console.log('Clicked deleteButton');
      jest.advanceTimersByTime(1000);
    });

    await waitFor(
      () => {
        console.log('waitFor: Checking invoice deleted');
        expect(screen.queryByText(/INV001/i)).not.toBeInTheDocument();
        expect(screen.getByText(/INV002/i)).toBeInTheDocument();
      },
      { timeout: 10000 }
    );
    console.log('Test completed: xóa hóa đơn');
  });

  test('snapshot của giao diện ListInvoices', async () => {
    console.log('Test: snapshot của giao diện ListInvoices');
    const { container } = await act(async () => {
      render(<ListInvoices />);
      console.log('Rendered ListInvoices');
      jest.advanceTimersByTime(1000);
      return { container: document.body };
    });

    await waitFor(
      () => {
        console.log('waitFor: Checking initial render');
        console.log('DOM contains main-content:', !!screen.queryByTestId('main-content'));
        screen.debug();
        expect(screen.getByTestId('main-content')).toBeInTheDocument();
        expect(screen.getByText(/INV001/i)).toBeInTheDocument();
      },
      { timeout: 10000 }
    );

    expect(container).toMatchSnapshot();
    console.log('Test completed: snapshot của giao diện ListInvoices');
  });
});