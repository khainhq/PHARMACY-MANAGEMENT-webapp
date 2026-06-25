import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FaClipboardList, FaPills, FaChartLine, FaUserTie } from 'react-icons/fa';
import { theme } from '../styles/theme';

const FeaturesSection = styled.section`
  padding: 6rem 2rem;
  background: #f3f8fb;
`;

const FeaturesContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

const SectionTitle = styled(motion.h2)`
  text-align: center;
  font-size: 2.5rem;
  font-weight: 800;
  color: ${theme.colors.darkGray};
  margin-bottom: 1rem;
`;

const SectionSubtitle = styled(motion.p)`
  text-align: center;
  font-size: 1.15rem;
  color: ${theme.colors.muted};
  margin-bottom: 4rem;
  max-width: 680px;
  margin-left: auto;
  margin-right: auto;
  line-height: 1.7;
`;

const FeaturesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
`;

const FeatureCard = styled(motion.div)`
  background: white;
  padding: 2rem;
  border-radius: 8px;
  border: 1px solid #dbeafe;
  box-shadow: ${theme.shadows.medium};
  min-height: 250px;
`;

const IconWrapper = styled.div`
  width: 58px;
  height: 58px;
  background: linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent});
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.35rem;

  svg {
    color: white;
    font-size: 1.75rem;
  }
`;

const FeatureTitle = styled.h3`
  font-size: 1.35rem;
  font-weight: 800;
  color: ${theme.colors.darkGray};
  margin-bottom: 0.9rem;
`;

const FeatureDescription = styled.p`
  color: ${theme.colors.muted};
  line-height: 1.65;
`;

const Features = () => {
  const features = [
    {
      icon: <FaClipboardList />,
      title: 'Quản lý tồn kho',
      description: 'Theo dõi số lượng thuốc, hạn sử dụng, giá nhập và giá bán để hạn chế thiếu hàng hoặc tồn kho quá lâu.'
    },
    {
      icon: <FaPills />,
      title: 'Danh mục thuốc rõ ràng',
      description: 'Lưu thông tin thuốc, đơn vị tính, xuất xứ, hoạt chất và nhóm thuốc trong cùng một nơi dễ tra cứu.'
    },
    {
      icon: <FaChartLine />,
      title: 'Báo cáo bán hàng',
      description: 'Xem nhanh doanh thu, hóa đơn, sản phẩm bán chạy và dữ liệu phục vụ ra quyết định cho nhà thuốc.'
    },
    {
      icon: <FaUserTie />,
      title: 'Phân quyền nhân viên',
      description: 'Tách vai trò quản trị, bán hàng và quản lý sản phẩm để quy trình vận hành gọn và an toàn hơn.'
    }
  ];

  return (
    <FeaturesSection>
      <FeaturesContainer>
        <SectionTitle initial={{ y: 30, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} viewport={{ once: true }}>
          Tính năng nổi bật
        </SectionTitle>
        <SectionSubtitle initial={{ y: 30, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} viewport={{ once: true }}>
          PharmaCare hỗ trợ những nghiệp vụ quan trọng của nhà thuốc từ nhập hàng, bán hàng, chăm sóc khách hàng đến báo cáo quản lý.
        </SectionSubtitle>
        <FeaturesGrid>
          {features.map((feature, index) => (
            <FeatureCard
              key={feature.title}
              initial={{ y: 30, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.45, delay: index * 0.08 }}
              viewport={{ once: true }}
            >
              <IconWrapper>{feature.icon}</IconWrapper>
              <FeatureTitle>{feature.title}</FeatureTitle>
              <FeatureDescription>{feature.description}</FeatureDescription>
            </FeatureCard>
          ))}
        </FeaturesGrid>
      </FeaturesContainer>
    </FeaturesSection>
  );
};

export default Features;
