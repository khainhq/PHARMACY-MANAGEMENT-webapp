import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';

const BannerContainer = styled.div`
  background: linear-gradient(135deg, #059669 0%, #34d399 100%);
  color: #ffffff;
  padding: 4rem 6rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  overflow: hidden;
  position: relative;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: url('/images/pattern.png') repeat;
    opacity: 0.1;
    z-index: 1;
  }

  @media (max-width: 768px) {
    flex-direction: column;
    padding: 3rem 2rem;
    text-align: center;
  }
`;

const BannerContent = styled.div`
  flex: 1;
  z-index: 2;
  max-width: 600px;

  @media (max-width: 768px) {
    max-width: 100%;
    margin-bottom: 2rem;
  }
`;

const BannerTitle = styled(motion.h1)`
  font-size: 3.5rem;
  font-weight: 800;
  margin-bottom: 1.5rem;
  line-height: 1.2;
  background: linear-gradient(to right, #ffffff, #e2e8f0);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;

  @media (max-width: 768px) {
    font-size: 2.5rem;
  }
`;

const BannerSubtitle = styled(motion.p)`
  font-size: 1.25rem;
  line-height: 1.6;
  margin-bottom: 2rem;
  opacity: 0.9;

  @media (max-width: 768px) {
    font-size: 1.1rem;
  }
`;

const BannerButton = styled(motion.a)`
  display: inline-flex;
  align-items: center;
  background: #fbbf24;
  color: #059669;
  padding: 1rem 2rem;
  border-radius: 50px;
  font-weight: 600;
  font-size: 1.1rem;
  text-decoration: none;
  transition: all 0.3s ease;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
    background: #f59e0b;
  }

  &::after {
    content: '→';
    margin-left: 0.5rem;
    transition: transform 0.3s ease;
  }

  &:hover::after {
    transform: translateX(4px);
  }
`;

const BannerImage = styled(motion.img)`
  max-width: 45%;
  height: auto;
  border-radius: 12px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
  z-index: 2;

  @media (max-width: 768px) {
    max-width: 80%;
  }
`;

const Banner = () => {
  return (
    <BannerContainer>
      <BannerContent>
        <BannerTitle
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          Smart Pharmaceutical Management Solution
        </BannerTitle>
        <BannerSubtitle
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.8 }}
        >
          Streamline your pharmacy operations with our comprehensive management system. 
          Enhance efficiency, reduce errors, and improve patient care.
        </BannerSubtitle>
        <BannerButton
          href="/login"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Get Started
        </BannerButton>
      </BannerContent>
      <BannerImage
        src="/images/medicine2-Photoroom.png"
        alt="Pharmacy Management System"
        initial={{ x: 100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.8 }}
      />
    </BannerContainer>
  );
};

export default Banner;
