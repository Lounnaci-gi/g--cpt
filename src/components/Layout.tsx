import React from 'react';
import { LayoutDashboard, ArrowRightLeft, HardHat, FileText, Menu, X, Droplets, PackagePlus, Settings } from 'lucide-react';
import { cn } from '../lib/utils';
import DatabaseIndicator from './DatabaseIndicator';
import Footer from './Footer';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Tableau de Bord', icon: LayoutDashboard },
    { id: 'inventory', label: 'Inventaire', icon: Droplets },
    { id: 'reception', label: 'Réception Stock', icon: PackagePlus },
    { id: 'transfer', label: 'Transferts', icon: ArrowRightLeft },
    { id: 'field', label: 'Terrain', icon: HardHat },
    { id: 'reporting', label: 'Reporting', icon: FileText },
    { id: 'settings', label: 'Paramètres', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-navy-800 font-sans selection:bg-water-500 selection:text-white">

      {/* Sidebar / Nav — obat.fr style: dark navy */}
      <nav className="fixed top-0 left-0 h-full w-64 bg-navy-800 hidden md:flex flex-col z-50 shadow-2xl">
        {/* Logo */}
        <div className="p-6 border-b border-white/10 flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-water-500 flex items-center justify-center shadow-lg animate-glow">
            <Droplets className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white tracking-tight">H2O Stock</h1>
            <p className="text-[10px] text-white/40 font-medium uppercase tracking-widest">Gestion de stock</p>
          </div>
        </div>
        
        {/* Nav items */}
        <div className="flex-1 py-5 space-y-1 px-3 overflow-y-auto">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-2xl transition-all duration-200 group",
                activeTab === item.id
                  ? "bg-water-500 text-white shadow-lg shadow-water-500/30"
                  : "text-white/60 hover:bg-white/10 hover:text-white"
              )}
            >
              <item.icon className={cn("w-5 h-5 flex-shrink-0 transition-transform duration-200 group-hover:scale-110", activeTab === item.id ? "text-white" : "text-white/50")} />
              <span className="font-semibold">{item.label}</span>
            </button>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 text-[10px] font-mono text-white/30 uppercase tracking-widest">
          © 2025 H2O Stock v1.0
        </div>

        {/* Database Status */}
        <div className="p-4 border-t border-white/10">
          <DatabaseIndicator />
        </div>
      </nav>

      {/* Mobile Nav */}
      <div className="md:hidden fixed top-0 left-0 w-full bg-navy-800 z-[60] px-4 py-3 flex justify-between items-center shadow-lg">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-water-500 flex items-center justify-center">
            <Droplets className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-lg text-white">H2O Stock</span>
        </div>
        <div className="flex items-center gap-2">
          <DatabaseIndicator />
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 rounded-xl bg-white/10 text-white hover:bg-white/20 transition-all">
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 bg-navy-900/95 backdrop-blur-xl z-[55] pt-16">
          <div className="p-4 space-y-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setIsMobileMenuOpen(false);
                }}
                className={cn(
                  "w-full flex items-center gap-3 px-5 py-3.5 text-base font-semibold rounded-2xl transition-all duration-200",
                  activeTab === item.id
                    ? "bg-water-500 text-white shadow-lg"
                    : "text-white/70 hover:bg-white/10 hover:text-white"
                )}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="md:ml-64 pt-16 md:pt-0 min-h-screen flex flex-col">
        <div className="max-w-7xl mx-auto p-6 md:p-8 flex-1 w-full">
          {children}
        </div>
        <Footer />
      </main>
    </div>
  );
};

export default Layout;
