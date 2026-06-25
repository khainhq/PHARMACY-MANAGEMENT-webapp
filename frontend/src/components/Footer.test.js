import React from 'react';
import { render, screen } from '@testing-library/react';
import Footer from './Footer';

describe('Footer component', () => {
    test('renders brand title and description', () => {
        render(<Footer />);
        const brandHeading = screen.getByRole('heading', { name: /PharmaCore/i, level: 4 });
        expect(brandHeading).toBeInTheDocument();
    
        expect(screen.getByText(/Your favourite online pharmacy store/i)).toBeInTheDocument();
    });

    test('renders quick links', () => {
        render(<Footer />);
        const links = [
            { name: /Contact Us/i, href: '/contact' },
            { name: /About Us/i, href: '/about' },
            { name: /Careers/i, href: '/careers' }
        ];

        links.forEach(link => {
            const element = screen.getByRole('link', { name: link.name });
            expect(element).toBeInTheDocument();
            expect(element).toHaveAttribute('href', link.href);
        });
    });

    test('renders services links', () => {
        render(<Footer />);
        const services = [
            { name: /Delivery/i, href: '/delivery' },
            { name: /Purchase/i, href: '/purchase' },
            { name: /Consult Specialist/i, href: '/consult' }
        ];

        services.forEach(link => {
            const element = screen.getByRole('link', { name: link.name });
            expect(element).toBeInTheDocument();
            expect(element).toHaveAttribute('href', link.href);
        });
    });

    test('renders address and contact info', () => {
        render(<Footer />);
        expect(screen.getByText(/123 Main Street/i)).toBeInTheDocument();
        expect(screen.getByText(/Phone: \+1 234 567 890/i)).toBeInTheDocument();
        expect(screen.getByText(/Email: support@d-express\.com/i)).toBeInTheDocument();
    });

    test('renders footer bottom with current year', () => {
        render(<Footer />);
        const year = new Date().getFullYear();
        expect(screen.getByText(new RegExp(`© ${year} PharmaCore. All rights reserved.`, 'i'))).toBeInTheDocument();
    });
});
