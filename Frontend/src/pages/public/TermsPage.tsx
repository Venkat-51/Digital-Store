import React from 'react';

const TermsPage: React.FC = () => (
  <div className="min-h-screen bg-gray-50">
    <div className="bg-gradient-to-br from-gray-900 to-gray-800 text-white py-16 text-center">
      <h1 className="text-4xl font-black">Terms & Conditions</h1>
      <p className="text-gray-400 mt-2">Last updated: January 2025</p>
    </div>
    <div className="container-wide max-w-3xl py-12">
      <div className="card p-8">
        {[
          { h: 'Acceptance of Terms', p: 'By accessing and using the Lexicon Technology website and services, you accept and agree to be bound by these Terms and Conditions.' },
          { h: 'Products and Pricing', p: 'All prices are in Singapore Dollars (SGD) and inclusive of GST. Prices are subject to change without notice. We reserve the right to limit quantities.' },
          { h: 'Orders and Payment', p: 'All orders are subject to availability and confirmation. Payment must be received in full before orders are processed and shipped.' },
          { h: 'Shipping and Delivery', p: 'Delivery times are estimates only. Lexicon Technology is not responsible for delays caused by third-party courier services or circumstances beyond our control.' },
          { h: 'Returns and Refunds', p: 'Products may be returned within 30 days of purchase in original condition with original packaging. Refunds will be processed within 7–14 business days.' },
          { h: 'Warranty', p: 'All products come with the manufacturer\'s warranty. Lexicon Technology does not provide additional warranty beyond what the manufacturer offers.' },
          { h: 'Limitation of Liability', p: 'To the maximum extent permitted by law, Lexicon Technology shall not be liable for any indirect, incidental, or consequential damages arising from the use of our products or services.' },
          { h: 'Governing Law', p: 'These Terms and Conditions are governed by the laws of Singapore. Any disputes shall be subject to the exclusive jurisdiction of Singapore courts.' },
        ].map((section) => (
          <div key={section.h} className="mb-8">
            <h2 className="text-lg font-black text-gray-900 mb-3">{section.h}</h2>
            <p className="text-gray-500 leading-relaxed text-sm">{section.p}</p>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default TermsPage;
