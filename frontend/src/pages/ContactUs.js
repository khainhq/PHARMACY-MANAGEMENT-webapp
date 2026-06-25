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
  background: linear-gradient(135deg, #075985, #0ea5e9 55%, #14b8a6);
  color: white;
  padding: 4.5rem 1.5rem;
`;

const HeroInner = styled.div`
  max-width: 1120px;
  margin: 0 auto;

  h1 {
    font-size: 3rem;
    font-weight: 800;
    margin-bottom: 1rem;
  }

  p {
    max-width: 700px;
    color: #e0f2fe;
    line-height: 1.7;
    font-size: 1.1rem;
  }
`;

const Content = styled.main`
  max-width: 1120px;
  margin: -2.5rem auto 4rem;
  padding: 0 1.5rem;
  display: grid;
  grid-template-columns: 0.9fr 1.1fr;
  gap: 1.5rem;

  @media (max-width: 860px) {
    grid-template-columns: 1fr;
  }
`;

const Panel = styled.section`
  background: white;
  border-radius: 8px;
  padding: 2rem;
  box-shadow: ${theme.shadows.medium};
  border: 1px solid #dbeafe;
`;

const InfoItem = styled.div`
  padding: 1.1rem 0;
  border-bottom: 1px solid #e2e8f0;

  &:last-child {
    border-bottom: 0;
  }

  span {
    display: block;
    color: ${theme.colors.muted};
    font-weight: 700;
    margin-bottom: 0.35rem;
  }

  strong, a {
    color: ${theme.colors.darkGray};
    font-size: 1.05rem;
    text-decoration: none;
  }
`;

const MapFrame = styled.iframe`
  width: 100%;
  height: 450px;
  border: 0;
  border-radius: 8px;
`;

const Note = styled.div`
  margin-top: 1.5rem;
  padding: 1.2rem;
  background: #ecfeff;
  border-left: 4px solid ${theme.colors.accent};
  color: #164e63;
  line-height: 1.65;
`;

const ContactUs = () => {
  return (
    <Page>
      <Header />
      <Hero>
        <HeroInner>
          <h1>Contact Us</h1>
          <p>
            PharmaCare luôn sẵn sàng hỗ trợ khi bạn cần tư vấn triển khai, kiểm tra hệ thống hoặc góp ý để trải nghiệm quản lý nhà thuốc tốt hơn.
          </p>
        </HeroInner>
      </Hero>
      <Content>
        <Panel>
          <h2>Thông tin liên hệ</h2>
          <InfoItem>
            <span>Điện thoại</span>
            <a href="tel:+84816151762">+84 816151762</a>
          </InfoItem>
          <InfoItem>
            <span>Email</span>
            <a href="mailto:khainhq0310@ut.edu.vn">khainhq0310@ut.edu.vn</a>
          </InfoItem>
          <InfoItem>
            <span>Địa chỉ</span>
            <strong>Trường Đại học Giao thông Vận tải TP. Hồ Chí Minh - Cơ sở 1</strong>
          </InfoItem>
          <Note>
            Bạn có thể liên hệ để được hỗ trợ đăng nhập, kiểm tra dữ liệu mẫu, cấu hình Docker hoặc hướng dẫn chạy hệ thống trên máy cá nhân.
          </Note>
        </Panel>
        <Panel>
          <h2>Bản đồ</h2>
          <MapFrame
            title="Bản đồ PharmaCare"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.088637973106!2d106.71414257326435!3d10.804523058678429!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3175293dceb22197%3A0x755bb0f39a48d4a6!2zVHLGsOG7nW5nIMSQ4bqhaSBI4buNYyBHaWFvIFRow7RuZyBW4bqtbiBU4bqjaSBUaMOgbmggUGjhu5EgSOG7kyBDaMOtIE1pbmggLSBDxqEgc-G7nyAx!5e0!3m2!1svi!2s!4v1782382664831!5m2!1svi!2s"
            allowFullScreen
            loading="lazy"
            referrerPolicy="strict-origin-when-cross-origin"
          />
        </Panel>
      </Content>
      <Footer />
    </Page>
  );
};

export default ContactUs;
