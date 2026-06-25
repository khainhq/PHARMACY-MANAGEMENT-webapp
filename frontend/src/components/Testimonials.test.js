import React from 'react';
import { render, screen } from '@testing-library/react';
import Testimonials from './Testimonials';

// Giả lập framer-motion để tránh lỗi và xử lý props thành chuỗi JSON
jest.mock('framer-motion', () => ({
  motion: {
    section: ({ children, ...props }) => (
      <section {...Object.keys(props).reduce((acc, key) => ({
        ...acc,
        [key]: typeof props[key] === 'object' ? JSON.stringify(props[key]) : props[key],
      }), {})}>
        {children}
      </section>
    ),
    div: ({ children, ...props }) => (
      <div {...Object.keys(props).reduce((acc, key) => ({
        ...acc,
        [key]: typeof props[key] === 'object' ? JSON.stringify(props[key]) : props[key],
      }), {})}>
        {children}
      </div>
    ),
    h2: ({ children, ...props }) => (
      <h2 {...Object.keys(props).reduce((acc, key) => ({
        ...acc,
        [key]: typeof props[key] === 'object' ? JSON.stringify(props[key]) : props[key],
      }), {})}>
        {children}
      </h2>
    ),
    blockquote: ({ children, ...props }) => (
      <blockquote {...Object.keys(props).reduce((acc, key) => ({
        ...acc,
        [key]: typeof props[key] === 'object' ? JSON.stringify(props[key]) : props[key],
      }), {})}>
        {children}
      </blockquote>
    ),
  },
}));

describe('Testimonials component', () => {
  beforeEach(() => {
    // Reset mock trước mỗi bài kiểm thử
    jest.clearAllMocks();
  });

  test('hiển thị tiêu đề, trích dẫn, và thông tin tác giả', () => {
    render(<Testimonials />);

    // Kiểm tra tiêu đề
    expect(screen.getByText(/What Our Clients Say/i)).toBeInTheDocument();

    // Kiểm tra trích dẫn
    expect(
      screen.getByText(/The pharmacy management system has revolutionized how we operate./i)
    ).toBeInTheDocument();

    // Kiểm tra thông tin tác giả
    expect(screen.getByText(/Josh Kirven/i)).toBeInTheDocument();
    expect(screen.getByText(/Pharmacy Owner/i)).toBeInTheDocument();
  });

  test('hiển thị hình ảnh với thuộc tính alt hợp lệ', () => {
    render(<Testimonials />);

    // Kiểm tra hình ảnh chính
    const customerImage = screen.getByAltText(/Happy Customer/i);
    expect(customerImage).toBeInTheDocument();
    expect(customerImage).toHaveAttribute('src', '/images/customer-Photoroom.png');

    // Kiểm tra hình ảnh tác giả
    const authorImage = screen.getByAltText(/Josh Kirven/i);
    expect(authorImage).toBeInTheDocument();
    expect(authorImage).toHaveAttribute('src', '/images/avatar.png');
  });

  test('áp dụng thuộc tính motion cho các phần tử', () => {
    render(<Testimonials />);

    // Kiểm tra div chứa hình ảnh (ImageContainer)
    const imageContainer = screen.getByAltText(/Happy Customer/i).parentElement;
    expect(imageContainer).toHaveAttribute('initial', JSON.stringify({ x: -100, opacity: 0 }));
    expect(imageContainer).toHaveAttribute('whileInView', JSON.stringify({ x: 0, opacity: 1 }));

    // Kiểm tra tiêu đề (Title)
    const title = screen.getByText(/What Our Clients Say/i);
    expect(title).toHaveAttribute('initial', JSON.stringify({ y: 30, opacity: 0 }));
    expect(title).toHaveAttribute('whileInView', JSON.stringify({ y: 0, opacity: 1 }));

    // Kiểm tra trích dẫn (Quote)
    const quote = screen.getByText(/The pharmacy management system has revolutionized how we operate./i);
    expect(quote).toHaveAttribute('initial', JSON.stringify({ opacity: 0 }));
    expect(quote).toHaveAttribute('whileInView', JSON.stringify({ opacity: 1 }));

    // Kiểm tra tác giả (Author)
    const authorText = screen.getByText(/Josh Kirven/i);
    const author = authorText.closest('div').parentElement; // Lên hai cấp cha để lấy motion.div
    expect(author).toHaveAttribute('initial', JSON.stringify({ y: 20, opacity: 0 }));
    expect(author).toHaveAttribute('whileInView', JSON.stringify({ y: 0, opacity: 1 }));
  });

  test('hiển thị đúng trên màn hình nhỏ (responsive)', () => {
    // Giả lập màn hình nhỏ
    global.innerWidth = 500;
    global.dispatchEvent(new Event('resize'));

    render(<Testimonials />);

    // Kiểm tra tiêu đề vẫn hiển thị
    expect(screen.getByText(/What Our Clients Say/i)).toBeInTheDocument();

    // Kiểm tra trích dẫn vẫn hiển thị
    expect(
      screen.getByText(/The pharmacy management system has revolutionized how we operate./i)
    ).toBeInTheDocument();

    // Kiểm tra thông tin tác giả vẫn hiển thị
    expect(screen.getByText(/Josh Kirven/i)).toBeInTheDocument();
  });
});