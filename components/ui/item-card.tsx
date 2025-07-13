"use client";

import { motion } from "framer-motion";
import { Star, Crown, Trophy, Gem, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface ItemCardProps {
  item: {
    id: string;
    name: string;
    image: string;
    rarity: "common" | "rare" | "epic" | "legendary";
    value: number;
    probability?: number;
  };
  onClick?: () => void;
  className?: string;
  showProbability?: boolean;
  animated?: boolean;
}

const rarityConfig = {
  common: {
    color: "text-gray-400",
    gradient: "from-gray-400 to-gray-600",
    border: "border-gray-400/30",
    glow: "shadow-gray-400/20",
    icon: Star
  },
  rare: {
    color: "text-blue-400",
    gradient: "from-blue-400 to-blue-600",
    border: "border-blue-400/30",
    glow: "shadow-blue-400/20",
    icon: Gem
  },
  epic: {
    color: "text-purple-400",
    gradient: "from-purple-400 to-purple-600",
    border: "border-purple-400/30",
    glow: "shadow-purple-400/20",
    icon: Trophy
  },
  legendary: {
    color: "text-yellow-400",
    gradient: "from-yellow-400 to-orange-600",
    border: "border-yellow-400/30",
    glow: "shadow-yellow-400/20",
    icon: Crown
  }
};

export function ItemCard({ 
  item, 
  onClick, 
  className, 
  showProbability = false,
  animated = true
}: ItemCardProps) {
  const config = rarityConfig[item.rarity];
  const Icon = config.icon;

  return (
    <motion.div
      initial={animated ? { opacity: 0, y: 20 } : {}}
      animate={animated ? { opacity: 1, y: 0 } : {}}
      whileHover={animated ? { 
        scale: 1.05, 
        y: -8,
        boxShadow: `0 20px 40px rgba(0,0,0,0.3)`
      } : {}}
      whileTap={animated ? { scale: 0.95 } : {}}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      onClick={onClick}
      className={cn(
        "group relative overflow-hidden rounded-2xl cursor-pointer",
        "bg-gradient-to-br from-slate-800/50 to-slate-900/50",
        "border-2 backdrop-blur-sm",
        config.border,
        "hover:shadow-2xl transition-all duration-300",
        config.glow,
        className
      )}
    >
      {/* Background animation */}
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      {/* Rarity indicator */}
      <div className={cn(
        "absolute top-2 right-2 z-10 px-2 py-1 rounded-full text-xs font-bold",
        "bg-gradient-to-r backdrop-blur-sm",
        config.gradient,
        "text-white shadow-lg"
      )}>
        <div className="flex items-center gap-1">
          <Icon className="w-3 h-3" />
          {item.rarity.toUpperCase()}
        </div>
      </div>

      {/* Item image */}
      <div className="relative aspect-square overflow-hidden">
        <img 
          src={item.image} 
          alt={item.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        
        {/* Sparkle effects for legendary items */}
        {item.rarity === 'legendary' && (
          <div className="absolute inset-0 pointer-events-none">
            {Array.from({ length: 6 }).map((_, i) => (
              <motion.div
                key={i}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ 
                  scale: [0, 1, 0], 
                  opacity: [0, 1, 0],
                  x: [0, (i % 2 === 0 ? 1 : -1) * 20],
                  y: [0, (i % 3 === 0 ? 1 : -1) * 15]
                }}
                transition={{ 
                  duration: 2, 
                  delay: i * 0.2,
                  repeat: Infinity,
                  repeatDelay: 1
                }}
                className="absolute"
                style={{
                  left: `${15 + (i * 15)}%`,
                  top: `${15 + (i * 12)}%`
                }}
              >
                <Sparkles className="w-3 h-3 text-yellow-400" />
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Item details */}
      <div className="p-4 space-y-2">
        <h3 className="font-bold text-white text-sm truncate group-hover:text-white/90 transition-colors">
          {item.name}
        </h3>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 text-yellow-400" />
            <span className="text-yellow-400 font-semibold text-sm">
              {item.value.toLocaleString()}
            </span>
          </div>
          
          {showProbability && item.probability && (
            <div className="text-xs text-white/60">
              {(item.probability * 100).toFixed(2)}%
            </div>
          )}
        </div>
      </div>

      {/* Hover glow effect */}
      <div className={cn(
        "absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-300",
        "bg-gradient-to-r",
        config.gradient
      )} />
    </motion.div>
  );
}