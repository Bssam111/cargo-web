'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';

const links = [
  { href: '#about', label: 'About' },
  { href: '#features', label: 'Features' },
  { href: '#how-it-works', label: 'How It Works' },
  { href: '#tech', label: 'Tech Stack' },
  { href: '#team', label: 'Team' },
  { href: '#download', label: 'Download' },
];

export default function LandingNav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleNav = (href: string) => {
    setOpen(false);
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div
            className="cursor-pointer select-none"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            <span className={`text-xl font-extrabold tracking-tight transition-colors ${scrolled ? 'text-gray-900' : 'text-white'}`}>
              Car<span className="text-brand">Go</span>
            </span>
          </div>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {links.map((link) => (
              <button
                key={link.href}
                onClick={() => handleNav(link.href)}
                className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  scrolled
                    ? 'text-gray-600 hover:text-brand hover:bg-brand-50'
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}
              >
                {link.label}
              </button>
            ))}
          </nav>

          {/* CTA */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/login"
              className={`px-4 py-2 text-sm font-medium rounded-lg border transition-all ${
                scrolled
                  ? 'border-brand text-brand hover:bg-brand hover:text-white'
                  : 'border-white/40 text-white hover:bg-white/10'
              }`}
            >
              Portal Login
            </Link>
            <button
              onClick={() => handleNav('#download')}
              className="px-4 py-2 text-sm font-semibold rounded-lg bg-brand text-white hover:bg-brand-600 transition-colors"
            >
              Download App
            </button>
          </div>

          {/* Mobile menu toggle */}
          <button
            className={`md:hidden p-2 rounded-lg ${scrolled ? 'text-gray-700' : 'text-white'}`}
            onClick={() => setOpen(!open)}
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden bg-white border-t border-gray-100 overflow-hidden"
          >
            <div className="px-4 py-3 flex flex-col gap-1">
              {links.map((link) => (
                <button
                  key={link.href}
                  onClick={() => handleNav(link.href)}
                  className="w-full text-left px-3 py-2.5 text-sm font-medium text-gray-700 hover:text-brand hover:bg-brand-50 rounded-lg transition-colors"
                >
                  {link.label}
                </button>
              ))}
              <div className="pt-2 flex flex-col gap-2">
                <Link href="/login" className="w-full text-center px-4 py-2.5 text-sm font-medium border border-brand text-brand rounded-lg hover:bg-brand hover:text-white transition-all">
                  Portal Login
                </Link>
                <button
                  onClick={() => handleNav('#download')}
                  className="w-full px-4 py-2.5 text-sm font-semibold bg-brand text-white rounded-lg hover:bg-brand-600 transition-colors"
                >
                  Download App
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
