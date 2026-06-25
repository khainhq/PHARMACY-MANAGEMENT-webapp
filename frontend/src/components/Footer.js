import React from 'react';
import styled from 'styled-components';
import { theme } from '../styles/theme';

const FooterContainer = styled.footer`
  background: #082f49;
  color: #ffffff;
  padding: 3rem 4rem 2rem;

  @media (max-width: 768px) {
    padding: 2.5rem 1.5rem;
    text-align: center;
  }
`;

const FooterSections = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1.4fr 1fr 1fr 1.2fr;
  gap: 2rem;

  @media (max-width: 900px) {
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
          <FooterTitle>Nghiệp vụ</FooterTitle>
          <FooterLink href="/medicines">Quản lý thuốc</FooterLink>
          <FooterLink href="/suppliers">Nhà cung cấp</FooterLink>
          <FooterLink href="/invoices/list">Hóa đơn</FooterLink>
          <FooterLink href="/reports">Báo cáo</FooterLink>
        </div>
        <div>
          <FooterTitle>Thông tin</FooterTitle>
          <FooterText>Điện thoại: +84 816151762</FooterText>
          <FooterText>Email: khainhq0310@ut.edu.vn</FooterText>
          <FooterText>TP. Hồ Chí Minh, Việt Nam</FooterText>
        </div>
      </FooterSections>
      <FooterBottom>
        © {new Date().getFullYear()} PharmaCare. Đã đăng ký bản quyền.
      </FooterBottom>
    </FooterContainer>
  );
};

export default Footer;
