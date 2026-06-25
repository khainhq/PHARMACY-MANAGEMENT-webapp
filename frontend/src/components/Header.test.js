import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Header from './Header';

describe('Header component', () => {
    beforeEach(() => {
        render(
            <MemoryRouter>
                <Header />
            </MemoryRouter>
        );
    });

    test('renders logo image and text', () => {
        const logoImg = screen.getByAltText(/PharmaCore Logo/i);
        expect(logoImg).toBeInTheDocument();
        expect(logoImg).toHaveAttribute('src', '/images/logo.jpg');

        const logoText = screen.getByText(/PharmaCore/i);
        expect(logoText).toBeInTheDocument();
    });

    test('renders navigation links', () => {
        const homeLink = screen.getByRole('link', { name: /Home/i });
        const contactLink = screen.getByRole('link', { name: /Contact Us/i });
        const aboutLink = screen.getByRole('link', { name: /About Us/i });
        const signInButton = screen.getByRole('link', { name: /Sign In/i });

        expect(homeLink).toHaveAttribute('href', '/');
        expect(contactLink).toHaveAttribute('href', '/contact');
        expect(aboutLink).toHaveAttribute('href', '/about');
        expect(signInButton).toHaveAttribute('href', '/login');
    });
});
