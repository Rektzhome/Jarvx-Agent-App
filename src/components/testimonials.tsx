import React from 'react';
import { Card, CardBody, Avatar } from "@heroui/react";
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

interface TestimonialProps {
  quote: string;
  author: string;
  role: string;
  avatarId: string;
  index: number;
}

const Testimonial: React.FC<TestimonialProps> = ({ quote, author, role, avatarId, index }) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, delay: 0.1 * index }}
    >
      <Card className="bg-content1 border-none h-[220px]">
        <CardBody className="gap-4">
          <p className="text-default-400 italic font-sora">
            {quote.split('. ').map((sentence, i) => (
              <React.Fragment key={i}>
                {sentence.trim() + (i < quote.split('. ').length - 1 ? '.' : '')}
                <br />
              </React.Fragment>
            ))}
          </p>
          <div className="flex items-center gap-3 mt-auto">
            <Avatar 
              src={`https://img.heroui.chat/image/avatar?w=80&h=80&u=${avatarId}`} 
              size="sm" 
            />
            <div>
              <p className="font-semibold font-sora">{author}</p>
              <p className="text-xs text-default-500 font-sora">{role}</p>
            </div>
          </div>
        </CardBody>
      </Card>
    </motion.div>
  );
};

export const Testimonials: React.FC = () => {
  const [ref, inView] = useInView({
    triggerOnce: false,
    threshold: 0.1,
  });

  const testimonials = [
    {
      quote: "JARVX telah mengubah alur kerja pembuatan konten kami. Prompt yang dihasilkan sangat detail. Efektivitasnya luar biasa",
      author: "Alex Morgan",
      role: "Direktur Konten, TechCorp",
      avatarId: "alex123"
    },
    {
      quote: "Sebagai pengembang, saya menghargai JARVX. Membantu komunikasi dengan AI lebih efektif. Menghemat berjam-jam waktu kerja saya",
      author: "Samira Khan",
      role: "Pengembang Senior, InnovateTech",
      avatarId: "samira456"
    },
    {
      quote: "Pustaka template sangat bernilai. Sepadan dengan biaya langganan. Menjadi alat penting bagi tim pemasaran kami",
      author: "Michael Chen",
      role: "Kepala Pemasaran, GrowthLabs",
      avatarId: "michael789"
    }
  ];

  return (
    <section className="py-20 px-4 bg-content1/5">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-sora font-extrabold mb-12 text-center" style={{ fontWeight: 800 }}>Testimoni Pengguna</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <Testimonial
              key={index}
              quote={testimonial.quote}
              author={testimonial.author}
              role={testimonial.role}
              avatarId={testimonial.avatarId}
              index={index}
            />
          ))}
        </div>
      </div>
    </section>
  );
};