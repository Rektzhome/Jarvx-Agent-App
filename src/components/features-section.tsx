import React, { useRef, useEffect } from 'react';
import { Card, CardBody } from "@heroui/react";
import { Icon } from "@iconify/react";
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

interface FeatureCardProps {
  icon: string;
  title: string;
  description: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description }) => {
  return (
    <Card className="bg-content1 border-none min-w-[280px] sm:min-w-[320px] mx-2">
      <CardBody className="gap-4">
        <div className="rounded-full bg-content2 p-3 w-12 h-12 flex items-center justify-center">
          <Icon icon={icon} className="text-primary text-2xl" />
        </div>
        <h3 className="text-xl font-sora font-semibold">{title}</h3>
        <p className="text-default-400 font-sora">{description}</p>
      </CardBody>
    </Card>
  );
};

export const FeaturesSection: React.FC = () => {
  const [ref, inView] = useInView({
    triggerOnce: false,
    threshold: 0.1,
  });
  
  const carousel1Ref = useRef<HTMLDivElement>(null);
  const carousel2Ref = useRef<HTMLDivElement>(null);
  
  const features = [
    {
      icon: "lucide:sparkles",
      title: "Prompt Lanjutan",
      description: "Kontrol presisi atas gaya prompt."
    },
    {
      icon: "lucide:brain",
      title: "Didukung AI",
      description: "Model bahasa mutakhir."
    },
    {
      icon: "lucide:layers",
      title: "Template Siap Pakai",
      description: "Ratusan template industri."
    },
    {
      icon: "lucide:settings",
      title: "Kustomisasi",
      description: "Antarmuka yang intuitif."
    },
    {
      icon: "lucide:history",
      title: "Riwayat Prompt",
      description: "Simpan untuk penggunaan mendatang."
    },
    {
      icon: "lucide:share-2",
      title: "Berbagi Mudah",
      description: "Bagikan dengan tim Anda."
    },
    {
      icon: "lucide:zap",
      title: "Kinerja Tinggi",
      description: "Hasil dalam hitungan detik."
    },
    {
      icon: "lucide:shield",
      title: "Keamanan Terjamin",
      description: "Data dienkripsi dengan aman."
    }
  ];
  
  // Split features into two groups for the two carousels
  const firstCarouselFeatures = features.slice(0, 4);
  const secondCarouselFeatures = features.slice(4);
  
  // Animation for continuous scrolling
  useEffect(() => {
    const animateCarousel = (carouselRef: React.RefObject<HTMLDivElement>, direction: number) => {
      if (!carouselRef.current) return;
      
      const scrollAmount = 1; // pixels per frame
      let position = 0;
      
      const scroll = () => {
        if (!carouselRef.current) return;
        
        position += scrollAmount * direction;
        const maxScroll = carouselRef.current.scrollWidth - carouselRef.current.clientWidth;
        
        // Reset position when reaching the end
        if (position > maxScroll) {
          position = 0;
        } else if (position < 0) {
          position = maxScroll;
        }
        
        carouselRef.current.scrollLeft = position;
        requestAnimationFrame(scroll);
      };
      
      const animationId = requestAnimationFrame(scroll);
      
      return () => cancelAnimationFrame(animationId);
    };
    
    const cleanup1 = animateCarousel(carousel1Ref, 1); // Right direction
    const cleanup2 = animateCarousel(carousel2Ref, -1); // Left direction
    
    return () => {
      cleanup1 && cleanup1();
      cleanup2 && cleanup2();
    };
  }, []);

  return (
    <section className="py-20 px-4" ref={ref}>
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-sora font-extrabold mb-12 text-center" style={{ fontWeight: 800 }}>Fitur Unggulan</h2>
        
        <div className="space-y-8 overflow-hidden">
          {/* First carousel - moving right */}
          <div className="relative">
            <div 
              ref={carousel1Ref}
              className="flex overflow-x-hidden py-4"
            >
              <div className="flex animate-none whitespace-nowrap">
                {/* Duplicate cards for infinite scrolling effect */}
                {[...firstCarouselFeatures, ...firstCarouselFeatures].map((feature, index) => (
                  <FeatureCard
                    key={`carousel1-${index}`}
                    icon={feature.icon}
                    title={feature.title}
                    description={feature.description}
                  />
                ))}
              </div>
            </div>
            {/* Gradient overlays for fading effect */}
            <div className="absolute top-0 left-0 h-full w-16 bg-gradient-to-r from-background to-transparent pointer-events-none"></div>
            <div className="absolute top-0 right-0 h-full w-16 bg-gradient-to-l from-background to-transparent pointer-events-none"></div>
          </div>
          
          {/* Second carousel - moving left */}
          <div className="relative">
            <div 
              ref={carousel2Ref}
              className="flex overflow-x-hidden py-4"
            >
              <div className="flex animate-none whitespace-nowrap">
                {/* Duplicate cards for infinite scrolling effect */}
                {[...secondCarouselFeatures, ...secondCarouselFeatures].map((feature, index) => (
                  <FeatureCard
                    key={`carousel2-${index}`}
                    icon={feature.icon}
                    title={feature.title}
                    description={feature.description}
                  />
                ))}
              </div>
            </div>
            {/* Gradient overlays for fading effect */}
            <div className="absolute top-0 left-0 h-full w-16 bg-gradient-to-r from-background to-transparent pointer-events-none"></div>
            <div className="absolute top-0 right-0 h-full w-16 bg-gradient-to-l from-background to-transparent pointer-events-none"></div>
          </div>
        </div>
      </div>
    </section>
  );
};