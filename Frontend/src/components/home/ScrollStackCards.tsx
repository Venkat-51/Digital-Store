import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Monitor, Shield, Zap, Award } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const CARDS = [
  {
    id: 1,
    icon: <Monitor size={32} />,
    title: 'Premium Hardware',
    description: 'Top-tier computer accessories and peripherals from leading global brands.',
    gradient: 'from-primary-600 to-primary-900',
    bg: 'bg-primary-50',
    iconColor: 'text-primary-600',
  },
  {
    id: 2,
    icon: <Shield size={32} />,
    title: 'Authentic Warranty',
    description: 'Every product comes with official manufacturer warranty and after-sales support.',
    gradient: 'from-secondary-500 to-secondary-800',
    bg: 'bg-secondary-50',
    iconColor: 'text-secondary-500',
  },
  {
    id: 3,
    icon: <Zap size={32} />,
    title: 'Fast Delivery',
    description: 'Same-day delivery available across Singapore. Get your tech when you need it.',
    gradient: 'from-green-500 to-green-800',
    bg: 'bg-green-50',
    iconColor: 'text-green-600',
  },
  {
    id: 4,
    icon: <Award size={32} />,
    title: 'Expert Support',
    description: 'Our team of tech specialists is here to help you find the perfect solution.',
    gradient: 'from-purple-500 to-purple-800',
    bg: 'bg-purple-50',
    iconColor: 'text-purple-600',
  },
];

const ScrollStackCards: React.FC = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement[]>([]);

  useEffect(() => {
    if (!sectionRef.current) return;

    const ctx = gsap.context(() => {
      cardsRef.current.forEach((card, i) => {
        if (!card) return;
        gsap.fromTo(
          card,
          { opacity: 0, y: 60, scale: 0.95 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.7,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: card,
              start: 'top 80%',
              end: 'top 50%',
              scrub: false,
              toggleActions: 'play none none none',
            },
            delay: i * 0.1,
          },
        );
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="section bg-gray-950" aria-labelledby="features-heading">
      <div className="container-wide">
        <div className="text-center mb-14">
          <p className="text-sm font-bold text-primary-400 uppercase tracking-widest mb-3">Why Lexicon</p>
          <h2 id="features-heading" className="text-4xl font-black text-white tracking-tight mb-4">
            Why Choose Us?
          </h2>
          <p className="text-gray-400 max-w-xl mx-auto">
            Lexicon Technology has been Singapore's trusted partner for premium tech products for over a decade.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {CARDS.map((card, i) => (
            <div
              key={card.id}
              ref={(el) => { if (el) cardsRef.current[i] = el; }}
              className="group relative bg-gray-900 rounded-3xl p-7 border border-gray-800 hover:border-gray-700 transition-all duration-300 hover:-translate-y-2 overflow-hidden"
            >
              {/* Background gradient (shows on hover) */}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}
              />

              {/* Icon */}
              <div className={`w-14 h-14 ${card.bg} rounded-2xl flex items-center justify-center mb-5 ${card.iconColor} relative z-10`}>
                {card.icon}
              </div>

              {/* Content */}
              <h3 className="text-lg font-bold text-white mb-3 relative z-10">{card.title}</h3>
              <p className="text-sm text-gray-400 leading-relaxed relative z-10">{card.description}</p>

              {/* Corner accent */}
              <div className={`absolute bottom-0 right-0 w-24 h-24 bg-gradient-to-tl ${card.gradient} opacity-5 rounded-tl-full`} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ScrollStackCards;
