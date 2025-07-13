"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

interface ResponsiveLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export function ResponsiveLayout({ children, className }: ResponsiveLayoutProps) {
  const isMobile = useIsMobile();
  const [screenSize, setScreenSize] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');

  useEffect(() => {
    const updateScreenSize = () => {
      if (window.innerWidth < 768) {
        setScreenSize('mobile');
      } else if (window.innerWidth < 1024) {
        setScreenSize('tablet');
      } else {
        setScreenSize('desktop');
      }
    };

    updateScreenSize();
    window.addEventListener('resize', updateScreenSize);
    return () => window.removeEventListener('resize', updateScreenSize);
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={cn(
        "min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900",
        screenSize === 'mobile' && "px-4 py-2",
        screenSize === 'tablet' && "px-6 py-4",
        screenSize === 'desktop' && "px-8 py-6",
        className
      )}
    >
      <div className={cn(
        "mx-auto",
        screenSize === 'mobile' && "max-w-full",
        screenSize === 'tablet' && "max-w-4xl",
        screenSize === 'desktop' && "max-w-7xl"
      )}>
        {children}
      </div>
    </motion.div>
  );
}

interface ResponsiveGridProps {
  children: React.ReactNode;
  className?: string;
}

export function ResponsiveGrid({ children, className }: ResponsiveGridProps) {
  return (
    <div className={cn(
      "grid gap-4",
      "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
      "auto-rows-fr",
      className
    )}>
      {children}
    </div>
  );
}

interface ResponsiveCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

export function ResponsiveCard({ children, className, hover = true }: ResponsiveCardProps) {
  return (
    <motion.div
      whileHover={hover ? { scale: 1.02, y: -5 } : {}}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className={cn(
        "rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20",
        "p-4 lg:p-6",
        "shadow-xl hover:shadow-2xl transition-all duration-300",
        "hover:bg-white/15",
        className
      )}
    >
      {children}
    </motion.div>
  );
}