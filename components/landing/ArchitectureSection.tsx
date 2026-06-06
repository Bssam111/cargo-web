'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Smartphone, Shield, Database, Cloud, Bell, LayoutDashboard, HardHat } from 'lucide-react';

const layers = [
  {
    icon: Smartphone,
    title: 'Mobile App',
    subtitle: 'Flutter (iOS & Android)',
    color: 'bg-blue-500',
    textColor: 'text-blue-600',
    bgLight: 'bg-blue-50 border-blue-200',
  },
  {
    icon: Shield,
    title: 'Firebase Authentication',
    subtitle: 'OTP + Email/Password + Phone',
    color: 'bg-orange-500',
    textColor: 'text-orange-600',
    bgLight: 'bg-orange-50 border-orange-200',
  },
  {
    icon: Database,
    title: 'Cloud Firestore',
    subtitle: 'Real-time NoSQL database',
    color: 'bg-yellow-500',
    textColor: 'text-yellow-600',
    bgLight: 'bg-yellow-50 border-yellow-200',
  },
  {
    icon: Cloud,
    title: 'Cloud Functions',
    subtitle: 'TypeScript serverless logic (us-central1)',
    color: 'bg-purple-500',
    textColor: 'text-purple-600',
    bgLight: 'bg-purple-50 border-purple-200',
  },
  {
    icon: Bell,
    title: 'FCM + Storage',
    subtitle: 'Push notifications & file storage',
    color: 'bg-red-500',
    textColor: 'text-red-600',
    bgLight: 'bg-red-50 border-red-200',
  },
  {
    icon: LayoutDashboard,
    title: 'Admin Dashboard',
    subtitle: 'Next.js + TypeScript (this portal)',
    color: 'bg-brand',
    textColor: 'text-brand',
    bgLight: 'bg-green-50 border-green-200',
  },
  {
    icon: HardHat,
    title: 'Employee Portal',
    subtitle: 'Hub operations & inspections',
    color: 'bg-teal-500',
    textColor: 'text-teal-600',
    bgLight: 'bg-teal-50 border-teal-200',
  },
];

export default function ArchitectureSection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section id="architecture" ref={ref} className="py-28 bg-gray-950">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <span className="inline-block text-green-400 text-sm font-semibold uppercase tracking-widest mb-4">
            System Architecture
          </span>
          <h2 className="text-4xl sm:text-5xl font-extrabold text-white mb-5">
            Built for scale
          </h2>
          <p className="text-lg text-gray-400 max-w-xl mx-auto">
            A modern cloud-native architecture with Firebase as the backbone
            and Next.js for the operations dashboard.
          </p>
        </motion.div>

        {/* Stack */}
        <div className="relative flex flex-col items-center gap-0">
          {layers.map((layer, i) => {
            const Icon = layer.icon;
            const isLast = i === layers.length - 1;
            return (
              <motion.div
                key={layer.title}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={inView ? { opacity: 1, scale: 1 } : {}}
                transition={{ duration: 0.4, delay: 0.1 + i * 0.08 }}
                className="flex flex-col items-center w-full max-w-md"
              >
                <div className={`w-full flex items-center gap-4 bg-gray-900 border border-gray-800 hover:border-gray-700 rounded-2xl px-6 py-4 transition-all group cursor-default`}>
                  <div className={`w-10 h-10 ${layer.color} rounded-xl flex items-center justify-center flex-shrink-0`}>
                    <Icon size={19} className="text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-white text-sm">{layer.title}</div>
                    <div className="text-xs text-gray-500 truncate">{layer.subtitle}</div>
                  </div>
                  <div className={`text-xs font-semibold px-2.5 py-1 rounded-full bg-gray-800 ${layer.textColor}`}>
                    {i === 0 ? 'Client' : i <= 4 ? 'Firebase' : 'Web'}
                  </div>
                </div>

                {/* Arrow down */}
                {!isLast && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={inView ? { opacity: 1 } : {}}
                    transition={{ delay: 0.15 + i * 0.08 }}
                    className="flex flex-col items-center my-1"
                  >
                    <div className="w-px h-5 bg-gray-700" />
                    <svg width="10" height="6" viewBox="0 0 10 6" fill="none">
                      <path d="M1 1L5 5L9 1" stroke="#4B5563" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
