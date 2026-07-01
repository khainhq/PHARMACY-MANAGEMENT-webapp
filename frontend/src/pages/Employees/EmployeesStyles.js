import styled from 'styled-components';

export const Container = styled.div`
  display: flex;
  box-sizing: border-box;
  background-color: #f3f4f6;
  font-family: 'Roboto', sans-serif;

  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }
`;

export const Content = styled.div`
  flex: 1;
  min-width: 0;
  padding: clamp(1rem, 1.5vw, 2rem);
  margin-left: 250px;
  background-color: #ffffff;
  border-radius: 12px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  overflow-x: auto;
`;

export const Toolbar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
  margin-bottom: 1rem;
`;

export const Button = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  background-color: rgb(6, 150, 102);
  color: #ffffff;
  border: none;
  padding: 0.62rem 0.95rem;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  line-height: 1.2;
  min-height: 36px;
  white-space: nowrap;
  cursor: pointer;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: rgb(3, 93, 64);
  }
`;

export const SearchInput = styled.input`
  padding: 0.75rem;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  width: min(320px, 100%);
  font-size: 0.9rem;
`;

export const Table = styled.table`
  width: 100%;
  min-width: 980px;
  table-layout: fixed;
  border-collapse: collapse;
  margin-top: 1.5rem;
  background-color: #ffffff;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

export const TableHeader = styled.th`
  background-color: rgb(6, 150, 102);
  color: #ffffff;
  padding: 0.75rem 0.85rem;
  text-align: left;
  font-size: 0.92rem;
  line-height: 1.35;
  vertical-align: top;
  overflow-wrap: break-word;
  word-break: normal;
`;

export const TableCell = styled.td`
  border: 1px solid #e5e7eb;
  padding: 0.7rem 0.85rem;
  font-size: 0.9rem;
  line-height: 1.35;
  color: #374151;
  vertical-align: top;
  overflow-wrap: break-word;
  word-break: normal;

  &:hover {
    background-color: #f9fafb;
  }
`;

export const genderMap = {
  Male: 'Nam',
  Female: 'Nữ',
  Nam: 'Nam',
  Nữ: 'Nữ',
  Other: 'Khác',
  Khác: 'Khác',
};

export const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  margin-bottom: 2rem;
  padding: 2rem;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  background-color: #f9fafb;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

export const Input = styled.input`
  padding: 0.75rem;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 0.9rem;
  color: #374151;
`;

export const Select = styled.select`
  padding: 0.75rem;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 0.9rem;
  color: #374151;
`;
