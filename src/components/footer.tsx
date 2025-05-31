import React from 'react';
import { Link, Divider } from "@heroui/react";
import { Icon } from "@iconify/react";
import { Logo } from './logo';

export const Footer: React.FC = () => {
  return (
    <footer className="py-8 px-4 bg-background">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 mb-8">
          <div className="md:col-span-1">
            <Logo />
            <p className="mt-4 text-default-400 text-sm font-apple">
              Platform rekayasa prompt tingkat lanjut untuk profesional kreatif.
            </p>
            <div className="flex gap-4 mt-6">
              <Link href="#" className="text-default-400 hover:text-primary transition-colors">
                <Icon icon="lucide:twitter" width={20} />
              </Link>
              <Link href="#" className="text-default-400 hover:text-primary transition-colors">
                <Icon icon="lucide:github" width={20} />
              </Link>
              <Link href="#" className="text-default-400 hover:text-primary transition-colors">
                <Icon icon="lucide:linkedin" width={20} />
              </Link>
              <Link href="#" className="text-default-400 hover:text-primary transition-colors">
                <Icon icon="lucide:youtube" width={20} />
              </Link>
            </div>
          </div>
          
          <div>
            <h4 className="font-bold mb-4 font-poppins">Produk</h4>
            <ul className="space-y-2">
              <li><Link href="#" className="text-default-400 hover:text-primary transition-colors text-sm font-apple">Generator</Link></li>
              <li><Link href="#" className="text-default-400 hover:text-primary transition-colors text-sm font-apple">Fitur</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-bold mb-4 font-poppins">Perusahaan</h4>
            <ul className="space-y-2">
              <li><Link href="#" className="text-default-400 hover:text-primary transition-colors text-sm font-apple">Tentang</Link></li>
              <li><Link href="#" className="text-default-400 hover:text-primary transition-colors text-sm font-apple">Kontak</Link></li>
            </ul>
          </div>
        </div>
        
        <Divider className="my-6" />
        
        <div className="flex flex-col md:flex-row justify-between items-center">
          <p className="text-default-400 text-sm font-apple">
            © {new Date().getFullYear()} <span className="font-sora font-extrabold text-white uppercase">JARVX</span>. Hak cipta dilindungi.
          </p>
          <div className="flex gap-4 mt-4 md:mt-0">
            <Link href="#" className="text-default-400 hover:text-primary transition-colors text-sm font-apple">Ketentuan</Link>
            <Link href="#" className="text-default-400 hover:text-primary transition-colors text-sm font-apple">Privasi</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};