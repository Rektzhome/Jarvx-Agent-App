import React from 'react';
import { Card, CardBody, CardHeader, CardFooter, Button, Divider, Image, Link } from "@heroui/react";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";

export const DonationCard: React.FC = () => {
  // Add function to handle button click
  const handleCoffeeButtonClick = () => {
    // Open the Saweria link in a new tab
    window.open("https://saweria.co/alienrektz", "_blank", "noopener,noreferrer");
  };

  return (
    <Card className="border-none overflow-visible shadow-lg shadow-primary/10 max-w-md mx-auto w-full mt-10">
      <CardHeader className="flex flex-col gap-1">
        <h3 className="text-xl font-bold font-sora">Traktir saya kopi</h3>
        <p className="text-default-400 text-sm font-sora">Dukung pengembangan JARVX agar terus berkembang dan gratis untuk semua</p>
      </CardHeader>
      <Divider/>
      <CardBody className="gap-8">
        <div>
          <p className="font-sora text-center text-default-400">
            Setiap dukungan Anda membantu menambah fitur baru dan server yang lebih cepat
          </p>
          <p className="font-sora text-center mt-2 text-primary font-semibold">
            100% gratis, tanpa iklan, dan akan selalu begitu!
          </p>
        </div>
        
        <div className="space-y-3">
          {[
            "Semua fitur paket Gratis",
            "Prioritas dukungan teknis",
            "Akses awal ke fitur baru",
            "Nama Anda di halaman kontributor",
            "Penghargaan khusus dari tim",
            "Pengaruh pada roadmap produk"
          ].map((feature, index) => (
            <div key={index} className="flex items-start gap-2">
              <Icon icon="lucide:check-circle" className="text-primary mt-1" />
              <span className="text-sm font-sora">{feature}</span>
            </div>
          ))}
        </div>
      </CardBody>
      <CardFooter>
        <Button 
          color="warning"
          variant="solid"
          radius="full"
          fullWidth
          className="font-sora text-black transition-transform hover:scale-105"
          startContent={<Icon icon="lucide:coffee" />}
          onPress={handleCoffeeButtonClick}
        >
          Traktir Kopi
        </Button>
      </CardFooter>
    </Card>
  );
};