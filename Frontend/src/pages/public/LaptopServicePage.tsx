import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import {
  Wrench, ShieldCheck, Clock, Cpu, BatteryCharging, Monitor,
  Zap, CheckCircle2, Droplet, Flame, HardDrive, Sparkles,
  Truck, PhoneCall, ChevronDown, Check, Send, Star,
  Laptop, Calendar, Award, ShieldAlert, ArrowRight
} from 'lucide-react';
import { Input, Textarea } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

// Booking Form Zod Schema
const bookingSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().min(8, 'Please enter a valid Singapore phone number'),
  laptopBrand: z.string().min(1, 'Please select your laptop brand'),
  laptopModel: z.string().min(2, 'Please enter your laptop model or series'),
  serviceType: z.string().min(1, 'Please select an issue category'),
  fulfillmentMethod: z.enum(['pickup', 'walkin']),
  preferredDate: z.string().min(1, 'Please select a preferred date'),
  notes: z.string().optional(),
});

type BookingFormData = z.infer<typeof bookingSchema>;

// Laptop Brands Configuration
const LAPTOP_BRANDS = [
  { id: 'macbook', name: 'Apple MacBook', icon: '💻' },
  { id: 'dell', name: 'Dell / XPS', icon: '💻' },
  { id: 'hp', name: 'HP / Spectre', icon: '💻' },
  { id: 'lenovo', name: 'Lenovo / ThinkPad', icon: '💻' },
  { id: 'asus', name: 'ASUS / ROG', icon: '💻' },
  { id: 'acer', name: 'Acer / Predator', icon: '💻' },
  { id: 'razer', name: 'Razer Blade', icon: '💻' },
  { id: 'other', name: 'Other Brands', icon: '💻' },
];

// Repair Issues Configuration
const REPAIR_ISSUES = [
  {
    id: 'screen',
    title: 'Screen & Display Replacement',
    icon: <Monitor className="w-5 h-5 text-primary-600" />,
    minPrice: 120,
    maxPrice: 320,
    duration: '2 - 4 Hours',
    description: 'Fix cracked LCD/OLED screens, dead pixels, flickering, or line distortion with OEM panels.',
  },
  {
    id: 'battery',
    title: 'Battery Replacement',
    icon: <BatteryCharging className="w-5 h-5 text-emerald-600" />,
    minPrice: 75,
    maxPrice: 150,
    duration: '1 Hour',
    description: 'Original grade battery swap for swollen batteries, poor charge retention, or sudden shutdowns.',
  },
  {
    id: 'liquid',
    title: 'Liquid & Water Damage Rescue',
    icon: <Droplet className="w-5 h-5 text-cyan-600" />,
    minPrice: 150,
    maxPrice: 380,
    duration: '24 - 48 Hours',
    description: 'Ultrasonic chemical bath cleaning, board-level corrosion removal, and trace repair.',
  },
  {
    id: 'motherboard',
    title: 'Motherboard Component Repair',
    icon: <Cpu className="w-5 h-5 text-indigo-600" />,
    minPrice: 180,
    maxPrice: 420,
    duration: '1 - 3 Days',
    description: 'Micro-soldering repair for no-power state, short circuits, charging IC failures, and GPU issues.',
  },
  {
    id: 'thermal',
    title: 'Overheating & Thermal Overhaul',
    icon: <Flame className="w-5 h-5 text-orange-600" />,
    minPrice: 50,
    maxPrice: 90,
    duration: '1 - 2 Hours',
    description: 'Deep fan de-dusting, premium Honeywell/Thermal Grizzly thermal paste & pad re-application.',
  },
  {
    id: 'upgrade',
    title: 'SSD & RAM Performance Upgrade',
    icon: <HardDrive className="w-5 h-5 text-purple-600" />,
    minPrice: 65,
    maxPrice: 220,
    duration: '1 Hour',
    description: 'High-speed NVMe PCIe 4.0 SSD expansion, RAM upgrades, and 100% data cloning.',
  },
];

