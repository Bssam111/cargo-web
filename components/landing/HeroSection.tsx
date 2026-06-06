'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Download, Star, Users, Car, Zap } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

function AnimatedCounter({ target, suffix = '' }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const duration = 1800;
          const steps = 60;
          const increment = target / steps;
          let current = 0;
          const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
              setCount(target);
              clearInterval(timer);
            } else {
              setCount(Math.floor(current));
            }
          }, duration / steps);
        }
      },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);

  return <span ref={ref}>{count}{suffix}</span>;
}

const heroStats = [
  { icon: Users, label: 'User Roles', value: 4, suffix: '' },
  { icon: Zap, label: 'Core Features', value: 20, suffix: '+' },
  { icon: Car, label: 'Technologies', value: 11, suffix: '' },
  { icon: Star, label: 'Team Members', value: 5, suffix: '' },
];

export default function HeroSection() {
  const handleScroll = (id: string) => {
    document.querySelector(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative min-h-screen flex flex-col justify-center overflow-hidden bg-[#040b06]">
      {/* Gradient mesh */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-brand/20 rounded-full blur-[120px]" />
        <div className="absolute top-1/2 -right-40 w-[500px] h-[500px] bg-brand/15 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 left-1/3 w-[400px] h-[400px] bg-green-900/20 rounded-full blur-[80px]" />
      </div>

      {/* Grid overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20">
        <div className="text-center max-w-4xl mx-auto">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 bg-brand/20 border border-brand/30 text-green-400 text-sm font-medium px-4 py-2 rounded-full mb-8"
          >
            <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
            Saudi&apos;s First Peer-to-Peer Car Rental Platform
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.08] mb-6"
          >
            Drive the Future.
            <br />
            <span className="bg-gradient-to-r from-green-400 to-green-300 bg-clip-text text-transparent">
              Rent Smarter.
            </span>
          </motion.h1>

          {/* Subtext */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg sm:text-xl text-gray-400 leading-relaxed max-w-2xl mx-auto mb-10"
          >
            CarGo connects vehicle owners and renters through a managed hub model in Riyadh.
            Seamless bookings, verified vehicles, secure payments — all in one app.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-wrap gap-4 justify-center mb-16"
          >
            <a
              href="/app-release.apk"
              download
              className="inline-flex items-center gap-2 bg-brand text-white font-semibold px-7 py-3.5 rounded-xl hover:bg-brand-600 transition-all hover:scale-105 shadow-lg shadow-brand/30"
            >
              <Download size={18} />
              Download APK
            </a>
            <button
              onClick={() => handleScroll('#features')}
              className="inline-flex items-center gap-2 bg-white/10 text-white font-semibold px-7 py-3.5 rounded-xl border border-white/20 hover:bg-white/15 transition-all hover:scale-105"
            >
              Explore Features
              <ArrowRight size={16} />
            </button>
          </motion.div>

          {/* Stats row */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.45 }}
            className="grid grid-cols-2 sm:grid-cols-4 gap-4"
          >
            {heroStats.map(({ icon: Icon, label, value, suffix }) => (
              <div
                key={label}
                className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-sm hover:bg-white/8 transition-colors"
              >
                <div className="w-9 h-9 bg-brand/30 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Icon size={18} className="text-green-400" />
                </div>
                <div className="text-3xl font-extrabold text-white mb-1">
                  <AnimatedCounter target={value} suffix={suffix} />
                </div>
                <div className="text-xs text-gray-400 font-medium uppercase tracking-wide">{label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

    </section>
  );
}
