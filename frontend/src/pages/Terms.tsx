import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const Terms: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center space-x-4">
            <Link 
              to="/" 
              className="flex items-center space-x-2 hover:text-accent transition-colors duration-300"
            >
              <ArrowLeft size={20} />
              <span>Back to Home</span>
            </Link>
          </div>
          <h1 className="text-4xl font-montserrat font-black tracking-tighter mt-4">
            Terms of Service
          </h1>
          <p className="text-primary-foreground/80 mt-2">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="prose prose-lg max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
            <p className="mb-4">
              By accessing and using the BRELIS website and services, you accept and agree to be bound by the terms 
              and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">2. Use License</h2>
            <p className="mb-4">
              Permission is granted to temporarily download one copy of the materials (information or software) 
              on BRELIS's website for personal, non-commercial transitory viewing only. This is the grant of a license, 
              not a transfer of title, and under this license you may not:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>Modify or copy the materials</li>
              <li>Use the materials for any commercial purpose or for any public display</li>
              <li>Attempt to reverse engineer any software contained on the website</li>
              <li>Remove any copyright or other proprietary notations from the materials</li>
              <li>Transfer the materials to another person or "mirror" the materials on any other server</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">3. User Account</h2>
            <p className="mb-4">
              When you create an account with us, you must provide information that is accurate, complete, and current 
              at all times. You are responsible for safeguarding the password and for all activities that occur under 
              your account. You agree not to disclose your password to any third party.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">4. Product Information</h2>
            <p className="mb-4">
              We strive to display accurate product information, including prices, descriptions, and availability. 
              However, we do not warrant that product descriptions or other content is accurate, complete, reliable, 
              current, or error-free. If a product offered by BRELIS is not as described, your sole remedy is to 
              return it in unused condition.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">5. Pricing and Payment</h2>
            <p className="mb-4">
              All prices are in Indian Rupees (INR) unless otherwise stated. Prices are subject to change without notice. 
              Payment must be made at the time of order placement. We accept various payment methods as displayed on our website.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">6. Shipping and Delivery</h2>
            <p className="mb-4">
              We will make every effort to ship your order within the timeframe specified on our website. 
              Delivery times are estimates and may vary based on your location and shipping method selected. 
              Risk of loss and title for items purchased pass to you upon delivery of the items to the carrier.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">7. Returns and Refunds</h2>
            <p className="mb-4">
              We accept returns within 30 days of delivery for items in their original condition. 
              Return shipping costs are the responsibility of the customer unless the item is defective or 
              we sent the wrong item. Refunds will be processed within 5-7 business days of receiving the returned item.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">8. Prohibited Uses</h2>
            <p className="mb-4">You may not use our website:</p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>In any way that violates any applicable federal, state, local, or international law or regulation</li>
              <li>To transmit, or procure the sending of, any advertising or promotional material</li>
              <li>To impersonate or attempt to impersonate the company, a company employee, or any other person</li>
              <li>To engage in any other conduct that restricts or inhibits anyone's use of the website</li>
              <li>To introduce viruses, trojan horses, worms, logic bombs, or other material that is malicious or technologically harmful</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">9. Intellectual Property</h2>
            <p className="mb-4">
              The website and its original content, features, and functionality are and will remain the exclusive 
              property of BRELIS and its licensors. The website is protected by copyright, trademark, and other 
              laws of both India and foreign countries.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">10. Limitation of Liability</h2>
            <p className="mb-4">
              In no event shall BRELIS, nor its directors, employees, partners, agents, suppliers, or affiliates, 
              be liable for any indirect, incidental, special, consequential, or punitive damages, including without 
              limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your use 
              of the website.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">11. Governing Law</h2>
            <p className="mb-4">
              These Terms shall be interpreted and governed by the laws of India, without regard to its conflict 
              of law provisions. Our failure to enforce any right or provision of these Terms will not be considered 
              a waiver of those rights.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">12. Changes to Terms</h2>
            <p className="mb-4">
              We reserve the right, at our sole discretion, to modify or replace these Terms at any time. 
              If a revision is material, we will try to provide at least 30 days notice prior to any new terms 
              taking effect.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">13. Contact Information</h2>
            <p className="mb-4">
              If you have any questions about these Terms of Service, please contact us at:
            </p>
            <div className="bg-muted p-4 rounded-lg">
              <p className="mb-2"><strong>Email:</strong> brelisbrelis1@gmail.com</p>
              <p className="mb-2"><strong>Phone:</strong> +91 939810 32323</p>
              <p><strong>Address:</strong> BRELIS Streetwear, India</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Terms;
