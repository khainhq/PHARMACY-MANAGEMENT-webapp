import React from 'react';
import styled from 'styled-components';
import { theme } from '../styles/theme';

const FooterContainer = styled.footer`
  background: #082f49;
  color: #ffffff;
  padding: 3rem 2.5rem 2rem;

  @media (max-width: 768px) {
    padding: 2.5rem 1.5rem;
    text-align: center;
  }
`;

const FooterSections = styled.div`
  max-width: 1320px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr 0.7fr 1fr 1.35fr;
  gap: 2rem;

  @media (max-width: 1050px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (max-width: 700px) {
    grid-template-columns: 1fr;
  }
`;

const FooterTitle = styled.h4`
  font-size: 1.2rem;
  font-weight: 800;
  margin-bottom: 1rem;
  color: #e0f2fe;
`;

const Brand = styled(FooterTitle)`
  font-size: 1.55rem;

  strong {
    color: ${theme.colors.green};
  }
`;

const FooterText = styled.p`
  font-size: 0.95rem;
  color: #bae6fd;
  line-height: 1.65;
  margin-bottom: 0.55rem;
`;

const FooterLink = styled.a`
  display: block;
  font-size: 0.95rem;
  color: #bae6fd;
  text-decoration: none;
  margin-bottom: 0.55rem;

  &:hover {
    color: white;
    text-decoration: underline;
  }
`;

const FooterBottom = styled.div`
  max-width: 1200px;
  margin: 2rem auto 0;
  text-align: center;
  font-size: 0.875rem;
  color: #93c5fd;
  border-top: 1px solid rgba(186, 230, 253, 0.24);
  padding-top: 1rem;
`;

const FooterMap = styled.iframe`
  width: 100%;
  height: 240px;
  border: 0;
  border-radius: 8px;
`;

const Footer = () => {
  return (
    <FooterContainer>
      <FooterSections>
        <div>
          <Brand>Pharma<strong>Care</strong></Brand>
          <FooterText>
            Giải pháp quản lý nhà thuốc với giao diện thân thiện, hỗ trợ vận hành kho thuốc, bán hàng, khách hàng và báo cáo.
          </FooterText>
        </div>
        <div>
          <FooterTitle>Liên kết nhanh</FooterTitle>
          <FooterLink href="/">Home</FooterLink>
          <FooterLink href="/contact">Contact Us</FooterLink>
          <FooterLink href="/about">About Us</FooterLink>
          <FooterLink href="/login">Sign In</FooterLink>
        </div>
        <div>
          <FooterTitle>Thông tin</FooterTitle>
          <FooterText>Điện thoại: +84 816151762</FooterText>
          <FooterText>Email: khainhq0310@ut.edu.vn</FooterText>
          <FooterText>TP. Hồ Chí Minh, Việt Nam</FooterText>
        </div>
        <div>
          <FooterTitle>Bản đồ</FooterTitle>
          <FooterMap
            title="Bản đồ PharmaCare ở chân trang"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.088637973106!2d106.71414257326435!3d10.804523058678429!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3175293dceb22197%3A0x755bb0f39a48d4a6!2zVHLGsOG7nW5nIMSQ4bqhaSBI4buNYyBHaWFvIFRow7RuZyBW4bqtbiBU4bqjaSBUaMOgbmggUGjhu5EgSOG7kyBDaMOtIE1pbmggLSBDxqEgc-G7nyAx!5e0!3m2!1svi!2s!4v1782382664831!5m2!1svi!2s"
            allowFullScreen
            loading="lazy"
            referrerPolicy="strict-origin-when-cross-origin"
          />
        </div>
      </FooterSections>
      <FooterBottom>
        © {new Date().getFullYear()} PharmaCare. Đã đăng ký bản quyền.
      </FooterBottom>
    </FooterContainer>
  );
};

export default Footer;
