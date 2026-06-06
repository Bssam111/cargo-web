'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

const technologies = [
  {
    name: 'Flutter',
    category: 'Mobile',
    description: 'Cross-platform iOS & Android app',
    logo: '🐦',
    color: 'bg-blue-50 border-blue-100',
    badge: 'bg-blue-100 text-blue-700',
  },
  {
    name: 'Firebase',
    category: 'Backend',
    description: 'Auth, Firestore, Storage, Functions',
    logo: '🔥',
    color: 'bg-orange-50 border-orange-100',
    badge: 'bg-orange-100 text-orange-700',
  },
  {
    name: 'Firestore',
    category: 'Database',
    description: 'Real-time NoSQL cloud database',
    logo: '🗄️',
    color: 'bg-yellow-50 border-yellow-100',
    badge: 'bg-yellow-100 text-yellow-700',
  },
  {
    name: 'Firebase Auth',
    category: 'Security',
    description: 'OTP, email/password, phone auth',
    logo: '🔐',
    color: 'bg-red-50 border-red-100',
    badge: 'bg-red-100 text-red-700',
  },
  {
    name: 'FCM',
    category: 'Notifications',
    description: 'Firebase Cloud Messaging',
    logo: '🔔',
    color: 'bg-pink-50 border-pink-100',
    badge: 'bg-pink-100 text-pink-700',
  },
  {
    name: 'Next.js',
    category: 'Web',
    description: 'Admin & employee web portal',
    logo: '▲',
    color: 'bg-gray-50 border-gray-200',
    badge: 'bg-gray-200 text-gray-700',
  },
  {
    name: 'React',
    category: 'UI',
    description: 'Component-based UI framework',
    logo: '⚛️',
    color: 'bg-cyan-50 border-cyan-100',
    badge: 'bg-cyan-100 text-cyan-700',
  },
  {
    name: 'TypeScript',
    category: 'Language',
    description: 'Type-safe JavaScript',
    logo: 'TS',
    color: 'bg-blue-50 border-blue-100',
    badge: 'bg-blue-100 text-blue-700',
  },
  {
    name: 'Stripe',
    category: 'Payments',
    description: 'SetupIntent card verification',
    logo: '💳',
    color: 'bg-violet-50 border-violet-100',
    badge: 'bg-violet-100 text-violet-700',
  },
  {
    name: 'Gemini AI',
    category: 'AI',
    description: 'AI chatbot assistant',
    logo: '✨',
    color: 'bg-purple-50 border-purple-100',
    badge: 'bg-purple-100 text-purple-700',
  },
  {
    name: 'Vercel',
    category: 'Hosting',
    description: 'Web portal deployment',
    logo: '▲',
    color: 'bg-gray-50 border-gray-200',
    badge: 'bg-gray-200 text-gray-700',
  },
];

export default function TechStackSection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section id="tech" ref={ref} className="py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-block text-brand text-sm font-semibold uppercase tracking-widest mb-4">
            Technology Stack
          </span>
          <h2 className="text-4xl sm:text-5xl font-extrabold text-gray-900 mb-5">
            Built with modern tools
          </h2>
          <p className="text-lg text-gray-500 max-w-xl mx-auto">
            CarGo leverages industry-leading technologies for reliability,
            performance, and developer experience.
          </p>
        </motion.div>

        {/* Tech grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {technologies.map(({ name, category, description, logo, color, badge }, i) => (
            <motion.div
              key={name}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              className={`${color} border rounded-2xl p-5 hover:shadow-md transition-all group`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-lg font-bold">
                  {logo}
                </div>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${badge}`}>
                  {category}
                </span>
              </div>
              <h4 className="font-bold text-gray-900 mb-1">{name}</h4>
              <p className="text-xs text-gray-500 leading-relaxed">{description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
