import React from 'react';
import { Icon } from "@iconify/react";
import { motion } from 'framer-motion';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
}

export const Logo: React.FC<LogoProps> = ({ size = 'md' }) => {
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12',
  };

  return (
    <div className="flex items-center gap-3">
      <motion.div 
        className={`${sizeClasses[size]} bg-white/10 text-white rounded-md flex items-center justify-center overflow-hidden`}
        whileHover={{ scale: 1.05 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >
        <Icon icon="lucide:sparkles" className="text-white w-2/3 h-2/3" />
      </motion.div>
      <motion.span
        className="text-white font-sora font-extrabold text-xl tracking-tight uppercase"
        initial={{ opacity: 1 }}
        whileHover={{ scale: 1.05 }}
        transition={{ duration: 0.2 }}
      >
        JARVX
      </motion.span>
    </div>
  );
};