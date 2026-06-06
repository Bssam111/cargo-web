'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Search, CalendarDays, CreditCard, MapPin, RotateCcw, Car, Building, ClipboardCheck, TrendingUp } from 'lucide-react';

const renterSteps = [
  { icon: Search, step: '01', title: 'Search a Car', description: 'Browse available vehicles, filter by type, brand, and dates.' },
  { icon: CalendarDays, step: '02', title: 'Select Dates', description: 'Pick your rental dates with real-time availability checking.' },
  { icon: CreditCard, step: '03', title: 'Book & Pay', description: 'Secure your booking with Stripe payment verification.' },
  { icon: MapPin, step: '04', title: 'Pick Up from Hub', description: 'Collect your verified car from the CarGo Hub in Al Yasmin.' },
  { icon: RotateCcw, step: '05', title: 'Return Vehicle', description: 'Return to the hub. Employee inspects and closes the booking.' },
];

const ownerSteps = [
  { icon: Car, step: '01', title: 'Add Vehicle', description: 'List your car with photos, specs, and your pricing preferences.' },
  { icon: MapPin, step: '02', title: 'Deliver to Hub', description: 'Drop your car at the CarGo Hub for secure storage and management.' },
  { icon: ClipboardCheck, step: '03', title: 'Vehicle Inspection', description: 'Our employee inspects and verifies your vehicle is ready to rent.' },
  { icon: Building, step: '04', title: 'Receive Bookings', description: 'Sit back while CarGo manages rentals and customer service for you.' },
  { icon: TrendingUp, step: '05', title: 'Earn Revenue', description: 'Get paid automatically into your CarGo wallet after each rental.' },
];

function JourneyColumn({
  title,
  subtitle,
  steps,
  accentColor,
  delay,
  inView,
}: {
  title: string;
  subtitle: string;
  steps: typeof renterSteps;
  accentColor: string;
  delay: number;
  inView: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay }}
      className="flex-1"
    >
      <div className={`inline-flex items-center gap-2 ${accentColor} text-white text-xs font-semibold uppercase tracking-widest px-3 py-1.5 rounded-full mb-4`}>
        {title}
      </div>
      <h3 className="text-2xl font-bold text-gray-900 mb-8">{subtitle}</h3>

      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-5 top-6 bottom-6 w-px bg-gray-200" />

        <div className="space-y-6">
          {steps.map(({ icon: Icon, step, title: stepTitle, description }, i) => (
            <motion.div
              key={step}
              initial={{ opacity: 0, x: -20 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.4, delay: delay + 0.1 + i * 0.08 }}
              className="flex gap-4"
            >
              <div className={`relative flex-shrink-0 w-10 h-10 ${accentColor} rounded-full flex items-center justify-center shadow-md z-10`}>
                <Icon size={17} className="text-white" />
              </div>
              <div className="flex-1 pb-2">
                <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-0.5">Step {step}</div>
                <h4 className="font-bold text-gray-900 mb-1">{stepTitle}</h4>
                <p className="text-sm text-gray-500 leading-relaxed">{description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

export default function HowItWorksSection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section id="how-it-works" ref={ref} className="py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <span className="inline-block text-brand text-sm font-semibold uppercase tracking-widest mb-4">
            How It Works
          </span>
          <h2 className="text-4xl sm:text-5xl font-extrabold text-gray-900 mb-5">
            Simple for everyone
          </h2>
          <p className="text-lg text-gray-500 max-w-xl mx-auto">
            Whether you&apos;re renting or earning — CarGo makes the process effortless
            from start to finish.
          </p>
        </motion.div>

        {/* Two columns */}
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24">
          <JourneyColumn
            title="Renter Journey"
            subtitle="Rent a car in minutes"
            steps={renterSteps}
            accentColor="bg-blue-600"
            delay={0.2}
            inView={inView}
          />
          <JourneyColumn
            title="Owner Journey"
            subtitle="Put your car to work"
            steps={ownerSteps}
            accentColor="bg-brand"
            delay={0.35}
            inView={inView}
          />
        </div>
      </div>
    </section>
  );
}
