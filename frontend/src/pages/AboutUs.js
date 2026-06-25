import React from 'react';
import styled from 'styled-components';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { theme } from '../styles/theme';

const Page = styled.div`
  background: #f3f8fb;
  min-height: 100vh;
`;

const Hero = styled.section`
  background:
    linear-gradient(90deg, rgba(7, 89, 133, 0.92), rgba(14, 165, 233, 0.72)),
    url('/images/pharmacare/hero-5.png');
  background-size: cover;
  background-position: center;
  color: white;
  padding: 5rem 1.5rem;
`;

const Inner = styled.div`
  max-width: 1120px;
  margin: 0 auto;
`;

const Title = styled.h1`
  font-size: 3rem;
  font-weight: 800;
  margin-bottom: 1rem;
`;

const Lead = styled.p`
  max-width: 760px;
  color: #e0f2fe;
  font-size: 1.15rem;
  line-height: 1.8;
`;

const Section = styled.section`
  max-width: 1120px;
  margin: 0 auto;
  padding: 4rem 1.5rem;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.25rem;

  @media (max-width: 860px) {
    grid-template-columns: 1fr;
  }
`;

const Card = styled.article`
  background: white;
  border-radius: 8px;
  padding: 1.7rem;
  border: 1px solid #dbeafe;
  box-shadow: ${theme.shadows.medium};

  h2 {
    color: ${theme.colors.primary};
    font-size: 1.35rem;
    font-weight: 800;
    margin-bottom: 0.8rem;
  }

  p {
    color: ${theme.colors.muted};
    line-height: 1.7;
  }
`;

const Story = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  align-items: center;

  @media (max-width: 860px) {
    grid-template-columns: 1fr;
  }
`;

const StoryImage = styled.img`
  width: 100%;
  aspect-ratio: 4 / 3;
  object-fit: cover;
  border-radius: 8px;
  box-shadow: ${theme.shadows.large};
`;

const StoryText = styled.div`
  h2 {
    color: ${theme.colors.darkGray};
    font-size: 2rem;
    font-weight: 800;
    margin-bottom: 1rem;
  }

  p {
    color: ${theme.colors.muted};
    line-height: 1.8;
    margin-bottom: 1rem;
  }
`;

const AboutUs = () => {
  return (
    <Page>
      <Header />
      <Hero>
        <Inner>
          <Title>About Us</Title>
          <Lead>
            PharmaCare là giao diện quản lý nhà thuốc hướng đến sự rõ ràng, dễ dùng và phù hợp với quy trình vận hành tại Việt Nam.
          </Lead>
        </Inner>
      </Hero>
      <Section>
        <Story>
          <StoryText>
            <h2>Được thiết kế cho nhà thuốc hiện đại</h2>
            <p>
              Hệ thống tập trung vào những nghiệp vụ cốt lõi: quản lý thuốc, nhà cung cấp, nhân viên, khách hàng, hóa đơn và phiếu nhập hàng.
            </p>
            <p>
              Mục tiêu của PharmaCare là giúp người dùng thao tác nhanh hơn, giảm nhập liệu lặp lại và theo dõi dữ liệu quan trọng một cách trực quan.
            </p>
          </StoryText>
          <StoryImage src="/images/pharmacare/hero-3.png" alt="Đội ngũ nhà thuốc PharmaCare" />
        </Story>
      </Section>
      <Section>
        <Grid>
          <Card>
            <h2>Sứ mệnh</h2>
            <p>Tạo một công cụ quản lý dễ tiếp cận để nhà thuốc nhỏ và vừa có thể số hóa quy trình vận hành hằng ngày.</p>
          </Card>
          <Card>
            <h2>Tầm nhìn</h2>
            <p>Hướng đến môi trường nhà thuốc chuyên nghiệp hơn, dữ liệu minh bạch hơn và phục vụ khách hàng an toàn hơn.</p>
          </Card>
          <Card>
            <h2>Giá trị</h2>
            <p>Rõ ràng trong giao diện, ổn định trong nghiệp vụ và linh hoạt khi mở rộng thêm chức năng trong tương lai.</p>
          </Card>
        </Grid>
      </Section>
      <Footer />
    </Page>
  );
};

export default AboutUs;
