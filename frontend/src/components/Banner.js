import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';

const slides = [
  {
    image: '/images/pharmacare/hero-1.png',
    title: 'Quản lý nhà thuốc thông minh cho PharmaCare',
    subtitle: 'Theo dõi thuốc, nhân viên, khách hàng và hóa đơn trong một hệ thống rõ ràng, nhanh gọn và dễ dùng.'
  },
  {
    image: '/images/pharmacare/hero-2.png',
    title: 'Vận hành chính xác hơn mỗi ngày',
    subtitle: 'Dữ liệu tồn kho, bán hàng và nhập thuốc được cập nhật tức thời để giảm sai sót trong từng ca làm việc.'
  },
  {
    image: '/images/pharmacare/hero-3.png',
    title: 'Kết nối đội ngũ nhà thuốc',
    subtitle: 'Hỗ trợ dược sĩ, y tá và nhân viên bán hàng phối hợp hiệu quả trong quy trình phục vụ khách hàng.'
  },
  {
    image: '/images/pharmacare/hero-4.png',
    title: 'Chăm sóc khách hàng chu đáo hơn',
    subtitle: 'Lưu thông tin khách hàng và lịch sử giao dịch để tư vấn thuốc an toàn, nhất quán và chuyên nghiệp.'
  },
  {
    image: '/images/pharmacare/hero-5.png',
    title: 'Báo cáo trực quan cho quản lý',
    subtitle: 'Nắm bắt doanh thu, sản phẩm bán chạy và tình trạng kho bằng các chỉ số dễ đọc, dễ hành động.'
  },
  {
    image: '/images/pharmacare/hero-6.png',
    title: 'Sẵn sàng cho nhà thuốc hiện đại',
    subtitle: 'Giao diện thân thiện, phù hợp cho nhà thuốc tại Việt Nam và các mô hình bán hàng đa kênh.'
  }
];

const BannerContainer = styled.section`
  color: #ffffff;
  min-height: 640px;
  position: relative;
  overflow: hidden;
  background: #075985;
  cursor: grab;

  &:active {
    cursor: grabbing;
  }
`;

const Track = styled.div`
  height: 640px;
  display: flex;
  transform: translateX(${({ $index }) => `-${$index * 100}%`});
  transition: transform 0.55s ease;

  @media (max-width: 768px) {
    height: 650px;
  }
`;

const Slide = styled.div`
  min-width: 100%;
  position: relative;
  background-image:
    linear-gradient(90deg, rgba(3, 105, 161, 0.92) 0%, rgba(3, 105, 161, 0.74) 42%, rgba(20, 184, 166, 0.2) 100%),
    url(${({ $image }) => $image});
  background-size: cover;
  background-position: center;
`;

const Content = styled.div`
  max-width: 1200px;
  height: 100%;
  margin: 0 auto;
  padding: 5rem 1.5rem 7rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

const Badge = styled(motion.div)`
  width: fit-content;
  padding: 0.5rem 0.85rem;
  border: 1px solid rgba(255, 255, 255, 0.32);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.14);
  font-weight: 700;
  margin-bottom: 1.25rem;
`;

const Title = styled(motion.h1)`
  max-width: 680px;
  font-size: 3.7rem;
  line-height: 1.12;
  font-weight: 800;
  margin: 0 0 1.5rem;

  @media (max-width: 768px) {
    font-size: 2.4rem;
  }
`;

const Subtitle = styled(motion.p)`
  max-width: 620px;
  font-size: 1.2rem;
  line-height: 1.75;
  margin: 0 0 2rem;
  color: #e0f2fe;
`;

const BannerButton = styled(motion.a)`
  width: fit-content;
  display: inline-flex;
  align-items: center;
  background: #22c55e;
  color: #ffffff;
  padding: 1rem 1.6rem;
  border-radius: 8px;
  font-weight: 800;
  text-decoration: none;
  box-shadow: 0 16px 32px rgba(34, 197, 94, 0.24);

  &:hover {
    background: #16a34a;
  }
`;

const Dots = styled.div`
  position: absolute;
  left: 50%;
  bottom: 2rem;
  transform: translateX(-50%);
  display: flex;
  gap: 0.7rem;
  z-index: 3;
`;

const Dot = styled.button`
  width: 13px;
  height: 13px;
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.9);
  background: ${({ $active }) => $active ? '#ffffff' : 'rgba(255, 255, 255, 0.28)'};
  cursor: pointer;
  padding: 0;
`;

const Banner = () => {
  const [active, setActive] = useState(0);
  const startX = useRef(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setActive((current) => (current + 1) % slides.length);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  const beginDrag = (clientX) => {
    startX.current = clientX;
  };

  const endDrag = (clientX) => {
    if (startX.current === null) return;
    const distance = clientX - startX.current;
    if (Math.abs(distance) > 50) {
      setActive((current) => distance < 0 ? (current + 1) % slides.length : (current - 1 + slides.length) % slides.length);
    }
    startX.current = null;
  };

  return (
    <BannerContainer
      onMouseDown={(event) => beginDrag(event.clientX)}
      onMouseUp={(event) => endDrag(event.clientX)}
      onMouseLeave={(event) => endDrag(event.clientX)}
      onTouchStart={(event) => beginDrag(event.touches[0].clientX)}
      onTouchEnd={(event) => endDrag(event.changedTouches[0].clientX)}
    >
      <Track $index={active}>
        {slides.map((slide, index) => (
          <Slide $image={slide.image} key={slide.image}>
            <Content>
              <Badge initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
                PharmaCare Việt Nam
              </Badge>
              <Title initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}>
                {slide.title}
              </Title>
              <Subtitle initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                {slide.subtitle}
              </Subtitle>
              <BannerButton href="/login" whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
                Bắt đầu quản lý
              </BannerButton>
            </Content>
          </Slide>
        ))}
      </Track>
      <Dots aria-label="Chọn ảnh banner">
        {slides.map((slide, index) => (
          <Dot
            key={slide.image}
            $active={active === index}
            aria-label={`Chuyển đến ảnh ${index + 1}`}
            onClick={() => setActive(index)}
          />
        ))}
      </Dots>
    </BannerContainer>
  );
};

export default Banner;
