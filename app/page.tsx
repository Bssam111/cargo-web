'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import LandingNav from '@/components/landing/LandingNav';
import HeroSection from '@/components/landing/HeroSection';
import AboutSection from '@/components/landing/AboutSection';
import FeaturesSection from '@/components/landing/FeaturesSection';
import HowItWorksSection from '@/components/landing/HowItWorksSection';
import ArchitectureSection from '@/components/landing/ArchitectureSection';
import TechStackSection from '@/components/landing/TechStackSection';
import ScreenshotsSection from '@/components/landing/ScreenshotsSection';
import StatsSection from '@/components/landing/StatsSection';
import TeamSection from '@/components/landing/TeamSection';
import DownloadSection from '@/components/landing/DownloadSection';
import FooterSection from '@/components/landing/FooterSection';

export default function RootPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (user?.role === 'admin') router.replace('/admin');
    else if (user?.role === 'employee') router.replace('/employee');
  }, [user, loading, router]);

  return (
    <div className="min-h-screen">
      <LandingNav />
      <HeroSection />
      <AboutSection />
      <FeaturesSection />
      <HowItWorksSection />
      <ArchitectureSection />
      <TechStackSection />
      <ScreenshotsSection />
      <StatsSection />
      <TeamSection />
      <DownloadSection />
      <FooterSection />
    </div>
  );
}
