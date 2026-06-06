'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, X, ZoomIn } from 'lucide-react';

const screenshots = [
  { src: '/screen/Home-Screen.png', label: 'Home Screen', category: 'Renter' },
  { src: '/screen/Search.png', label: 'Search & Filter', category: 'Renter' },
  { src: '/screen/Car Detail.png', label: 'Car Details', category: 'Renter' },
  { src: '/screen/chatbot.png', label: 'AI Chatbot', category: 'Renter' },
  { src: '/screen/renter-past -trips.png', label: 'Past Trips', category: 'Renter' },
  { src: '/screen/Owner-Dashboard.png', label: 'Owner Dashboard', category: 'Owner' },
  { src: '/screen/Owner-Cars.png', label: 'Fleet Management', category: 'Owner' },
  { src: '/screen/Owner-Earnings.png', label: 'Earnings', category: 'Owner' },
  { src: '/screen/Splash-Screen.png', label: 'Splash Screen', category: 'App' },
];

export default function ScreenshotsSection() {
  const [current, setCurrent] = useState(0);
  const [lightbox, setLightbox] = useState<number | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  const prev = () => setCurrent((c) => (c - 1 + screenshots.length) % screenshots.length);
  const next = () => setCurrent((c) => (c + 1) % screenshots.length);

  useEffect(() => {
    if (lightbox !== null) return;
    const timer = setInterval(() => setCurrent((c) => (c + 1) % screenshots.length), 4000);
    return () => clearInterval(timer);
  }, [lightbox]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (lightbox === null) return;
      if (e.key === 'ArrowLeft') setLightbox((l) => (l! - 1 + screenshots.length) % screenshots.length);
      if (e.key === 'ArrowRight') setLightbox((l) => (l! + 1) % screenshots.length);
      if (e.key === 'Escape') setLightbox(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [lightbox]);

  const visibleIndexes = [-2, -1, 0, 1, 2].map(
    (offset) => (current + offset + screenshots.length) % screenshots.length
  );

  return (
    <section id="screenshots" ref={ref} className="py-28 bg-gray-50 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-block text-brand text-sm font-semibold uppercase tracking-widest mb-4">
            App Screenshots
          </span>
          <h2 className="text-4xl sm:text-5xl font-extrabold text-gray-900 mb-5">
            See it in action
          </h2>
          <p className="text-lg text-gray-500 max-w-xl mx-auto">
            A polished, production-ready mobile experience for every user type.
          </p>
        </motion.div>

        {/* Carousel */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="relative"
        >
          {/* Phone frames row */}
          <div className="flex items-end justify-center gap-4 h-[520px] mb-10">
            {visibleIndexes.map((idx, pos) => {
              const distance = pos - 2; // -2 to 2
              const isCenter = distance === 0;
              const scale = isCenter ? 1 : Math.max(0.65, 1 - Math.abs(distance) * 0.15);
              const translateY = isCenter ? 0 : Math.abs(distance) * 20;
              const opacity = isCenter ? 1 : Math.max(0.4, 1 - Math.abs(distance) * 0.25);
              const zIndex = 5 - Math.abs(distance);

              return (
                <motion.div
                  key={`${idx}-${pos}`}
                  animate={{ scale, y: translateY, opacity }}
                  transition={{ duration: 0.4, ease: 'easeOut' }}
                  style={{ zIndex }}
                  className={`relative flex-shrink-0 cursor-pointer ${isCenter ? 'cursor-zoom-in' : 'cursor-pointer'}`}
                  onClick={() => isCenter ? setLightbox(idx) : setCurrent(idx)}
                >
                  {/* Phone frame */}
                  <div className={`relative rounded-[2.5rem] overflow-hidden shadow-2xl border-[6px] ${isCenter ? 'border-gray-900 w-48 h-[400px]' : 'border-gray-800 w-40 h-[340px]'}`}>
                    <Image
                      src={screenshots[idx].src}
                      alt={screenshots[idx].label}
                      fill
                      className="object-cover"
                    />
                    {/* Notch */}
                    <div className="absolute top-2 left-1/2 -translate-x-1/2 w-16 h-4 bg-gray-900 rounded-full z-10" />
                    {isCenter && (
                      <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors flex items-center justify-center">
                        <ZoomIn size={24} className="text-white opacity-0 hover:opacity-100 transition-opacity" />
                      </div>
                    )}
                  </div>
                  {isCenter && (
                    <div className="text-center mt-4">
                      <div className="font-semibold text-gray-900 text-sm">{screenshots[idx].label}</div>
                      <div className="text-xs text-gray-400">{screenshots[idx].category}</div>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={prev}
              className="w-10 h-10 bg-white border border-gray-200 rounded-full flex items-center justify-center hover:border-brand hover:text-brand transition-colors shadow-sm"
            >
              <ChevronLeft size={18} />
            </button>

            {/* Dots */}
            <div className="flex gap-2">
              {screenshots.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  className={`transition-all rounded-full ${i === current ? 'w-6 h-2 bg-brand' : 'w-2 h-2 bg-gray-300 hover:bg-gray-400'}`}
                />
              ))}
            </div>

            <button
              onClick={next}
              className="w-10 h-10 bg-white border border-gray-200 rounded-full flex items-center justify-center hover:border-brand hover:text-brand transition-colors shadow-sm"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </motion.div>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
            onClick={() => setLightbox(null)}
          >
            <motion.div
              initial={{ scale: 0.85 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.85 }}
              className="relative max-h-[90vh] max-w-sm w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative w-full aspect-[9/19] rounded-3xl overflow-hidden">
                <Image
                  src={screenshots[lightbox].src}
                  alt={screenshots[lightbox].label}
                  fill
                  className="object-contain"
                />
              </div>
              <div className="text-center mt-4 text-white font-semibold">{screenshots[lightbox].label}</div>
            </motion.div>

            {/* Controls */}
            <button
              className="absolute top-4 right-4 text-white/70 hover:text-white"
              onClick={() => setLightbox(null)}
            >
              <X size={24} />
            </button>
            <button
              className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-white hover:bg-white/20"
              onClick={() => setLightbox((l) => (l! - 1 + screenshots.length) % screenshots.length)}
            >
              <ChevronLeft size={20} />
            </button>
            <button
              className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-white hover:bg-white/20"
              onClick={() => setLightbox((l) => (l! + 1) % screenshots.length)}
            >
              <ChevronRight size={20} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
