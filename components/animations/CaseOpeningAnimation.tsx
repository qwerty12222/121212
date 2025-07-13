"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Star, Gift, Trophy, Crown, Gem } from "lucide-react";

interface CaseOpeningAnimationProps {
  isOpen: boolean;
  onComplete: () => void;
  wonItem: {
    name: string;
    image: string;
    rarity: "common" | "rare" | "epic" | "legendary";
    value: number;
  } | null;
  caseImage: string;
}

const rarityColors = {
  common: "from-gray-400 to-gray-600",
  rare: "from-blue-400 to-blue-600",
  epic: "from-purple-400 to-purple-600",
  legendary: "from-yellow-400 to-orange-600"
};

const rarityIcons = {
  common: Star,
  rare: Gem,
  epic: Trophy,
  legendary: Crown
};

export function CaseOpeningAnimation({ 
  isOpen, 
  onComplete, 
  wonItem, 
  caseImage 
}: CaseOpeningAnimationProps) {
  const [stage, setStage] = useState<'closed' | 'spinning' | 'revealing' | 'complete'>('closed');
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; delay: number }>>([]);

  useEffect(() => {
    if (isOpen && wonItem) {
      setStage('spinning');
      
      // Generate particles
      const newParticles = Array.from({ length: 30 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        delay: Math.random() * 2
      }));
      setParticles(newParticles);
      
      // Sequence animation stages
      const timer1 = setTimeout(() => setStage('revealing'), 2000);
      const timer2 = setTimeout(() => setStage('complete'), 3500);
      const timer3 = setTimeout(() => onComplete(), 5000);
      
      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
        clearTimeout(timer3);
      };
    }
  }, [isOpen, wonItem, onComplete]);

  if (!isOpen || !wonItem) return null;

  const RarityIcon = rarityIcons[wonItem.rarity];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm"
    >
      {/* Particle Background */}
      <div className="absolute inset-0 overflow-hidden">
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            initial={{ 
              opacity: 0, 
              scale: 0, 
              x: `${particle.x}%`, 
              y: `${particle.y}%` 
            }}
            animate={{ 
              opacity: [0, 1, 0], 
              scale: [0, 1, 0], 
              y: `${particle.y - 20}%` 
            }}
            transition={{ 
              duration: 3, 
              delay: particle.delay,
              repeat: Infinity,
              repeatDelay: 1
            }}
            className="absolute w-2 h-2 bg-yellow-400 rounded-full"
          />
        ))}
      </div>

      {/* Main Animation Container */}
      <div className="relative flex flex-col items-center justify-center max-w-md mx-auto px-4">
        
        {/* Case Animation */}
        <AnimatePresence mode="wait">
          {stage === 'spinning' && (
            <motion.div
              initial={{ scale: 0.8, rotateY: 0 }}
              animate={{ 
                scale: [0.8, 1.2, 1], 
                rotateY: [0, 360, 720],
                filter: ["brightness(1)", "brightness(1.5)", "brightness(1)"]
              }}
              exit={{ scale: 0.5, opacity: 0 }}
              transition={{ duration: 2, ease: "easeInOut" }}
              className="relative"
            >
              <div className="w-48 h-48 rounded-2xl overflow-hidden shadow-2xl">
                <img 
                  src={caseImage} 
                  alt="Case" 
                  className="w-full h-full object-cover"
                />
              </div>
              
              {/* Spinning ring effect */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 border-4 border-yellow-400 rounded-2xl"
                style={{
                  borderImage: "linear-gradient(45deg, #fbbf24, #f59e0b, #fbbf24) 1"
                }}
              />
            </motion.div>
          )}

          {stage === 'revealing' && (
            <motion.div
              initial={{ scale: 0, rotateY: 180 }}
              animate={{ scale: 1, rotateY: 0 }}
              className="relative"
            >
              {/* Rarity glow effect */}
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ 
                  opacity: [0, 1, 0.8], 
                  scale: [0.5, 1.5, 1.2],
                }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${rarityColors[wonItem.rarity]} opacity-50 blur-xl`}
              />
              
              {/* Item image */}
              <motion.div
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.8 }}
                className="relative w-48 h-48 rounded-2xl overflow-hidden shadow-2xl"
              >
                <img 
                  src={wonItem.image} 
                  alt={wonItem.name} 
                  className="w-full h-full object-cover"
                />
              </motion.div>
              
              {/* Sparkle effects */}
              <div className="absolute inset-0 pointer-events-none">
                {Array.from({ length: 8 }).map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ 
                      scale: [0, 1, 0], 
                      opacity: [0, 1, 0],
                      x: [0, (i % 2 === 0 ? 1 : -1) * 50],
                      y: [0, (i % 3 === 0 ? 1 : -1) * 30]
                    }}
                    transition={{ 
                      duration: 2, 
                      delay: i * 0.1,
                      repeat: Infinity,
                      repeatDelay: 0.5
                    }}
                    className="absolute"
                    style={{
                      left: `${20 + (i * 10)}%`,
                      top: `${20 + (i * 8)}%`
                    }}
                  >
                    <Sparkles className="w-6 h-6 text-yellow-400" />
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {stage === 'complete' && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-center space-y-6"
            >
              {/* Item display */}
              <div className="relative">
                <motion.div
                  animate={{ 
                    boxShadow: [
                      "0 0 20px rgba(251, 191, 36, 0.3)",
                      "0 0 40px rgba(251, 191, 36, 0.6)",
                      "0 0 20px rgba(251, 191, 36, 0.3)"
                    ]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-48 h-48 rounded-2xl overflow-hidden mx-auto"
                >
                  <img 
                    src={wonItem.image} 
                    alt={wonItem.name} 
                    className="w-full h-full object-cover"
                  />
                </motion.div>
                
                {/* Rarity badge */}
                <motion.div
                  initial={{ scale: 0, y: 20 }}
                  animate={{ scale: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className={`absolute -top-2 -right-2 px-3 py-1 rounded-full bg-gradient-to-r ${rarityColors[wonItem.rarity]} text-white font-bold text-sm flex items-center gap-1`}
                >
                  <RarityIcon className="w-4 h-4" />
                  {wonItem.rarity.toUpperCase()}
                </motion.div>
              </div>
              
              {/* Item details */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="space-y-2"
              >
                <h3 className="text-2xl font-bold text-white">{wonItem.name}</h3>
                <div className="flex items-center justify-center gap-2 text-yellow-400">
                  <Star className="w-5 h-5" />
                  <span className="font-semibold">{wonItem.value.toLocaleString()} Stars</span>
                </div>
              </motion.div>
              
              {/* Congratulations text */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: [0, 1.1, 1] }}
                transition={{ delay: 0.9, duration: 0.6 }}
                className="text-center"
              >
                <div className="text-4xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                  CONGRATULATIONS!
                </div>
                <div className="text-white/80 mt-2">You won an amazing item!</div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

export default CaseOpeningAnimation;