'use client';

import React from 'react';
import { Menu, Search, Bell } from 'lucide-react';
import { usePathname } from 'next/navigation';

interface TopBarProps {
  onMenuClick: () => void;
}

export default function TopBar({ onMenuClick }: TopBarProps) {
  const pathname = usePathname();
  
  // Basic breadcrumb logic (can be expanded later)
  const pathSegments = pathname.split('/').filter(Boolean);
  const currentPage = pathSegments[pathSegments.length - 1];
  const title = currentPage 
    ? currentPage.charAt(0).toUpperCase() + currentPage.slice(1).replace('-', ' ') 
    : 'Dashboard';

  return (
    <header className="h-16 border-b bg-card flex items-center justify-between px-4 md:px-6 shrink-0 z-10 sticky top-0">
      <div className="flex items-center gap-4">
        <button 
          onClick={onMenuClick}
          className="lg:hidden p-2 -ml-2 text-muted-foreground hover:text-foreground rounded-md hover:bg-muted"
        >
          <Menu className="h-5 w-5" />
        </button>
        
        {/* Breadcrumb / Title */}
        <div className="flex flex-col">
          <h1 className="text-lg font-semibold tracking-tight">{title}</h1>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button className="p-2 text-muted-foreground hover:text-foreground rounded-full hover:bg-muted transition-colors relative" title="Search">
          <Search className="h-5 w-5" />
        </button>
        <button className="p-2 text-muted-foreground hover:text-foreground rounded-full hover:bg-muted transition-colors relative" title="Notifications">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1.5 right-2 h-2 w-2 bg-destructive rounded-full" />
        </button>
      </div>
    </header>
  );
}
