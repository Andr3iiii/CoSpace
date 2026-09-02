import React from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';

export const ClientLayout: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground selection:bg-primary/20 selection:text-primary transition-colors duration-200 relative">
      <Header />
      <main className="flex-1 flex flex-col relative z-10">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};