// Speed Multipliers
const SPEED_OPTIONS = [
  { id: 'standard', name: 'Standard (2-3 Days)', multiplier: 1, text: 'Standard Turnaround' },
  { id: 'express', name: 'Express (24-Hour Guarantee)', multiplier: 1.2, text: 'Priority Express Lab Queue' },
  { id: 'sameday', name: 'Same-Day Emergency Service', multiplier: 1.4, text: 'Immediate On-Bench Priority' },
];

// FAQ List
const FAQS = [
  {
    q: 'How does the free diagnostics service work?',
    a: 'Bring your laptop to our Singapore service center or request our free islandwide pickup. Our certified engineers inspect the hardware and provide an exact quotation before any repair work begins. If you choose not to proceed, you pay $0.'
  },
  {
    q: 'Will my personal data and files remain safe?',
    a: 'Absolutely. We enforce strict ISO-compliant data privacy standards. Your hard drive/SSD is never wiped unless OS reinstallation is explicitly requested and confirmed with you in advance.'
  },
  {
    q: 'What warranty period is included with laptop repairs?',
    a: 'All our hardware repairs and replacement parts come with a 90-day comprehensive Lexicon warranty. If the exact same issue recurs within 90 days, we fix it free of charge.'
  },
  {
    q: 'How does the Free Islandwide Courier Pickup work?',
    a: 'We schedule a courier to pick up your laptop from your home or office anywhere in Singapore. Once repaired, we deliver it safely back to your doorstep.'
  },
  {
    q: 'What happens if my laptop cannot be fixed?',
    a: 'We operate on a strict "No Fix, No Fee" policy. If our engineers cannot resolve the hardware problem, you will not be charged a single cent for the repair attempt.'
  }
];

