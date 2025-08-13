import React from 'react';
import Header from '@/components/Layout/Header';
import Footer from '@/components/Layout/Footer';
import Hero from '@/components/Home/Hero';
import BestSellers from '@/components/Home/BestSellers';
import Categories from '@/components/Home/Categories';
import BrandStory from '@/components/Home/BrandStory';

const Index = () => {
  return (
    <div className="min-h-screen">
      <Header cartItemsCount={0} />
      <main>
        <Hero />
        <BestSellers />
        <Categories />
        <BrandStory />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
