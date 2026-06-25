import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';

const TestimonialsSection = styled.section`
  background: linear-gradient(135deg, #059669 0%, #34d399 100%);
  color: white;
  padding: 6rem 2rem;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: url('/images/pattern.png') repeat;
    opacity: 0.1;
  }
`;

const TestimonialsContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  gap: 4rem;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 2rem;
  }
`;

const ImageContainer = styled(motion.div)`
  flex: 1;
  max-width: 400px;
  
  img {
    width: 100%;
    height: auto;
    border-radius: 20px;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
  }

  @media (max-width: 768px) {
    max-width: 300px;
  }
`;

const ContentContainer = styled.div`
  flex: 1;
  z-index: 1;
`;

const Title = styled(motion.h2)`
  font-size: 2.5rem;
  font-weight: 800;
  margin-bottom: 2rem;
  line-height: 1.2;

  @media (max-width: 768px) {
    font-size: 2rem;
    text-align: center;
  }
`;

const Quote = styled(motion.blockquote)`
  font-size: 1.25rem;
  line-height: 1.8;
  margin-bottom: 2rem;
  font-style: italic;
  position: relative;
  padding-left: 2rem;

  &::before {
    content: '"';
    font-size: 4rem;
    position: absolute;
    left: -1rem;
    top: -1rem;
    opacity: 0.5;
  }

  @media (max-width: 768px) {
    text-align: center;
    padding-left: 0;
  }
`;

const Author = styled(motion.div)`
  display: flex;
  align-items: center;
  gap: 1rem;

  @media (max-width: 768px) {
    justify-content: center;
  }
`;

const AuthorImage = styled.img`
  width: 60px;
  height: 60px;
  border-radius: 50%;
  border: 3px solid white;
`;

const AuthorInfo = styled.div`
  h4 {
    font-size: 1.2rem;
    font-weight: 600;
    margin: 0;
  }

  p {
    font-size: 0.9rem;
    opacity: 0.9;
  }
`;

const Testimonials = () => {
  return (
    <TestimonialsSection>
      <TestimonialsContainer>
        <ImageContainer
          initial={{ x: -100, opacity: 0 }}
          whileInView={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <img src="/images/customer-Photoroom.png" alt="Happy Customer" />
        </ImageContainer>
        <ContentContainer>
          <Title
            initial={{ y: 30, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            What Our Clients Say
          </Title>
          <Quote
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
          >
            The pharmacy management system has revolutionized how we operate. 
            The interface is intuitive, and the support team is exceptional. 
            It's made our daily operations much more efficient and reliable.
          </Quote>
          <Author
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            viewport={{ once: true }}
          >
            <AuthorImage src="/images/avatar.png" alt="Josh Kirven" />
            <AuthorInfo>
              <h4>Josh Kirven</h4>
              <p>Pharmacy Owner</p>
            </AuthorInfo>
          </Author>
        </ContentContainer>
      </TestimonialsContainer>
    </TestimonialsSection>
  );
};

export default Testimonials;
