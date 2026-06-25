import styled from 'styled-components';

export const Container = styled.div`
  display: flex;
  margin-left: 250px;
  padding: 2rem;
  gap: 2rem;
  background-color: #f3f4f6; /* Màu nền tổng thể */
  font-family: 'Roboto', sans-serif; /* Phông chữ chuyên nghiệp */
`;

export const LeftSection = styled.div`
  flex: 3;
  padding: 1.5rem;
  background-color: #ffffff;
  border-radius: 12px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
`;

export const RightSection = styled.div`
  flex: 1;
  padding: 1.5rem;
  background-color: #ffffff;
  border-radius: 12px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
`;

export const MedicineDetails = styled.div`
  margin-bottom: 1.5rem;
  padding: 1.5rem;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  background-color: #f9fafb;

  h2 {
    text-align: center;
    margin-bottom: 1rem;
    color: #0f172a;
    font-size: 1.5rem;
  }

  img {
    display: block;
    border-radius: 12px;
    border: 1px solid #e5e7eb;
  }

  p {
    margin: 0.5rem 0;
    font-size: 1rem;
    color: #374151;
  }

  strong {
    color: #0f172a;
  }
`;

export const MedicineList = styled.div`
  margin-top: 1rem;
`;

export const PaymentDetailsTable = styled.div`
  margin-bottom: 2rem;
`;

export const PaymentInfo = styled.div`
  margin-top: 2rem;

  h2 {
    font-size: 1.5rem;
    font-weight: 700;
    color: #0f172a;
    margin-bottom: 1rem;
    text-align: center;
  }

  h3 {
    font-size: 1.25rem;
    font-weight: 600;
    color: #059669;
    margin-top: 1rem;
    text-align: center;
  }
`;

export const Table = styled.table`
  width: 100%;
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
  padding: 1rem;
  text-align: left;
  font-size: 1rem;
`;

export const TableCell = styled.td`
  border: 1px solid #e5e7eb;
  padding: 1rem;
  font-size: 0.9rem;
  color: #374151;
`;

export const Button = styled.button`
  background-color: #059669;
  color: #ffffff;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: rgb(3, 93, 64);
  }
`;

export const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  margin-bottom: 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 0.9rem;
`;

export const Select = styled.select`
  width: 100%;
  padding: 0.75rem;
  margin-bottom: 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 0.9rem;
`;

export const Content = styled.div`
  flex: 1;
  padding: 1rem;
  margin-left: 250px; /* Adjust for sidebar width */
  background-color: #ffffff;
  min-height: 100vh;
`;

export const Toolbar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

export const CenteredButton = styled(Button)`
  display: block;
  margin: 2rem auto; /* Căn giữa theo chiều ngang */
  padding: 1rem 2rem; /* Tăng kích thước nút */
  font-size: 1rem; /* Tăng kích thước chữ */
`;