const LaptopServicePage: React.FC = () => {
  // Calculator state
  const [selectedBrand, setSelectedBrand] = useState('macbook');
  const [selectedIssue, setSelectedIssue] = useState('screen');
  const [selectedSpeed, setSelectedSpeed] = useState('express');

  // FAQ open accordion state
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const bookingFormRef = useRef<HTMLDivElement>(null);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      fulfillmentMethod: 'pickup',
      laptopBrand: 'Apple MacBook',
      serviceType: 'Screen & Display Replacement'
    }
  });

  // Calculate prices
  const currentIssue = REPAIR_ISSUES.find((i) => i.id === selectedIssue) || REPAIR_ISSUES[0];
  const speedObj = SPEED_OPTIONS.find((s) => s.id === selectedSpeed) || SPEED_OPTIONS[0];

  const estimatedMin = Math.round(currentIssue.minPrice * speedObj.multiplier);
  const estimatedMax = Math.round(currentIssue.maxPrice * speedObj.multiplier);

  const handleApplyEstimateToBooking = () => {
    const brandObj = LAPTOP_BRANDS.find((b) => b.id === selectedBrand);
    if (brandObj) setValue('laptopBrand', brandObj.name);
    setValue('serviceType', currentIssue.title);

    if (bookingFormRef.current) {
      bookingFormRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const onSubmitBooking = async (data: BookingFormData) => {
    // Simulate API booking call
    await new Promise((resolve) => setTimeout(resolve, 1200));
    toast.success(`Repair request submitted! Tracking Code: LEX-SRV-${Math.floor(100000 + Math.random() * 900000)}`, {
      duration: 6000
    });
    reset();
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 pb-16 lg:pb-0">
      
      {/* 1. HERO SECTION - Light Theme */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary-50/70 via-blue-50/30 to-gray-50 text-gray-900 py-16 md:py-24 border-b border-gray-200/80">
        {/* Soft Background Accents */}
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-primary-200/30 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 right-0 w-96 h-96 bg-blue-200/20 rounded-full blur-3xl pointer-events-none" />

        <div className="container-wide relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            
            {/* Top Badge */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-primary-200 text-primary-900 text-xs sm:text-sm font-bold mb-6 shadow-xs"
            >
              <Sparkles className="w-4 h-4 text-amber-500" />
              Official Authorized Laptop Repair & Upgrades in Singapore
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-none mb-6 text-gray-900"
            >
              Express Laptop Repair <br className="hidden sm:inline" />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary-900 via-primary-700 to-blue-700">
                & Free Diagnostics
              </span>
            </motion.h1>

            {/* Subtext */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-gray-600 text-base sm:text-lg mb-8 leading-relaxed max-w-2xl mx-auto"
            >
              Fast 24-hour turnaround, 90-day warranty, genuine OEM components, and zero-risk Free Diagnostics for MacBooks, Dell, ThinkPads, ASUS & Gaming Laptops.
            </motion.p>

            {/* CTA Group */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Button
                variant="primary"
                size="lg"
                onClick={() => {
                  if (bookingFormRef.current) {
                    bookingFormRef.current.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
                className="w-full sm:w-auto text-base font-bold px-8 py-4 shadow-lg hover:shadow-primary-900/20"
              >
                <Wrench className="w-5 h-5 mr-2" /> Book Repair & Free Pickup
              </Button>
              <a
                href="#calculator"
                className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3.5 rounded-xl border border-gray-300 bg-white hover:bg-gray-50 text-gray-800 text-base font-bold shadow-xs transition-all"
              >
                Calculate Repair Cost <ArrowRight className="w-4 h-4 ml-2 text-gray-500" />
              </a>
            </motion.div>

            {/* Trust Highlights Badges */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-4 text-left border-t border-gray-200/80 pt-8"
            >
              <div className="flex items-center gap-2.5 sm:gap-3 bg-white p-2.5 sm:p-3.5 rounded-xl border border-gray-200 shadow-2xs min-w-0">
                <ShieldCheck className="w-6 h-6 sm:w-7 sm:h-7 text-emerald-600 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] sm:text-[11px] font-bold text-gray-400 uppercase tracking-wider truncate">Policy</p>
                  <p className="text-xs sm:text-sm font-extrabold text-gray-900 leading-tight">No Fix, No Fee</p>
                </div>
              </div>
              <div className="flex items-center gap-2.5 sm:gap-3 bg-white p-2.5 sm:p-3.5 rounded-xl border border-gray-200 shadow-2xs min-w-0">
                <Clock className="w-6 h-6 sm:w-7 sm:h-7 text-primary-600 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] sm:text-[11px] font-bold text-gray-400 uppercase tracking-wider truncate">Speed</p>
                  <p className="text-xs sm:text-sm font-extrabold text-gray-900 leading-tight">24h Express Lab</p>
                </div>
              </div>
              <div className="flex items-center gap-2.5 sm:gap-3 bg-white p-2.5 sm:p-3.5 rounded-xl border border-gray-200 shadow-2xs min-w-0">
                <Award className="w-6 h-6 sm:w-7 sm:h-7 text-amber-500 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] sm:text-[11px] font-bold text-gray-400 uppercase tracking-wider truncate">Protection</p>
                  <p className="text-xs sm:text-sm font-extrabold text-gray-900 leading-tight">90-Day Warranty</p>
                </div>
              </div>
              <div className="flex items-center gap-2.5 sm:gap-3 bg-white p-2.5 sm:p-3.5 rounded-xl border border-gray-200 shadow-2xs min-w-0">
                <Truck className="w-6 h-6 sm:w-7 sm:h-7 text-purple-600 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] sm:text-[11px] font-bold text-gray-400 uppercase tracking-wider truncate">Convenience</p>
                  <p className="text-xs sm:text-sm font-extrabold text-gray-900 leading-tight">Free Door Pickup</p>
                </div>
              </div>
            </motion.div>

          </div>
        </div>
      </section>


      {/* 2. INTERACTIVE REPAIR COST ESTIMATOR - Light Theme */}
      <section id="calculator" className="py-16 bg-white border-b border-gray-200/80">
        <div className="container-wide">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-extrabold uppercase tracking-widest text-primary-900 bg-primary-50 px-3.5 py-1 rounded-full border border-primary-200">
              Instant Price Estimator
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mt-3 mb-3">
              Calculate Your Repair Cost
            </h2>
            <p className="text-gray-600 text-sm sm:text-base">
              Select your laptop brand, issue, and desired repair urgency to calculate an instant estimated price range.
            </p>
          </div>

          <div className="bg-white text-gray-900 rounded-3xl p-6 sm:p-10 shadow-xl border border-gray-200 max-w-5xl mx-auto grid lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Controls */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Step 1: Laptop Brand */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
                  1. Select Laptop Brand
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {LAPTOP_BRANDS.map((brand) => (
                    <button
                      key={brand.id}
                      type="button"
                      onClick={() => setSelectedBrand(brand.id)}
                      className={`p-3 rounded-xl text-left border text-xs sm:text-sm font-bold transition-all flex items-center gap-2 ${
                        selectedBrand === brand.id
                          ? 'bg-primary-900 text-white border-primary-900 shadow-md ring-2 ring-primary-900/20'
                          : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      <span className="text-base">{brand.icon}</span>
                      <span className="truncate">{brand.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Step 2: Select Repair Issue */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
                  2. Select Issue or Required Service
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {REPAIR_ISSUES.map((issue) => (
                    <button
                      key={issue.id}
                      type="button"
                      onClick={() => setSelectedIssue(issue.id)}
                      className={`p-3.5 rounded-xl text-left border transition-all flex items-start gap-3 ${
                        selectedIssue === issue.id
                          ? 'bg-primary-50 text-primary-950 border-primary-400 ring-2 ring-primary-500/20 shadow-xs'
                          : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      <div className="p-2 rounded-lg bg-white border border-gray-200 flex-shrink-0 mt-0.5 shadow-2xs">
                        {issue.icon}
                      </div>
                      <div>
                        <p className="text-xs sm:text-sm font-extrabold text-gray-900 leading-snug">{issue.title}</p>
                        <p className="text-[11px] text-gray-500 mt-1 font-mono font-semibold">
                          Est. ${issue.minPrice} - ${issue.maxPrice}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Step 3: Urgency / Speed */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
                  3. Select Service Speed
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {SPEED_OPTIONS.map((speed) => (
                    <button
                      key={speed.id}
                      type="button"
                      onClick={() => setSelectedSpeed(speed.id)}
                      className={`p-3 rounded-xl text-center border text-xs font-bold transition-all ${
                        selectedSpeed === speed.id
                          ? 'bg-primary-900 text-white border-primary-900 shadow-sm'
                          : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      {speed.name}
                    </button>
                  ))}
                </div>
              </div>

            </div>

            {/* Right Highlight Estimate Card */}
            <div className="lg:col-span-5 bg-gradient-to-br from-primary-900 via-primary-950 to-slate-900 text-white p-6 sm:p-8 rounded-2xl border border-primary-800 shadow-xl flex flex-col justify-between h-full">
              <div>
                <div className="flex items-center justify-between border-b border-primary-800/80 pb-4 mb-4">
                  <span className="text-xs font-bold uppercase text-primary-200 tracking-wider">Estimate Summary</span>
                  <span className="text-[11px] font-extrabold text-emerald-300 bg-emerald-950/80 px-2.5 py-1 rounded-full border border-emerald-700/60">
                    Free Inspection
                  </span>
                </div>

                <div className="mb-6">
                  <p className="text-xs text-primary-300 font-semibold mb-1">Selected Service</p>
                  <h3 className="text-lg font-black text-white leading-tight">{currentIssue.title}</h3>
                  <p className="text-xs text-slate-300 mt-2 line-clamp-2">{currentIssue.description}</p>
                </div>

                <div className="bg-slate-950/70 p-4 rounded-xl border border-primary-800/60 space-y-3 mb-6">
                  <div className="flex justify-between items-center text-xs text-slate-300">
                    <span>Estimated Turnaround:</span>
                    <span className="font-bold text-blue-300">{currentIssue.duration}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs text-slate-300">
                    <span>Priority Level:</span>
                    <span className="font-bold text-slate-100">{speedObj.text}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs text-slate-300">
                    <span>Warranty:</span>
                    <span className="font-bold text-emerald-400">90-Day Coverage</span>
                  </div>
                </div>

                <div className="text-center py-4 bg-primary-950/80 rounded-xl border border-primary-700/60 mb-6">
                  <p className="text-xs font-bold text-primary-300 uppercase tracking-widest">Estimated Cost Range</p>
                  <p className="text-3xl sm:text-4xl font-black text-white mt-1">
                    S${estimatedMin} – S${estimatedMax}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    *Final price confirmed after free bench diagnosis
                  </p>
                </div>
              </div>

              <Button
                variant="primary"
                size="lg"
                onClick={handleApplyEstimateToBooking}
                className="w-full text-base font-bold py-3.5 shadow-lg bg-white text-primary-950 hover:bg-gray-100 border-none"
              >
                Book Repair With This Estimate <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>

          </div>
        </div>
      </section>


      {/* 3. CORE SERVICES GRID - Light Theme */}
      <section className="py-16 md:py-24 bg-gray-50">
        <div className="container-wide">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-extrabold uppercase tracking-widest text-primary-900 bg-primary-50 px-3.5 py-1 rounded-full border border-primary-200">
              Our Repair Capabilities
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mt-3 mb-3">
              Comprehensive Laptop Services
            </h2>
            <p className="text-gray-600 text-sm sm:text-base">
              From screen replacements to board-level micro-soldering, our ESD-safe cleanroom lab handles all hardware issues.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {REPAIR_ISSUES.map((service) => (
              <motion.div
                key={service.id}
                whileHover={{ y: -4 }}
                className="bg-white rounded-2xl p-6 border border-gray-200/90 shadow-sm hover:shadow-xl transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="w-12 h-12 rounded-xl bg-primary-50 border border-primary-100 flex items-center justify-center mb-5">
                    {service.icon}
                  </div>
                  <h3 className="text-xl font-extrabold text-gray-900 mb-2 leading-tight">
                    {service.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600 mb-5 leading-relaxed">
                    {service.description}
                  </p>
                  
                  <ul className="space-y-2 mb-6 border-t border-gray-100 pt-4 text-xs font-semibold text-gray-700">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Genuine OEM Grade Replacement Parts
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Fast Turnaround: {service.duration}
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" /> 90-Day Parts & Labor Warranty
                    </li>
                  </ul>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div>
                    <p className="text-[11px] text-gray-400 font-bold uppercase">Starting From</p>
                    <p className="text-xl font-black text-primary-900">S${service.minPrice}</p>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedIssue(service.id);
                      handleApplyEstimateToBooking();
                    }}
                    className="text-xs font-bold text-primary-900 hover:text-primary-800 bg-primary-50 hover:bg-primary-100 border border-primary-200 px-3.5 py-2 rounded-lg transition-colors flex items-center gap-1"
                  >
                    Select & Book <ChevronDown className="w-3.5 h-3.5 -rotate-90" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>


      {/* 4. 4-STEP SERVICE PROCESS - Light Theme */}
      <section className="py-16 bg-white border-y border-gray-200">
        <div className="container-wide">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-700 bg-emerald-50 px-3.5 py-1 rounded-full border border-emerald-200">
              Simple & Transparent
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mt-3 mb-3">
              How Our Service Works
            </h2>
            <p className="text-gray-600 text-sm sm:text-base">
              Getting your laptop repaired in Singapore is quick, convenient, and hassle-free.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                step: '01',
                title: 'Book or Request Pickup',
                desc: 'Fill out our online form to schedule store drop-off or request our Free Doorstep Pickup courier.',
                icon: <Truck className="w-6 h-6 text-primary-600" />
              },
              {
                step: '02',
                title: 'Free Bench Diagnosis',
                desc: 'Our engineers conduct a thorough 30-point hardware check and issue an exact quote.',
                icon: <Wrench className="w-6 h-6 text-blue-600" />
              },
              {
                step: '03',
                title: 'Certified Repair & QC',
                desc: 'We replace broken components with genuine OEM parts and run stress test benchmarks.',
                icon: <ShieldCheck className="w-6 h-6 text-indigo-600" />
              },
              {
                step: '04',
                title: 'Safe Return & Warranty',
                desc: 'Pick up your revived laptop or have it delivered to your home with a 90-day warranty.',
                icon: <Award className="w-6 h-6 text-emerald-600" />
              }
            ].map((st) => (
              <div key={st.step} className="relative bg-gray-50/80 rounded-2xl p-6 border border-gray-200/90 shadow-2xs">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-white border border-gray-200 flex items-center justify-center shadow-xs">
                    {st.icon}
                  </div>
                  <span className="text-2xl font-black text-gray-300 font-mono">{st.step}</span>
                </div>
                <h3 className="text-lg font-extrabold text-gray-900 mb-2">{st.title}</h3>
                <p className="text-xs text-gray-600 leading-relaxed">{st.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* 5. BOOKING FORM SECTION - Light Theme */}
      <section ref={bookingFormRef} className="py-16 md:py-24 bg-gray-50">
        <div className="container-wide">
          <div className="max-w-4xl mx-auto bg-white rounded-3xl p-6 sm:p-12 border border-gray-200/90 shadow-xl">
            <div className="text-center max-w-xl mx-auto mb-10">
              <span className="text-xs font-extrabold uppercase tracking-widest text-primary-900 bg-primary-50 px-3.5 py-1 rounded-full border border-primary-200">
                Online Reservation
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mt-3 mb-2">
                Book Repair & Free Pickup
              </h2>
              <p className="text-gray-600 text-xs sm:text-sm">
                Reserve your bench slot. Our support team will confirm your pick-up or walk-in schedule within 15 minutes.
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmitBooking)} className="space-y-6">
              
              {/* Row 1: Name & Email */}
              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Alex Tan"
                    {...register('name')}
                    className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-primary-600 focus:ring-1 focus:ring-primary-600"
                  />
                  {errors.name && <p className="text-xs text-red-500 mt-1 font-semibold">{errors.name.message}</p>}
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    placeholder="alex@example.com"
                    {...register('email')}
                    className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-primary-600 focus:ring-1 focus:ring-primary-600"
                  />
                  {errors.email && <p className="text-xs text-red-500 mt-1 font-semibold">{errors.email.message}</p>}
                </div>
              </div>

              {/* Row 2: Phone & Laptop Brand */}
              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                    Singapore Phone Number *
                  </label>
                  <input
                    type="tel"
                    placeholder="+65 9123 4567"
                    {...register('phone')}
                    className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-primary-600 focus:ring-1 focus:ring-primary-600"
                  />
                  {errors.phone && <p className="text-xs text-red-500 mt-1 font-semibold">{errors.phone.message}</p>}
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                    Laptop Brand *
                  </label>
                  <select
                    {...register('laptopBrand')}
                    className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-900 focus:outline-none focus:border-primary-600"
                  >
                    {LAPTOP_BRANDS.map((b) => (
                      <option key={b.id} value={b.name} className="bg-white text-gray-900">
                        {b.name}
                      </option>
                    ))}
                  </select>
                  {errors.laptopBrand && <p className="text-xs text-red-500 mt-1 font-semibold">{errors.laptopBrand.message}</p>}
                </div>
              </div>

              {/* Row 3: Laptop Model & Service Type */}
              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                    Laptop Model / Series *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. MacBook Pro M1 2021 / Dell XPS 15"
                    {...register('laptopModel')}
                    className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-primary-600"
                  />
                  {errors.laptopModel && <p className="text-xs text-red-500 mt-1 font-semibold">{errors.laptopModel.message}</p>}
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                    Service Category *
                  </label>
                  <select
                    {...register('serviceType')}
                    className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-900 focus:outline-none focus:border-primary-600"
                  >
                    {REPAIR_ISSUES.map((i) => (
                      <option key={i.id} value={i.title} className="bg-white text-gray-900">
                        {i.title}
                      </option>
                    ))}
                  </select>
                  {errors.serviceType && <p className="text-xs text-red-500 mt-1 font-semibold">{errors.serviceType.message}</p>}
                </div>
              </div>

              {/* Row 4: Fulfillment Method & Preferred Date */}
              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                    Fulfillment Preference *
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <label className="flex items-center gap-2 p-3 bg-gray-50 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-100 text-xs font-bold text-gray-800">
                      <input
                        type="radio"
                        value="pickup"
                        {...register('fulfillmentMethod')}
                        className="text-primary-600 focus:ring-primary-600"
                      />
                      Free Pickup Courier
                    </label>
                    <label className="flex items-center gap-2 p-3 bg-gray-50 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-100 text-xs font-bold text-gray-800">
                      <input
                        type="radio"
                        value="walkin"
                        {...register('fulfillmentMethod')}
                        className="text-primary-600 focus:ring-primary-600"
                      />
                      Store Walk-in
                    </label>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                    Preferred Date *
                  </label>
                  <input
                    type="date"
                    min={new Date().toISOString().split('T')[0]}
                    {...register('preferredDate')}
                    className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-900 focus:outline-none focus:border-primary-600"
                  />
                  {errors.preferredDate && <p className="text-xs text-red-500 mt-1 font-semibold">{errors.preferredDate.message}</p>}
                </div>
              </div>

              {/* Problem Notes */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                  Problem Description & Additional Notes (Optional)
                </label>
                <textarea
                  rows={3}
                  placeholder="Describe the issue (e.g., laptop won't turn on after coffee spill, battery drains in 30 mins)..."
                  {...register('notes')}
                  className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-primary-600"
                />
              </div>

              {/* Submit Button */}
              <Button
                variant="primary"
                size="lg"
                type="submit"
                isLoading={isSubmitting}
                className="w-full text-base font-bold py-4 shadow-xl"
              >
                <Send className="w-5 h-5 mr-2" /> Confirm & Request Service
              </Button>
            </form>
          </div>
        </div>
      </section>


      {/* 6. FAQ ACCORDION SECTION - Light Theme */}
      <section className="py-16 md:py-24 bg-white border-t border-gray-200">
        <div className="container-wide max-w-4xl">
          <div className="text-center mb-12">
            <span className="text-xs font-extrabold uppercase tracking-widest text-primary-900 bg-primary-50 px-3.5 py-1 rounded-full border border-primary-200">
              Got Questions?
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mt-3 mb-3">
              Frequently Asked Questions
            </h2>
            <p className="text-gray-600 text-sm">
              Everything you need to know about our laptop diagnostic and repair process in Singapore.
            </p>
          </div>

          <div className="space-y-3">
            {FAQS.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <div
                  key={index}
                  className="bg-white rounded-2xl border border-gray-200 overflow-hidden transition-all shadow-2xs"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : index)}
                    className="w-full p-5 text-left flex items-center justify-between gap-4 focus:outline-none"
                  >
                    <span className="text-sm sm:text-base font-extrabold text-gray-900">
                      {faq.q}
                    </span>
                    <div className={`p-1.5 rounded-full bg-gray-100 text-gray-600 transition-transform ${isOpen ? 'rotate-180 bg-primary-50 text-primary-700' : ''}`}>
                      <ChevronDown className="w-4 h-4" />
                    </div>
                  </button>

                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="px-5 pb-5 text-xs sm:text-sm text-gray-600 leading-relaxed border-t border-gray-100 pt-3">
                          {faq.a}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </section>

    </div>
  );
};

export default LaptopServicePage;
