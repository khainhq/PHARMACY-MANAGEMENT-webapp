import styled from 'styled-components';

export const Container = styled.div`
  display: flex;
  background-color: #f3f4f6; /* Màu nền tổng thể */
`;

export const Content = styled.div`
  flex: 1;
  min-width: 0;
  margin-left: 220px;
  padding: clamp(0.75rem, 1.1vw, 1.25rem);
  background-color: #ffffff; /* Màu nền trắng */
  min-height: 100vh;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); /* Hiệu ứng đổ bóng */
  overflow-x: hidden;

  h1 {
    margin: 0 0 0.75rem;
    color: #0f172a;
    font-size: clamp(1.5rem, 2vw, 2rem);
    line-height: 1.15;
  }
`;

export const DashboardOverviewGrid = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1.35fr) minmax(340px, 0.75fr);
  gap: 0.85rem;
  align-items: stretch;
  margin-top: 0.75rem;

  @media (max-width: 1180px) {
    grid-template-columns: 1fr;
  }
`;

export const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.85rem;
  margin-top: 0;

  @media (max-width: 1180px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (max-width: 680px) {
    grid-template-columns: 1fr;
  }
`;

export const StatCard = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  background-color: #ffffff;
  color: #0f172a;
  min-height: 160px;
  padding: 0.95rem; /* Giảm padding */
  border-radius: 8px; /* Bo góc mềm hơn */
  text-align: center;
  text-decoration: none;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  border: 2px solid transparent;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); /* Đổ bóng nhẹ hơn */

  &:hover {
    transform: translateY(-5px); /* Hiệu ứng nổi nhẹ hơn khi hover */
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15); /* Đổ bóng mạnh hơn khi hover */
  }

  &.success {
    border: 2px solid #22c55e;
    background-color: #e6f9e8; /* Màu nền xanh lá nhạt */
  }

  &.info {
    border: 2px solid #3b82f6;
    background-color: #e8f3ff; /* Màu nền xanh dương nhạt */
  }

  &.warning {
    border: 2px solid #facc15;
    background-color: #fffbe6; /* Màu nền vàng nhạt */
  }

  &.danger {
    border: 2px solid #ef4444;
    background-color: #ffe6e6; /* Màu nền đỏ nhạt */
  }
`;

export const StatTitle = styled.h3`
  font-size: 0.95rem; /* Giảm kích thước tiêu đề */
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 0.25rem; /* Giảm khoảng cách dưới */
`;

export const StatValue = styled.p`
  font-size: 1.35rem; /* Giảm kích thước giá trị */
  font-weight: bold;
  color: #0f172a;
  margin: 0;
`;

export const RevenueReportCard = styled.div`
  display: flex;
  min-width: 0;
  flex-direction: column;
  margin-top: 0.85rem;
  padding: 1rem;
  border: 1px solid #bae6fd;
  border-radius: 8px;
  background: linear-gradient(180deg, #eff6ff 0%, #ffffff 100%);
  box-shadow: 0 2px 4px rgba(15, 23, 42, 0.1);

  h2 {
    margin: 0 0 0.55rem;
    color: #0f172a;
    font-size: 1.05rem;
    line-height: 1.25;
  }
`;

export const RevenueReportValue = styled.strong`
  color: #0369a1;
  font-size: clamp(1.35rem, 2vw, 1.9rem);
  line-height: 1.1;
`;

export const RevenueReportMeta = styled.div`
  display: flex;
  gap: 0.45rem;
  flex-wrap: wrap;
  margin: 0.45rem 0 0.7rem;
  color: #475569;
  font-size: 0.82rem;
  font-weight: 700;

  span {
    padding: 0.24rem 0.5rem;
    border-radius: 999px;
    background: #e0f2fe;
  }
`;

export const RevenueReportFilters = styled.div`
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 0.55rem;
  align-items: end;

  button {
    min-height: 34px;
    border: 0;
    border-radius: 8px;
    background: #0369a1;
    color: #ffffff;
    font-size: 0.84rem;
    font-weight: 800;
    cursor: pointer;
  }

  @media (max-width: 1180px) and (min-width: 621px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));

    button {
      grid-column: 1 / -1;
    }
  }

  @media (max-width: 620px) {
    grid-template-columns: 1fr;
  }
`;

export const RevenueReportField = styled.label`
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 0.24rem;
  color: #334155;
  font-size: 0.78rem;
  font-weight: 800;

  input {
    width: 100%;
    min-height: 34px;
    padding: 0.42rem 0.5rem;
    border: 1px solid #cbd5e1;
    border-radius: 8px;
    background: #ffffff;
    color: #0f172a;
    font-size: 0.84rem;
  }
`;

export const RecentSection = styled.div`
  grid-column: ${({ $wide }) => ($wide ? '1 / -1' : 'auto')};
  margin-top: 1rem;
  padding: 1rem;
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  min-width: 0;
  overflow: hidden;

  h2 {
    margin: 0 0 1rem;
    color: #0f172a;
    font-size: clamp(1.05rem, 1.35vw, 1.35rem);
    line-height: 1.25;
  }

  .recharts-wrapper {
    max-width: 100%;
  }
`;

export const SectionGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;

  @media (max-width: 1180px) {
    grid-template-columns: 1fr;
  }
`;

export const ChartGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
  align-items: stretch;

  @media (max-width: 1180px) {
    grid-template-columns: 1fr;
  }
`;

export const InventoryInsightGrid = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 0;
  align-items: stretch;

  @media (max-width: 1180px) {
    grid-template-columns: 1fr;
  }
`;

export const ResponsiveTableWrap = styled.div`
  width: 100%;
  overflow-x: hidden;
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
  color: #fff;
  padding: 0.65rem;
  text-align: left;
  font-size: 0.88rem;
  line-height: 1.35;
  overflow-wrap: anywhere;
`;

export const TableCell = styled.td`
  border: 1px solid #ddd;
  padding: 0.65rem;
  font-size: 0.84rem;
  line-height: 1.35;
  overflow-wrap: anywhere;

  &:first-child,
  &:nth-child(3),
  &:nth-child(4) {
    white-space: normal;
    overflow-wrap: anywhere;
  }
`;

export const EmptyState = styled.td`
  padding: 1.25rem;
  border: 1px solid #e5e7eb;
  color: #64748b;
  text-align: center;
  font-weight: 700;
`;

export const ChartContainer = styled.div`
  margin-top: 2rem;
  padding: 1rem;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

export const IconWrapper = styled.div`
  font-size: 2.05rem; /* Tăng kích thước icon */
  margin-bottom: 0.45rem;
  color: inherit;
`;

export const ViewDetail = styled.p`
  margin: 0.55rem 0 0;
  font-size: 0.86rem; /* Tăng kích thước chữ */
  color: #3b82f6; /* Màu xanh dương */
  text-decoration: underline;
  cursor: pointer;

  &:hover {
    color: #1e40af; /* Màu xanh dương đậm hơn khi hover */
  }
`;
