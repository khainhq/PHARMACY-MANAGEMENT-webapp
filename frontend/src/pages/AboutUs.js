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

const AboutUs = () => {
  return (
    <Container>
      <Title>About Us</Title>
      <Paragraph>
        PharmaCore is dedicated to providing innovative solutions for pharmacy management. Our mission is to simplify
        and optimize the way pharmacies operate, ensuring better healthcare for everyone.
      </Paragraph>
      <Paragraph>
        With a team of experienced professionals and cutting-edge technology, we strive to deliver the best tools for
        managing medicines, suppliers, and sales efficiently.
      </Paragraph>
    </Container>
  );
};

export default AboutUs;