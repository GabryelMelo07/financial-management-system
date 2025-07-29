'use client';

import type { Page } from '@/lib/types';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/context/ThemeProvider';
import AddOrEditTransactionModal from '@/components/add-or-edit-transaction-modal';

import {
  BarChart3,
  CreditCard,
  Home,
  MoonIcon,
  Plus,
  SunIcon,
} from 'lucide-react';

const navItems = [
  { id: 'dashboard' as Page, label: 'Painel', icon: Home },
  { id: 'transactions' as Page, label: 'Transações', icon: CreditCard },
  { id: 'reports' as Page, label: 'Relatórios', icon: BarChart3 },
];

export default function Navbar({
  currentPage,
  setCurrentPage,
}: {
  currentPage: Page;
  setCurrentPage: (page: Page) => void;
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <>
      <div className="pt-16">
        <nav
          className={`fixed top-0 left-0 right-0 z-50 transition-all ${
            scrolled
              ? 'bg-background/80 backdrop-blur-md border-b border-border/50'
              : 'bg-transparent'
          }`}
        >
          <div className="">
            <div className="flex items-center justify-between max-w-7xl mx-auto">
              <div className="flex items-center space-x-8">
                <div className="flex items-center space-x-2">
                  <div className="px-2 py-1 rounded">
                    <img width={64} src="/logo-144x144.png" alt="Logo" />
                  </div>
                  <span className="text-foreground font-semibold">
                    Renato Borracharia
                  </span>
                </div>

                <div className="flex items-center space-x-1">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Button
                        key={item.id}
                        variant={
                          currentPage === item.id ? 'secondary' : 'ghost'
                        }
                        className={`${
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
                  variant="destructive"
                  onClick={() => setIsModalOpen(true)}
                  className="text-destructive-foreground font-semibold"
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
          </div>
        </nav>
      </div>

      <AddOrEditTransactionModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        transaction={null}
      />
    </>
  );
}
