import React from 'react';
import { motion } from 'framer-motion';
import Header from '../components/Header';
import Banner from '../components/Banner';
import Features from '../components/Features';
import Testimonials from '../components/Testimonials';
import Footer from '../components/Footer';

const LandingPage = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.45 }}
    className="d-flex flex-column min-vh-100"
  >
    <Header />
    <Banner />
    <Features />
    <Testimonials />
    <Footer />
  </motion.div>
);

export default LandingPage;
