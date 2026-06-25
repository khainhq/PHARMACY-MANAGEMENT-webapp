import React from 'react';
import styled from 'styled-components';

const FooterContainer = styled.footer`
  background: #0f172a;
  color: #ffffff;
  padding: 2rem 4rem;
  display: flex;
  flex-direction: column;
  gap: 2rem;

  @media (max-width: 768px) {
    text-align: center;
    gap: 1.5rem;
  }
`;

const FooterSections = styled.div`
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1.5rem;
  }
`;

const FooterSection = styled.div`
  flex: 1;
  margin: 0 1rem;

  @media (max-width: 768px) {
    margin: 0;
  }
`;

const FooterTitle = styled.h4`
  font-size: 1.25rem;
  font-weight: 700;
  margin-bottom: 1rem;
`;

const FooterText = styled.p`
  font-size: 0.875rem;
  opacity: 0.8;
  margin-bottom: 0.5rem;
`;

const FooterLink = styled.a`
  display: block;
  font-size: 0.875rem;
  color: #ffffff;
  text-decoration: none;
  margin-bottom: 0.5rem;
  opacity: 0.8;

  &:hover {
    opacity: 1;
    text-decoration: underline;
  }
`;

const FooterBottom = styled.div`
  text-align: center;
  font-size: 0.875rem;
  opacity: 0.8;
  border-top: 1px solid #374151;
  padding-top: 1rem;
`;

const Footer = () => {
  return (
    <FooterContainer>
      <FooterSections>
        <FooterSection>
          <FooterTitle>PharmaCore</FooterTitle>
          <FooterText>Your favourite online pharmacy store. We offer onsite delivery and your health is our priority.</FooterText>
        </FooterSection>
        <FooterSection>
          <FooterTitle>Quick Links</FooterTitle>
          <FooterLink href="/contact">Contact Us</FooterLink>
          <FooterLink href="/about">About Us</FooterLink>
          <FooterLink href="/careers">Careers</FooterLink>
        </FooterSection>
        <FooterSection>
          <FooterTitle>Services</FooterTitle>
          <FooterLink href="/delivery">Delivery</FooterLink>
          <FooterLink href="/purchase">Purchase</FooterLink>
          <FooterLink href="/consult">Consult Specialist</FooterLink>
        </FooterSection>
        <FooterSection>
          <FooterTitle>Address</FooterTitle>
          <FooterText>123 Main Street</FooterText>
          <FooterText>City, Country</FooterText>
          <FooterText>Phone: +1 234 567 890</FooterText>
          <FooterText>Email: support@d-express.com</FooterText>
        </FooterSection>
      </FooterSections>
      <FooterBottom>
        © {new Date().getFullYear()} PharmaCore. All rights reserved.
      </FooterBottom>
    </FooterContainer>
  );
};

export default Footer;