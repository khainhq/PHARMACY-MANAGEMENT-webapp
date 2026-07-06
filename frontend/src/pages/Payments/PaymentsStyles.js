import styled from 'styled-components';

export const Container = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1.35fr) minmax(420px, 0.95fr);
  align-items: stretch;
  box-sizing: border-box;
  width: calc(100% - 220px);
  max-width: calc(100% - 220px);
  min-width: 0;
  height: 100vh;
  margin-left: 220px;
  padding: clamp(0.85rem, 1.4vw, 1.5rem);
  gap: clamp(0.85rem, 1.4vw, 1.5rem);
  background-color: #f3f4f6; /* Màu nền tổng thể */
  font-family: 'Roboto', sans-serif; /* Phông chữ chuyên nghiệp */
  overflow: hidden;

  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }

  @media (max-width: 1120px) {
    grid-template-columns: 1fr;
    height: auto;
    min-height: 100vh;
    overflow: visible;
  }
`;

export const ListPageContainer = styled.div`
  display: flex;
  box-sizing: border-box;
  min-height: 100vh;
  background-color: #f3f4f6;
  font-family: 'Roboto', sans-serif;

  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }
`;

export const LeftSection = styled.div`
  display: flex;
  flex-direction: column;
  min-width: 0;
  min-height: 0;
  padding: clamp(0.85rem, 1.15vw, 1.2rem);
  background-color: #ffffff;
  border-radius: 12px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;

  @media (max-width: 1120px) {
    width: 100%;
    flex: 1 1 auto;
  }
`;

export const RightSection = styled.div`
  display: flex;
  flex-direction: column;
  min-width: 0;
  min-height: 0;
  padding: clamp(0.85rem, 1.15vw, 1.2rem);
  background-color: #ffffff;
  border-radius: 12px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;

  @media (max-width: 1120px) {
    width: 100%;
    flex: 1 1 auto;
    min-width: 0;
  }
`;

export const MedicineDetails = styled.div`
  position: relative;
  max-height: min(360px, 45vh);
  margin-bottom: 1.5rem;
  padding: 1.5rem;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  background-color: #f9fafb;
  overflow-y: auto;

  h2 {
    text-align: center;
    margin: 0 2.6rem 1rem;
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

export const ClosePanelButton = styled.button`
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  z-index: 2;
  display: inline-flex;
  width: 36px;
  height: 36px;
  align-items: center;
  justify-content: center;
  border: 2px solid #ef4444;
  border-radius: 8px;
  background: #ffffff;
  color: #dc2626;
  cursor: pointer;
  font-size: 1.05rem;
  box-shadow: 0 8px 18px rgba(220, 38, 38, 0.18);

  &:hover,
  &:focus-visible {
    background: #fee2e2;
    outline: none;
  }
`;

export const MedicineList = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 0;
  margin-top: 1rem;
  overflow-y: auto;
  padding-right: 0.25rem;

  table {
    flex: 0 0 auto;
    margin-top: 0.65rem;
  }
`;

export const PaymentDetailsTable = styled.div`
  flex: 1 1 auto;
  min-height: 130px;
  max-height: 34vh;
  margin-bottom: 0.9rem;
  overflow-x: hidden;
  overflow-y: auto;

  table {
    min-width: 0;
    width: 100%;
    table-layout: fixed;
    margin-top: 0.65rem;
  }

  th,
  td {
    font-size: clamp(0.68rem, 0.78vw, 0.82rem);
    padding: 0.42rem 0.36rem;
  }
`;

export const PaymentInfo = styled.div`
  flex: 0 0 auto;
  margin-top: 0;
  font-size: 0.82rem;

  h2 {
    font-size: clamp(1rem, 1.2vw, 1.18rem);
    font-weight: 700;
    color: #0f172a;
    margin: 0 0 0.45rem;
    text-align: center;
  }

  h3 {
    font-size: 0.95rem;
    font-weight: 600;
    color: #059669;
    margin: 0.45rem 0 0;
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
  padding: 0.52rem 0.56rem;
  text-align: left;
  font-size: 0.84rem;
  line-height: 1.28;
  vertical-align: top;
  overflow-wrap: normal;
  word-break: keep-all;
`;

export const TableCell = styled.td`
  border: 1px solid #e5e7eb;
  padding: 0.52rem 0.56rem;
  font-size: 0.82rem;
  line-height: 1.32;
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
  padding: 0.62rem 0.7rem;
  margin-bottom: 0.65rem;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 0.9rem;
`;

export const Select = styled.select`
  width: 100%;
  padding: 0.5rem 0.6rem;
  margin-bottom: 0.5rem;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 0.84rem;
`;

export const Content = styled.div`
  flex: 1;
  min-width: 0;
  padding: clamp(0.5rem, 1vw, 1rem);
  margin-left: 220px;
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
    width: min(920px, calc(100vw - 320px));
    min-width: min(520px, 100%);
    margin-bottom: 0;
  }
`;

export const FilterBar = styled.div`
  display: flex;
  align-items: flex-end;
  gap: 0.75rem;
  flex-wrap: wrap;
  margin-bottom: 1rem;

  input,
  select {
    width: min(190px, 100%);
    margin-bottom: 0;
  }
`;

export const FilterField = styled.label`
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  color: #334155;
  font-size: 0.82rem;
  font-weight: 700;
`;

export const CenteredButton = styled(Button)`
  display: block;
  margin: 0.9rem auto 0;
  padding: 0.78rem 1.35rem;
  font-size: 0.95rem;
`;

export const TableViewport = styled.div`
  width: 100%;
  min-width: 0;
  overflow-x: auto;

  ${Table} {
    min-width: 1060px;
  }
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

export const EmptyCell = styled.td`
  padding: 1.5rem;
  border: 1px solid #e5e7eb;
  color: #64748b;
  text-align: center;
  font-weight: 700;
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
