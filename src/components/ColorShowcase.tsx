import React from 'react';
import { Palette, Sparkles, Star, Heart, Zap, Sun, Moon, Cloud, Droplets, Flame, Flower2, Gem } from 'lucide-react';

const ColorShowcase: React.FC = () => {
  const colorPalettes = [
    { name: 'Primary', color: 'indigo', shades: [50, 100, 200, 300, 400, 500, 600, 700, 800, 900], icon: Droplets },
    { name: 'Secondary', color: 'purple', shades: [50, 100, 200, 300, 400, 500, 600, 700, 800, 900], icon: Gem },
    { name: 'Accent', color: 'teal', shades: [50, 100, 200, 300, 400, 500, 600, 700, 800, 900], icon: Sparkles },
    { name: 'Coral', color: 'rose', shades: [50, 100, 200, 300, 400, 500, 600, 700, 800, 900], icon: Flame },
    { name: 'Sky', color: 'sky', shades: [50, 100, 200, 300, 400, 500, 600, 700, 800, 900], icon: Cloud },
    { name: 'Amber', color: 'amber', shades: [50, 100, 200, 300, 400, 500, 600, 700, 800, 900], icon: Sun },
    { name: 'Emerald', color: 'emerald', shades: [50, 100, 200, 300, 400, 500, 600, 700, 800, 900], icon: Flower2 },
    { name: 'Rose', color: 'rose', shades: [50, 100, 200, 300, 400, 500, 600, 700, 800, 900], icon: Heart },
  ];

  const gradients = [
    { name: 'Primary', class: 'primary-gradient', from: 'from-primary-500', to: 'to-primary-700' },
    { name: 'Secondary', class: 'secondary-gradient', from: 'from-secondary-500', to: 'to-secondary-700' },
    { name: 'Accent', class: 'accent-gradient', from: 'from-accent-500', to: 'to-accent-700' },
    { name: 'Coral', class: 'coral-gradient', from: 'from-coral-500', to: 'to-coral-700' },
    { name: 'Sky', class: 'sky-gradient', from: 'from-sky-500', to: 'to-sky-700' },
    { name: 'Amber', class: 'amber-gradient', from: 'from-amber-500', to: 'to-amber-700' },
    { name: 'Emerald', class: 'emerald-gradient', from: 'from-emerald-500', to: 'to-emerald-700' },
    { name: 'Rose', class: 'rose-gradient', from: 'from-rose-500', to: 'to-rose-700' },
  ];

  return (
    <div className="space-y-8 p-8">
      {/* Header */}
      <header className="border-b border-slate-200/60 pb-6">
        <div className="flex items-center gap-3 mb-2">
          <Palette className="w-10 h-10 text-primary-500" />
          <h1 className="text-5xl font-display font-bold bg-gradient-to-r from-primary-600 via-secondary-500 via-accent-500 via-coral-500 to-amber-500 bg-clip-text text-transparent">
            Palette de Couleurs
          </h1>
          <Sparkles className="w-8 h-8 text-accent-500 animate-pulse" />
        </div>
        <p className="text-slate-600 text-lg">
          Découvrez toutes les couleurs vibrantes et modernes de votre projet
        </p>
      </header>

      {/* Rainbow Banner */}
      <div className="rainbow-gradient p-8 rounded-3xl text-white shadow-2xl">
        <div className="text-center space-y-4">
          <Star className="w-16 h-16 mx-auto animate-spin" style={{ animationDuration: '10s' }} />
          <h2 className="text-4xl font-bold">Bienvenue dans l'Univers des Couleurs</h2>
          <p className="text-lg opacity-90">
            Un design moderne avec des couleurs vibrantes et harmonieuses
          </p>
        </div>
      </div>

      {/* Color Palettes */}
      <section className="space-y-6">
        <h2 className="text-3xl font-display font-bold text-slate-900 flex items-center gap-2">
          <Palette className="w-7 h-7 text-primary-500" />
          Palettes de Couleurs
        </h2>

        <div className="space-y-6">
          {colorPalettes.map((palette) => (
            <div key={palette.name} className="modern-card p-6 rounded-2xl">
              <div className="flex items-center gap-3 mb-4">
                <palette.icon className={`w-6 h-6 text-${palette.color}-600`} />
                <h3 className="text-xl font-bold text-slate-900">{palette.name}</h3>
              </div>
              <div className="flex gap-2">
                {palette.shades.map((shade) => (
                  <div key={shade} className="flex-1 group">
                    <div 
                      className={`h-20 rounded-xl bg-${palette.color}-${shade} shadow-md group-hover:scale-110 transition-transform cursor-pointer`}
                    />
                    <p className="text-xs text-center mt-2 text-slate-600 font-semibold">{shade}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Gradients Showcase */}
      <section className="space-y-6">
        <h2 className="text-3xl font-display font-bold text-slate-900 flex items-center gap-2">
          <Sparkles className="w-7 h-7 text-accent-500" />
          Dégradés Magnifiques
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {gradients.map((gradient) => (
            <div 
              key={gradient.name}
              className={`${gradient.class} p-6 rounded-2xl text-white shadow-xl hover:scale-105 transition-transform cursor-pointer`}
            >
              <div className="relative z-10">
                <h3 className="font-bold text-xl mb-2">{gradient.name}</h3>
                <p className="text-sm opacity-90">
                  Dégradé {gradient.name.toLowerCase()} avec animation
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Color Combinations */}
      <section className="space-y-6">
        <h2 className="text-3xl font-display font-bold text-slate-900 flex items-center gap-2">
          <Heart className="w-7 h-7 text-coral-500" />
          Combinaisons Harmonieuses
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Combination 1 */}
          <div className="modern-card p-6 rounded-2xl space-y-4">
            <h3 className="font-bold text-slate-900 text-lg">Océan Profond</h3>
            <div className="space-y-3">
              <div className="primary-gradient p-4 rounded-xl text-white">
                Primary 600
              </div>
              <div className="sky-gradient p-4 rounded-xl text-white">
                Sky 500
              </div>
              <div className="accent-gradient p-4 rounded-xl text-white">
                Accent 500
              </div>
            </div>
          </div>

          {/* Combination 2 */}
          <div className="modern-card p-6 rounded-2xl space-y-4">
            <h3 className="font-bold text-slate-900 text-lg">Coucher de Soleil</h3>
            <div className="space-y-3">
              <div className="coral-gradient p-4 rounded-xl text-white">
                Coral 500
              </div>
              <div className="amber-gradient p-4 rounded-xl text-white">
                Amber 500
              </div>
              <div className="rose-gradient p-4 rounded-xl text-white">
                Rose 500
              </div>
            </div>
          </div>

          {/* Combination 3 */}
          <div className="modern-card p-6 rounded-2xl space-y-4">
            <h3 className="font-bold text-slate-900 text-lg">Forêt Enchantée</h3>
            <div className="space-y-3">
              <div className="emerald-gradient p-4 rounded-xl text-white">
                Emerald 500
              </div>
              <div className="accent-gradient p-4 rounded-xl text-white">
                Accent 600
              </div>
              <div className="sky-gradient p-4 rounded-xl text-white">
                Sky 400
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Buttons with Colors */}
      <section className="space-y-6">
        <h2 className="text-3xl font-display font-bold text-slate-900 flex items-center gap-2">
          <Zap className="w-7 h-7 text-amber-500" />
          Boutons Colorés
        </h2>

        <div className="modern-card p-8 rounded-2xl space-y-6">
          <div>
            <h3 className="font-semibold text-slate-900 mb-4">Boutons avec Dégradés</h3>
            <div className="flex flex-wrap gap-4">
              <button className="primary-gradient px-6 py-3 rounded-xl text-white font-semibold shadow-lg hover:scale-105 transition-transform">
                Primary
              </button>
              <button className="secondary-gradient px-6 py-3 rounded-xl text-white font-semibold shadow-lg hover:scale-105 transition-transform">
                Secondary
              </button>
              <button className="accent-gradient px-6 py-3 rounded-xl text-white font-semibold shadow-lg hover:scale-105 transition-transform">
                Accent
              </button>
              <button className="coral-gradient px-6 py-3 rounded-xl text-white font-semibold shadow-lg hover:scale-105 transition-transform">
                Coral
              </button>
              <button className="emerald-gradient px-6 py-3 rounded-xl text-white font-semibold shadow-lg hover:scale-105 transition-transform">
                Emerald
              </button>
              <button className="amber-gradient px-6 py-3 rounded-xl text-white font-semibold shadow-lg hover:scale-105 transition-transform">
                Amber
              </button>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-slate-900 mb-4">Badges Colorés</h3>
            <div className="flex flex-wrap gap-3">
              <span className="bg-primary-100 text-primary-700 px-4 py-2 rounded-full font-semibold text-sm">Primary</span>
              <span className="bg-secondary-100 text-secondary-700 px-4 py-2 rounded-full font-semibold text-sm">Secondary</span>
              <span className="bg-accent-100 text-accent-700 px-4 py-2 rounded-full font-semibold text-sm">Accent</span>
              <span className="bg-coral-100 text-coral-700 px-4 py-2 rounded-full font-semibold text-sm">Coral</span>
              <span className="bg-sky-100 text-sky-700 px-4 py-2 rounded-full font-semibold text-sm">Sky</span>
              <span className="bg-amber-100 text-amber-700 px-4 py-2 rounded-full font-semibold text-sm">Amber</span>
              <span className="bg-emerald-100 text-emerald-700 px-4 py-2 rounded-full font-semibold text-sm">Emerald</span>
              <span className="bg-rose-100 text-rose-700 px-4 py-2 rounded-full font-semibold text-sm">Rose</span>
            </div>
          </div>
        </div>
      </section>

      {/* Cards with Colors */}
      <section className="space-y-6">
        <h2 className="text-3xl font-display font-bold text-slate-900 flex items-center gap-2">
          <Moon className="w-7 h-7 text-secondary-500" />
          Cartes Colorées
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="modern-card p-6 rounded-2xl border-l-4 border-l-primary-500">
            <div className="p-3 bg-primary-100 rounded-xl w-fit mb-4">
              <Star className="w-6 h-6 text-primary-600" />
            </div>
            <h3 className="font-bold text-slate-900 mb-2">Primary Card</h3>
            <p className="text-sm text-slate-600">Carte avec accent Primary</p>
          </div>

          <div className="modern-card p-6 rounded-2xl border-l-4 border-l-secondary-500">
            <div className="p-3 bg-secondary-100 rounded-xl w-fit mb-4">
              <Gem className="w-6 h-6 text-secondary-600" />
            </div>
            <h3 className="font-bold text-slate-900 mb-2">Secondary Card</h3>
            <p className="text-sm text-slate-600">Carte avec accent Secondary</p>
          </div>

          <div className="modern-card p-6 rounded-2xl border-l-4 border-l-accent-500">
            <div className="p-3 bg-accent-100 rounded-xl w-fit mb-4">
              <Sparkles className="w-6 h-6 text-accent-600" />
            </div>
            <h3 className="font-bold text-slate-900 mb-2">Accent Card</h3>
            <p className="text-sm text-slate-600">Carte avec accent Teal</p>
          </div>

          <div className="modern-card p-6 rounded-2xl border-l-4 border-l-coral-500">
            <div className="p-3 bg-coral-100 rounded-xl w-fit mb-4">
              <Heart className="w-6 h-6 text-coral-600" />
            </div>
            <h3 className="font-bold text-slate-900 mb-2">Coral Card</h3>
            <p className="text-sm text-slate-600">Carte avec accent Coral</p>
          </div>
        </div>
      </section>

      {/* Usage Examples */}
      <section className="space-y-6">
        <h2 className="text-3xl font-display font-bold text-slate-900 flex items-center gap-2">
          <Sparkles className="w-7 h-7 text-emerald-500" />
          Exemples d'Utilisation
        </h2>

        <div className="modern-card p-8 rounded-2xl">
          <h3 className="font-bold text-slate-900 mb-4">Code pour utiliser les couleurs :</h3>
          <div className="bg-slate-900 text-slate-100 p-6 rounded-xl font-mono text-sm space-y-2">
            <p><span className="text-secondary-400">// Dégradés</span></p>
            <p><span className="text-coral-400">className</span>=<span className="text-emerald-400">"primary-gradient"</span></p>
            <p><span className="text-coral-400">className</span>=<span className="text-emerald-400">"secondary-gradient"</span></p>
            <p><span className="text-coral-400">className</span>=<span className="text-emerald-400">"coral-gradient"</span></p>
            <p className="mt-4"><span className="text-secondary-400">// Couleurs de fond</span></p>
            <p><span className="text-coral-400">className</span>=<span className="text-emerald-400">"bg-primary-600"</span></p>
            <p><span className="text-coral-400">className</span>=<span className="text-emerald-400">"bg-accent-500"</span></p>
            <p><span className="text-coral-400">className</span>=<span className="text-emerald-400">"bg-coral-100"</span></p>
            <p className="mt-4"><span className="text-secondary-400">// Couleurs de texte</span></p>
            <p><span className="text-coral-400">className</span>=<span className="text-emerald-400">"text-primary-600"</span></p>
            <p><span className="text-coral-400">className</span>=<span className="text-emerald-400">"text-secondary-500"</span></p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ColorShowcase;
