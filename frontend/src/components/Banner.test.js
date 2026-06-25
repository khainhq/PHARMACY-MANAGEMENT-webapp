import React from 'react';
import { render, screen } from '@testing-library/react';
import Banner from './Banner';

describe('Banner component', () => {
    test('renders title, subtitle, and button', () => {
        render(<Banner />);

        // Kiểm tra tiêu đề
        const title = screen.getByText(/Smart Pharmaceutical Management Solution/i);
        expect(title).toBeInTheDocument();

        // Kiểm tra phụ đề
        const subtitle = screen.getByText(/Streamline your pharmacy operations/i);
        expect(subtitle).toBeInTheDocument();

        // Kiểm tra nút Get Started
        const button = screen.getByRole('link', { name: /Get Started/i });
        expect(button).toBeInTheDocument();
        expect(button).toHaveAttribute('href', '/login');
    });

    test('renders the banner image with correct alt text', () => {
        render(<Banner />);
        const image = screen.getByAltText(/Pharmacy Management System/i);
        expect(image).toBeInTheDocument();
        expect(image).toHaveAttribute('src', '/images/medicine2-Photoroom.png');
    });
});
