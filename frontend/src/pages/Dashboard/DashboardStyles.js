import styled from 'styled-components';

export const Container = styled.div`
  display: flex;
  background-color: #f3f4f6; /* Màu nền tổng thể */
`;

export const Content = styled.div`
  flex: 1;
  margin-left: 250px;
  padding: 2rem;
  background-color: #ffffff; /* Màu nền trắng */
  min-height: 100vh;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); /* Hiệu ứng đổ bóng */
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
  margin-top: 3rem; /* Tăng khoảng cách trên */
  padding: 1.5rem;
  background-color: #ffffff;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

export const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;
`;

export const TableHeader = styled.th`
  background-color: #0f172a;
  color: #fff;
  padding: 0.8rem; /* Tăng padding */
  text-align: left;
  font-size: 1rem; /* Tăng kích thước chữ */
`;

export const TableCell = styled.td`
  border: 1px solid #ddd;
  padding: 0.8rem; /* Tăng padding */
  font-size: 0.9rem; /* Giảm kích thước chữ */
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