import React from 'react';
import { render, screen } from '@testing-library/react';
import Testimonials from './Testimonials';

describe('Testimonials component', () => {
  beforeEach(() => render(<Testimonials />));

  test('hiển thị tiêu đề đánh giá và nhà tài trợ minh hoạ', () => {
    expect(screen.getByRole('heading', { name: 'Đánh giá từ nhà thuốc và bác sĩ' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Nhà tài trợ minh hoạ' })).toBeInTheDocument();
  });

  test('hiển thị sáu người đánh giá với ảnh hợp lệ', () => {
    const names = [
      'Dược sĩ Minh Anh',
      'Bác sĩ Hoàng Nam',
      'Dược sĩ Thu Hà',
      'Y tá Bảo Trân',
      'Bác sĩ Quang Huy',
      'Dược sĩ Lan Phương'
    ];

    names.forEach((name, index) => {
      expect(screen.getAllByRole('heading', { name })).toHaveLength(2);
      screen.getAllByAltText(name).forEach((image) => {
        expect(image).toHaveAttribute('src', `/images/pharmacare/reviewer-${index + 1}.png`);
      });
    });
  });

  test('hiển thị các thương hiệu tài trợ minh hoạ', () => {
    expect(screen.getAllByAltText('FPT Long Châu')).toHaveLength(3);
    expect(screen.getAllByAltText('Nhà thuốc An Khang')).toHaveLength(3);
    expect(screen.getAllByAltText('Pharmacity')).toHaveLength(3);
    expect(screen.getAllByAltText('MEDiCARE')).toHaveLength(3);
  });
});
