'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';

function Counter({ target, suffix = '', prefix = '' }: { target: number; suffix?: string; prefix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const started = useRef(false);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView || started.current) return;
    started.current = true;
    const duration = 2000;
    const steps = 80;
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
    return () => clearInterval(timer);
  }, [inView, target]);

  return (
    <div ref={ref} className="text-5xl lg:text-6xl font-black text-white tabular-nums">
      {prefix}{count}{suffix}
    </div>
  );
}

const stats = [
  { value: 4, suffix: '', label: 'User Roles', sub: 'Renter, Owner, Employee, Admin' },
  { value: 20, suffix: '+', label: 'Core Features', sub: 'Across all platform modules' },
  { value: 11, suffix: '', label: 'Technologies', sub: 'Integrated in the stack' },
  { value: 5, suffix: '', label: 'Team Members', sub: 'Built with passion' },
  { value: 62, suffix: 'MB', label: 'App Size', sub: 'Production-ready APK' },
  { value: 7, suffix: '', label: 'App Screens', sub: 'Included in the build' },
];

export default function StatsSection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section id="stats" ref={ref} className="py-28 bg-brand relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-white/5 rounded-full" />
        <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-white/5 rounded-full" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl sm:text-5xl font-extrabold text-white mb-4">
            By the numbers
          </h2>
          <p className="text-lg text-green-200 max-w-xl mx-auto">
            CarGo is a full-scale platform covering every aspect of peer-to-peer car rental.
          </p>
        </motion.div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-8 lg:gap-6">
          {stats.map(({ value, suffix, label, sub }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="text-center"
            >
              <Counter target={value} suffix={suffix} />
              <div className="text-lg font-bold text-white mt-2 mb-1">{label}</div>
              <div className="text-xs text-green-200">{sub}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
