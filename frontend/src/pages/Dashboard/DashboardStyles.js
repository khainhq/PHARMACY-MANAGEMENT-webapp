import styled from 'styled-components';

export const Container = styled.div`
  display: flex;
  background-color: #f3f4f6; /* Màu nền tổng thể */
`;

export const Content = styled.div`
  flex: 1;
  min-width: 0;
  margin-left: 220px;
  padding: clamp(1rem, 1.5vw, 2rem);
  background-color: #ffffff; /* Màu nền trắng */
  min-height: 100vh;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); /* Hiệu ứng đổ bóng */
  overflow-x: hidden;
`;

export const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); /* Giảm kích thước thẻ */
  gap: 1.5rem; /* Giảm khoảng cách giữa các thẻ */
  margin-top: 1.5rem; /* Giảm khoảng cách trên */
`;

export const StatCard = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  background-color: #ffffff;
  color: #0f172a;
  padding: 1.5rem; /* Giảm padding */
  border-radius: 12px; /* Bo góc mềm hơn */
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
  font-size: 1rem; /* Giảm kích thước tiêu đề */
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 0.3rem; /* Giảm khoảng cách dưới */
`;

export const StatValue = styled.p`
  font-size: 1.5rem; /* Giảm kích thước giá trị */
  font-weight: bold;
  color: #0f172a;
  margin: 0;
`;

export const RecentSection = styled.div`
  margin-top: 1.5rem;
  padding: 1.5rem;
  background-color: #ffffff;
  border-radius: 12px;
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
  gap: 1.5rem;

  @media (max-width: 1180px) {
    grid-template-columns: 1fr;
  }
`;

export const ChartGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1.5rem;
  align-items: stretch;

  @media (max-width: 1180px) {
    grid-template-columns: 1fr;
  }
`;

export const InventoryInsightGrid = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1.05fr) minmax(320px, 0.95fr);
  gap: 1.25rem;
  align-items: stretch;

  @media (max-width: 1180px) {
    grid-template-columns: 1fr;
  }
`;

export const BuyerMapCard = styled.div`
  display: flex;
  min-height: 320px;
  flex-direction: column;
  padding: 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  background: #f8fafc;

  h3 {
    margin: 0 0 0.35rem;
    color: #0f172a;
    font-size: 1rem;
  }

  p {
    margin: 0;
    color: #64748b;
    font-size: 0.84rem;
    line-height: 1.45;
  }
`;

export const WorldMapFrame = styled.div`
  position: relative;
  flex: 1;
  min-height: 210px;
  margin-top: 0.75rem;
  overflow: hidden;
  border-radius: 10px;
  background:
    radial-gradient(circle at 20% 20%, rgba(14, 165, 233, 0.15), transparent 28%),
    linear-gradient(180deg, #e0f2fe 0%, #f8fafc 100%);
`;

export const MarketDot = styled.button`
  position: absolute;
  left: ${({ $x }) => `${$x}%`};
  top: ${({ $y }) => `${$y}%`};
  width: ${({ $active }) => ($active ? '18px' : '14px')};
  height: ${({ $active }) => ($active ? '18px' : '14px')};
  border: 3px solid #ffffff;
  border-radius: 999px;
  background: ${({ $active }) => ($active ? '#f97316' : '#2563eb')};
  box-shadow: 0 8px 18px rgba(37, 99, 235, 0.25);
  cursor: pointer;
  transform: translate(-50%, -50%);
`;

export const MarketTooltip = styled.div`
  position: absolute;
  left: ${({ $x }) => `${$x}%`};
  top: ${({ $y }) => `${$y}%`};
  min-width: 150px;
  padding: 0.55rem 0.7rem;
  border: 1px solid #dbeafe;
  border-radius: 8px;
  background: #ffffff;
  box-shadow: 0 16px 34px rgba(15, 23, 42, 0.16);
  color: #0f172a;
  transform: translate(-50%, calc(-100% - 0.7rem));
  pointer-events: none;

  strong {
    display: block;
    font-size: 0.9rem;
  }

  span {
    color: #0369a1;
    font-size: 0.82rem;
    font-weight: 800;
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
  font-size: 3rem; /* Tăng kích thước icon */
  margin-bottom: 1rem;
  color: inherit;
`;

export const ViewDetail = styled.p`
  margin-top: 1rem;
  font-size: 1rem; /* Tăng kích thước chữ */
  color: #3b82f6; /* Màu xanh dương */
  text-decoration: underline;
  cursor: pointer;

  &:hover {
    color: #1e40af; /* Màu xanh dương đậm hơn khi hover */
  }
`;

