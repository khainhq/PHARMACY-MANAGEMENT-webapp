import React from 'react';
import styled, { keyframes } from 'styled-components';
import { theme } from '../styles/theme';

const reviews = [
  {
    name: 'Dược sĩ Minh Anh',
    role: 'Quản lý nhà thuốc Quận 3',
    image: '/images/pharmacare/reviewer-1.png',
    quote: 'PharmaCare giúp đội ngũ kiểm tra tồn kho nhanh hơn, đặc biệt là khi cần rà soát hạn sử dụng và số lượng thuốc bán chạy.'
  },
  {
    name: 'Bác sĩ Hoàng Nam',
    role: 'Cố vấn chuyên môn',
    image: '/images/pharmacare/reviewer-2.png',
    quote: 'Giao diện rõ ràng, dữ liệu khách hàng và hóa đơn được trình bày dễ hiểu nên việc tư vấn và theo dõi lịch sử mua thuốc thuận tiện hơn.'
  },
  {
    name: 'Dược sĩ Thu Hà',
    role: 'Chủ nhà thuốc tư nhân',
    image: '/images/pharmacare/reviewer-3.png',
    quote: 'Phần báo cáo giúp tôi nắm doanh thu theo ngày và biết sản phẩm nào cần nhập thêm mà không phải tổng hợp thủ công.'
  },
  {
    name: 'Y tá Bảo Trân',
    role: 'Phụ trách chăm sóc khách hàng',
    image: '/images/pharmacare/reviewer-4.png',
    quote: 'Thông tin khách hàng được lưu gọn, dễ tìm lại khi cần hỗ trợ hoặc kiểm tra đơn thuốc đã bán trước đó.'
  },
  {
    name: 'Bác sĩ Quang Huy',
    role: 'Phòng khám liên kết',
    image: '/images/pharmacare/reviewer-5.png',
    quote: 'Hệ thống phù hợp với nhà thuốc hiện đại, có phân quyền và thao tác đủ nhanh cho môi trường phục vụ liên tục.'
  },
  {
    name: 'Dược sĩ Lan Phương',
    role: 'Nhà thuốc khu vực Thủ Đức',
    image: '/images/pharmacare/reviewer-6.png',
    quote: 'Tôi thích cách quản lý nhà cung cấp và phiếu nhập thuốc, dễ kiểm tra chi phí nhập hàng theo từng giai đoạn.'
  }
];

const sponsors = ['FPT Long Châu', 'Nhà thuốc An Khang', 'Pharmacity', 'MEDiCARE', 'Nhà thuốc 365', 'PharmaCare'];

const marquee = keyframes`
  from { transform: translateX(0); }
  to { transform: translateX(-50%); }
`;

const Section = styled.section`
  background: linear-gradient(135deg, #075985 0%, #0ea5e9 54%, #14b8a6 100%);
  color: white;
  padding: 5rem 0;
  overflow: hidden;
`;

const Header = styled.div`
  max-width: 1200px;
  margin: 0 auto 2.5rem;
  padding: 0 2rem;

  h2 {
    font-size: 2.5rem;
    font-weight: 800;
    margin-bottom: 0.75rem;
  }

  p {
    max-width: 680px;
    line-height: 1.7;
    color: #e0f2fe;
  }
`;

const MarqueeWindow = styled.div`
  overflow: hidden;
`;

const ReviewTrack = styled.div`
  display: flex;
  width: max-content;
  gap: 1.25rem;
  animation: ${marquee} 34s linear infinite;

  &:hover {
    animation-play-state: paused;
  }
`;

const ReviewCard = styled.article`
  width: 360px;
  min-height: 245px;
  background: rgba(255, 255, 255, 0.96);
  color: ${theme.colors.darkGray};
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 16px 36px rgba(7, 89, 133, 0.28);
`;

const Reviewer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.9rem;
  margin-bottom: 1rem;

  img {
    width: 62px;
    height: 62px;
    border-radius: 50%;
    object-fit: cover;
    border: 3px solid #bae6fd;
  }

  h3 {
    font-size: 1.05rem;
    font-weight: 800;
    margin: 0;
  }

  p {
    margin: 0.2rem 0 0;
    color: ${theme.colors.muted};
    font-size: 0.9rem;
  }
`;

const Quote = styled.p`
  color: #334155;
  line-height: 1.65;
  margin: 0;
`;

const SponsorTitle = styled.h3`
  max-width: 1200px;
  margin: 3rem auto 1.2rem;
  padding: 0 2rem;
  font-size: 1.5rem;
  font-weight: 800;
`;

const SponsorTrack = styled.div`
  display: flex;
  width: max-content;
  gap: 1rem;
  animation: ${marquee} 24s linear infinite;
`;

const SponsorLogo = styled.div`
  min-width: 220px;
  height: 74px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.95);
  color: ${theme.colors.primary};
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 900;
  font-size: 1.1rem;
  border: 1px solid rgba(255, 255, 255, 0.5);
`;

const Testimonials = () => {
  const reviewItems = [...reviews, ...reviews];
  const sponsorItems = [...sponsors, ...sponsors, ...sponsors];

  return (
    <Section>
      <Header>
        <h2>Đánh giá từ nhà thuốc và bác sĩ</h2>
        <p>
          Những nhận xét minh họa từ các dược sĩ, bác sĩ và đơn vị vận hành nhà thuốc về trải nghiệm quản lý cùng PharmaCare.
        </p>
      </Header>
      <MarqueeWindow>
        <ReviewTrack>
          {reviewItems.map((review, index) => (
            <ReviewCard key={`${review.name}-${index}`}>
              <Reviewer>
                <img src={review.image} alt={review.name} />
                <div>
                  <h3>{review.name}</h3>
                  <p>{review.role}</p>
                </div>
              </Reviewer>
              <Quote>{review.quote}</Quote>
            </ReviewCard>
          ))}
        </ReviewTrack>
      </MarqueeWindow>
      <SponsorTitle>Nhà tài trợ minh hoạ</SponsorTitle>
      <MarqueeWindow>
        <SponsorTrack>
          {sponsorItems.map((sponsor, index) => (
            <SponsorLogo key={`${sponsor}-${index}`}>{sponsor}</SponsorLogo>
          ))}
        </SponsorTrack>
      </MarqueeWindow>
    </Section>
  );
};

export default Testimonials;
