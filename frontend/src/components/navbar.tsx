'use client';

import {
  BarChart3,
  CreditCard,
  Home,
  MoonIcon,
  Plus,
  SunIcon,
} from 'lucide-react';

import type { Page } from '@/types';

import { Button } from '@/components/ui/button';
import { useTheme } from '@/context/ThemeProvider';

export default function Navbar({
  currentPage,
  setCurrentPage,
  onAddTransaction,
}: {
  currentPage: Page;
  setCurrentPage: (page: Page) => void;
  onAddTransaction: () => void;
}) {
  const { theme, toggleTheme } = useTheme();

  const navItems = [
    { id: 'dashboard' as Page, label: 'Painel', icon: Home },
    { id: 'transactions' as Page, label: 'Transações', icon: CreditCard },
    { id: 'reports' as Page, label: 'Relatórios', icon: BarChart3 },
  ];

  return (
    <nav className="px-4 py-1">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center space-x-8">
          <div className="flex items-center space-x-2">
            <div className="px-2 py-1 rounded">
              <img width={64} src="/logo-144x144.png" alt="Logo" />
            </div>
            <span className="text-primary-foreground font-semibold">
              Renato Borracharia
            </span>
          </div>

          <div className="flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Button
                  key={item.id}
                  variant={currentPage === item.id ? 'secondary' : 'ghost'}
                  className={`text-primary-foreground hover:bg-primary-foreground/10 ${
                    currentPage === item.id
                      ? 'bg-primary-foreground/20 primary-foreground'
                      : ''
                  }`}
                  onClick={() => setCurrentPage(item.id)}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {item.label}
                </Button>
              );
            })}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            onClick={onAddTransaction}
            className="bg-primary hover:bg-primary/80 text-primary-foreground font-semibold"
          >
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Transação
          </Button>
          <Button
            variant="ghost"
            onClick={toggleTheme}
            aria-label="Alternar tema"
          >
            {theme === 'dark' ? (
              <SunIcon strokeWidth={2} />
            ) : (
              <MoonIcon strokeWidth={2} />
            )}
          </Button>
        </div>
      </div>
    </nav>
  );
}
