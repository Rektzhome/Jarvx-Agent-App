import React from 'react';
import { Card, CardBody, CardHeader, CardFooter, Button, Divider } from "@heroui/react";
import { Icon } from "@iconify/react";
import { DonationCard } from './donation-card';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

interface PricingCardProps {
  title: string;
  price: string;
  description: string;
  features: string[];
  buttonText: string;
  isPrimary?: boolean;
}

const PricingCard: React.FC<PricingCardProps> = ({ 
  title, 
  price, 
  description, 
  features, 
  buttonText,
  isPrimary = false
}) => {
  return (
    <Card className={`border-none overflow-visible shadow-lg ${isPrimary ? 'shadow-primary/20' : 'shadow-primary/10'} max-w-md mx-auto w-full`}>
      <CardHeader className="flex flex-col gap-1">
        <h3 className="text-xl font-bold font-sora">{title}</h3>
        <p className="text-default-400 text-sm font-sora">{description}</p>
      </CardHeader>
      <Divider/>
      <CardBody className="gap-8">
        <div>
          <p className="font-sora">
            <span className="text-4xl font-bold">{price}</span>
          </p>
        </div>
        
        <div className="space-y-3">
          {features.map((feature, index) => (
            <div key={index} className="flex items-start gap-2">
              <Icon icon="lucide:check-circle" className="text-primary mt-1" />
              <span className="text-sm font-sora">{feature}</span>
            </div>
          ))}
        </div>
      </CardBody>
      <CardFooter>
        <Button 
          color={isPrimary ? "primary" : "default"}
          variant={isPrimary ? "solid" : "bordered"}
          radius="full"
          fullWidth
          className="font-sora"
        >
          {buttonText}
        </Button>
      </CardFooter>
    </Card>
  );
};

export const PricingSection: React.FC = () => {
  const [ref, inView] = useInView({
    triggerOnce: false,
    threshold: 0.1,
  });

  return (
    <section className="py-20 px-4" id="pricing" ref={ref}>
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-sora font-extrabold mb-4 text-center" style={{ fontWeight: 800 }}>Paket Harga</h2>
        <p className="text-default-400 text-center mb-12 max-w-2xl mx-auto font-sora">
          Mulai gunakan JARVX sekarang.<br />
          Gratis untuk semua pengguna.
        </p>
        
        <div className="max-w-md mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: inView ? 1 : 0, y: inView ? 0 : 20 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <PricingCard
              title="Gratis"
              price="Rp 0"
              description="Akses dasar untuk pengguna individu"
              features={[
                "Pembuatan prompt dasar",
                "10 prompt per hari",
                "Akses ke template dasar",
                "Dukungan komunitas"
              ]}
              buttonText="Mulai Sekarang"
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
};