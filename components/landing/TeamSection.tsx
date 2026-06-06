'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import Image from 'next/image';
import { Code2, Wrench, TestTube, Palette, Server } from 'lucide-react';

const team = [
  {
    name: 'Bassam Alhwarini',
    role: 'Scrum Master & Full-Stack Developer',
    contribution: 'Led the project end-to-end as Scrum Master. Built core Flutter features, Firebase integration, Cloud Functions, and the admin portal.',
    avatar: '/team/bassam.jpg',
    icon: Server,
    color: 'from-brand to-green-600',
  },
  {
    name: 'Abdulrhman Alyousef',
    role: 'Full-Stack Developer & Development Lead',
    contribution: 'Development Lead responsible for architecture decisions, booking flow, payment integration, and key platform features.',
    avatar: '/team/Abdulrhman.jpg',
    icon: Code2,
    color: 'from-blue-600 to-blue-400',
  },
  {
    name: 'Mohammed Abuhaimed',
    role: 'Full-Stack Developer',
    contribution: 'Developed major features across the Flutter app and Firebase backend, including owner flows and push notifications.',
    avatar: '/team/abuhaimed.jpeg',
    icon: Wrench,
    color: 'from-purple-600 to-purple-400',
  },
  {
    name: 'Abdullah Aloraini',
    role: 'Testing Lead',
    contribution: 'Led QA and testing efforts, ensuring platform stability, edge case coverage, and regression-free releases.',
    avatar: '/team/Abdullah.jpg',
    icon: TestTube,
    color: 'from-orange-600 to-orange-400',
  },
  {
    name: 'Mohammed Aloraini',
    role: 'UI/UX Designer & Tester',
    contribution: 'Designed the app\'s visual identity, user experience flows, screen layouts, and supported QA testing.',
    avatar: '/team/Mohammed.jpg',
    icon: Palette,
    color: 'from-pink-600 to-pink-400',
  },
];

export default function TeamSection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section id="team" ref={ref} className="py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-block text-brand text-sm font-semibold uppercase tracking-widest mb-4">
            The Team
          </span>
          <h2 className="text-4xl sm:text-5xl font-extrabold text-gray-900 mb-5">
            Built by passionate people
          </h2>
          <p className="text-lg text-gray-500 max-w-xl mx-auto">
            A five-person team of final-year Computer Science students who built CarGo
            from idea to production.
          </p>
        </motion.div>

        {/* Team grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {team.map(({ name, role, contribution, avatar, icon: Icon, color }, i) => (
            <motion.div
              key={name}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className={`group relative bg-gray-50 hover:bg-white border border-gray-100 hover:border-gray-200 rounded-2xl p-6 hover:shadow-xl transition-all duration-300 ${
                i === 0 ? 'sm:col-span-2 lg:col-span-1' : ''
              }`}
            >
              {/* Gradient top bar */}
              <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${color} rounded-t-2xl opacity-0 group-hover:opacity-100 transition-opacity`} />

              <div className="flex items-start gap-4">
                {/* Avatar */}
                <div className="relative flex-shrink-0">
                  <div className="w-16 h-16 rounded-2xl overflow-hidden bg-gray-200">
                    <Image
                      src={avatar}
                      alt={name}
                      width={64}
                      height={64}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className={`absolute -bottom-1 -right-1 w-6 h-6 bg-gradient-to-br ${color} rounded-lg flex items-center justify-center shadow-sm`}>
                    <Icon size={12} className="text-white" />
                  </div>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-gray-900 leading-tight">{name}</h4>
                  <div className="text-sm text-brand font-medium mt-0.5">{role}</div>
                </div>
              </div>

              <p className="text-sm text-gray-500 leading-relaxed mt-4">{contribution}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
