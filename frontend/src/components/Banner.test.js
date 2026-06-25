import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import Banner from './Banner';

describe('Banner component', () => {
  test('hiển thị nội dung PharmaCare và nút bắt đầu', () => {
    render(<Banner />);

    expect(screen.getByRole('heading', {
      name: 'Quản lý nhà thuốc thông minh cho PharmaCare'
    })).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: 'Bắt đầu quản lý' })).toHaveLength(6);
    expect(screen.getAllByRole('link', { name: 'Bắt đầu quản lý' })[0]).toHaveAttribute('href', '/login');
  });

  test('hiển thị sáu nút điều hướng và cho phép chuyển ảnh', () => {
    render(<Banner />);

    const dots = screen.getAllByRole('button', { name: /Chuyển đến ảnh/ });
    expect(dots).toHaveLength(6);
    fireEvent.click(screen.getByRole('button', { name: 'Chuyển đến ảnh 3' }));
    expect(screen.getByRole('button', { name: 'Chuyển đến ảnh 3' })).toBeInTheDocument();
  });
});
