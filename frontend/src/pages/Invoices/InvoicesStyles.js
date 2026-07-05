import styled from 'styled-components';

export const Container = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1.45fr) minmax(420px, 0.85fr);
  align-items: stretch;
  box-sizing: border-box;
  width: calc(100% - 220px);
  max-width: calc(100% - 220px);
  min-width: 0;
  height: 100vh;
  margin-left: 220px;
  padding: clamp(0.85rem, 1.4vw, 1.5rem);
  gap: clamp(0.85rem, 1.4vw, 1.5rem);
  background-color: #f3f4f6;
  font-family: 'Roboto', sans-serif;
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

export const ListContainer = styled.div`
  box-sizing: border-box;
  width: calc(100% - 220px);
  min-height: 100vh;
  margin-left: 220px;
  padding: clamp(1rem, 1.6vw, 2rem);
  background-color: #f3f4f6;
  font-family: 'Roboto', sans-serif;
  overflow-x: hidden;

  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }
`;

export const LeftSection = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1 1 auto;
  min-width: 0;
  min-height: 0;
  padding: clamp(0.75rem, 1vw, 1rem);
  background-color: #ffffff;
  border-radius: 12px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;

  @media (max-width: 1120px) {
    width: 100%;
    min-height: 560px;
  }
`;

export const RightSection = styled.div`
  display: flex;
  flex-direction: column;
  min-width: 0;
  min-height: 0;
  padding: clamp(0.75rem, 1vw, 1rem);
  background-color: #ffffff;
  border-radius: 12px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;

  @media (max-width: 1120px) {
    width: 100%;
    min-height: 560px;
  }
`;
export const MedicineDetails = styled.div`
  flex: 0 0 auto;
  margin-bottom: 0.85rem;
  padding: 0.9rem;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  background-color: #f9fafb;

  h2 {
    margin: 0 0 0.75rem;
    color: #0f172a;
    font-size: 1.1rem;
  }

  img {
    display: block;
    border-radius: 12px;
    border: 1px solid #e5e7eb;
  }

  p {
    margin: 0.32rem 0;
    font-size: 0.9rem;
    color: #374151;
  }

  strong {
    color: #0f172a;
  }
`;

export const MedicineList = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 0;

  h2 {
    margin: 0 0 0.75rem;
  }

  input {
    margin-bottom: 0.75rem;
  }
`;

export const Cart = styled.div`
  flex: 0 0 min(36%, 250px);
  min-height: 150px;
  margin-bottom: 0.85rem;
  overflow-x: hidden;
  overflow-y: auto;

  h2 {
    margin: 0 0 0.75rem;
  }

  table {
    min-width: 0;
    width: 100%;
    table-layout: fixed;
  }
`;

export const InvoiceInfo = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 0;
  margin-top: 0;
  overflow-y: auto;
  padding-right: 0.15rem;

  h2 {
    margin: 0 0 0.45rem;
    font-size: clamp(1.2rem, 1.65vw, 1.55rem);
    line-height: 1.2;
  }

  h3 {
    margin: 0.5rem 0;
  }
`;

export const Table = styled.table`
  width: 100%;
  min-width: ${({ $minWidth }) => $minWidth || '0'};
  table-layout: fixed;
  border-collapse: collapse;
  margin-top: 1rem;
  background-color: #ffffff;
  border-radius: 8px;
  overflow: hidden;
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
  background-color: rgb(6, 150, 102);
  color: #ffffff;
  border: none;
  padding: 0.5rem 0.75rem;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.84rem;
  font-weight: 700;
  line-height: 1.25;
  min-height: 34px;
  max-width: 100%;
  white-space: normal;
  overflow-wrap: break-word;
  word-break: normal;
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

  &:focus {
    border-color: #111827;
    outline: none;
    box-shadow: 0 0 0 2px rgba(17, 24, 39, 0.1);
  }

  &[aria-invalid='true'] {
    border-color: #dc2626;
    background-color: #fff1f2;
    box-shadow: 0 0 0 2px rgba(220, 38, 38, 0.12);
  }

  &[aria-invalid='true']:focus {
    border-color: #dc2626;
    box-shadow: 0 0 0 2px rgba(220, 38, 38, 0.18);
  }
`;

export const Field = styled.label`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  margin-bottom: 0.55rem;
  color: #334155;
  font-size: 0.83rem;
  font-weight: 700;

  ${Input},
  select {
    margin-bottom: 0;
  }
