// jest.setup.js
import '@testing-library/jest-dom';

// Ghi lại tất cả console.error để debug
const originalError = console.error;
console.error = (...args) => {
  originalError(...args);
};