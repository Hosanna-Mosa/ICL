import React from 'react';
import Header from '@/components/Layout/Header';
import Footer from '@/components/Layout/Footer';
import heroImage from '@/assets/hero-image.jpg';

const About: React.FC = () => {
  const milestones = [
    {
      year: '2020',
      title: 'Brand Launch',
      description: 'ICL was born from the streets, bringing authentic urban culture to premium streetwear.'
    },
    {
      year: '2021',
      title: 'First Collection',
      description: 'Released our signature oversized hoodies and premium tees, setting new standards for street fashion.'
    },
    {
      year: '2022',
      title: 'Community Growth',
      description: 'Built a community of 50K+ street culture enthusiasts across India.'
    },
    {
      year: '2023',
      title: 'Sustainable Focus',
      description: 'Introduced eco-friendly materials and ethical manufacturing processes.'
    },
    {
      year: '2024',
      title: 'Global Vision',
      description: 'Expanding internationally while staying true to our urban roots and Indian craftsmanship.'
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-5xl md:text-7xl font-bold text-foreground mb-6">
              ABOUT ICL
            </h1>
            <p className="text-xl text-primary font-medium tracking-wide">
              Urban Spirit. Elite Streetwear.
            </p>
          </div>
          
          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left: Brand Story */}
            <div className="space-y-8">
              <div>
                <h2 className="text-3xl font-bold text-foreground mb-6">
                  Our Story
                </h2>
                <p className="text-muted-foreground text-lg leading-relaxed mb-6">
                  ICL was born from the vibrant streets of India, where culture meets creativity and tradition blends with rebellion. We recognized that streetwear wasn't just clothing—it was a language, a movement, a way of life.
                </p>
                <p className="text-muted-foreground text-lg leading-relaxed">
                  Our mission is to create premium streetwear that speaks to the urban soul. Every piece is designed with meticulous attention to detail, using high-quality materials that stand the test of time and trend cycles.
                </p>
              </div>
              
              <div>
                <h3 className="text-2xl font-bold text-foreground mb-4">
                  Our Mission
                </h3>
                <p className="text-muted-foreground text-lg leading-relaxed">
                  To empower the next generation of street culture enthusiasts with clothing that doesn't just look good, but feels authentic. We believe in quality over quantity, substance over hype.
                </p>
              </div>
              
              <div>
                <h3 className="text-2xl font-bold text-foreground mb-4">
                  Our Values
                </h3>
                <ul className="space-y-3 text-muted-foreground text-lg">
                  <li className="flex items-start">
                    <span className="text-primary mr-3">•</span>
                    Authenticity in every design and interaction
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary mr-3">•</span>
                    Quality craftsmanship using premium materials
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary mr-3">•</span>
                    Sustainable and ethical manufacturing
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary mr-3">•</span>
                    Community-first approach to business
                  </li>
                </ul>
              </div>
            </div>
            
            {/* Right: Brand Photography */}
            <div className="relative">
              <div className="aspect-[4/5] overflow-hidden bg-muted">
                <img 
                  src={heroImage} 
                  alt="ICL Brand" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -right-6 bg-primary text-primary-foreground p-6 w-48">
                <p className="font-bold text-lg">Elite Streetwear</p>
                <p className="text-sm opacity-90">Since 2020</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground text-center mb-16">
            Our Journey
          </h2>
          
          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-1/2 transform -translate-x-1/2 w-px bg-border h-full hidden md:block"></div>
            
            <div className="space-y-12">
              {milestones.map((milestone, index) => (
                <div 
                  key={milestone.year}
                  className={`flex flex-col md:flex-row items-center gap-8 ${
                    index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                  }`}
                >
                  {/* Content */}
                  <div className={`flex-1 ${index % 2 === 0 ? 'md:text-right' : 'md:text-left'}`}>
                    <div className="bg-card p-8 shadow-soft">
                      <h3 className="text-2xl font-bold text-foreground mb-2">
                        {milestone.title}
                      </h3>
                      <p className="text-muted-foreground leading-relaxed">
                        {milestone.description}
                      </p>
                    </div>
                  </div>
                  
                  {/* Year Badge */}
                  <div className="relative z-10 bg-primary text-primary-foreground w-16 h-16 rounded-full flex items-center justify-center font-bold text-lg">
                    {milestone.year.slice(-2)}
                  </div>
                  
                  {/* Spacer */}
                  <div className="flex-1 hidden md:block"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Founder's Message */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-8">
            Founder's Message
          </h2>
          <blockquote className="text-xl text-muted-foreground leading-relaxed italic mb-8">
            "ICL isn't just a brand—it's a movement. We're building more than clothing; we're creating a community where authenticity meets style, where the streets inspire the studio, and where every piece tells a story of urban culture."
          </blockquote>
          <div className="text-foreground font-medium">
            — The ICL Team
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default About;