`;

export const FieldError = styled.span`
  color: #dc2626;
  font-size: 0.78rem;
  font-weight: 700;
`;

export const CountryPicker = styled.div`
  position: relative;
  min-width: 0;
`;

export const CountryButton = styled.button`
  display: flex;
  width: 100%;
  min-height: 40px;
  align-items: center;
  gap: 0.5rem;
  padding: 0.56rem 0.65rem;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: #ffffff;
  color: #111827;
  font-size: 0.9rem;
  cursor: pointer;

  &:focus {
    border-color: #111827;
    outline: none;
    box-shadow: 0 0 0 2px rgba(17, 24, 39, 0.1);
  }
`;

export const CountryMenu = styled.div`
  position: absolute;
  top: calc(100% + 0.35rem);
  left: 0;
  right: 0;
  z-index: 20;
  max-height: 260px;
  overflow-y: auto;
  padding: 0.35rem;
  border: 1px solid #d1d5db;
  border-radius: 10px;
  background: #ffffff;
  box-shadow: 0 18px 38px rgba(15, 23, 42, 0.18);
`;

export const CountryOption = styled.button`
  display: flex;
  width: 100%;
  align-items: center;
  gap: 0.55rem;
  padding: 0.5rem 0.6rem;
  border: 0;
  border-radius: 8px;
  background: ${({ $active }) => ($active ? '#e0f2fe' : 'transparent')};
  color: #0f172a;
  font-size: 0.88rem;
  text-align: left;
  cursor: pointer;

  &:hover {
    background: #f1f5f9;
  }
`;

export const FlagMark = styled.img`
  flex: 0 0 auto;
  width: 24px;
  height: 16px;
  overflow: hidden;
  border: 1px solid rgba(15, 23, 42, 0.16);
  border-radius: 3px;
  background: #e5e7eb;
  object-fit: cover;
`;

export const PhoneInputGroup = styled.div`
  display: grid;
  grid-template-columns: minmax(132px, 0.42fr) minmax(0, 1fr);
  gap: 0.55rem;

  @media (max-width: 560px) {
    grid-template-columns: 1fr;
  }
`;

export const InvoiceActions = styled.div`
  position: sticky;
  bottom: 0;
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  padding-top: 0.75rem;
  padding-bottom: 0.1rem;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.78), #ffffff 28%);
`;

export const ListContent = styled.div`
  width: 100%;
  min-width: 0;
  padding: 0;
`;

export const ListToolbar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
  margin-bottom: 1rem;

  h2 {
    margin: 0;
    color: #0f172a;
    font-size: clamp(1.25rem, 1.7vw, 1.65rem);
  }

  ${Input} {
    width: min(360px, 100%);
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

export const TableViewport = styled.div`
  flex: 1;
  width: 100%;
  min-width: 0;
  min-height: 0;
  overflow-x: hidden;
  overflow-y: visible;

  thead th {
    position: sticky;
    top: 0;
    z-index: 1;
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

export const Select = styled.select`
  width: 100%;
  padding: 0.62rem 0.7rem;
  margin-bottom: 0.65rem;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 0.9rem;

  &:focus {
    border-color: #111827;
    outline: none;
    box-shadow: 0 0 0 2px rgba(17, 24, 39, 0.1);
  }

  &[aria-invalid='true'] {
    border-color: #dc2626;
    background-color: #fff1f2;
    box-shadow: 0 0 0 2px rgba(220, 38, 38, 0.12);
  }

  &[aria-invalid='true']:focus {
    border-color: #dc2626;
    box-shadow: 0 0 0 2px rgba(220, 38, 38, 0.18);
  }
`;

export const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 2rem;
  padding: 1rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  background-color: #f9f9f9;
`;

export const Content = styled.div`
  flex: 1;
  padding: 1rem;
  margin-left: 220px;
`;

export const unitMap = {
  UNT001: 'Hộp',
  UNT002: 'Chai',
  UNT003: 'Vỉ',
  UNT004: 'Viên',
  UNT005: 'Gói',
  UNT006: 'Tuýp',
  UNT007: 'Lọ',
  UNT008: 'Ống',
};

export const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
`;

export const ModalContent = styled.div`
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  width: 600px;
  max-height: 80%;
  overflow-y: auto;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
`;

export const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  font-size: 1.2rem;
  font-weight: bold;
  color: #0f172a;
`;

export const ModalBody = styled.div`
  margin-bottom: 1rem;
`;

export const ModalFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
`;
