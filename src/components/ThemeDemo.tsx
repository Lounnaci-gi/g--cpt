import React from 'react';
import { CheckCircle, AlertTriangle, Info, XCircle, ArrowRight, Star, Bell, Settings, User, Zap, Sparkles, TrendingUp } from 'lucide-react';

const ThemeDemo: React.FC = () => {
  return (
    <div className="space-y-8 p-8 relative">
      {/* Header with Effects */}
      <header className="border-b border-slate-200/60 pb-6">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-5xl font-display font-bold bg-gradient-to-r from-primary-600 via-accent-500 to-primary-700 bg-clip-text text-transparent">
            🎨 Thème Moderne H2O Stock
          </h1>
          <Sparkles className="w-8 h-8 text-primary-500 animate-pulse" />
        </div>
        <p className="text-slate-600 text-lg">
          Démonstration avec police Poppins et effets visuels avancés
        </p>
      </header>

      {/* Effets de Cartes */}
      <section className="space-y-4">
        <h2 className="text-3xl font-display font-bold text-slate-900 flex items-center gap-2">
          <Zap className="w-6 h-6 text-primary-500" />
          Effets de Cartes
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="modern-card p-6 rounded-2xl">
            <div className="flex items-center gap-2 mb-3">
              <Star className="w-5 h-5 text-primary-600" />
              <h3 className="font-bold text-slate-900">Modern Card</h3>
            </div>
            <p className="text-sm text-slate-600">
              Carte avec glassmorphism, ombre subtile et effet hover avec translation
            </p>
            <div className="mt-4 text-xs text-primary-600 font-semibold">
              ✨ Survolez-moi !
            </div>
          </div>

          <div className="elevated-card p-6 rounded-2xl">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-5 h-5 text-accent-600" />
              <h3 className="font-bold text-slate-900">Elevated Card</h3>
            </div>
            <p className="text-sm text-slate-600">
              Carte avec bordure dégradée et effet d'élévation au survol
            </p>
            <div className="mt-4 text-xs text-accent-600 font-semibold">
              🚀 Effet premium !
            </div>
          </div>

          <div className="glass-effect p-6 rounded-2xl">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-5 h-5 text-primary-600" />
              <h3 className="font-bold text-slate-900">Glass Effect</h3>
            </div>
            <p className="text-sm text-slate-600">
              Effet glass avec shimmer animé au survol
            </p>
            <div className="mt-4 text-xs text-primary-600 font-semibold">
              💫 Effet brillant !
            </div>
          </div>
        </div>
      </section>

      {/* Boutons avec Effets */}
      <section className="space-y-4">
        <h2 className="text-3xl font-display font-bold text-slate-900 flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-accent-500" />
          Boutons avec Effets
        </h2>
        
        <div className="modern-card p-8 rounded-2xl space-y-6">
          <div>
            <h3 className="font-semibold text-slate-900 mb-4">Boutons Principaux</h3>
            <div className="flex flex-wrap gap-4">
              <button className="btn-primary">
                <span className="relative z-10 flex items-center gap-2">
                  <ArrowRight className="w-4 h-4" />
                  Primary Button
                </span>
              </button>
              <button className="btn-secondary">
                Secondary Button
              </button>
              <button className="btn-accent">
                <span className="relative z-10 flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  Accent Button
                </span>
              </button>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-slate-900 mb-4">Boutons avec Animations</h3>
            <div className="flex flex-wrap gap-4">
              <button className="btn-primary shimmer">
                <span className="relative z-10">Avec Shimmer</span>
              </button>
              <button className="btn-primary rounded-full">
                <span className="relative z-10">Bouton Arrondi</span>
              </button>
              <button className="btn-accent neon-glow px-8 py-3 rounded-xl">
                <span className="relative z-10 flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  Neon Glow
                </span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Badges Animés */}
      <section className="space-y-4">
        <h2 className="text-3xl font-display font-bold text-slate-900">Badges avec Effets</h2>
        
        <div className="modern-card p-6 rounded-2xl">
          <div className="flex flex-wrap gap-4">
            <span className="badge-primary text-sm px-4 py-2">
              <span className="relative z-10">✨ Primary</span>
            </span>
            <span className="badge-success text-sm px-4 py-2">
              <span className="relative z-10">✓ Succès</span>
            </span>
            <span className="badge-warning text-sm px-4 py-2">
              <span className="relative z-10">⚠ Attention</span>
            </span>
            <span className="badge-error text-sm px-4 py-2">
              <span className="relative z-10">✕ Erreur</span>
            </span>
          </div>
        </div>
      </section>

      {/* Inputs avec Effets */}
      <section className="space-y-4">
        <h2 className="text-3xl font-display font-bold text-slate-900">Inputs Modernes</h2>
        
        <div className="modern-card p-8 rounded-2xl space-y-6">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Nom complet
            </label>
            <input 
              type="text" 
              className="input-modern"
              placeholder="Entrez votre nom..."
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Email
            </label>
            <input 
              type="email" 
              className="input-modern"
              placeholder="votre@email.com"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Téléphone
              </label>
              <input 
                type="tel" 
                className="input-modern"
                placeholder="+33 6 12 34 56 78"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Entreprise
              </label>
              <input 
                type="text" 
                className="input-modern"
                placeholder="Nom de l'entreprise"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Alertes Élégantes */}
      <section className="space-y-4">
        <h2 className="text-3xl font-display font-bold text-slate-900">Alertes avec Design</h2>
        
        <div className="space-y-4">
          <div className="modern-card p-5 rounded-2xl border-l-4 border-l-success-500 flex items-start gap-4 hover:scale-[1.01] transition-transform">
            <div className="p-2 bg-success-50 rounded-xl">
              <CheckCircle className="w-6 h-6 text-success-600" />
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-success-600 text-lg">Opération Réussie</h4>
              <p className="text-sm text-slate-600 mt-1">
                L'opération a été effectuée avec succès. Les modifications ont été sauvegardées.
              </p>
            </div>
          </div>

          <div className="modern-card p-5 rounded-2xl border-l-4 border-l-warning-500 flex items-start gap-4 hover:scale-[1.01] transition-transform">
            <div className="p-2 bg-warning-50 rounded-xl">
              <AlertTriangle className="w-6 h-6 text-warning-600" />
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-warning-600 text-lg">Attention Requise</h4>
              <p className="text-sm text-slate-600 mt-1">
                Veuillez vérifier les informations saisies avant de continuer.
              </p>
            </div>
          </div>

          <div className="modern-card p-5 rounded-2xl border-l-4 border-l-error-500 flex items-start gap-4 hover:scale-[1.01] transition-transform">
            <div className="p-2 bg-error-50 rounded-xl">
              <XCircle className="w-6 h-6 text-error-600" />
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-error-600 text-lg">Erreur Détectée</h4>
              <p className="text-sm text-slate-600 mt-1">
                Une erreur est survenue lors du traitement. Veuillez réessayer.
              </p>
            </div>
          </div>

          <div className="modern-card p-5 rounded-2xl border-l-4 border-l-primary-500 flex items-start gap-4 hover:scale-[1.01] transition-transform">
            <div className="p-2 bg-primary-50 rounded-xl">
              <Info className="w-6 h-6 text-primary-600" />
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-primary-600 text-lg">Information Importante</h4>
              <p className="text-sm text-slate-600 mt-1">
                Voici une information importante que vous devez connaître.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Statistiques avec Effets */}
      <section className="space-y-4">
        <h2 className="text-3xl font-display font-bold text-slate-900">Cartes Statistiques</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { label: 'Total Compteurs', value: '1,234', icon: Star, color: 'primary', change: '+12%' },
            { label: 'Stock Neuf', value: '567', icon: Bell, color: 'accent', change: '+8%' },
            { label: 'Installés', value: '890', icon: User, color: 'success', change: '+15%' },
            { label: 'Alertes', value: '12', icon: Settings, color: 'warning', change: '-5%' },
          ].map((stat, idx) => (
            <div key={idx} className="modern-card p-6 rounded-2xl group">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-semibold text-slate-600">{stat.label}</span>
                <div className={`p-3 bg-${stat.color}-100 rounded-xl group-hover:scale-110 transition-transform`}>
                  <stat.icon className={`w-6 h-6 text-${stat.color}-600`} />
                </div>
              </div>
              <div className="flex items-end justify-between">
                <span className="text-4xl font-bold text-slate-900">{stat.value}</span>
                <span className={`text-sm font-bold text-${stat.color}-600 bg-${stat.color}-50 px-2 py-1 rounded-lg`}>
                  {stat.change}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Dégradés avec Animations */}
      <section className="space-y-4">
        <h2 className="text-3xl font-display font-bold text-slate-900">Dégradés Animés</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="primary-gradient p-8 rounded-2xl text-white relative">
            <div className="relative z-10">
              <h3 className="font-bold text-2xl mb-2">Primary Gradient</h3>
              <p className="text-sm opacity-90">
                Dégradé indigo avec effet de pulsation lumineuse
              </p>
            </div>
          </div>

          <div className="accent-gradient p-8 rounded-2xl text-white relative">
            <div className="relative z-10">
              <h3 className="font-bold text-2xl mb-2">Accent Gradient</h3>
              <p className="text-sm opacity-90">
                Dégradé teal frais avec animation de brillance
              </p>
            </div>
          </div>

          <div className="subtle-gradient p-8 rounded-2xl border-2 border-slate-200">
            <h3 className="font-bold text-2xl mb-2 text-slate-900">Subtle Gradient</h3>
            <p className="text-sm text-slate-600">
              Dégradé subtil parfait pour les arrière-plans
            </p>
          </div>
        </div>
      </section>

      {/* Animations Showcase */}
      <section className="space-y-4">
        <h2 className="text-3xl font-display font-bold text-slate-900">Animations Disponibles</h2>
        
        <div className="modern-card p-8 rounded-2xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-20 h-20 mx-auto bg-primary-100 rounded-2xl flex items-center justify-center animate-float mb-3">
                <Sparkles className="w-8 h-8 text-primary-600" />
              </div>
              <p className="text-xs font-semibold text-slate-700">Float</p>
              <p className="text-[10px] text-slate-500">animate-float</p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 mx-auto bg-accent-100 rounded-2xl flex items-center justify-center animate-glow mb-3">
                <Zap className="w-8 h-8 text-accent-600" />
              </div>
              <p className="text-xs font-semibold text-slate-700">Glow</p>
              <p className="text-[10px] text-slate-500">animate-glow</p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 mx-auto bg-primary-100 rounded-2xl flex items-center justify-center animate-pulse mb-3">
                <Star className="w-8 h-8 text-primary-600" />
              </div>
              <p className="text-xs font-semibold text-slate-700">Pulse</p>
              <p className="text-[10px] text-slate-500">animate-pulse</p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 mx-auto bg-accent-100 rounded-2xl flex items-center justify-center shimmer mb-3">
                <TrendingUp className="w-8 h-8 text-accent-600" />
              </div>
              <p className="text-xs font-semibold text-slate-700">Shimmer</p>
              <p className="text-[10px] text-slate-500">shimmer class</p>
            </div>
          </div>
        </div>
      </section>

      {/* Scrollbar Personnalisée */}
      <section className="space-y-4">
        <h2 className="text-3xl font-display font-bold text-slate-900">Scrollbar Dégradée</h2>
        
        <div className="modern-card p-6 rounded-2xl">
          <p className="text-sm text-slate-600 mb-4">
            La scrollbar utilise maintenant un dégradé Primary → Accent. Faites défiler pour voir l'effet !
          </p>
          <div className="h-40 overflow-y-auto space-y-2 pr-2">
            {Array.from({ length: 20 }).map((_, i) => (
              <div key={i} className="p-3 bg-slate-50 rounded-lg text-xs text-slate-600">
                Élément {i + 1} - Scroll pour voir la barre personnalisée
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default ThemeDemo;
