import React from 'react';
import { render, screen } from '@testing-library/react';
import Features from './Features';

// Mock framer-motion properly
jest.mock('framer-motion', () => {
    const React = require('react');
    return {
        motion: new Proxy({}, {
            get: (target, prop) => (props) => <div {...props} />
        })
    };
});

describe('Features component', () => {
    test('renders section title and subtitle', () => {
        render(<Features />);
        expect(screen.getByText(/Powerful Features/i)).toBeInTheDocument();
        expect(screen.getByText(/Everything you need to manage your pharmacy/i)).toBeInTheDocument();
    });

    test('renders all feature cards', () => {
        render(<Features />);
        const featureTitles = [
            'Inventory Management',
            'Medicine Database',
            'Sales Analytics',
            'Employee Management'
        ];

        featureTitles.forEach(title => {
            const heading = screen.getByRole('heading', { name: new RegExp(title, 'i'), level: 3 });
            expect(heading).toBeInTheDocument();
        });

        const cards = screen.getAllByRole('heading', { level: 3 });
        expect(cards).toHaveLength(4);
    });
});
