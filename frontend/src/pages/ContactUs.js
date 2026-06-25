import React from 'react';
import styled from 'styled-components';

const Container = styled.div`
  max-width: 800px;
  margin: 2rem auto;
  padding: 2rem;
  background-color: #ffffff;
  border-radius: 12px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
`;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  color: #059669;
  text-align: center;
  margin-bottom: 1.5rem;
`;

const Paragraph = styled.p`
  font-size: 1rem;
  color: #374151;
  line-height: 1.6;
  margin-bottom: 1.5rem;
`;

const ContactInfo = styled.div`
  font-size: 1rem;
  color: #374151;
  line-height: 1.6;
`;

const ContactUs = () => {
  return (
    <Container>
      <Title>Contact Us</Title>
      <Paragraph>
        If you have any questions or need assistance, feel free to reach out to us. We're here to help!
      </Paragraph>
      <ContactInfo>
        <p><strong>Email:</strong> support@pharmacore.com</p>
        <p><strong>Phone:</strong> +1 234 567 890</p>
        <p><strong>Address:</strong> 123 Main Street, City, Country</p>
      </ContactInfo>
    </Container>
  );
};

export default ContactUs;