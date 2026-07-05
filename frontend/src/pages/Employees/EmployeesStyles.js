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
  margin-left: 220px;
  background-color: #ffffff;
  border-radius: 12px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  overflow-x: hidden;
`;

export const Toolbar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
  margin-bottom: 1rem;
`;

export const SearchBox = styled.div`
  position: relative;
  width: min(360px, 100%);

  svg {
    position: absolute;
    top: 50%;
    right: 0.9rem;
    transform: translateY(-50%);
    color: #64748b;
    pointer-events: none;
  }
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
  padding: 0.75rem 2.6rem 0.75rem 0.9rem;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  width: 100%;
  font-size: 0.9rem;
`;

export const FilterBar = styled.div`
  display: flex;
  align-items: flex-end;
  gap: 0.75rem;
  flex-wrap: wrap;
  margin-bottom: 1.5rem;
`;

export const FilterField = styled.label`
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  color: #334155;
  font-size: 0.82rem;
  font-weight: 700;
`;

export const Table = styled.table`
  width: 100%;
  min-width: 0;
  table-layout: fixed;
  border-collapse: collapse;
  margin-top: 1.5rem;
  background-color: #ffffff;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

export const TableViewport = styled.div`
  width: 100%;
  overflow-x: hidden;
`;

export const TableHeader = styled.th`
  background-color: rgb(6, 150, 102);
  color: #ffffff;
  padding: 0.75rem 0.85rem;
  text-align: left;
  font-size: 0.86rem;
  line-height: 1.35;
  vertical-align: top;
  overflow-wrap: break-word;
  word-break: normal;

  &:first-child {
    text-align: center;
    white-space: nowrap;
  }

  &:nth-child(8),
  &:nth-child(9) {
    text-align: center;
    vertical-align: middle;
  }
`;

export const TableCell = styled.td`
  border: 1px solid #e5e7eb;
  padding: 0.7rem 0.85rem;
  font-size: 0.84rem;
  line-height: 1.35;
  color: #374151;
  vertical-align: top;
  overflow-wrap: break-word;
  word-break: normal;

  &:first-child {
    text-align: center;
    white-space: nowrap;
  }

  &:nth-child(8),
  &:nth-child(9) {
    text-align: center;
  }

  &:hover {
    background-color: #f9fafb;
  }
`;

export const ActionGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;

  ${Button} {
    min-width: 0;
    padding: 0.5rem 0.75rem;
  }
`;

export const EmptyCell = styled.td`
  padding: 1.5rem;
  border: 1px solid #e5e7eb;
  color: #64748b;
  text-align: center;
  font-weight: 700;
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

export const FormField = styled.label`
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  color: #334155;
  font-size: 0.84rem;
  font-weight: 700;
`;

export const HelpText = styled.span`
  color: #64748b;
  font-size: 0.78rem;
  font-weight: 600;
`;

export const Input = styled.input`
  padding: 0.75rem;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 0.9rem;
  color: #374151;

  &[aria-invalid='true'] {
    border-color: #dc2626;
    background-color: #fff1f2;
  }
`;

export const Select = styled.select`
  padding: 0.75rem;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 0.9rem;
  color: #374151;
`;

export const SectionTitle = styled.h2`
  margin: 1.75rem 0 0.8rem;
  color: #0f172a;
  font-size: clamp(1.1rem, 1.4vw, 1.35rem);
`;

export const StatusBadge = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 70px;
  margin: 0 auto;
  padding: 0.24rem 0.48rem;
  border-radius: 999px;
  background: ${({ $active }) => ($active ? '#dcfce7' : '#fee2e2')};
  color: ${({ $active }) => ($active ? '#166534' : '#991b1b')};
  font-size: 0.74rem;
  font-weight: 800;
  white-space: nowrap;
`;
