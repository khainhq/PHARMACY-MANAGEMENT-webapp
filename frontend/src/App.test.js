import { render, screen } from '@testing-library/react';
import App from './App';

jest.mock('jspdf', () => jest.fn());
jest.mock('html2canvas', () => jest.fn());
jest.mock('framer-motion', () => {
  const React = require('react');
  const ignored = new Set(['initial', 'animate', 'exit', 'transition', 'whileInView', 'whileHover', 'whileTap', 'viewport']);
  return {
    motion: new Proxy({}, {
      get: (_, tag) => ({ children, ...props }) => {
        const validProps = Object.fromEntries(Object.entries(props).filter(([key]) => !ignored.has(key)));
        return React.createElement(tag, validProps, children);
      }
    })
  };
});

test('hiển thị trang chủ PharmaCare', () => {
  window.history.pushState({}, '', '/');
  render(<App />);

  expect(screen.getByRole('link', { name: /PharmaCare Logo Pharma\s*Care/ })).toBeInTheDocument();
  expect(screen.getByRole('heading', {
    name: 'Quản lý nhà thuốc thông minh cho PharmaCare'
  })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Hiện số điện thoại' })).toBeInTheDocument();
  expect(screen.queryByRole('link', { name: 'Liên hệ qua Zalo' })).not.toBeInTheDocument();
});
