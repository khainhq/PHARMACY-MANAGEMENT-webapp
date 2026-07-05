import styled from 'styled-components';

export const Container = styled.div`
  display: flex;
  background-color: #f3f4f6; /* Màu nền tổng thể */
  font-family: 'Roboto', sans-serif; /* Phông chữ chuyên nghiệp */
`;

export const Content = styled.div`
  flex: 1;
  min-width: 0;
  min-height: 100vh;
  padding: clamp(1rem, 1.6vw, 2rem);
  margin-left: 220px;
  background-color: #ffffff;
  border-radius: 12px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
`;

export const Toolbar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
  margin-bottom: 1.5rem;
`;

export const Button = styled.button`
  padding: 0.75rem 1.5rem;
  background-color: rgb(6, 150, 102)
; /* Màu xanh lá cây */
  color: #ffffff;
  border: none;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: rgb(3, 93, 64); /* Màu xanh lá cây đậm hơn */
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
  min-width: 860px;
  border-collapse: collapse;
  margin-top: 1.5rem;
  background-color: #ffffff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

export const TableHeader = styled.th`
  background-color: rgb(6, 150, 102)
; /* Màu xanh đậm */
  color: #ffffff;
  padding: 1rem;
  text-align: left;
  font-size: 1rem;
  line-height: 1.3;
  overflow-wrap: normal;
  word-break: keep-all;
`;

export const TableCell = styled.td`
  border: 1px solid #e5e7eb;
  padding: 0.9rem 1rem;
  font-size: 0.9rem;
  color: #374151;
  vertical-align: middle;

  &:first-child,
  &:nth-child(5) {
    text-align: center;
    white-space: nowrap;
  }

  &:last-child {
    min-width: 240px;
  }

  &:last-child ${Button} {
    min-width: 88px;
    margin: 0.25rem;
    padding: 0.62rem 0.75rem;
    white-space: nowrap;
  }

  &:last-child ${Button}:nth-of-type(3) {
    display: block;
    width: min(190px, calc(100% - 0.5rem));
  }
`;

export const TableViewport = styled.div`
  width: 100%;
  overflow-x: auto;
`;

export const ActionGroup = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(82px, 1fr));
  gap: 0.5rem;
  width: min(230px, 100%);
  align-items: stretch;

  ${Button} {
    width: 100%;
    padding: 0.62rem 0.75rem;
    white-space: nowrap;
  }

  ${Button}:last-child:nth-child(3) {
    grid-column: 1 / -1;
  }
`;

export const EmptyCell = styled.td`
  padding: 1.5rem;
  border: 1px solid #e5e7eb;
  color: #64748b;
  text-align: center;
  font-weight: 700;
`;

export const roleMap = {
  1: 'Admin',
  2: 'Nhân viên bán hàng',
  3: 'Nhân viên quản lí sản phẩm',
};

// Add missing styled components
export const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  margin-bottom: 2rem;
  padding: 2rem;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  background-color: #f9fafb;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); /* Hiệu ứng đổ bóng */
`;

export const Input = styled.input`
  padding: 0.75rem;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 0.875rem;
  color: #374151;
`;

export const Select = styled.select`
  padding: 0.75rem;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 0.875rem;
  color: #374151;
`;
