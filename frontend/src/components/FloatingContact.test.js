import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import FloatingContact from './FloatingContact';

describe('FloatingContact component', () => {
  test('hiện số điện thoại khi nhấn nút gọi', () => {
    render(<FloatingContact />);

    expect(screen.queryByText('0816151762')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Hiện số điện thoại' }));
    expect(screen.getByRole('link', { name: '0816151762' })).toHaveAttribute('href', 'tel:0816151762');
  });

  test('không hiển thị liên kết Zalo', () => {
    render(<FloatingContact />);

    expect(screen.queryByRole('link', { name: 'Liên hệ qua Zalo' })).not.toBeInTheDocument();
  });
});
