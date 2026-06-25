import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FaClipboardList, FaPills, FaChartLine, FaUserTie } from 'react-icons/fa';

const FeaturesSection = styled.section`
  padding: 6rem 2rem;
  background: #f8fafc;
`;

const FeaturesContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

const SectionTitle = styled(motion.h2)`
  text-align: center;
  font-size: 2.5rem;
  font-weight: 800;
  color: #0f172a;
  margin-bottom: 1rem;
`;

const SectionSubtitle = styled(motion.p)`
  text-align: center;
  font-size: 1.2rem;
  color: #64748b;
  margin-bottom: 4rem;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
`;

const FeaturesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  padding: 1rem;
`;

const FeatureCard = styled(motion.div)`
  background: white;
  padding: 2rem;
  border-radius: 16px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 15px rgba(0, 0, 0, 0.1);
  }
`;

const IconWrapper = styled.div`
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, #059669 0%, #34d399 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.5rem;
  
  svg {
    color: white;
    font-size: 1.8rem;
  }
`;

const FeatureTitle = styled.h3`
  font-size: 1.4rem;
  font-weight: 700;
  color: #0f172a;
  margin-bottom: 1rem;
`;

const FeatureDescription = styled.p`
  color: #64748b;
  line-height: 1.6;
`;

const Features = () => {
  const features = [
    {
      icon: <FaClipboardList />,
      title: "Inventory Management",
      description: "Efficiently track and manage your pharmaceutical inventory with real-time updates and automated reordering."
    },
    {
      icon: <FaPills />,
      title: "Medicine Database",
      description: "Comprehensive database of medicines with detailed information about composition, dosage, and contraindications."
    },
    {
      icon: <FaChartLine />,
      title: "Sales Analytics",
      description: "Advanced analytics and reporting tools to track sales performance and identify trends."
    },
    {
      icon: <FaUserTie />,
      title: "Employee Management",
      description: "Streamline employee management with tools to track roles, performance, and work schedules efficiently."
    }
  ];

  return (
    <FeaturesSection>
      <FeaturesContainer>
        <SectionTitle
          initial={{ y: 30, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          Powerful Features
        </SectionTitle>
        <SectionSubtitle
          initial={{ y: 30, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
        >
          Everything you need to manage your pharmacy efficiently
        </SectionSubtitle>
        <FeaturesGrid>
          {features.map((feature, index) => (
            <FeatureCard
              key={index}
              initial={{ y: 30, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <IconWrapper>
                {feature.icon}
              </IconWrapper>
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
