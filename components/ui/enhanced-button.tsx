"use client";

import { motion } from "framer-motion";
import { forwardRef } from "react";
import { cn } from "@/lib/utils";
import { Button, ButtonProps } from "./button";
import { Loader2, Star, Zap, Gift, Crown } from "lucide-react";

interface EnhancedButtonProps extends ButtonProps {
  loading?: boolean;
  icon?: 'star' | 'zap' | 'gift' | 'crown';
  gradient?: boolean;
  pulse?: boolean;
  size?: 'default' | 'sm' | 'lg' | 'xl';
}

const iconMap = {
  star: Star,
  zap: Zap,
  gift: Gift,
  crown: Crown
};

const EnhancedButton = forwardRef<HTMLButtonElement, EnhancedButtonProps>(
  ({ 
    className, 
    loading, 
    icon, 
    gradient = false, 
    pulse = false, 
    size = 'default',
    children, 
    disabled,
    ...props 
  }, ref) => {
    const Icon = icon ? iconMap[icon] : null;
    
    const sizeClasses = {
      default: "h-10 px-4 py-2",
      sm: "h-8 px-3 text-sm",
      lg: "h-12 px-8 text-lg",
      xl: "h-16 px-12 text-xl"
    };

    return (
      <motion.div
        whileHover={{ scale: disabled || loading ? 1 : 1.05 }}
        whileTap={{ scale: disabled || loading ? 1 : 0.95 }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
      >
        <Button
          ref={ref}
          disabled={disabled || loading}
          className={cn(
            "relative overflow-hidden font-semibold transition-all duration-300",
            gradient && "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600",
            pulse && "animate-pulse",
            sizeClasses[size],
            className
          )}
          {...props}
        >
          {/* Animated background effect */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
            initial={{ x: "-100%" }}
            animate={{ x: "100%" }}
            transition={{ 
              duration: 1.5, 
              repeat: Infinity, 
              repeatDelay: 2,
              ease: "easeInOut"
            }}
          />
          
          {/* Content */}
          <div className="relative flex items-center justify-center gap-2">
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : Icon ? (
              <Icon className="w-4 h-4" />
            ) : null}
            {children}
          </div>
        </Button>
      </motion.div>
    );
  }
);

EnhancedButton.displayName = "EnhancedButton";

export { EnhancedButton };