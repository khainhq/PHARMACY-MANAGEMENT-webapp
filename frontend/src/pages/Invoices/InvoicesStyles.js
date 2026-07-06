import styled from 'styled-components';

export const Container = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1.28fr) minmax(340px, 0.72fr);
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
  padding: clamp(0.55rem, 0.8vw, 0.8rem);
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
  position: relative;
  flex: 0 0 auto;
  max-height: min(330px, 42vh);
  margin-bottom: 0.85rem;
  padding: 0.9rem 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  background-color: #f9fafb;
  overflow-y: auto;

  h2 {
    margin: 0 2.6rem 0.75rem 0;
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

  h2 {
    margin: 0 0 0.75rem;
  }

  input {
    margin-bottom: 0.75rem;
  }
`;

export const CategoryFilter = styled.div`
  position: relative;
  z-index: 5;
  margin: 0 0 0.75rem;
  border-bottom: 1px solid #dbeafe;
`;

export const CategoryTabs = styled.div`
  display: flex;
  align-items: center;
  gap: 0.2rem;
  overflow-x: auto;
  scrollbar-width: thin;
`;

export const CategoryTab = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  flex: 0 0 auto;
  padding: 0.58rem 0.72rem;
  border: 0;
  border-bottom: 2px solid ${({ $active }) => ($active ? '#2563eb' : 'transparent')};
  background: #ffffff;
  color: ${({ $active }) => ($active ? '#1d4ed8' : '#0f172a')};
  font-family: inherit;
  font-size: 0.84rem;
  font-weight: 700;
  line-height: 1.25;
  cursor: pointer;

  &:hover,
  &:focus-visible {
    color: #1d4ed8;
    outline: none;
  }
`;

export const CategoryMenu = styled.div`
  position: absolute;
  top: calc(100% + 1px);
  left: 0;
  right: 0;
  display: grid;
  grid-template-columns: minmax(220px, 0.34fr) minmax(0, 1fr);
  min-height: 260px;
  max-height: min(440px, 62vh);
  overflow: hidden;
  border: 1px solid #dbeafe;
  border-top: 0;
  border-radius: 0 0 14px 14px;
  background: #f1f5f9;
  box-shadow: 0 20px 48px rgba(15, 23, 42, 0.16);

  @media (max-width: 720px) {
    grid-template-columns: 1fr;
    position: static;
    max-height: none;
    margin-top: 0.35rem;
    border: 1px solid #dbeafe;
    border-radius: 12px;
  }
`;

export const CategorySubList = styled.div`
  overflow-y: auto;
  padding: 0.75rem;
  background: #ffffff;
`;

export const CategorySubButton = styled.button`
  display: flex;
  width: 100%;
  align-items: center;
  gap: 0.55rem;
  padding: 0.62rem 0.7rem;
  border: 0;
  border-bottom: 1px solid #e5e7eb;
  border-radius: 8px;
  background: ${({ $active }) => ($active ? '#eef2ff' : 'transparent')};
  color: ${({ $active }) => ($active ? '#0f172a' : '#475569')};
  font-family: inherit;
  font-size: 0.82rem;
  font-weight: 700;
  line-height: 1.35;
  text-align: left;
  cursor: pointer;

  svg {
    flex: 0 0 auto;
    color: #4f7cff;
    font-size: 1rem;
  }

  &:hover,
  &:focus-visible {
    background: #eef2ff;
    color: #0f172a;
    outline: none;
  }
`;

export const CategoryPreview = styled.div`
  overflow-y: auto;
  padding: 0.9rem 1rem;
`;

export const CategoryPreviewGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.7rem;

  @media (max-width: 720px) {
    grid-template-columns: 1fr;
  }
`;

export const CategoryPreviewCard = styled.button`
  display: grid;
  grid-template-columns: 46px minmax(0, 1fr);
  align-items: center;
  gap: 0.6rem;
  min-height: 64px;
  padding: 0.58rem;
  border: 0;
  border-radius: 10px;
  background: #ffffff;
  color: #0f172a;
  font-family: inherit;
  text-align: left;
  cursor: pointer;

  span:first-child {
    display: inline-flex;
    width: 46px;
    height: 42px;
    align-items: center;
    justify-content: center;
    border-radius: 10px;
    background: #eff6ff;
    color: #2563eb;
    font-size: 1.35rem;
  }

  strong {
    display: block;
    margin-bottom: 0.18rem;
    font-size: 0.8rem;
    line-height: 1.22;
  }

  small {
    display: block;
    color: #64748b;
    font-size: 0.74rem;
    line-height: 1.3;
  }

  &:hover,
  &:focus-visible {
    outline: 2px solid #bfdbfe;
  }
`;

export const CategoryFilterSummary = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  flex-wrap: wrap;
  margin: -0.25rem 0 0.65rem;
  color: #475569;
  font-size: 0.8rem;
  font-weight: 700;

  button {
    border: 0;
    background: transparent;
    color: #2563eb;
    font: inherit;
    cursor: pointer;
  }
`;

export const Cart = styled.div`
  flex: 0 0 auto;
  max-height: 230px;
  min-height: 118px;
  margin-top: 0.85rem;
  overflow: hidden auto;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 0.75rem;
  background: #f8fafc;

  h2 {
    margin: 0 0 0.45rem;
    font-size: 1.05rem;
  }

  > div {
    overflow-x: hidden;
    overflow-y: visible;
  }

  table {
    min-width: 0;
    width: 100%;
    table-layout: fixed;
    margin-top: 0.65rem;
  }

  th,
  td {
    font-size: clamp(0.68rem, 0.78vw, 0.78rem);
    padding: 0.42rem 0.38rem;
    vertical-align: middle;
  }

  button {
    min-height: 30px;
    padding: 0.4rem 0.52rem;
    font-size: 0.74rem;
  }
`;

export const InvoiceInfo = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 0;
  margin-top: 0;
  overflow-y: auto;
  padding-right: 0.25rem;

  h2 {
    margin: 0 0 0.35rem;
    font-size: clamp(1.05rem, 1.35vw, 1.32rem);
    line-height: 1.2;
  }

  h3 {
    margin: 0.36rem 0;
    font-size: 0.98rem;
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
  padding: 0.56rem 0.62rem;
  text-align: left;
  font-size: 0.86rem;
  line-height: 1.35;
  vertical-align: top;
  overflow-wrap: normal;
  word-break: keep-all;
`;

export const TableCell = styled.td`
  border: 1px solid #e5e7eb;
  padding: 0.56rem 0.62rem;
  font-size: 0.84rem;
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
  padding: 0.52rem 0.62rem;
  margin-bottom: 0.52rem;
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
  gap: 0.2rem;
  margin-bottom: 0.42rem;
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
  min-height: 38px;
  align-items: center;
  gap: 0.5rem;
  padding: 0.48rem 0.58rem;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: #ffffff;
  color: #111827;
  font-size: 0.9rem;
  cursor: pointer;

  span:last-child {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

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
  right: auto;
  z-index: 20;
  width: min(280px, 72vw);
  max-height: 260px;
  overflow: auto;
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
  white-space: nowrap;

  span:last-child {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
  }

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
  grid-template-columns: minmax(168px, 0.42fr) minmax(0, 1fr);
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
  gap: 0.65rem;
  padding-top: 0.45rem;
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
