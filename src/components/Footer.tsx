import React from 'react';
import { Droplets, Mail, Phone, MapPin, Github, Twitter, Linkedin, Heart, ArrowUp, Globe, Shield, Zap, Clock } from 'lucide-react';

const Footer: React.FC = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative mt-16">
      {/* Gradient Border Top */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary-500 via-secondary-500 via-accent-500 to-primary-500" />

      {/* Main Footer */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
            
            {/* Brand Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl primary-gradient flex items-center justify-center shadow-lg shadow-primary-600/30">
                  <Droplets className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="font-display text-xl font-bold bg-gradient-to-r from-primary-400 to-accent-400 bg-clip-text text-transparent">
                    H2O Stock
                  </h3>
                  <p className="text-[10px] text-slate-400">Gestion Intelligente</p>
                </div>
              </div>
              <p className="text-sm text-slate-300 leading-relaxed">
                Solution moderne de gestion de stock pour les compteurs d'eau. 
                Optimisez vos inventaires et suivez vos équipements en temps réel.
              </p>
              <div className="flex gap-3">
                <a 
                  href="#" 
                  className="p-2 bg-slate-800 hover:bg-primary-600 rounded-lg transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-primary-600/30"
                  aria-label="Twitter"
                >
                  <Twitter className="w-5 h-5" />
                </a>
                <a 
                  href="#" 
                  className="p-2 bg-slate-800 hover:bg-primary-600 rounded-lg transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-primary-600/30"
                  aria-label="LinkedIn"
                >
                  <Linkedin className="w-5 h-5" />
                </a>
                <a 
                  href="#" 
                  className="p-2 bg-slate-800 hover:bg-primary-600 rounded-lg transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-primary-600/30"
                  aria-label="GitHub"
                >
                  <Github className="w-5 h-5" />
                </a>
                <a 
                  href="#" 
                  className="p-2 bg-slate-800 hover:bg-primary-600 rounded-lg transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-primary-600/30"
                  aria-label="Website"
                >
                  <Globe className="w-5 h-5" />
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div className="space-y-4">
              <h4 className="font-display text-lg font-bold text-white flex items-center gap-2">
                <Zap className="w-5 h-5 text-primary-400" />
                Liens Rapides
              </h4>
              <ul className="space-y-2">
                {[
                  { label: 'Tableau de Bord', href: '#dashboard' },
                  { label: 'Inventaire', href: '#inventory' },
                  { label: 'Réception Stock', href: '#reception' },
                  { label: 'Transferts', href: '#transfer' },
                  { label: 'Terrain', href: '#field' },
                  { label: 'Reporting', href: '#reporting' },
                ].map((link) => (
                  <li key={link.label}>
                    <a 
                      href={link.href}
                      className="text-sm text-slate-300 hover:text-primary-400 transition-colors duration-200 flex items-center gap-2 group"
                    >
                      <span className="w-0 group-hover:w-2 h-0.5 bg-primary-400 transition-all duration-200" />
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact Info */}
            <div className="space-y-4">
              <h4 className="font-display text-lg font-bold text-white flex items-center gap-2">
                <Mail className="w-5 h-5 text-accent-400" />
                Contact
              </h4>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-primary-400 mt-0.5 shrink-0" />
                  <span className="text-sm text-slate-300">
                    123 Rue de l'Innovation<br />
                    75000 Paris, France
                  </span>
                </li>
                <li className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-accent-400 shrink-0" />
                  <a href="tel:+33123456789" className="text-sm text-slate-300 hover:text-accent-400 transition-colors">
                    +33 1 23 45 67 89
                  </a>
                </li>
                <li className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-primary-400 shrink-0" />
                  <a href="mailto:contact@h2ostock.com" className="text-sm text-slate-300 hover:text-primary-400 transition-colors">
                    contact@h2ostock.com
                  </a>
                </li>
                <li className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-accent-400 shrink-0" />
                  <span className="text-sm text-slate-300">
                    Lun - Ven: 9h - 18h
                  </span>
                </li>
              </ul>
            </div>

            {/* Features */}
            <div className="space-y-4">
              <h4 className="font-display text-lg font-bold text-white flex items-center gap-2">
                <Shield className="w-5 h-5 text-emerald-400" />
                Fonctionnalités
              </h4>
              <ul className="space-y-2">
                {[
                  'Gestion en temps réel',
                  'Suivi des inventaires',
                  'Alertes automatiques',
                  'Rapports détaillés',
                  'Base de données SQL',
                  'Interface responsive',
                ].map((feature) => (
                  <li key={feature} className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-primary-400 to-accent-400" />
                    <span className="text-sm text-slate-300">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Newsletter Section */}
        <div className="border-t border-slate-700/50">
          <div className="max-w-7xl mx-auto px-6 py-8">
            <div className="modern-card bg-gradient-to-r from-primary-600/20 via-secondary-600/20 to-accent-600/20 border-primary-500/30 p-6 sm:p-8 rounded-2xl">
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                <div className="space-y-2">
                  <h4 className="font-display text-xl font-bold text-white">
                    Restez Informé
                  </h4>
                  <p className="text-sm text-slate-300">
                    Recevez les dernières mises à jour et nouveautés directement dans votre boîte mail.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                  <input 
                    type="email"
                    placeholder="Votre adresse email"
                    className="input-modern bg-white/10 border-slate-600 text-white placeholder:text-slate-400 focus:border-primary-400 w-full sm:w-72"
                  />
                  <button className="btn-primary whitespace-nowrap shimmer">
                    <span className="relative z-10 flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      S'abonner
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-700/50">
          <div className="max-w-7xl mx-auto px-6 py-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              {/* Copyright */}
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <span>© {currentYear} H2O Stock</span>
                <span>•</span>
                <span>Tous droits réservés</span>
                <Heart className="w-4 h-4 text-rose-500 fill-rose-500 animate-pulse" />
              </div>

              {/* Legal Links */}
              <div className="flex flex-wrap items-center justify-center gap-4 text-sm">
                <a href="#" className="text-slate-400 hover:text-primary-400 transition-colors">
                  Politique de confidentialité
                </a>
                <span className="text-slate-600">•</span>
                <a href="#" className="text-slate-400 hover:text-primary-400 transition-colors">
                  Conditions d'utilisation
                </a>
                <span className="text-slate-600">•</span>
                <a href="#" className="text-slate-400 hover:text-primary-400 transition-colors">
                  Mentions légales
                </a>
              </div>

              {/* Scroll to Top */}
              <button
                onClick={scrollToTop}
                className="p-3 bg-gradient-to-r from-primary-600 to-accent-600 rounded-xl hover:shadow-lg hover:shadow-primary-600/30 transition-all duration-300 hover:scale-110 group"
                aria-label="Scroll to top"
              >
                <ArrowUp className="w-5 h-5 text-white group-hover:animate-bounce" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
