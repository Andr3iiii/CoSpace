import React from 'react';
import { Sparkles, MapPin, Mail, Phone } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-border/80 bg-card/40 mt-auto pt-12 pb-8 px-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
        <div>
          <div className="flex items-center gap-2.5 mb-3">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground shadow-md shadow-primary/25">
              <Sparkles className="h-4 w-4" />
            </div>
            <span className="text-lg font-black text-foreground">CoSpace</span>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Next-generation collaborative workspaces, private executive studios, and smart boardrooms designed for ambitious teams and creators.
          </p>
        </div>

        <div>
          <h4 className="text-sm font-bold text-foreground mb-3 uppercase tracking-wider">
            Location & Contact
          </h4>
          <div className="flex flex-col gap-2.5 text-sm text-muted-foreground">
            <span className="flex items-center gap-2.5">
              <MapPin className="h-4 w-4 text-primary shrink-0" /> 7th Ave, Bonifacio Global City, Taguig
            </span>
            <span className="flex items-center gap-2.5">
              <Mail className="h-4 w-4 text-primary shrink-0" /> hello@cospace.com
            </span>
            <span className="flex items-center gap-2.5">
              <Phone className="h-4 w-4 text-primary shrink-0" /> +63 2 8888 1234
            </span>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-bold text-foreground mb-3 uppercase tracking-wider">
            Space Types
          </h4>
          <div className="flex flex-col gap-2 text-sm text-muted-foreground">
            <span>Hot Desks & Open Lounges</span>
            <span>Dedicated Fix Desks</span>
            <span>Private Team Offices</span>
            <span>4K Video Boardrooms</span>
            <span>Auditorium Event Spaces</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto pt-6 border-t border-border/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
        <span>© {new Date().getFullYear()} CoSpace Technologies Inc. All rights reserved.</span>
        <span>Secure Payments powered by PayMongo</span>
      </div>
    </footer>
  );
};
