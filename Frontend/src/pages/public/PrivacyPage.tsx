import React from 'react';

const PrivacyPage: React.FC = () => (
  <div className="min-h-screen bg-gray-50">
    <div className="bg-gradient-to-br from-gray-900 to-gray-800 text-white py-16 text-center">
      <h1 className="text-4xl font-black">Privacy Policy</h1>
      <p className="text-gray-400 mt-2">Last updated: January 2025</p>
    </div>
    <div className="container-wide max-w-3xl py-12">
      <div className="card p-8 prose prose-gray max-w-none">
        {[
          { h: 'Information We Collect', p: 'We collect information you provide directly to us, such as when you create an account, make a purchase, or contact us. This includes name, email address, phone number, and shipping address.' },
          { h: 'How We Use Your Information', p: 'We use the information we collect to process orders, send transactional emails, improve our services, and send marketing communications (with your consent).' },
          { h: 'Information Sharing', p: 'We do not sell your personal information. We may share information with service providers who assist us in operating our business, such as payment processors and shipping companies.' },
          { h: 'Data Security', p: 'We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.' },
          { h: 'Cookies', p: 'We use cookies to enhance your browsing experience, analyze site traffic, and personalize content. You can control cookie settings through your browser.' },
          { h: 'Your Rights', p: 'Under Singapore\'s PDPA, you have the right to access, correct, and withdraw consent for the use of your personal data. Contact us at privacy@lexicontech.sg.' },
          { h: 'Contact Us', p: 'If you have questions about this Privacy Policy, please contact us at: Lexicon Technology Pte Ltd, 30 Cecil Street, Singapore 049712 | privacy@lexicontech.sg' },
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

export default PrivacyPage;
