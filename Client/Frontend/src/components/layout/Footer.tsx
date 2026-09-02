import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight, Instagram, Facebook, Linkedin, Twitter, MapPin, Mail, Phone } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer
      className="relative w-full text-slate-300 overflow-hidden select-none border-none outline-none mt-auto"
      style={{
        background: 'linear-gradient(to bottom, #0B1220 0%, #0A101C 45%, #080D16 75%, #05080E 100%)',
      }}
    >
      {/* 1. Massive Background Typographic Wordmark */}
      <div
        className="absolute bottom-0 left-0 right-0 w-full overflow-hidden pointer-events-none select-none z-0 flex justify-center items-end"
        aria-hidden="true"
      >
        <span
          className="text-[22vw] sm:text-[25vw] font-black tracking-tighter uppercase leading-none bg-gradient-to-b from-white/20 via-white/5 to-transparent bg-clip-text text-transparent opacity-35 translate-y-[28%] whitespace-nowrap"
        >
          COSPACE
        </span>
      </div>

      {/* Main Content Container (Continuous & seamless extension of page) */}
      <div className="max-w-7xl mx-auto px-6 sm:px-10 pt-6 sm:pt-8 pb-5 sm:pb-6 relative z-10 space-y-3.5 sm:space-y-4">
        
        {/* Top Branding & CTA Row */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          {/* Top-Left Branding */}
          <Link to="/" className="flex items-center gap-2 group select-none">
            <div className="h-7 w-7 rounded-lg bg-primary/20 border border-primary/40 flex items-center justify-center text-primary shadow-sm group-hover:scale-105 transition-transform">
              <Sparkles className="h-3.5 w-3.5" />
            </div>
            <div>
              <span className="text-sm sm:text-base font-black text-white tracking-tight block leading-tight">CoSpace</span>
              <span className="text-[8px] uppercase font-bold tracking-widest text-slate-400 leading-none">Coworking & Studios</span>
            </div>
          </Link>

          {/* Top-Right CTA */}
          <div className="flex flex-col sm:items-end gap-0.5 self-stretch sm:self-auto">
            <Link to="/workspaces">
              <button
                type="button"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-3.5 py-1 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold shadow-md shadow-primary/20 transition-all hover:scale-[1.02] cursor-pointer"
              >
                <span>Book Now</span>
                <ArrowRight className="h-3 w-3" />
              </button>
            </Link>
            <span className="text-[9px] font-medium tracking-wide text-slate-400 text-center sm:text-right">
              Find Your Workspace
            </span>
          </div>
        </div>

        {/* Brand Intro Statement */}
        <div className="text-center max-w-lg mx-auto">
          <p className="text-[11px] sm:text-xs text-slate-300 font-medium leading-relaxed">
            Flexible spaces designed for focused work, collaboration, and connection.
          </p>
        </div>

        {/* Centered Social Icon Buttons */}
        <div className="flex items-center justify-center gap-2.5">
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            className="h-7 w-7 rounded-lg bg-white/5 hover:bg-white/15 border border-white/10 hover:border-white/30 flex items-center justify-center text-slate-300 hover:text-white transition-all shadow-sm cursor-pointer"
            aria-label="Instagram"
          >
            <Instagram className="h-3 w-3" />
          </a>
          <a
            href="https://facebook.com"
            target="_blank"
            rel="noopener noreferrer"
            className="h-7 w-7 rounded-lg bg-white/5 hover:bg-white/15 border border-white/10 hover:border-white/30 flex items-center justify-center text-slate-300 hover:text-white transition-all shadow-sm cursor-pointer"
            aria-label="Facebook"
          >
            <Facebook className="h-3 w-3" />
          </a>
          <a
            href="https://linkedin.com"
            target="_blank"
            rel="noopener noreferrer"
            className="h-7 w-7 rounded-lg bg-white/5 hover:bg-white/15 border border-white/10 hover:border-white/30 flex items-center justify-center text-slate-300 hover:text-white transition-all shadow-sm cursor-pointer"
            aria-label="LinkedIn"
          >
            <Linkedin className="h-3 w-3" />
          </a>
          <a
            href="https://x.com"
            target="_blank"
            rel="noopener noreferrer"
            className="h-7 w-7 rounded-lg bg-white/5 hover:bg-white/15 border border-white/10 hover:border-white/30 flex items-center justify-center text-slate-300 hover:text-white transition-all shadow-sm cursor-pointer"
            aria-label="X (formerly Twitter)"
          >
            <Twitter className="h-3 w-3" />
          </a>
        </div>

        {/* Contact Information Row */}
        <div className="pt-3 border-t border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-[11px] text-slate-400 font-medium">
          <a href="mailto:robertandreicarullo@cospace.com" className="flex items-center gap-1.5 hover:text-white transition-colors">
            <Mail className="h-3 w-3 text-primary" />
            <span>robertandreicarullo@cospace.com</span>
          </a>
          <span className="flex items-center gap-2">
            <MapPin className="h-3 w-3 text-primary" />
            <span>Sta. Cruz, Naga City, Camarines Sur, Philippines</span>
          </span>
          <a href="tel:+63288881234" className="flex items-center gap-1.5 hover:text-white transition-colors">
            <Phone className="h-3 w-3 text-primary" />
            <span>+63 2 8888 1234</span>
          </a>
        </div>

        {/* Copyright & Legal Row */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-1 text-[9px] text-slate-500 font-normal">
          <span>© {new Date().getFullYear()} CoSpace. All rights reserved.</span>
          <span>Designed for Focus • Built for Teams</span>
        </div>
      </div>
    </footer>
  );
};
