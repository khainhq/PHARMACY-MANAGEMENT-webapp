import styled from 'styled-components';

export const Container = styled.div`
  display: flex;
`;

export const Content = styled.div`
  flex: 1;
  min-width: 0;
  margin-left: 220px;
  padding: clamp(1rem, 1.6vw, 2rem);
  background-color: #f3f4f6; /* Màu nền sáng */
  min-height: 100vh;
  overflow-x: hidden;
`;

export const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 2rem;

  @media (max-width: 1180px) {
    grid-template-columns: 1fr;
  }
`;

export const SummaryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(190px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
`;

export const SummaryCard = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
  padding: 1.1rem 1.25rem;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  box-shadow: 0 2px 6px rgba(15, 23, 42, 0.08);

  span {
    color: #64748b;
    font-size: 0.86rem;
    font-weight: 700;
  }

  strong {
    color: #0f172a;
    font-size: 1.25rem;
  }
`;

export const StatCard = styled.div`
  grid-column: ${({ $wide }) => ($wide ? '1 / -1' : 'auto')};
  background-color: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  min-width: 0;
  overflow: hidden;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
  }

  h3 {
    font-size: clamp(1rem, 1.25vw, 1.2rem);
    font-weight: 600;
    color: #0f172a;
    margin-bottom: 1rem;
    line-height: 1.25;
  }

  .recharts-wrapper {
    max-width: 100%;
  }
`;

export const Table = styled.table`
  width: 100%;
  min-width: 0;
  border-collapse: collapse;
  margin-top: 1rem;
  table-layout: fixed;
`;

export const TableHeader = styled.th`
  background-color: #0f172a;
  color: #ffffff;
  padding: 0.75rem;
  text-align: left;
  font-size: 0.875rem;
  font-weight: 600;
`;

export const TableCell = styled.td`
  border: 1px solid #e5e7eb;
  padding: 0.75rem;
  font-size: 0.875rem;
  color: #374151;
  overflow-wrap: anywhere;
`;

export const TableScroll = styled.div`
  width: 100%;
  overflow-x: auto;

  ${Table} {
    min-width: 760px;
  }

  #report-sections.pdf-exporting & {
    overflow: visible;

    ${Table} {
      min-width: 0;
    }
  }
`;

export const EmptyCell = styled.td`
  padding: 1.25rem;
  border: 1px solid #e5e7eb;
  color: #64748b;
  text-align: center;
  font-weight: 700;
`;

export const Toolbar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
  margin-bottom: 2rem;

  h1 {
    font-size: 2rem;
    font-weight: 700;
    color: #0f172a;
  }
`;

export const Button = styled.button`
  padding: 0.75rem 1.5rem;
  background-color: rgb(6, 150, 102); /* Màu xanh lá cây */
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

  &:not(:last-child) {
    margin-right: 1rem;
  }
`;
