import React from 'react';
import { LayoutDashboard, ArrowRightLeft, HardHat, FileText, Menu, X, Droplets, PackagePlus, Settings } from 'lucide-react';
import { cn } from '../lib/utils';
import DatabaseIndicator from './DatabaseIndicator';

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
    <div className="min-h-screen bg-water-50 text-water-950 font-sans selection:bg-water-500 selection:text-white">
      {/* Sidebar / Nav */}
      <nav className="fixed top-0 left-0 h-full w-64 border-r border-water-200 bg-white/80 backdrop-blur-xl hidden md:flex flex-col z-50">
        <div className="p-6 border-b border-water-100 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-water-500 flex items-center justify-center shadow-lg shadow-water-500/20">
            <Droplets className="w-6 h-6 text-white" />
          </div>
          <h1 className="font-serif italic text-xl font-bold tracking-tight text-water-900">H2O Stock</h1>
        </div>
        
        <div className="flex-1 py-6 space-y-1 px-3">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={cn(
                "w-full flex items-center gap-4 px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200",
                activeTab === item.id 
                  ? "bg-water-500 text-white shadow-lg shadow-water-500/30" 
                  : "text-water-600 hover:bg-water-100 hover:text-water-900"
              )}
            >
              <item.icon className={cn("w-5 h-5", activeTab === item.id ? "text-white" : "text-water-400")} />
              {item.label}
            </button>
          ))}
        </div>

        <div className="p-6 border-t border-water-100 text-[10px] font-mono opacity-50 uppercase tracking-widest text-water-700">
          © 2024 Gestion de Stock v1.0
        </div>

        {/* Database Status */}
        <div className="p-4 border-t border-water-100">
          <DatabaseIndicator />
        </div>
      </nav>

      {/* Mobile Nav */}
      <div className="md:hidden fixed top-0 left-0 w-full bg-white/80 backdrop-blur-lg border-b border-water-100 z-[60] px-4 py-3 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Droplets className="w-6 h-6 text-water-500" />
          <span className="font-serif italic font-bold text-water-900">H2O Stock</span>
        </div>
        <div className="flex items-center gap-2">
          <DatabaseIndicator />
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 rounded-lg bg-water-100 text-water-600">
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 bg-water-50/95 backdrop-blur-xl z-[55] pt-16">
          <div className="p-4 space-y-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setIsMobileMenuOpen(false);
                }}
                className={cn(
                  "w-full flex items-center gap-4 px-6 py-4 text-lg font-medium rounded-2xl transition-all",
                  activeTab === item.id 
                    ? "bg-water-500 text-white shadow-lg shadow-water-500/30" 
                    : "text-water-600 hover:bg-water-100"
                )}
              >
                <item.icon className="w-6 h-6" />
                {item.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="md:ml-64 pt-16 md:pt-0 min-h-screen">
        <div className="max-w-7xl mx-auto p-6 md:p-10">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
