'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  ArrowRightLeft, 
  Wallet, 
  CreditCard, 
  PiggyBank, 
  PieChart, 
  Target, 
  TrendingUp, 
  FileText, 
  Settings, 
  User,
  LogOut,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ThemeToggle } from '../shared/ThemeToggle';
import { signOut, useSession } from 'next-auth/react';

const ROUTES = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Transactions', path: '/transactions', icon: ArrowRightLeft },
  { name: 'Categories', path: '/categories', icon: PieChart },
  { name: 'Accounts', path: '/accounts', icon: Wallet },
  { name: 'Credit Cards', path: '/credit-cards', icon: CreditCard },
  { name: 'Loans', path: '/loans', icon: PiggyBank },
  { name: 'Budgets', path: '/budgets', icon: PieChart },
  { name: 'Goals', path: '/goals', icon: Target },
  { name: 'Investments', path: '/investments', icon: TrendingUp },
  { name: 'Reports', path: '/reports', icon: FileText },
];

const BOTTOM_ROUTES = [
  { name: 'Settings', path: '/settings', icon: Settings },
  { name: 'Profile', path: '/profile', icon: User },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { data: session } = useSession();

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-50 w-72 bg-card border-r flex flex-col transition-transform duration-300 ease-in-out lg:static lg:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}
    >
      {/* Logo Area */}
      <div className="h-16 flex items-center justify-between px-6 border-b shrink-0">
        <Link href="/dashboard" className="flex items-center gap-2 font-bold text-xl tracking-tight text-primary">
          <Wallet className="h-6 w-6" />
          MoneyTracker Pro
        </Link>
        <button onClick={onClose} className="lg:hidden text-muted-foreground hover:text-foreground">
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Main Nav */}
      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {ROUTES.map((route) => {
          const isActive = pathname.startsWith(route.path);
          return (
            <Link
              key={route.path}
              href={route.path}
              onClick={() => onClose()}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md transition-colors text-sm font-medium",
                isActive 
                  ? "bg-primary/10 text-primary" 
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <route.icon className="h-4 w-4" />
              {route.name}
            </Link>
          );
        })}
      </div>

      {/* Bottom Section */}
      <div className="p-4 border-t space-y-4 shrink-0">
        <div className="space-y-1">
          {BOTTOM_ROUTES.map((route) => {
            const isActive = pathname.startsWith(route.path);
            return (
              <Link
                key={route.path}
                href={route.path}
                onClick={() => onClose()}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md transition-colors text-sm font-medium",
                  isActive 
                    ? "bg-primary/10 text-primary" 
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <route.icon className="h-4 w-4" />
                {route.name}
              </Link>
            );
          })}
        </div>

        {/* User Profile & Actions */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0 text-primary font-bold">
              {session?.user?.name?.charAt(0) || 'U'}
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="text-sm font-medium truncate">{session?.user?.name || 'User'}</span>
              <span className="text-xs text-muted-foreground truncate">{session?.user?.email || ''}</span>
            </div>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <ThemeToggle />
            <button 
              onClick={() => signOut({ callbackUrl: '/' })} 
              className="p-2 text-muted-foreground hover:text-destructive transition-colors rounded-md hover:bg-muted"
              title="Logout"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
