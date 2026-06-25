import React, { useEffect } from 'react';
import { motion } from 'framer-motion'; // Import Framer Motion
import { gsap } from 'gsap'; // Import GSAP
import { ScrollTrigger } from 'gsap/ScrollTrigger'; // Import ScrollTrigger
import Header from '../components/Header';
import Banner from '../components/Banner';
import Features from '../components/Features';
import Footer from '../components/Footer';
import Testimoniasl from '../components/Testimonials'; // Import Testimonials component

gsap.registerPlugin(ScrollTrigger);

const LandingPage = () => {
  useEffect(() => {
    // GSAP ScrollTrigger for parallax effect
    gsap.to('.banner-container', {
      yPercent: -20,
      ease: 'none',
      scrollTrigger: {
        trigger: '.banner-container',
        start: 'top top',
        end: 'bottom top',
        scrub: true,
      },
    });
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }} // Bắt đầu mờ và trượt xuống
      animate={{ opacity: 1, y: 0 }} // Hiện rõ và trượt lên
      exit={{ opacity: 0, y: -50 }} // Thoát ra mờ và trượt lên
      transition={{ duration: 1 }} // Thời gian hiệu ứng
      className="d-flex flex-column min-vh-100"
    >
      <Header />
      <Banner />
      <Features />
      <Testimoniasl />
      <Footer />
    </motion.div>
  );
};

export default LandingPage;