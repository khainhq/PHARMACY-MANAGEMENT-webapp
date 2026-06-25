import React from 'react';
import { render, screen } from '@testing-library/react';
import Features from './Features';

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

describe('Features component', () => {
  test('hiển thị tiêu đề và nội dung giới thiệu tiếng Việt', () => {
    render(<Features />);

    expect(screen.getByRole('heading', { name: 'Tính năng nổi bật' })).toBeInTheDocument();
    expect(screen.getByText(/PharmaCare hỗ trợ những nghiệp vụ quan trọng/)).toBeInTheDocument();
  });

  test('hiển thị đủ bốn tính năng', () => {
    render(<Features />);

    [
      'Quản lý tồn kho',
      'Danh mục thuốc rõ ràng',
      'Báo cáo bán hàng',
      'Phân quyền nhân viên'
    ].forEach((title) => {
      expect(screen.getByRole('heading', { name: title, level: 3 })).toBeInTheDocument();
    });
  });
});
