"use client";

import { motion } from "framer-motion";
import { Star, Gift, Crown, Sparkles, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { EnhancedButton } from "./enhanced-button";

interface CaseCardProps {
  case: {
    id: string;
    name: string;
    image: string;
    price: number;
    currency: "TON" | "STARS";
    category: string;
    items: Array<{
      id: string;
      name: string;
      image: string;
      rarity: "common" | "rare" | "epic" | "legendary";
      value: number;
      probability: number;
    }>;
  };
  onClick?: () => void;
  className?: string;
  userBalance?: {
    ton: number;
    stars: number;
  };
}

const categoryColors = {
  premium: "from-purple-500 to-pink-500",
  exclusive: "from-yellow-500 to-orange-500",
  special: "from-blue-500 to-cyan-500",
  mix: "from-green-500 to-blue-500",
  free: "from-gray-500 to-gray-600"
};

export function CaseCard({ 
  case: caseData, 
  onClick, 
  className, 
  userBalance 
}: CaseCardProps) {
  const canAfford = userBalance ? 
    (caseData.currency === "STARS" ? userBalance.stars >= caseData.price : userBalance.ton >= caseData.price) : 
    false;

  const legendaryItems = caseData.items.filter(item => item.rarity === 'legendary');
  const hasLegendary = legendaryItems.length > 0;
  
  const categoryGradient = categoryColors[caseData.category as keyof typeof categoryColors] || categoryColors.mix;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02, y: -5 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className={cn(
        "group relative overflow-hidden rounded-2xl cursor-pointer",
        "bg-gradient-to-br from-slate-800/80 to-slate-900/80",
        "border-2 border-white/20 backdrop-blur-sm",
        "hover:border-white/40 hover:shadow-2xl transition-all duration-300",
        hasLegendary && "shadow-yellow-400/20",
        className
      )}
      onClick={onClick}
    >
      {/* Background animation */}
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      {/* Category badge */}
      <div className={cn(
        "absolute top-3 left-3 z-10 px-3 py-1 rounded-full text-xs font-bold",
        "bg-gradient-to-r backdrop-blur-sm text-white shadow-lg",
        categoryGradient
      )}>
        {caseData.category.toUpperCase()}
      </div>

      {/* Legendary indicator */}
      {hasLegendary && (
        <div className="absolute top-3 right-3 z-10">
          <motion.div
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center"
          >
            <Crown className="w-4 h-4 text-white" />
          </motion.div>
        </div>
      )}

      {/* Case image with sparkle effects */}
      <div className="relative aspect-square overflow-hidden">
        <img 
          src={caseData.image} 
          alt={caseData.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        
        {/* Sparkle effects for premium cases */}
        {(caseData.category === 'premium' || hasLegendary) && (
          <div className="absolute inset-0 pointer-events-none">
            {Array.from({ length: 8 }).map((_, i) => (
              <motion.div
                key={i}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ 
                  scale: [0, 1, 0], 
                  opacity: [0, 1, 0],
                  x: [0, (i % 2 === 0 ? 1 : -1) * 30],
                  y: [0, (i % 3 === 0 ? 1 : -1) * 20]
                }}
                transition={{ 
                  duration: 2.5, 
                  delay: i * 0.1,
                  repeat: Infinity,
                  repeatDelay: 1
                }}
                className="absolute"
                style={{
                  left: `${10 + (i * 10)}%`,
                  top: `${10 + (i * 10)}%`
                }}
              >
                <Sparkles className="w-4 h-4 text-yellow-400" />
              </motion.div>
            ))}
          </div>
        )}

        {/* Price overlay */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {caseData.currency === "STARS" ? (
                <Star className="w-5 h-5 text-yellow-400" />
              ) : (
                <Zap className="w-5 h-5 text-blue-400" />
              )}
              <span className="text-white font-bold text-lg">
                {caseData.price.toLocaleString()}
              </span>
              <span className="text-white/70 text-sm">
                {caseData.currency}
              </span>
            </div>
            
            {!canAfford && (
              <div className="text-red-400 text-xs font-medium">
                Insufficient funds
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Case details */}
      <div className="p-4 space-y-3">
        <h3 className="font-bold text-white text-lg truncate group-hover:text-white/90 transition-colors">
          {caseData.name}
        </h3>
        
        {/* Item preview */}
        <div className="flex items-center gap-2 overflow-hidden">
          <div className="flex -space-x-2">
            {caseData.items.slice(0, 4).map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="w-8 h-8 rounded-full border-2 border-white/30 overflow-hidden bg-slate-700"
              >
                <img 
                  src={item.image} 
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
              </motion.div>
            ))}
          </div>
          <div className="text-white/70 text-sm">
            +{caseData.items.length - 4} more items
          </div>
        </div>

        {/* Open button */}
        <EnhancedButton
          variant={canAfford ? "default" : "secondary"}
          size="lg"
          className="w-full"
          disabled={!canAfford}
          icon="gift"
          gradient={canAfford}
          onClick={(e) => {
            e.stopPropagation();
            onClick?.();
          }}
        >
          {canAfford ? "Open Case" : "Get More Stars"}
        </EnhancedButton>
      </div>

      {/* Hover glow effect */}
      <div className={cn(
        "absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-10 transition-opacity duration-300",
        "bg-gradient-to-r",
        categoryGradient
      )} />
    </motion.div>
  );
}