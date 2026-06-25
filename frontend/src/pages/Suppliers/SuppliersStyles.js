import styled from 'styled-components';

export const Container = styled.div`
  display: flex;
  background-color: #f3f4f6; /* Màu nền tổng thể */
  font-family: 'Roboto', sans-serif; /* Phông chữ chuyên nghiệp */
`;

export const Content = styled.div`
  flex: 1;
  padding: 2rem;
  margin-left: 250px; /* Khoảng trống bằng độ rộng của sidebar */
  background-color: #ffffff; /* Màu nền trắng */
  border-radius: 12px; /* Bo góc mềm mại */
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); /* Hiệu ứng đổ bóng */
`;

export const Toolbar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
`;

export const Button = styled.button`
  background-color: rgb(6, 150, 102); /* Màu xanh lá cây */
  color: #ffffff;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-size: 0.9rem;
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
  width: 250px;
  font-size: 0.9rem;
`;

export const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 1.5rem;
  background-color: #ffffff;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); /* Hiệu ứng đổ bóng */
`;

export const TableHeader = styled.th`
  background-color: #059669; /* Màu xanh đậm */
  color: #ffffff;
  padding: 1rem;
  text-align: left;
  font-size: 1rem;
`;

export const TableCell = styled.td`
  border: 1px solid #e5e7eb;
  padding: 1rem;
  font-size: 0.9rem;
  color: #374151; /* Màu chữ xám đậm */
`;

export const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  margin-bottom: 2rem;
  padding: 1.5rem;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  background-color: #f9fafb;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); /* Hiệu ứng đổ bóng */
`;

export const Input = styled.input`
  padding: 0.75rem;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 0.9rem;
`;

export const SectionTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 700;
  color: #0f172a;
  margin-bottom: 1rem;
  text-align: center;
`;

export const Divider = styled.hr`
  border: none;
  border-top: 2px solid #e5e7eb;
  margin: 2rem 0;
`;

export const ActionButton = styled(Button)`
  width: 80px; /* Chiều rộng riêng cho nút Sửa và Xóa */
  padding: 0.5rem 1rem; /* Điều chỉnh padding nếu cần */
`;