'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Download, Smartphone, CheckCircle, Package, HardDrive, Shield } from 'lucide-react';

const steps = [
  { step: '1', text: 'Download the APK file to your Android device' },
  { step: '2', text: 'Go to Settings → Security → Enable "Unknown Sources"' },
  { step: '3', text: 'Open the downloaded APK file to start installation' },
  { step: '4', text: 'Follow the on-screen instructions to complete setup' },
  { step: '5', text: 'Launch CarGo and create your account' },
];

const specs = [
  { icon: Package, label: 'File Size', value: '~62 MB' },
  { icon: HardDrive, label: 'Platform', value: 'Android' },
  { icon: Shield, label: 'Build', value: 'Production' },
];

export default function DownloadSection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section id="download" ref={ref} className="py-28 bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block text-green-400 text-sm font-semibold uppercase tracking-widest mb-4">
              Download CarGo
            </span>
            <h2 className="text-4xl sm:text-5xl font-extrabold text-white mb-5 leading-tight">
              Try it yourself.
              <br />
              <span className="text-green-400">Right now.</span>
            </h2>
            <p className="text-lg text-gray-400 mb-8">
              The full production CarGo app is available as an Android APK.
              Install it on any Android device and experience the complete
              peer-to-peer car rental platform.
            </p>

            {/* APK specs */}
            <div className="flex flex-wrap gap-4 mb-8">
              {specs.map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5">
                  <Icon size={15} className="text-green-400" />
                  <div>
                    <div className="text-xs text-gray-500">{label}</div>
                    <div className="text-sm font-semibold text-white">{value}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Download button */}
            <a
              href="/app-release.apk"
              download="CarGo.apk"
              className="inline-flex items-center gap-3 bg-brand text-white font-bold px-8 py-4 rounded-2xl hover:bg-brand-600 transition-all hover:scale-105 shadow-2xl shadow-brand/30 text-lg"
            >
              <Download size={22} />
              Download APK
            </a>

            <p className="text-sm text-gray-600 mt-4">
              Android only · Requires Android 6.0+
            </p>
          </motion.div>

          {/* Right — installation steps */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-brand rounded-xl flex items-center justify-center">
                  <Smartphone size={20} className="text-white" />
                </div>
                <div>
                  <div className="font-bold text-white">Installation Guide</div>
                  <div className="text-xs text-gray-500">Get up and running in minutes</div>
                </div>
              </div>

              <div className="space-y-4">
                {steps.map(({ step, text }, i) => (
                  <motion.div
                    key={step}
                    initial={{ opacity: 0, x: 20 }}
                    animate={inView ? { opacity: 1, x: 0 } : {}}
                    transition={{ duration: 0.4, delay: 0.3 + i * 0.08 }}
                    className="flex items-start gap-4"
                  >
                    <div className="flex-shrink-0 w-7 h-7 bg-brand/20 text-green-400 rounded-full flex items-center justify-center text-xs font-bold">
                      {step}
                    </div>
                    <p className="text-sm text-gray-300 leading-relaxed">{text}</p>
                  </motion.div>
                ))}
              </div>

              <div className="mt-6 pt-6 border-t border-gray-800 flex items-center gap-2 text-green-400">
                <CheckCircle size={16} />
                <span className="text-sm">Tested on Android 10, 12, 13, 14</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
