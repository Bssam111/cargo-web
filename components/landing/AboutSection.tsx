'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { MapPin, Shield, TrendingUp, Handshake } from 'lucide-react';

const differentiators = [
  {
    icon: MapPin,
    title: 'Centralized Hub',
    description: 'All vehicle pickups and returns happen at the CarGo Hub in Al Yasmin, Riyadh — no coordination headaches.',
  },
  {
    icon: Shield,
    title: 'Verified & Inspected',
    description: 'Every vehicle is physically inspected by our employees before and after each rental for maximum trust.',
  },
  {
    icon: TrendingUp,
    title: 'Owners Earn More',
    description: 'Vehicle owners earn passive income. CarGo handles logistics, bookings, payments, and customer support.',
  },
  {
    icon: Handshake,
    title: 'Peer-to-Peer Trust',
    description: 'Built on Firebase Auth + OTP verification to ensure every renter and owner is legitimate and verified.',
  },
];

export default function AboutSection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section id="about" ref={ref} className="py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <span className="inline-block text-brand text-sm font-semibold uppercase tracking-widest mb-4">
            About CarGo
          </span>
          <h2 className="text-4xl sm:text-5xl font-extrabold text-gray-900 mb-6 leading-tight">
            A smarter way to rent cars <br className="hidden sm:block" />
            in Saudi Arabia
          </h2>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">
            CarGo is a peer-to-peer car rental platform that removes the friction between vehicle
            owners who want to earn passive income and renters who need reliable, affordable transportation.
          </p>
        </motion.div>

        {/* Problem / Solution split */}
        <div className="grid lg:grid-cols-2 gap-16 items-center mb-24">
          {/* Problem */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="inline-flex items-center gap-2 bg-red-50 text-red-600 text-xs font-semibold uppercase tracking-widest px-3 py-1.5 rounded-full mb-6">
              The Problem
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-5">
              Traditional rentals are expensive & inconvenient
            </h3>
            <ul className="space-y-4">
              {[
                'High prices from traditional agencies with limited selection',
                'No transparent pricing or real-time availability',
                'No direct connection between vehicle owners and renters',
                'Manual, paper-based inspection and handover processes',
                'No centralized pickup point — owners and renters must coordinate individually',
              ].map((item) => (
                <li key={item} className="flex items-start gap-3 text-gray-600">
                  <span className="mt-1 flex-shrink-0 w-5 h-5 rounded-full bg-red-100 flex items-center justify-center">
                    <span className="w-1.5 h-1.5 bg-red-500 rounded-full" />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Solution */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.35 }}
          >
            <div className="inline-flex items-center gap-2 bg-brand-50 text-brand text-xs font-semibold uppercase tracking-widest px-3 py-1.5 rounded-full mb-6">
              The CarGo Solution
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-5">
              A managed hub model that works for everyone
            </h3>
            <ul className="space-y-4">
              {[
                'Peer-to-peer rental with real-time availability and competitive pricing',
                'All vehicles centrally located at the CarGo Hub in Al Yasmin, Riyadh',
                'Professional inspection by trained employees before every rental',
                'Stripe-powered payments with full booking management',
                'AI chatbot assistant helps renters find the perfect vehicle',
              ].map((item) => (
                <li key={item} className="flex items-start gap-3 text-gray-600">
                  <span className="mt-1 flex-shrink-0 w-5 h-5 rounded-full bg-brand-50 flex items-center justify-center">
                    <span className="w-1.5 h-1.5 bg-brand rounded-full" />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </motion.div>
        </div>

        {/* Differentiators grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {differentiators.map(({ icon: Icon, title, description }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.4 + i * 0.1 }}
              className="group bg-gray-50 hover:bg-brand hover:shadow-xl hover:shadow-brand/20 rounded-2xl p-6 transition-all duration-300"
            >
              <div className="w-11 h-11 bg-brand/10 group-hover:bg-white/20 rounded-xl flex items-center justify-center mb-4 transition-colors">
                <Icon size={22} className="text-brand group-hover:text-white transition-colors" />
              </div>
              <h4 className="font-bold text-gray-900 group-hover:text-white mb-2 transition-colors">{title}</h4>
              <p className="text-sm text-gray-500 group-hover:text-white/80 leading-relaxed transition-colors">
                {description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
