import React from 'react';
import { Navbar, NavbarBrand, NavbarContent, NavbarItem, Link, Button, Drawer, DrawerContent, DrawerBody, DrawerFooter, useDisclosure } from "@heroui/react";
import { Icon } from "@iconify/react";
import { Logo } from './logo';
import { Link as RouterLink } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import { motion } from "framer-motion";

export const MainNavbar: React.FC = () => {
  const location = useLocation();
  const isHomePage = location.pathname === '/';
  const isGeneratorPage = location.pathname === '/generator';
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  
  return (
    <>
      <Navbar maxWidth="xl" className="bg-background/80 backdrop-blur-md z-50">
        <NavbarBrand>
          <RouterLink to="/">
            <Logo />
          </RouterLink>
        </NavbarBrand>
        <NavbarContent className="hidden sm:flex gap-4" justify="center">
          <NavbarItem>
            <Link color="foreground" href="#" className="hover:text-primary transition-colors">
              Fitur
            </Link>
          </NavbarItem>
          <NavbarItem>
            <RouterLink to="/generator" className="text-foreground hover:text-primary transition-colors">
              Generator
            </RouterLink>
          </NavbarItem>
        </NavbarContent>
        <NavbarContent justify="end">
          {!isHomePage && (
            <NavbarItem>
              <Button 
                as={RouterLink} 
                to="/" 
                color="primary" 
                variant="flat" 
                radius="full" 
                className="text-white transition-transform hover:scale-105"
                startContent={<Icon icon="lucide:home" />}
              >
                Kembali ke Beranda
              </Button>
            </NavbarItem>
          )}
          {/* Only show the menu toggle button if not on the generator page */}
          {!isGeneratorPage && (
            <NavbarItem className="sm:hidden">
              <Button 
                isIconOnly 
                variant="light" 
                onPress={onOpen}
                className="text-white font-bold"
              >
                <Icon icon="lucide:menu" width={24} />
              </Button>
            </NavbarItem>
          )}
        </NavbarContent>
      </Navbar>
      
      {/* Only render the Drawer if not on the generator page */}
      {!isGeneratorPage && (
        <Drawer 
          isOpen={isOpen} 
          onOpenChange={onOpenChange}
          placement="bottom"
          size="full"
          hideCloseButton={true}
          classNames={{
            base: "rounded-t-xl",
            header: "border-b-0",
            body: "py-6",
          }}
          motionProps={{
            variants: {
              enter: {
                y: 0,
                opacity: 1,
                transition: {
                  duration: 0.3,
                  ease: [0.32, 0.72, 0, 1]
                }
              },
              exit: {
                y: 20,
                opacity: 0,
                transition: {
                  duration: 0.2,
                  ease: [0.32, 0.72, 0, 1]
                }
              }
            }
          }}
        >
          <DrawerContent>
            {(onClose) => (
              <>
                <button 
                  onClick={onClose}
                  className="absolute top-6 right-6 w-14 h-14 rounded-full bg-[#333333] flex items-center justify-center transition-transform hover:scale-110 focus:outline-none"
                  aria-label="Close menu"
                >
                  <Icon 
                    icon="lucide:x" 
                    width={32} 
                    height={32} 
                    className="text-white font-bold" 
                  />
                </button>
                
                <DrawerBody className="pt-12 px-4 flex flex-col items-center justify-center">
                  <div className="flex flex-col items-center w-full max-w-md mx-auto gap-4">
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, staggerChildren: 0.1 }}
                      className="w-full"
                    >
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.1 }}
                      >
                        <RouterLink to="/" onClick={onClose}>
                          <Button 
                            fullWidth
                            size="lg"
                            variant="flat"
                            color={isHomePage ? "primary" : "default"}
                            className="h-16 mb-4"
                            style={{ backgroundColor: isHomePage ? "#0A2463" : "#222222" }}
                          >
                            <div className="flex items-center justify-center w-full">
                              <Icon icon="lucide:home" width={24} className="text-blue-400 mr-4" />
                              <span className="text-xl font-medium">Beranda</span>
                            </div>
                          </Button>
                        </RouterLink>
                      </motion.div>
                      
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.2 }}
                      >
                        <Button 
                          fullWidth
                          size="lg"
                          variant="flat"
                          color="default"
                          className="h-16 mb-4"
                          style={{ backgroundColor: "#222222" }}
                          onPress={() => {
                            // Handle navigation
                            onClose();
                          }}
                        >
                          <div className="flex items-center justify-center w-full">
                            <Icon icon="lucide:layout-grid" width={24} className="text-white mr-4" />
                            <span className="text-xl font-medium">Fitur</span>
                          </div>
                        </Button>
                      </motion.div>
                      
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.3 }}
                      >
                        <RouterLink to="/generator" onClick={onClose}>
                          <Button 
                            fullWidth
                            size="lg"
                            variant="flat"
                            color={location.pathname === '/generator' ? "primary" : "default"}
                            className="h-16 mb-4"
                            style={{ backgroundColor: location.pathname === '/generator' ? "#0A2463" : "#222222" }}
                          >
                            <div className="flex items-center justify-center w-full">
                              <Icon icon="lucide:wand-sparkles" width={24} className="text-blue-400 mr-4" />
                              <span className="text-xl font-medium">Generator</span>
                            </div>
                          </Button>
                        </RouterLink>
                      </motion.div>
                    </motion.div>
                  </div>
                </DrawerBody>
                
                <DrawerFooter className="pt-0 flex justify-center">
                  <p className="text-center text-default-500 text-sm">
                    © {new Date().getFullYear()} <span className="font-sora font-extrabold text-white uppercase">JARVX</span>
                  </p>
                </DrawerFooter>
              </>
            )}
          </DrawerContent>
        </Drawer>
      )}
    </>
  );
};