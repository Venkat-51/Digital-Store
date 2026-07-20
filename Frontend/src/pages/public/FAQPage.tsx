import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

const FAQS = [
  { q: 'Are all products genuine and authentic?', a: 'Yes, 100%. All products sold at Lexicon Technology are sourced directly from authorised distributors and come with official manufacturer warranties.' },
  { q: 'How long does delivery take in Singapore?', a: 'Standard delivery takes 2–3 business days. Express delivery (same-day or next-day) is available for orders placed before 2pm.' },
  { q: 'Do you offer bulk/corporate pricing?', a: 'Absolutely! We offer special pricing for orders of 10 units or more. Contact our B2B team at corporate@lexicontech.sg for a custom quote.' },
  { q: 'What is your return policy?', a: 'We offer a 30-day return policy for all products in their original condition. Contact our support team to initiate a return.' },
  { q: 'How do I track my order?', a: 'Once your order is shipped, you\'ll receive a tracking number via email. You can also track your order in your account dashboard.' },
  { q: 'Can I cancel or modify my order?', a: 'Orders can be cancelled or modified within 1 hour of placement. Please contact us immediately if you need to make changes.' },
  { q: 'Do you ship internationally?', a: 'Currently, we deliver within Singapore only. We are working on international shipping solutions.' },
  { q: 'What payment methods do you accept?', a: 'We accept Visa, Mastercard, PayNow, GrabPay, and bank transfers for corporate orders.' },
];

const FAQPage: React.FC = () => {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-br from-primary-600 to-primary-900 text-white py-20 text-center">
        <h1 className="text-5xl font-black mb-4">Frequently Asked Questions</h1>
        <p className="text-primary-200 max-w-lg mx-auto">Everything you need to know about shopping with Lexicon Technology.</p>
      </div>

      <div className="container-wide max-w-3xl py-16">
        <div className="space-y-3">
          {FAQS.map((faq, i) => (
            <div key={i} className="card overflow-hidden">
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex items-center justify-between gap-4 p-5 text-left"
              >
                <span className="font-bold text-gray-900 text-sm md:text-base">{faq.q}</span>
                <motion.span animate={{ rotate: open === i ? 180 : 0 }} transition={{ duration: 0.2 }}>
                  <ChevronDown size={18} className="text-gray-400 flex-shrink-0" />
                </motion.span>
              </button>
              <AnimatePresence>
                {open === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden"
                  >
                    <p className="px-5 pb-5 text-sm text-gray-500 leading-relaxed border-t border-gray-50 pt-4">{faq.a}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FAQPage;
