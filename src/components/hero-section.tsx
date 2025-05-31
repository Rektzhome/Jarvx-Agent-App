import React from 'react';
import { Button } from "@heroui/react";
import { Icon } from "@iconify/react";
import { Link as RouterLink } from 'react-router-dom';
import Typewriter from 'typewriter-effect';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

export const HeroSection: React.FC = () => {
  const [ref, inView] = useInView({
    triggerOnce: false,
    threshold: 0.1,
  });

  return (
    <motion.div 
      className="relative min-h-[80vh] flex flex-col items-center justify-center text-center px-4 grid-background"
      ref={ref}
      initial={{ opacity: 0 }}
      animate={{ opacity: inView ? 1 : 0 }}
      transition={{ duration: 0.8 }}
    >
      <motion.div
        className="absolute -top-20 -left-20 w-64 h-64 rounded-full bg-primary/10 blur-3xl"
        animate={{
          x: [0, 30, 0],
          y: [0, 20, 0],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      
      <motion.div
        className="absolute -bottom-20 -right-20 w-64 h-64 rounded-full bg-primary/10 blur-3xl"
        animate={{
          x: [0, -30, 0],
          y: [0, -20, 0],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      
      <div className="max-w-4xl mx-auto relative z-10">
        <motion.h1 
          className="text-5xl sm:text-7xl font-sora font-extrabold mb-6 tracking-tight text-white uppercase"
          style={{ fontWeight: 800 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: inView ? 1 : 0, y: inView ? 0 : 20 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          JARVX
        </motion.h1>
        
        <motion.div
          className="text-xl sm:text-2xl mb-8 font-sora h-[40px]"
          initial={{ opacity: 0 }}
          animate={{ opacity: inView ? 1 : 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Typewriter
            options={{
              strings: [
                'Generator prompt tingkat lanjut untuk <span class="text-primary font-medium">profesional kreatif</span>',
                'Rekayasa prompt AI untuk <span class="text-primary font-medium">hasil yang optimal</span>',
                'Solusi prompt terbaik untuk <span class="text-primary font-medium">kreator konten</span>'
              ],
              autoStart: true,
              loop: true,
              delay: 40,
              deleteSpeed: 20,
              cursor: '',
              wrapperClassName: 'typewriter-wrapper',
              cursorClassName: 'typewriter-cursor',
              html: true,
            }}
          />
        </motion.div>
        
        <motion.p 
          className="text-default-400 mb-8 max-w-2xl mx-auto font-sora"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: inView ? 1 : 0, y: inView ? 0 : 20 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          Buat prompt yang canggih dan peka konteks.<br />
          Didukung teknologi AI mutakhir.<br />
          Untuk pengembang, kreator konten, dan penggemar AI.
        </motion.p>
        
        <motion.div 
          className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: inView ? 1 : 0, y: inView ? 0 : 20 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <Button 
            className="bg-[#222222] border border-[#333333] text-white transition-transform hover:scale-105"
            startContent={<Icon icon="lucide:github" width={20} />}
            size="lg"
            radius="full"
          >
            Star di GitHub <span className="ml-2 text-primary">11.7k</span>
          </Button>
          
          <Button 
            color="primary"
            size="lg"
            radius="full"
            startContent={<Icon icon="lucide:book-open" width={20} />}
            className="text-white transition-transform hover:scale-105"
            as={RouterLink}
            to="/generator"
          >
            Mulai Sekarang
          </Button>
        </motion.div>
      </div>
    </motion.div>
  );
};