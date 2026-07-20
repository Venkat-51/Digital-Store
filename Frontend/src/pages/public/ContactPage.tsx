import React from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { Mail, Phone, MapPin, Clock, Send } from 'lucide-react';
import { Input, Textarea } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  subject: z.string().min(5),
  message: z.string().min(20),
});
type FormData = z.infer<typeof schema>;

const ContactPage: React.FC = () => {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    await new Promise((r) => setTimeout(r, 1000));
    toast.success('Message sent! We\'ll get back to you shortly.');
    reset();
  };

  const CONTACT_INFO = [
    { icon: <Mail size={20} />, label: 'Email', value: 'hello@lexicontech.sg', href: 'mailto:hello@lexicontech.sg' },
    { icon: <Phone size={20} />, label: 'Phone', value: '+65 6123 4567', href: 'tel:+6561234567' },
    { icon: <MapPin size={20} />, label: 'Address', value: '30 Cecil Street, Singapore 049712', href: '#' },
    { icon: <Clock size={20} />, label: 'Business Hours', value: 'Mon–Fri: 9am–6pm SGT', href: null },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-gradient-to-br from-primary-600 to-primary-900 text-white py-20">
        <div className="container-wide text-center">
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-5xl font-black mb-4">Get in Touch</motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-primary-200 max-w-xl mx-auto">
            Have a question, need a quote, or want to discuss bulk orders? Our team is ready to help.
          </motion.p>
        </div>
      </div>

      <div className="container-wide py-16">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Info */}
          <div className="space-y-4">
            <h2 className="text-xl font-black text-gray-900 mb-6">Contact Information</h2>
            {CONTACT_INFO.map((info) => (
              <div key={info.label} className="card p-5 flex items-start gap-4">
                <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center text-primary-600 flex-shrink-0">
                  {info.icon}
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-0.5">{info.label}</p>
                  {info.href ? (
                    <a href={info.href} className="text-sm font-semibold text-gray-900 hover:text-primary-600 transition-colors">{info.value}</a>
                  ) : (
                    <p className="text-sm font-semibold text-gray-900">{info.value}</p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Form */}
          <div className="lg:col-span-2">
            <div className="card p-8">
              <h2 className="text-xl font-black text-gray-900 mb-6">Send us a Message</h2>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div className="grid sm:grid-cols-2 gap-5">
                  <Input id="contact-name" label="Your Name *" placeholder="John Tan" error={errors.name?.message} {...register('name')} />
                  <Input id="contact-email" label="Email Address *" type="email" placeholder="you@example.com" error={errors.email?.message} {...register('email')} />
                </div>
                <Input id="subject" label="Subject *" placeholder="How can we help?" error={errors.subject?.message} {...register('subject')} />
                <Textarea id="message" label="Message *" placeholder="Tell us more about your enquiry…" rows={5} error={errors.message?.message} {...register('message')} />
                <Button variant="primary" size="lg" type="submit" isLoading={isSubmitting} leftIcon={<Send size={16} />}>
                  Send Message
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
