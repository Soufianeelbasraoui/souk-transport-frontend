import React from 'react';
import Navbar from '../components/layout/Navbar';
import HeroSection from '../components/home/HeroSection';
import StatsSection from '../components/home/StatsSection';
import HowItWorksSection from '../components/home/HowItWorksSection';
import FeaturesSection from '../components/home/FeaturesSection';
import Footer from '../components/layout/Footer';
import RecentTrajets from '../components/home/RecentTrajets';
import TestimonialsSection from '../components/home/TestimonialsSection';
import CtaBanner from '../components/home/CtaBanner';
import FaqSection from '../components/home/FaqSection';

function HomePage () {
  return (
    <div className="min-vh-100 bg-white">
      <Navbar />
      <HeroSection />
      <StatsSection />
      <div id='comment-ca-marche'><HowItWorksSection /></div>
      <div id='fonctionnalites'> <FeaturesSection /></div>
      <div id='trajets-recents'><RecentTrajets/></div>
      <TestimonialsSection/>
      <CtaBanner/>
      <div id='faq'>
        <FaqSection/>
      </div>
      
      <Footer />
    </div>
  );
};

export default HomePage;