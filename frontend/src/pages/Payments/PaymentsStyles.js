import styled from 'styled-components';

export const Container = styled.div`
  display: flex;
  align-items: flex-start;
  box-sizing: border-box;
  width: auto;
  min-height: 100vh;
  margin-left: 260px;
  padding: clamp(0.85rem, 1.4vw, 1.5rem);
  gap: clamp(0.85rem, 1.4vw, 1.5rem);
  background-color: #f3f4f6; /* Màu nền tổng thể */
  font-family: 'Roboto', sans-serif; /* Phông chữ chuyên nghiệp */
  overflow-x: hidden;

  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }

  @media (max-width: 1320px) {
    flex-direction: column;
  }
`;

export const LeftSection = styled.div`
  flex: 1 1 58%;
  min-width: 0;
  padding: 1.5rem;
  background-color: #ffffff;
  border-radius: 12px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);

  @media (max-width: 1320px) {
    width: 100%;
    flex: 1 1 auto;
  }
`;

export const RightSection = styled.div`
  flex: 0 1 620px;
  min-width: min(560px, 100%);
  padding: 1.5rem;
  background-color: #ffffff;
  border-radius: 12px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);

  @media (max-width: 1320px) {
    width: 100%;
    flex: 1 1 auto;
    min-width: 0;
  }
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
  overflow-x: auto;

  table {
    min-width: 640px;
    table-layout: auto;
  }
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
  table-layout: fixed;
  border-collapse: collapse;
  margin-top: 1rem;
  background-color: #ffffff;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

export const TableHeader = styled.th`
  background-color: rgb(6, 150, 102);
  color: #ffffff;
  padding: 0.65rem 0.7rem;
  text-align: left;
  font-size: 0.92rem;
  line-height: 1.35;
  vertical-align: top;
  overflow-wrap: break-word;
  word-break: normal;
`;

export const TableCell = styled.td`
  border: 1px solid #e5e7eb;
  padding: 0.65rem 0.7rem;
  font-size: 0.88rem;
  line-height: 1.4;
  color: #374151;
  vertical-align: top;
  overflow-wrap: break-word;
  word-break: normal;
`;

export const Button = styled.button`
  background-color: #059669;
  color: #ffffff;
  border: none;
  padding: 0.5rem 0.75rem;
  border-radius: 8px;
  font-size: 0.84rem;
  font-weight: 700;
  line-height: 1.25;
  min-height: 34px;
  max-width: 100%;
  white-space: normal;
  overflow-wrap: break-word;
  word-break: normal;
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
  min-width: 0;
  padding: clamp(0.5rem, 1vw, 1rem);
  margin-left: 0;
  background-color: #ffffff;
  min-height: 100vh;
`;

export const Toolbar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
  margin-bottom: 1rem;

  ${Input} {
    width: min(560px, 100%);
    margin-bottom: 0;
  }
`;

export const CenteredButton = styled(Button)`
  display: block;
  margin: 2rem auto; /* Căn giữa theo chiều ngang */
  padding: 1rem 2rem; /* Tăng kích thước nút */
  font-size: 1rem; /* Tăng kích thước chữ */
`;

export const TableViewport = styled.div`
  width: 100%;
  min-width: 0;
  overflow-x: auto;
`;

export const ActionGroup = styled.div`
  display: flex;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: 0.45rem;

  ${Button} {
    flex: 0 1 auto;
  }
`;

export const Modal = styled.div`
  position: fixed;
  inset: 0;
  z-index: 1000;
  background: rgba(15, 23, 42, 0.55);
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 1rem;
`;

export const ModalContent = styled.div`
  width: 440px;
  max-width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  background: #ffffff;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 24px 60px rgba(15, 23, 42, 0.25);
`;

export const ModalHeader = styled.div`
  margin-bottom: 1rem;
  color: #0f172a;
  font-size: 1.15rem;
  font-weight: 800;
  text-align: center;
`;

export const ModalBody = styled.div`
  margin-bottom: 1rem;
`;

export const ModalFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
`;
