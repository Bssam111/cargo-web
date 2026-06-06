'use client';

import { useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import {
  Search, Lock, Heart, Star, Bell, Bot,
  Car, BarChart3, Wallet, Calendar, List,
  Building2, UserCheck, ClipboardCheck, RotateCcw,
  PieChart, Users, Eye, DollarSign, FileText,
} from 'lucide-react';

const categories = [
  { id: 'renters', label: 'For Renters', color: 'blue' },
  { id: 'owners', label: 'For Owners', color: 'green' },
  { id: 'operations', label: 'Operations', color: 'orange' },
  { id: 'admins', label: 'Admins', color: 'purple' },
];

const features: Record<string, { icon: React.ElementType; title: string; description: string }[]> = {
  renters: [
    { icon: Search, title: 'Search & Filter', description: 'Find vehicles by type, brand, price range, and availability with smart filters.' },
    { icon: Lock, title: 'Secure Booking', description: 'Book with confidence using Stripe-powered payment verification and OTP auth.' },
    { icon: Heart, title: 'Favorites', description: 'Save your favorite vehicles and get notified when they become available.' },
    { icon: Star, title: 'Reviews & Ratings', description: 'Read and write honest reviews to build trust in the community.' },
    { icon: Bell, title: 'Push Notifications', description: 'Get real-time updates on booking status, confirmations, and reminders.' },
    { icon: Bot, title: 'AI Chatbot', description: 'Gemini-powered assistant helps you find the perfect car and answers questions.' },
  ],
  owners: [
    { icon: Car, title: 'Vehicle Listing', description: 'List your vehicle with photos, details, pricing, and availability calendar.' },
    { icon: List, title: 'Fleet Management', description: 'Manage all your vehicles, track their status and hub availability in real-time.' },
    { icon: BarChart3, title: 'Earnings Dashboard', description: 'Visualize your rental income with detailed analytics and performance charts.' },
    { icon: Wallet, title: 'Wallet & Payouts', description: 'Track earnings, request payouts, and manage your CarGo wallet balance.' },
    { icon: Calendar, title: 'Booking Management', description: 'View upcoming bookings, rental history, and manage your vehicle calendar.' },
  ],
  operations: [
    { icon: Building2, title: 'Hub Management', description: 'Manage vehicle inventory at the CarGo Hub with real-time status tracking.' },
    { icon: UserCheck, title: 'Employee Verification', description: 'Role-based access for hub employees with dedicated inspection workflows.' },
    { icon: ClipboardCheck, title: 'Vehicle Inspection', description: 'Digital inspection forms capture vehicle condition before and after each rental.' },
    { icon: RotateCcw, title: 'Pickup & Return', description: 'Streamlined workflows for vehicle pickups from owners and returns from renters.' },
  ],
  admins: [
    { icon: PieChart, title: 'Analytics Dashboard', description: 'Full platform analytics with booking trends, revenue, and user growth metrics.' },
    { icon: Users, title: 'User Management', description: 'Manage renters, owners, and employees with full profile and role control.' },
    { icon: Eye, title: 'Vehicle Monitoring', description: 'Monitor all vehicles across the platform and their inspection status.' },
    { icon: DollarSign, title: 'Revenue Tracking', description: 'Real-time revenue tracking with payout management and financial reporting.' },
    { icon: FileText, title: 'Operational Reports', description: 'Generate detailed reports on bookings, hub operations, and platform health.' },
  ],
};

const colorMap = {
  blue: { bg: 'bg-blue-50', icon: 'bg-blue-100 text-blue-600', active: 'bg-blue-600 text-white' },
  green: { bg: 'bg-green-50', icon: 'bg-green-100 text-green-700', active: 'bg-green-600 text-white' },
  orange: { bg: 'bg-orange-50', icon: 'bg-orange-100 text-orange-600', active: 'bg-orange-600 text-white' },
  purple: { bg: 'bg-purple-50', icon: 'bg-purple-100 text-purple-600', active: 'bg-purple-600 text-white' },
};

export default function FeaturesSection() {
  const [active, setActive] = useState('renters');
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  const category = categories.find((c) => c.id === active)!;
  const color = colorMap[category.color as keyof typeof colorMap];

  return (
    <section id="features" ref={ref} className="py-28 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <span className="inline-block text-brand text-sm font-semibold uppercase tracking-widest mb-4">
            Platform Features
          </span>
          <h2 className="text-4xl sm:text-5xl font-extrabold text-gray-900 mb-5">
            Everything built in
          </h2>
          <p className="text-lg text-gray-500 max-w-xl mx-auto">
            CarGo is a complete platform. From the mobile app to the admin dashboard,
            every role has purpose-built features.
          </p>
        </motion.div>

        {/* Tab bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="flex flex-wrap gap-3 justify-center mb-12"
        >
          {categories.map((cat) => {
            const c = colorMap[cat.color as keyof typeof colorMap];
            return (
              <button
                key={cat.id}
                onClick={() => setActive(cat.id)}
                className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all ${
                  active === cat.id ? c.active + ' shadow-md' : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </motion.div>

        {/* Feature cards */}
        <motion.div
          key={active}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5"
        >
          {features[active].map(({ icon: Icon, title, description }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.07 }}
              className={`${color.bg} rounded-2xl p-6 border border-white hover:shadow-lg transition-all group`}
            >
              <div className={`w-11 h-11 ${color.icon} rounded-xl flex items-center justify-center mb-4`}>
                <Icon size={20} />
              </div>
              <h4 className="font-bold text-gray-900 mb-2">{title}</h4>
              <p className="text-sm text-gray-500 leading-relaxed">{description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
