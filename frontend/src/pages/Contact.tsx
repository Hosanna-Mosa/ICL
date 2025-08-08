import React, { useState } from 'react';
import { MessageSquare, Instagram, Mail, MapPin } from 'lucide-react';
import Header from '@/components/Layout/Header';
import Footer from '@/components/Layout/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

const Contact: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log('Form submitted:', formData);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="pt-32 pb-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
            CONTACT US
          </h1>
          <p className="text-lg text-muted-foreground">
            Get in touch with us. We'd love to hear from you.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Contact Form */}
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-4">
                Send us a Message
              </h2>
              <p className="text-muted-foreground">
                Have questions about our products, sizing, or just want to chat about streetwear? 
                Drop us a line and we'll get back to you soon.
              </p>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">
                  Name
                </label>
                <Input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Your full name"
                  className="w-full"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                  Email
                </label>
                <Input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="your@email.com"
                  className="w-full"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-foreground mb-2">
                  Message
                </label>
                <Textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  placeholder="Tell us what's on your mind..."
                  rows={6}
                  className="w-full resize-none"
                  required
                />
              </div>
              
              <Button type="submit" className="w-full">
                Send Message
              </Button>
            </form>
          </div>
          
          {/* Contact Information */}
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-4">
                Get in Touch
              </h2>
              <p className="text-muted-foreground mb-8">
                Choose your preferred way to reach us. We're here to help with anything you need.
              </p>
            </div>
            
            <div className="space-y-6">
              {/* WhatsApp */}
              <div className="flex items-start gap-4 p-6 bg-card shadow-soft hover:shadow-medium transition-shadow">
                <div className="bg-green-500 p-3 rounded-full">
                  <MessageSquare className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground mb-2">WhatsApp</h3>
                  <p className="text-muted-foreground text-sm mb-3">
                    Quick chat for instant support and order updates
                  </p>
                  <a 
                    href="https://wa.me/919876543210" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:text-primary/80 font-medium text-sm"
                  >
                    +91 98765 43210
                  </a>
                </div>
              </div>
              
              {/* Instagram */}
              <div className="flex items-start gap-4 p-6 bg-card shadow-soft hover:shadow-medium transition-shadow">
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-3 rounded-full">
                  <Instagram className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground mb-2">Instagram</h3>
                  <p className="text-muted-foreground text-sm mb-3">
                    Follow us for latest drops and style inspiration
                  </p>
                  <a 
                    href="https://instagram.com/icl_streetwear" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:text-primary/80 font-medium text-sm"
                  >
                    @icl_streetwear
                  </a>
                </div>
              </div>
              
              {/* Email */}
              <div className="flex items-start gap-4 p-6 bg-card shadow-soft hover:shadow-medium transition-shadow">
                <div className="bg-primary p-3 rounded-full">
                  <Mail className="w-6 h-6 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground mb-2">Email</h3>
                  <p className="text-muted-foreground text-sm mb-3">
                    For detailed inquiries and business partnerships
                  </p>
                  <a 
                    href="mailto:hello@iclstreetwear.com"
                    className="text-primary hover:text-primary/80 font-medium text-sm"
                  >
                    hello@iclstreetwear.com
                  </a>
                </div>
              </div>
              
              {/* Address */}
              <div className="flex items-start gap-4 p-6 bg-card shadow-soft hover:shadow-medium transition-shadow">
                <div className="bg-muted-foreground p-3 rounded-full">
                  <MapPin className="w-6 h-6 text-background" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground mb-2">Studio</h3>
                  <p className="text-muted-foreground text-sm mb-3">
                    Visit our design studio and warehouse
                  </p>
                  <address className="text-primary text-sm not-italic">
                    ICL Streetwear Studio<br />
                    Block A, Sector 15<br />
                    Noida, UP 201301<br />
                    India
                  </address>
                </div>
              </div>
            </div>
            
            {/* Business Hours */}
            <div className="bg-muted/30 p-6">
              <h3 className="font-bold text-foreground mb-4">Business Hours</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Monday - Friday</span>
                  <span className="text-foreground">10:00 AM - 7:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Saturday</span>
                  <span className="text-foreground">10:00 AM - 6:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Sunday</span>
                  <span className="text-foreground">Closed</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* WhatsApp Fixed Button */}
      <a
        href="https://wa.me/919876543210"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 bg-green-500 hover:bg-green-600 text-white p-4 rounded-full shadow-lg transition-colors z-50"
        aria-label="Chat on WhatsApp"
      >
        <MessageSquare className="w-6 h-6" />
      </a>

      <Footer />
    </div>
  );
};

export default Contact;