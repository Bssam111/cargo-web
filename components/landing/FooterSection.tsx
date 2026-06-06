'use client';

import Link from 'next/link';
import { Download, ExternalLink } from 'lucide-react';

const navLinks = [
  { label: 'About', href: '#about' },
  { label: 'Features', href: '#features' },
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'Architecture', href: '#architecture' },
  { label: 'Tech Stack', href: '#tech' },
  { label: 'Screenshots', href: '#screenshots' },
  { label: 'Team', href: '#team' },
  { label: 'Download', href: '#download' },
];

const scrollTo = (id: string) => {
  document.querySelector(id)?.scrollIntoView({ behavior: 'smooth' });
};

export default function FooterSection() {
  return (
    <footer className="bg-gray-950 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          {/* Brand */}
          <div>
            <div className="mb-4">
              <span className="text-xl font-extrabold tracking-tight text-white select-none">
                Car<span className="text-brand-300">Go</span>
              </span>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed max-w-xs">
              Saudi Arabia&apos;s peer-to-peer car rental platform. Connecting owners and renters
              through a managed hub model in Riyadh.
            </p>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="font-bold text-white mb-4">Navigation</h4>
            <div className="grid grid-cols-2 gap-x-6 gap-y-2">
              {navLinks.map(({ label, href }) => (
                <button
                  key={label}
                  onClick={() => scrollTo(href)}
                  className="text-sm text-gray-400 hover:text-green-400 text-left transition-colors"
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div>
            <h4 className="font-bold text-white mb-4">Quick Access</h4>
            <div className="space-y-3">
              <a
                href="/app-release.apk"
                download="CarGo.apk"
                className="flex items-center gap-2 text-sm text-gray-400 hover:text-green-400 transition-colors group"
              >
                <Download size={15} className="text-brand group-hover:text-green-400 transition-colors" />
                Download Android APK
              </a>
              <Link
                href="/login"
                className="flex items-center gap-2 text-sm text-gray-400 hover:text-green-400 transition-colors group"
              >
                <ExternalLink size={15} className="text-brand group-hover:text-green-400 transition-colors" />
                Portal Login (Admin / Employee)
              </Link>
            </div>

            <div className="mt-6">
              <div className="text-xs text-gray-600 uppercase tracking-widest font-semibold mb-3">Built With</div>
              <div className="flex flex-wrap gap-2">
                {['Flutter', 'Firebase', 'Next.js', 'Stripe', 'Gemini AI'].map((tech) => (
                  <span key={tech} className="text-xs bg-gray-800 text-gray-400 px-2.5 py-1 rounded-full">
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-600">
            © 2026 CarGo. Final Year Project — Computer Science Department.
          </p>
          <p className="text-sm text-gray-600">
            Bassam · Abdulrhman · Mohammed A. · Abdullah · Mohammed O.
          </p>
        </div>
      </div>
    </footer>
  );
}
