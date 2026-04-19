import { useState, useEffect, useMemo, type FormEvent } from 'react';
import { 
  Plus, 
  ArrowRightLeft, 
  History, 
  Settings, 
  AlertTriangle, 
  Package, 
  Menu, 
  X,
  TrendingDown,
  LayoutDashboard,
  LogOut,
  Search,
  Filter,
  ArrowUp,
  ArrowDown,
  Download,
  Users,
  Building2,
  MapPin,
  Home,
  ArrowLeft,
  Database,
  Warehouse
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Swal from 'sweetalert2';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
  Legend
} from 'recharts';
import { 
  onAuthStateChanged
} from 'firebase/auth';
import { 
  collection, 
  query, 
  onSnapshot, 
  where, 
  orderBy,
  limit,
  doc,
  getDoc,
  getDocs
} from 'firebase/firestore';
import { db, auth } from './lib/firebase';
import { cn } from './lib/utils';
import { 
  Meter, 
  Movement, 
  StockLevel, 
  Store, 
  Diameter, 
  Threshold,
  Brand,
  Supplier,
  Agency,
  Branch
} from './types';
import { setupInitialData } from './services/stockService';

const Toast = Swal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
  background: '#1C2128',
  color: '#F0F6FC',
  didOpen: (toast) => {
    toast.addEventListener('mouseenter', Swal.stopTimer);
    toast.addEventListener('mouseleave', Swal.resumeTimer);
  }
});

const downloadCSV = (data: any[], filename: string) => {
  if (data.length === 0) return;

  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row => 
      headers.map(header => {
        const val = row[header];
        const stringVal = val === null || val === undefined ? '' : String(val);
        // Escape quotes and handle commas
        return `"${stringVal.replace(/"/g, '""')}"`;
      }).join(',')
    )
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const alertTheme = {
  background: '#1C2128',
  color: '#F0F6FC',
  confirmButtonColor: '#38BDF8',
  cancelButtonColor: '#EF4444',
  customClass: {
    popup: 'rounded-xl border border-border-main'
  }
};

const LoginView = ({ onEnter }: { onEnter: () => void }) => {
  const [loading, setLoading] = useState(false);
  
  const handleEnter = async () => {
    setLoading(true);
    try {
      await setupInitialData();
      Toast.fire({
        icon: 'success',
        title: 'Connexion réussie'
      });
      onEnter();
    } catch (e) {
      console.error(e);
      onEnter(); 
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-bg-card p-8 rounded-xl shadow-sm border border-border-main max-w-md w-full"
      >
        <div className="flex items-center justify-center mb-8">
          <div className="bg-accent text-bg-primary p-3 rounded-lg mr-3">
            <Package size={32} />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary">AquaStock</h1>
        </div>
        <p className="text-center text-text-dim mb-8 font-serif italic">
          Gestion de stock de compteurs d'eau en temps réel.
        </p>
        <button 
          onClick={handleEnter}
          disabled={loading}
          className="w-full bg-accent text-bg-primary font-bold uppercase tracking-widest py-3 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {loading ? 'Initialisation...' : 'Entrer dans l\'application'}
        </button>
      </motion.div>
    </div>
  );
};

export default function App() {
  const [isAuthenticated, setAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'mouvements' | 'stock' | 'alerts' | 'reports' | 'admin'>('dashboard');
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [stockLevels, setStockLevels] = useState<StockLevel[]>([]);
  const [meters, setMeters] = useState<Meter[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [diameters, setDiameters] = useState<Diameter[]>([]);
  const [movements, setMovements] = useState<Movement[]>([]);
  const [thresholds, setThresholds] = useState<Threshold[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [isMoveModalOpen, setMoveModalOpen] = useState(false);
  const [selectedMeterId, setSelectedMeterId] = useState<string | null>(null);

  // Auth State Listener
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) setAuthenticated(true);
    });
    return () => unsub();
  }, []);

  // Listeners
  useEffect(() => {
    if (!isAuthenticated) return;

    const unsubStock = onSnapshot(collection(db, 'stockLevels'), (snap) => {
      setStockLevels(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as StockLevel)));
    });
    
    const unsubMeters = onSnapshot(collection(db, 'meters'), (snap) => {
      setMeters(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Meter)));
    });

    const unsubStores = onSnapshot(collection(db, 'stores'), (snap) => {
      setStores(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Store)));
    });

    const unsubDiam = onSnapshot(collection(db, 'diameters'), (snap) => {
      setDiameters(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Diameter)));
    });

    const unsubMvts = onSnapshot(
      query(collection(db, 'movements'), orderBy('date', 'desc'), limit(50)), 
      (snap) => {
        setMovements(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Movement)));
      }
    );

    const unsubThresholds = onSnapshot(collection(db, 'thresholds'), (snap) => {
      setThresholds(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Threshold)));
    });

    const unsubBrands = onSnapshot(collection(db, 'brands'), (snap) => {
      setBrands(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Brand)));
    });

    const unsubSuppliers = onSnapshot(collection(db, 'suppliers'), (snap) => {
      setSuppliers(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Supplier)));
    });

    const unsubAgencies = onSnapshot(collection(db, 'agencies'), (snap) => {
      setAgencies(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Agency)));
    });

    const unsubBranches = onSnapshot(collection(db, 'branches'), (snap) => {
      setBranches(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Branch)));
    });

    return () => {
      unsubStock();
      unsubMeters();
      unsubStores();
      unsubDiam();
      unsubMvts();
      unsubThresholds();
      unsubBrands();
      unsubSuppliers();
      unsubAgencies();
      unsubBranches();
    };
  }, [isAuthenticated]);

  // Calculer les IDs des magasins d'agence uniquement
  const agencyStoreIds = useMemo(() => {
    return stores
      .filter((s: any) => s.type === 'AGENCE' || s.type === 'AGENCY')
      .map((s: any) => s.id);
  }, [stores]);

  // Filtrer les compteurs des agences uniquement
  const agencyMeters = useMemo(() => {
    return meters.filter((m: any) => agencyStoreIds.includes(m.currentStoreId));
  }, [meters, agencyStoreIds]);

  // Calculer toutes les alertes
  const allAlerts = useMemo(() => {
    return stockLevels.filter(stock => {
      const threshold = thresholds.find(t => t.storeId === stock.storeId && t.diameterId === stock.diameterId);
      return threshold && stock.quantity < threshold.minQuantity;
    });
  }, [stockLevels, thresholds]);

  // Filtrer les alertes des agences uniquement
  const agencyAlerts = useMemo(() => {
    return allAlerts.filter((alert: any) => {
      const store = stores.find((s: any) => s.id === alert.storeId);
      return store && (store.type === 'AGENCE' || store.type === 'AGENCY');
    });
  }, [allAlerts, stores]);

  if (!isAuthenticated) {
    return <LoginView onEnter={() => setAuthenticated(true)} />;
  }

  const alerts = allAlerts;

  return (
    <div className="flex h-screen bg-bg-primary font-sans text-text-primary">
      {/* Sidebar ... */}

      <AnimatePresence>
        {isMoveModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-bg-primary/80 backdrop-blur-sm p-4">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-bg-card rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl relative border border-border-main"
            >
              <div className="p-8 border-b border-border-main bg-bg-sidebar text-text-primary flex justify-between items-center">
                <h3 className="text-xl font-bold uppercase tracking-wider">Nouveau Mouvement</h3>
                <button onClick={() => setMoveModalOpen(false)} className="hover:text-accent"><X /></button>
              </div>
              
              <div className="p-8 max-h-[70vh] overflow-auto">
                <NewMovementForm 
                  onClose={() => setMoveModalOpen(false)} 
                  stores={stores} 
                  agencies={agencies}
                  diameters={diameters}
                  suppliers={suppliers}
                />
              </div>
            </motion.div>
          </div>
        )}

        {selectedMeterId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-bg-primary/80 backdrop-blur-sm p-4">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-bg-card rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl relative border border-border-main"
            >
              <div className="p-8 border-b border-border-main bg-bg-sidebar text-text-primary flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-bold uppercase tracking-wider">Détails Compteur</h3>
                  <p className="text-accent font-mono text-sm mt-1">{meters.find(m => m.id === selectedMeterId)?.serialNumber}</p>
                </div>
                <button onClick={() => setSelectedMeterId(null)} className="hover:text-accent"><X /></button>
              </div>
              
              <div className="p-8 max-h-[70vh] overflow-auto">
                <MeterDetailView 
                  meter={meters.find(m => m.id === selectedMeterId)} 
                  movements={movements}
                  stores={stores}
                  brands={brands}
                />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <aside className={cn(
        "bg-bg-sidebar border-r border-border-main transition-all duration-300 relative z-20 flex flex-col",
        isSidebarOpen ? "w-64 p-6" : "w-20 p-4"
      )}>
        <div className="flex items-center gap-3 mb-10 overflow-hidden">
          <div className="w-10 h-10 bg-accent rounded-xl flex items-center justify-center shrink-0 shadow-lg shadow-accent/20">
            <Database className="text-white" size={20} />
          </div>
          {isSidebarOpen && (
            <div className="animate-in fade-in slide-in-from-left-2 duration-300">
              <h1 className="text-xl font-black tracking-tighter text-text-primary leading-none uppercase">AQUA<span className="text-accent italic">STOCK</span></h1>
              <p className="text-[8px] font-bold text-accent uppercase tracking-widest opacity-60">Professional Edition</p>
            </div>
          )}
        </div>

        <nav className="flex-1 w-full space-y-6">
          <div className="space-y-1">
            {isSidebarOpen && <p className="px-3 text-[10px] font-bold text-text-dim uppercase tracking-widest mb-2">Navigation</p>}
            <NavItem 
              id="dashboard" 
              label="Dashboard" 
              icon={<LayoutDashboard size={20} />} 
              active={activeTab === 'dashboard'} 
              collapsed={!isSidebarOpen}
              onClick={() => setActiveTab('dashboard')} 
            />
            <NavItem 
              id="mouvements" 
              label="Mouvements" 
              icon={<ArrowRightLeft size={20} />} 
              active={activeTab === 'mouvements'} 
              collapsed={!isSidebarOpen}
              onClick={() => setActiveTab('mouvements')} 
            />
            <NavItem 
              id="stock" 
              label="Inventaire" 
              icon={<Database size={20} />} 
              active={activeTab === 'stock'} 
              collapsed={!isSidebarOpen}
              onClick={() => setActiveTab('stock')} 
            />
            <NavItem 
              id="alerts" 
              label="Alertes" 
              icon={<AlertTriangle size={20} />} 
              active={activeTab === 'alerts'} 
              collapsed={!isSidebarOpen}
              onClick={() => setActiveTab('alerts')} 
            />
            <NavItem 
              id="reports" 
              label="Bilans" 
              icon={<TrendingDown size={20} />} 
              active={activeTab === 'reports'} 
              collapsed={!isSidebarOpen}
              onClick={() => setActiveTab('reports')} 
            />
          </div>

          <div className="space-y-1">
            {isSidebarOpen && <p className="px-3 text-[10px] font-bold text-text-dim uppercase tracking-widest mb-2">Système</p>}
            <NavItem 
              id="admin" 
              label="Administration" 
              icon={<Settings size={20} />} 
              active={activeTab === 'admin'} 
              collapsed={!isSidebarOpen}
              onClick={() => setActiveTab('admin')} 
            />
          </div>
        </nav>

        <button 
          onClick={() => setSidebarOpen(!isSidebarOpen)}
          className="mt-auto p-2 text-text-dim hover:text-accent transition-colors"
        >
          {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto p-8 overflow-y-auto bg-bg-primary">
        <header className="flex justify-between items-center mb-12">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-text-primary flex items-center gap-3">
              {activeTab === 'dashboard' && <><LayoutDashboard className="text-accent" /> Dashboard</>}
              {activeTab === 'mouvements' && <><ArrowRightLeft className="text-accent" /> Mouvements</>}
              {activeTab === 'stock' && <><Database className="text-accent" /> Inventaire</>}
              {activeTab === 'alerts' && <><AlertTriangle className="text-danger" /> Alertes</>}
              {activeTab === 'reports' && <><TrendingDown className="text-accent" /> Bilans & Rapports</>}
              {activeTab === 'admin' && <><Settings className="text-accent" /> Administration</>}
            </h2>
            <p className="text-text-dim text-sm mt-1">
              Mise à jour : {new Date().toLocaleDateString('fr-FR')} à {new Date().toLocaleTimeString()}
            </p>
          </div>
          
          <div className="flex gap-4">
            {alerts.length > 0 && (
              <div className="flex items-center gap-2 bg-danger/10 text-danger px-4 py-2 rounded-lg border border-danger/20">
                <AlertTriangle size={18} />
                <span className="text-sm font-bold uppercase tracking-wider">{alerts.length} Alertes Stock</span>
              </div>
            )}
            <button 
              onClick={() => setMoveModalOpen(true)}
              className="bg-accent text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:opacity-90 font-bold text-sm uppercase tracking-wider shadow-lg shadow-accent/20"
            >
              <Plus size={18} />
              <span>Nouveau Mouvement</span>
            </button>
          </div>
        </header>

        {activeTab === 'dashboard' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-12">
            <StatCard label="Stock Total (Agences)" value={agencyMeters.length.toString()} trend={`${agencyMeters.filter(m => m.status === 'EN_STOCK').length} en stock`} />
            <StatCard label="En Stock" value={agencyMeters.filter(m => m.status === 'EN_STOCK').length.toString()} />
            <StatCard 
              label="Installés" 
              value={agencyMeters.filter(m => m.status === 'INSTALLE' || m.status === 'POSE').length.toString()} 
            />
            <StatCard label="Hors Stock" value={agencyMeters.filter(m => m.status !== 'EN_STOCK').length.toString()} />
            <StatCard label="Alertes Seuil" value={agencyAlerts.length.toString()} isAlert={agencyAlerts.length > 0} />
          </div>
        )}

        <div className="bg-bg-card rounded-xl border border-border-main overflow-hidden shadow-xl">
          {activeTab === 'dashboard' && <DashboardView alerts={agencyAlerts} movements={movements} stores={stores} diameters={diameters} meters={agencyMeters} />}
          {activeTab === 'mouvements' && <MovementsView movements={movements} stores={stores} meters={meters} diameters={diameters} suppliers={suppliers} />}
          {activeTab === 'stock' && <InventoryView meters={meters} stores={stores} diameters={diameters} brands={brands} onMeterClick={(id: string) => setSelectedMeterId(id)} />}
          {activeTab === 'alerts' && <AlertsView stockLevels={stockLevels} thresholds={thresholds} stores={stores} diameters={diameters} />}
          {activeTab === 'reports' && (
            <ReportsView 
              movements={movements} 
              stores={stores} 
              agencies={agencies} 
              branches={branches} 
              diameters={diameters} 
            />
          )}
          {activeTab === 'admin' && <AdminView />}
        </div>
      </main>
    </div>
  );
}

function NavItem({ id, label, icon, active, collapsed, onClick }: any) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "flex items-center w-full p-3 rounded-xl transition-all duration-200 mb-1",
        active ? "bg-accent text-white shadow-lg shadow-accent/20" : "text-text-dim hover:text-accent hover:bg-accent/5"
      )}
    >
      <div className={cn("min-w-[20px]", active ? "text-white" : "")}>{icon}</div>
      {!collapsed && <span className="ml-3 font-semibold text-sm tracking-tight">{label}</span>}
    </button>
  );
}

function StatCard({ label, value, trend, isAlert }: any) {
  return (
    <div className={cn(
      "bg-bg-card p-6 rounded-xl border border-border-main shadow-sm hover:shadow-md transition-shadow",
      isAlert && "border-danger/30 bg-danger/5"
    )}>
      <p className="text-[10px] font-bold uppercase tracking-wider text-text-dim mb-2">{label}</p>
      <div className="flex items-baseline gap-2">
        <h3 className={cn("text-3xl font-extrabold tracking-tighter", isAlert ? "text-danger" : "text-text-primary")}>{value}</h3>
        {trend && <span className={cn("text-[10px] font-bold", trend.includes('+') ? "text-success" : "text-danger")}>{trend}</span>}
      </div>
    </div>
  );
}

function AlertsView({ stockLevels = [], thresholds = [], stores = [], diameters = [] }: any) {
  const alertsData = useMemo(() => {
    return stockLevels
      .map(stock => {
        const threshold = thresholds.find(t => t.storeId === stock.storeId && t.diameterId === stock.diameterId);
        if (!threshold) return null;
        if (stock.quantity >= threshold.minQuantity) return null;
        
        return {
          id: `${stock.storeId}_${stock.diameterId}`,
          storeLabel: stores.find(s => s.id === stock.storeId)?.label || stock.storeId,
          diameter: stock.diameterId,
          currentQty: stock.quantity,
          minQty: threshold.minQuantity,
          diff: threshold.minQuantity - stock.quantity
        };
      })
      .filter(a => a !== null);
  }, [stockLevels, thresholds, stores]);

  return (
    <div className="p-0">
      <div className="p-6 border-b border-border-main bg-white/2">
        <h3 className="font-bold uppercase tracking-widest text-xs text-text-dim">Liste des Alertes de Stock</h3>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-white/2 text-text-dim text-[10px] font-bold uppercase tracking-widest border-b border-border-main">
              <th className="p-5">Magasin / Agence</th>
              <th className="p-5">Diamètre</th>
              <th className="p-5 text-center">Quantité Actuelle</th>
              <th className="p-5 text-center">Seuil Minimum</th>
              <th className="p-5 text-center">Manquant</th>
              <th className="p-5">Statut</th>
            </tr>
          </thead>
          <tbody>
            {alertsData.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-10 text-center text-text-dim opacity-50 italic text-sm">Aucune alerte de stock détectée.</td>
              </tr>
            ) : (
              alertsData.map((alert: any) => (
                <tr key={alert.id} className="border-b border-border-main hover:bg-white/2 transition-colors">
                  <td className="p-5 text-[13px] font-bold text-text-primary">{alert.storeLabel}</td>
                  <td className="p-5 text-[13px] font-mono text-text-dim">{alert.diameter}</td>
                  <td className="p-5 text-center">
                    <span className="text-sm font-mono font-bold text-danger">{alert.currentQty}</span>
                  </td>
                  <td className="p-5 text-center">
                    <span className="text-sm font-mono text-text-dim">{alert.minQty}</span>
                  </td>
                  <td className="p-5 text-center">
                    <span className="text-sm font-mono font-bold text-danger">-{alert.diff}</span>
                  </td>
                  <td className="p-5">
                    <span className="px-2 py-1 rounded text-[9px] font-bold tracking-widest uppercase bg-danger/10 text-danger border border-danger/20">
                      Critique
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ReportsView({ movements = [], stores = [], agencies = [], branches = [], diameters = [], meters = [] }: any) {
  const [viewMode, setViewMode] = useState<'ANNUAL' | 'MONTHLY'>('ANNUAL');
  const [filterType, setFilterType] = useState<'GLOBAL' | 'AGENCY' | 'BRANCH'>('GLOBAL');
  const [selectedId, setSelectedId] = useState<string>('');
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth());

  const months = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];

  const availableYears = useMemo(() => {
    const years = new Set<number>();
    years.add(new Date().getFullYear());
    movements.forEach((m: any) => {
      if (m.date) years.add(m.date.toDate().getFullYear());
    });
    return Array.from(years).sort((a, b) => b - a);
  }, [movements]);

  // Stores relevant to current selection
  const relevantStoreIds = useMemo(() => {
    // Si GLOBAL, retourner tous les magasins
    if (filterType === 'GLOBAL') {
      return stores.map((s: any) => s.id);
    }
    if (!selectedId) return [];
    if (filterType === 'AGENCY') {
      return stores.filter((s: any) => s.agencyId === selectedId).map((s: any) => s.id);
    }
    if (filterType === 'BRANCH') {
      return stores.filter((s: any) => s.branchId === selectedId).map((s: any) => s.id);
    }
    return [];
  }, [filterType, selectedId, stores]);

  // Current stock for relevant stores
  const currentStockTotal = useMemo(() => {
    return meters.filter((m: any) => relevantStoreIds.includes(m.currentStoreId) && m.status === 'EN_STOCK').length;
  }, [meters, relevantStoreIds]);

  // Calculate stock at specific date by rolling back movements
  const calculateStockAt = (date: Date) => {
    // StockAtDate = CurrentStock - (All Net Changes between Date and Now)
    // Net Change = Entrées - Sorties
    const movementsSinceThen = movements.filter((m: any) => {
      if (!m.date) return false;
      const mDate = m.date.toDate();
      return mDate > date;
    });

    let netChange = 0;
    movementsSinceThen.forEach((m: any) => {
      const qty = m.meterSerialNumbers?.length || 0;
      const isEntering = relevantStoreIds.includes(m.destStoreId);
      const isLeaving = relevantStoreIds.includes(m.sourceStoreId);

      if (isEntering && !isLeaving) netChange += qty;
      if (isLeaving && !isEntering) netChange -= qty;
    });

    return currentStockTotal - netChange;
  };

  const filteredData = useMemo(() => {
    return movements.filter((m: any) => {
      if (!m.date) return false;
      const mDate = m.date.toDate();
      const inYear = mDate.getFullYear() === selectedYear;
      if (!inYear) return false;
      if (viewMode === 'MONTHLY' && mDate.getMonth() !== selectedMonth) return false;

      const involvesStore = relevantStoreIds.includes(m.sourceStoreId) || relevantStoreIds.includes(m.destStoreId);
      return involvesStore;
    });
  }, [movements, relevantStoreIds, selectedYear, selectedMonth, viewMode]);

  const monthlyStats = useMemo(() => {
    const stats = months.map((name, idx) => {
      const startOfMonth = new Date(selectedYear, idx, 1);
      const endOfMonth = new Date(selectedYear, idx + 1, 0, 23, 59, 59);
      return { 
        name, 
        sorties: 0, 
        entrees: 0, 
        net: 0,
        initial: calculateStockAt(startOfMonth),
        final: calculateStockAt(endOfMonth)
      };
    });

    movements.forEach((m: any) => {
      if (!m.date) return;
      const mDate = m.date.toDate();
      if (mDate.getFullYear() !== selectedYear) return;
      
      const monthIdx = mDate.getMonth();
      const qty = m.meterSerialNumbers?.length || 0;
      const isEntering = relevantStoreIds.includes(m.destStoreId);
      const isLeaving = relevantStoreIds.includes(m.sourceStoreId);

      if (isEntering && !isLeaving) {
        stats[monthIdx].entrees += qty;
        stats[monthIdx].net += qty;
      }
      if (isLeaving && !isEntering) {
        stats[monthIdx].sorties += qty;
        stats[monthIdx].net -= qty;
      }
    });

    return stats;
  }, [movements, relevantStoreIds, selectedYear, currentStockTotal]);

  const monthlyReportDetail = useMemo(() => {
    if (viewMode !== 'MONTHLY') return null;
    const stats = monthlyStats[selectedMonth];
    return {
      name: months[selectedMonth],
      initial: stats.initial,
      entrees: stats.entrees,
      sorties: stats.sorties,
      final: stats.final,
      net: stats.net
    };
  }, [monthlyStats, selectedMonth, viewMode]);

  const annualStats = useMemo(() => {
    return monthlyStats.reduce((acc, curr) => ({
      sorties: acc.sorties + curr.sorties,
      entrees: acc.entrees + curr.entrees,
      net: acc.net + curr.net
    }), { sorties: 0, entrees: 0, net: 0 });
  }, [monthlyStats]);

  const handleExport = () => {
    const exportData = viewMode === 'ANNUAL' 
      ? monthlyStats.map(s => ({
          Mois: s.name,
          Initial: s.initial,
          Entrees: s.entrees,
          Sorties: s.sorties,
          Final: s.final,
          Net: s.net
        }))
      : filteredData.map((m: any) => ({
          Date: m.date?.toDate().toLocaleDateString(),
          Type: m.typeId,
          Quantite: m.meterSerialNumbers?.length || 0,
          Note: m.deliveryNote || '',
          Observation: m.observation || ''
        }));
    
    downloadCSV(exportData, `bilan_${filterType.toLowerCase()}_${selectedId}_${selectedYear}.csv`);
  };

  return (
    <div className="bg-bg-primary min-h-screen">
      <div className="p-8 border-b border-border-main bg-bg-card shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-6">
          <div className="flex flex-wrap items-center gap-6">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-text-dim uppercase tracking-widest block">Périodicité</label>
              <div className="flex bg-bg-primary p-1 rounded-xl border border-border-main">
                <button 
                  onClick={() => setViewMode('ANNUAL')}
                  className={cn("px-4 py-2 rounded-lg text-xs font-bold transition-all", viewMode === 'ANNUAL' ? "bg-accent text-white shadow-md" : "text-text-dim hover:text-text-primary")}
                >Annuel</button>
                <button 
                  onClick={() => setViewMode('MONTHLY')}
                  className={cn("px-4 py-2 rounded-lg text-xs font-bold transition-all", viewMode === 'MONTHLY' ? "bg-accent text-white shadow-md" : "text-text-dim hover:text-text-primary")}
                >Mensuel</button>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-text-dim uppercase tracking-widest block">Type de bilan</label>
              <div className="flex bg-bg-primary p-1 rounded-xl border border-border-main">
                <button 
                  onClick={() => { setFilterType('GLOBAL'); setSelectedId(''); }}
                  className={cn("px-4 py-2 rounded-lg text-xs font-bold transition-all", filterType === 'GLOBAL' ? "bg-accent text-white shadow-md" : "text-text-dim hover:text-text-primary")}
                >Global</button>
                <button 
                  onClick={() => { setFilterType('AGENCY'); setSelectedId(''); }}
                  className={cn("px-4 py-2 rounded-lg text-xs font-bold transition-all", filterType === 'AGENCY' ? "bg-accent text-white shadow-md" : "text-text-dim hover:text-text-primary")}
                >Agence</button>
                <button 
                  onClick={() => { setFilterType('BRANCH'); setSelectedId(''); }}
                  className={cn("px-4 py-2 rounded-lg text-xs font-bold transition-all", filterType === 'BRANCH' ? "bg-accent text-white shadow-md" : "text-text-dim hover:text-text-primary")}
                >Antenne</button>
              </div>
            </div>
            
            {filterType !== 'GLOBAL' && (
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-text-dim uppercase tracking-widest block font-sans">
                  {filterType === 'AGENCY' ? 'Sélectionner une agence' : 'Sélectionner une antenne'} *
                </label>
                <select 
                  value={selectedId}
                  onChange={(e) => setSelectedId(e.target.value)}
                  className="bg-bg-primary border border-border-main text-text-primary text-xs font-bold rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-accent/20 transition-all min-w-[200px]"
                  required
                >
                  <option value="">-- Choisir {filterType === 'AGENCY' ? 'une agence' : 'une antenne'} --</option>
                  {(filterType === 'AGENCY' ? agencies : branches).map((item: any) => (
                    <option key={item.id} value={item.id}>{item.label}</option>
                  ))}
                </select>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-text-dim uppercase tracking-widest block">Période</label>
              <div className="flex gap-2">
                {viewMode === 'MONTHLY' && (
                  <select 
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(Number(e.target.value))}
                    className="bg-bg-primary border border-border-main text-text-primary text-xs font-bold rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-accent/20 transition-all"
                  >
                    {months.map((m, idx) => (
                      <option key={idx} value={idx}>{m}</option>
                    ))}
                  </select>
                )}
                <select 
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                  className="bg-bg-primary border border-border-main text-text-primary text-xs font-bold rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-accent/20 transition-all font-sans"
                >
                  {availableYears.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <button 
            onClick={handleExport}
            className="flex items-center gap-2 px-6 py-2.5 bg-bg-card border-2 border-border-main rounded-xl text-xs font-bold uppercase tracking-widest text-text-dim hover:text-accent hover:border-accent transition-all shadow-sm"
          >
            <Download size={16} /> Export CSV
          </button>
        </div>
      </div>

      <div className="p-8 space-y-8">
        {!selectedId ? (
          <div className="bg-bg-card border border-border-main rounded-2xl p-12 text-center">
            <div className="text-accent/50 mb-4 flex justify-center">
              <TrendingDown size={48} />
            </div>
            <h4 className="text-lg font-bold text-text-primary mb-2">Aucune sélection</h4>
            <p className="text-text-dim text-sm">
              {filterType === 'GLOBAL' 
                ? 'Le bilan global affichera tous les magasins' 
                : `Veuillez sélectionner une ${filterType === 'AGENCY' ? 'agence' : 'antenne'} pour afficher le bilan`
              }
            </p>
          </div>
        ) : (
          <>
        {viewMode === 'ANNUAL' ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-bg-card p-6 rounded-2xl border border-border-main shadow-sm">
                <p className="text-[10px] font-extrabold text-text-dim uppercase tracking-widest mb-2 text-center font-sans">Total Sorties (Annuel)</p>
                <div className="flex items-center justify-center gap-3">
                  <TrendingDown className="text-danger" size={24} />
                  <h4 className="text-4xl font-black text-text-primary tracking-tighter">{annualStats.sorties}</h4>
                </div>
              </div>
              <div className="bg-bg-card p-6 rounded-2xl border border-border-main shadow-sm">
                <p className="text-[10px] font-extrabold text-text-dim uppercase tracking-widest mb-2 text-center font-sans">Total Entrées (Annuel)</p>
                <div className="flex items-center justify-center gap-3">
                  <Plus className="text-success" size={24} />
                  <h4 className="text-4xl font-black text-text-primary tracking-tighter">{annualStats.entrees}</h4>
                </div>
              </div>
              <div className="bg-bg-card p-6 rounded-2xl border border-border-main shadow-sm">
                <p className="text-[10px] font-extrabold text-text-dim uppercase tracking-widest mb-2 text-center font-sans">Variation Net</p>
                <div className="flex items-center justify-center gap-3">
                  <ArrowRightLeft className={annualStats.net >= 0 ? "text-success" : "text-danger"} size={24} />
                  <h4 className={cn("text-4xl font-black tracking-tighter", annualStats.net >= 0 ? "text-success" : "text-danger")}>
                    {annualStats.net > 0 ? '+' : ''}{annualStats.net}
                  </h4>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-bg-card p-8 rounded-2xl border border-border-main shadow-sm">
                <h3 className="text-sm font-bold text-text-dim uppercase tracking-widest mb-8">Evolution Annuelle (Entrées vs Sorties)</h3>
                <div className="h-[350px] w-full" style={{ minHeight: 350 }}>
                  <ResponsiveContainer width="100%" height="100%" minHeight={350}>
                    <BarChart data={monthlyStats} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 10, fontWeight: 700 }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 10 }} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#FFF', borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                        itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                      />
                      <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase' }} />
                      <Bar dataKey="sorties" name="Sorties" fill="#EF4444" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="entrees" name="Entrées" fill="#00A78E" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-bg-card p-8 rounded-2xl border border-border-main shadow-sm overflow-hidden">
                <h3 className="text-sm font-bold text-text-dim uppercase tracking-widest mb-8">Bilan de l'exercice - {selectedYear}</h3>
                <div className="overflow-auto max-h-[350px]">
                  <table className="w-full text-left">
                    <thead className="sticky top-0 bg-bg-card z-10">
                      <tr className="border-b border-border-main text-[10px] font-bold text-text-dim uppercase tracking-widest">
                        <th className="py-3">Mois</th>
                        <th className="py-3 text-right">Initial</th>
                        <th className="py-3 text-right">Entrées</th>
                        <th className="py-3 text-right text-danger">Sorties</th>
                        <th className="py-3 text-right">Final</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border-main/50">
                      {monthlyStats.map((s, idx) => (
                        <tr key={idx} className="hover:bg-bg-primary transition-all group cursor-default">
                          <td className="py-4 text-xs font-bold text-text-primary">{s.name}</td>
                          <td className="py-4 text-xs text-right font-mono text-text-dim">{s.initial}</td>
                          <td className="py-4 text-xs text-right font-mono text-success font-bold">{s.entrees ? `+${s.entrees}` : '0'}</td>
                          <td className="py-4 text-xs text-right font-mono text-danger font-bold">{s.sorties ? `-${s.sorties}` : '0'}</td>
                          <td className="py-4 text-xs text-right font-mono font-black text-text-primary">{s.final}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-bg-card p-6 rounded-2xl border border-border-main shadow-sm text-center">
                <p className="text-[10px] font-bold text-text-dim uppercase tracking-widest mb-2 font-sans">Stock au 1er {months[selectedMonth]}</p>
                <h4 className="text-4xl font-black text-text-primary tracking-tighter">{monthlyReportDetail?.initial}</h4>
              </div>
              <div className="bg-bg-card p-6 rounded-2xl border border-border-main shadow-sm text-center border-l-4 border-l-success">
                <p className="text-[10px] font-bold text-text-dim uppercase tracking-widest mb-2 font-sans">Entrées du Mois</p>
                <div className="flex items-center justify-center gap-2 text-success">
                  <Plus size={20} />
                  <h4 className="text-4xl font-black tracking-tighter">{monthlyReportDetail?.entrees}</h4>
                </div>
              </div>
              <div className="bg-bg-card p-6 rounded-2xl border border-border-main shadow-sm text-center border-l-4 border-l-danger">
                <p className="text-[10px] font-bold text-text-dim uppercase tracking-widest mb-2 font-sans">Sorties du Mois</p>
                <div className="flex items-center justify-center gap-2 text-danger">
                  <TrendingDown size={20} />
                  <h4 className="text-4xl font-black tracking-tighter">{monthlyReportDetail?.sorties}</h4>
                </div>
              </div>
              <div className="bg-bg-card p-6 rounded-2xl border border-accent/20 bg-accent/5 shadow-sm text-center">
                <p className="text-[10px] font-bold text-accent uppercase tracking-widest mb-2 font-sans">Stock au Fin de Mois</p>
                <h4 className="text-4xl font-black text-accent tracking-tighter">{monthlyReportDetail?.final}</h4>
              </div>
            </div>

            <div className="bg-bg-card rounded-2xl border border-border-main shadow-sm overflow-hidden">
              <div className="p-6 border-b border-border-main bg-bg-sidebar">
                <h3 className="text-sm font-bold text-text-primary uppercase tracking-widest flex items-center gap-2">
                  <History className="text-accent" size={18} />
                  Détail des mouvements de {months[selectedMonth]} {selectedYear}
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-bg-primary text-[10px] font-bold text-text-dim uppercase tracking-widest border-b border-border-main">
                      <th className="p-5">Date</th>
                      <th className="p-5">Type</th>
                      <th className="p-5">Source / Destination</th>
                      <th className="p-5 text-center">Quantité</th>
                      <th className="p-5">Responsable</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-main/50">
                    {filteredData.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-20 text-center text-text-dim/50 italic text-sm">
                          Aucun mouvement enregistré pour cette période.
                        </td>
                      </tr>
                    ) : (
                      filteredData.map((m: any) => (
                        <tr key={m.id} className="hover:bg-bg-primary transition-colors">
                          <td className="p-5 text-xs font-mono">{m.date?.toDate().toLocaleDateString()}</td>
                          <td className="p-5">
                            <span className={cn(
                              "px-2 py-1 rounded text-[9px] font-bold uppercase tracking-widest border",
                              m.typeId === 'VENTE' ? "bg-danger/10 text-danger border-danger/20" : "bg-success/10 text-success border-success/20"
                            )}>{m.typeId}</span>
                          </td>
                          <td className="p-5 text-xs text-text-dim">
                            {stores.find((s: any) => s.id === m.sourceStoreId)?.label || 'EXTERIEUR'} 
                            <ArrowRightLeft className="inline mx-2 opacity-30" size={12} />
                            {stores.find((s: any) => s.id === m.destStoreId)?.label || 'EXTERIEUR'}
                          </td>
                          <td className="p-5 text-center font-mono font-bold text-sm">
                            {m.meterSerialNumbers?.length || 0}
                          </td>
                          <td className="p-5 text-xs italic text-text-dim">{m.responsible || 'Système'}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
          </>
        )}
      </div>
    </div>
  );
}

function DashboardView({ alerts = [], movements = [], stores = [], diameters = [], meters = [] }: any) {
  // Aggregate sales data for the last 12 months (Mocking VW_BilanAnnuel)
  const salesByMonth = useMemo(() => {
    const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];
    const currentMonth = new Date().getMonth();
    const result = [];

    for (let i = 11; i >= 0; i--) {
      const d = new Date();
      d.setMonth(currentMonth - i);
      const mIdx = d.getMonth();
      const year = d.getFullYear();
      result.push({
        name: months[mIdx],
        month: mIdx,
        year: year,
        ventes: 0,
        label: `${months[mIdx]} ${year}`
      });
    }

    movements.forEach((mvt: any) => {
      if (mvt.typeId === 'VENTE' && mvt.date) {
        const mvtDate = mvt.date.toDate();
        const mvtMonth = mvtDate.getMonth();
        const mvtYear = mvtDate.getFullYear();
        
        const entry = result.find(r => r.month === mvtMonth && r.year === mvtYear);
        if (entry) {
          entry.ventes += 1;
        }
      }
    });

    return result;
  }, [movements]);

  // Aggregate stock by diameter
  const diameterDistribution = useMemo(() => {
    const counts: Record<string, number> = {};
    meters.filter((m: any) => m.status === 'EN_STOCK').forEach((m: any) => {
      counts[m.diameterId] = (counts[m.diameterId] || 0) + 1;
    });
    
    return Object.entries(counts).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  }, [meters]);

  const COLORS = ['#00A78E', '#2563EB', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-px bg-border-main/50">
      <div className="bg-bg-card p-8 lg:col-span-2 space-y-12">
        {/* Sales Chart Section */}
        <div>
          <div className="flex justify-between items-center mb-8">
            <h3 className="font-bold uppercase tracking-widest text-xs text-text-dim">Bilan Annuel des Ventes</h3>
            <span className="text-[10px] text-accent tracking-widest font-bold uppercase bg-accent/5 px-2 py-1 rounded border border-accent/10">VENTES - 12 MOIS</span>
          </div>
          
          <div className="h-[300px] w-full" style={{ minHeight: 300 }}>
            <ResponsiveContainer width="100%" height="100%" minHeight={300}>
              <BarChart data={salesByMonth} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#6B7280', fontSize: 10, fontWeight: 600 }} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#6B7280', fontSize: 10, fontWeight: 600 }}
                  allowDecimals={false}
                />
                <Tooltip 
                  cursor={{ fill: 'rgba(0, 167, 142, 0.05)' }}
                  contentStyle={{ 
                    backgroundColor: '#FFFFFF', 
                    border: '1px solid #E5E7EB',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                  }}
                  itemStyle={{ color: '#00A78E' }}
                />
                <Bar dataKey="ventes" radius={[6, 6, 0, 0]} barSize={24}>
                  {salesByMonth.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.ventes > 0 ? '#00A78E' : '#F3F4F6'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Stock by Diameter Section */}
        <div className="pt-8 border-t border-border-main/50">
          <div className="flex justify-between items-center mb-8">
            <h3 className="font-bold uppercase tracking-widest text-xs text-text-dim">Répartition du Stock par Diamètre</h3>
            <span className="text-[10px] text-accent tracking-widest font-bold uppercase bg-accent/5 px-2 py-1 rounded border border-accent/10">STOCKS ACTUELS</span>
          </div>
          
          <div className="h-[300px] w-full" style={{ minHeight: 300 }}>
            <ResponsiveContainer width="100%" height="100%" minHeight={300}>
              <PieChart>
                <Pie
                  data={diameterDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                >
                  {diameterDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#FFFFFF', 
                    border: '1px solid #E5E7EB',
                    borderRadius: '12px',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Alertes Section */}
        <div>
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold uppercase tracking-widest text-xs text-text-dim">Alertes Stock Minimum</h3>
            <span className="text-[10px] text-text-dim/50 uppercase font-mono">En direct</span>
          </div>
          
          {alerts.length === 0 ? (
            <p className="text-sm text-text-dim/40 font-mono">Tous les magasins sont au-dessus des seuils.</p>
          ) : (
            <div className="space-y-3">
              {alerts.map((alert: any) => (
                <div key={alert.id} className="flex justify-between items-center p-4 bg-danger/5 rounded-lg border border-danger/20">
                  <div>
                    <p className="font-bold text-sm text-text-primary">{stores.find((s: any) => s.id === alert.storeId)?.label || alert.storeId}</p>
                    <p className="text-[10px] text-text-dim uppercase tracking-widest">{alert.diameterId}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-danger font-mono">Stock: {alert.quantity}</p>
                    <p className="text-[9px] font-bold text-danger/60 uppercase tracking-tighter">Réapprovisionnement suggéré</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="bg-bg-card p-8">
        <h3 className="font-bold uppercase tracking-widest text-xs text-text-dim mb-6">Mouvements Récents</h3>
        <div className="space-y-6">
          {movements.slice(0, 5).map((mvt: any) => (
            <div key={mvt.id} className="flex items-start gap-4 transition-colors cursor-pointer group">
              <div className="bg-bg-primary text-text-dim p-2 rounded border border-border-main group-hover:text-accent group-hover:border-accent transition-colors">
                <ArrowRightLeft size={14} />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start mb-1">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-text-primary">{mvt.typeId}</p>
                  <p className={cn(
                    "font-mono text-[10px]",
                    mvt.typeId.includes('APPRO') || mvt.typeId.includes('RECU') ? "text-success" : "text-text-dim"
                  )}>
                    {mvt.typeId.includes('APPRO') || mvt.typeId.includes('RECU') ? '+1' : '-1'}
                  </p>
                </div>
                <p className="text-xs text-text-dim leading-relaxed truncate max-w-[150px]">{mvt.observation || 'Traitement normal'}</p>
              </div>
            </div>
          ))}
        </div>
        <button className="mt-8 w-full py-2 border border-border-main rounded text-[10px] font-bold uppercase tracking-widest text-text-dim hover:bg-white/5 transition-colors">
          Voir tout l'historique
        </button>
      </div>
    </div>
  );
}

function MovementsView({ movements = [], stores = [], meters = [], diameters = [], suppliers = [] }: any) {
  const [searchQuery, setSearchQuery] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const filteredMovements = useMemo(() => {
    return movements.filter((mvt: any) => {
      const mvtDate = mvt.date?.toDate();
      
      const matchesSearch = !searchQuery || 
        mvt.typeId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        mvt.fileNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        mvt.responsible?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (mvt.deliveryNote?.toLowerCase() || '').includes(searchQuery.toLowerCase());

      const start = startDate ? new Date(startDate) : null;
      const end = endDate ? new Date(endDate) : null;
      
      if (start) start.setHours(0, 0, 0, 0);
      if (end) end.setHours(23, 59, 59, 999);

      const matchesDate = (!start || (mvtDate && mvtDate >= start)) && 
                          (!end || (mvtDate && mvtDate <= end));

      return matchesSearch && matchesDate;
    });
  }, [movements, searchQuery, startDate, endDate]);

  const clearFilters = () => {
    setSearchQuery('');
    setStartDate('');
    setEndDate('');
  };

  // Fonction pour calculer l'agrégation des compteurs par diamètre
  const getMeterSummary = (mvt: any) => {
    if (!mvt.meterSerialNumbers || mvt.meterSerialNumbers.length === 0) {
      return 'Aucun compteur';
    }

    // Compter les compteurs par diamètre
    const diameterCounts: Record<string, number> = {};
    
    mvt.meterSerialNumbers.forEach((serialNumber: string) => {
      // Trouver le compteur correspondant
      const meter = meters.find((m: any) => m.serialNumber === serialNumber);
      
      if (meter) {
        // Trouver le diamètre
        const diameter = diameters.find((d: any) => d.id === meter.diameterId);
        const diameterValue = diameter?.value || 'N/A';
        
        diameterCounts[diameterValue] = (diameterCounts[diameterValue] || 0) + 1;
      } else {
        // Essayer d'extraire le diamètre du numéro de série (format: DN15_...)
        const match = serialNumber.match(/^(DN\d+)/);
        const diameterValue = match ? match[1] : 'N/A';
        diameterCounts[diameterValue] = (diameterCounts[diameterValue] || 0) + 1;
      }
    });

    // Formater le résultat : "100 compteurs DN15, 15 compteurs DN20"
    return Object.entries(diameterCounts)
      .map(([diameter, count]) => `${count} compteur${(count as number) > 1 ? 's' : ''} ${diameter}`)
      .join(', ');
  };

  const handleExport = () => {
    const exportData = filteredMovements.map(mvt => {
      let sourceLabel = 'N/A';
      if (mvt.typeId === 'APPRO' && mvt.supplierId) {
        const supplier = suppliers.find((s: any) => s.id === mvt.supplierId);
        sourceLabel = supplier ? supplier.name : 'Fournisseur';
      } else if (mvt.typeId === 'APPRO' && mvt.sourceStoreId) {
        sourceLabel = stores.find((s: any) => s.id === mvt.sourceStoreId)?.label || 'Magasin';
      } else if (mvt.sourceStoreId) {
        sourceLabel = stores.find((s: any) => s.id === mvt.sourceStoreId)?.label || 'Fournisseur';
      } else if (mvt.typeId === 'APPRO' || mvt.typeId === 'TRANSF_RECU') {
        sourceLabel = 'Fournisseur';
      }
      
      return {
        Date: mvt.date?.toDate().toLocaleDateString(),
        Type: mvt.typeId,
        Compteurs: getMeterSummary(mvt),
        Arrivée: stores.find((s: any) => s.id === mvt.destStoreId)?.label || 'Vente/Pose',
        Source: sourceLabel,
        'N° Bon': mvt.deliveryNote || '',
        Intervenant: mvt.responsible || 'Admin'
      };
    });
    downloadCSV(exportData, `mouvements_${new Date().toISOString().split('T')[0]}.csv`);
  };

  return (
    <div className="p-0">
      <div className="p-6 border-b border-border-main bg-bg-card space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-4 flex-1">
            <div className="flex items-center gap-4 bg-bg-primary px-4 py-2 rounded-lg border border-border-main max-w-sm w-full">
              <Search size={18} className="text-text-dim" />
              <input 
                type="text" 
                placeholder="Rechercher..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent border-none outline-none text-sm w-full text-text-primary" 
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-text-dim">Période du</span>
              <input 
                type="date" 
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-bg-primary border border-border-main text-text-primary text-[11px] rounded-lg px-3 py-2 outline-none focus:border-accent"
              />
              <span className="text-[10px] font-bold uppercase tracking-widest text-text-dim">au</span>
              <input 
                type="date" 
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="bg-bg-primary border border-border-main text-text-primary text-[11px] rounded-lg px-3 py-2 outline-none focus:border-accent"
              />
            </div>

            {(searchQuery || startDate || endDate) && (
              <button 
                onClick={clearFilters}
                className="text-[10px] font-bold uppercase tracking-widest text-accent hover:underline flex items-center gap-1"
              >
                <X size={12} /> Effacer les filtres
              </button>
            )}
          </div>

          <button 
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-bg-primary border border-border-main rounded-lg text-[10px] font-bold uppercase tracking-widest text-text-dim hover:text-text-primary hover:bg-bg-sidebar transition-all"
          >
            <Download size={14} />
            Export CSV
          </button>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-white/2 text-text-dim text-[10px] font-bold uppercase tracking-widest border-b border-border-main">
              <th className="p-5">Date</th>
              <th className="p-5">Type</th>
              <th className="p-5">Compteur(s)</th>
              <th className="p-5 text-accent/80 font-black">SOURCE / ARRIVÉE</th>
              <th className="p-5">N° Bon</th>
              <th className="p-5">Intervenant</th>
            </tr>
          </thead>
          <tbody>
            {filteredMovements.map((mvt: any) => {
              // Déterminer la source
              let sourceLabel = 'N/A';
              if (mvt.typeId === 'APPRO') {
                if (mvt.supplierId) {
                  sourceLabel = suppliers.find((s: any) => s.id === mvt.supplierId)?.name || 'Fournisseur';
                } else if (mvt.sourceStoreId) {
                  sourceLabel = stores.find((s: any) => s.id === mvt.sourceStoreId)?.label || 'Magasin';
                } else {
                  sourceLabel = 'Fournisseur';
                }
              } else if (mvt.sourceStoreId) {
                sourceLabel = stores.find((s: any) => s.id === mvt.sourceStoreId)?.label || 'N/A';
              } else {
                sourceLabel = 'N/A';
              }

              return (
                <tr key={mvt.id} className="border-b border-border-main hover:bg-white/2 transition-colors">
                  <td className="p-5 font-mono text-[11px] text-text-dim">{mvt.date?.toDate().toLocaleDateString()}</td>
                  <td className="p-5">
                    <span className={cn(
                      "px-2 py-1 rounded text-[9px] font-bold tracking-widest uppercase border",
                      mvt.typeId.includes('APPRO') ? "bg-success/10 text-success border-success/20" : "bg-accent/10 text-accent border-accent/20"
                    )}>
                      {mvt.typeId}
                    </span>
                  </td>
                  <td className="p-5">
                    <span className="text-[11px] font-medium text-text-primary">
                      {getMeterSummary(mvt)}
                    </span>
                  </td>
                  <td className="p-5 text-[13px]">
                    <div className="flex flex-col">
                      <span className="text-text-primary">Arrivée: {stores.find((s: any) => s.id === mvt.destStoreId)?.label || 'Vente/Pose'}</span>
                      <span className="text-[10px] text-text-dim opacity-60">
                        Source: {sourceLabel}
                      </span>
                    </div>
                  </td>
                  <td className="p-5">
                    <div className="flex flex-col">
                      <span className="text-[11px] font-mono font-bold text-text-primary">{mvt.deliveryNote || '--'}</span>
                    </div>
                  </td>
                  <td className="p-5 text-[13px] text-text-dim">{mvt.responsible || 'Admin'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function InventoryView({ meters = [], stores = [], diameters = [], brands = [], onMeterClick }: any) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [storeFilter, setStoreFilter] = useState('ALL');
  const [diameterFilter, setDiameterFilter] = useState('ALL');
  const [sorts, setSorts] = useState<{ field: string; direction: 'asc' | 'desc' }[]>([
    { field: 'serialNumber', direction: 'asc' }
  ]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  const filteredAndSortedMeters = useMemo(() => {
    let result = [...meters];

    // Search
    if (searchQuery) {
      result = result.filter(m => m.serialNumber.toLowerCase().includes(searchQuery.toLowerCase()));
    }

    // Status Filter
    if (statusFilter !== 'ALL') {
      result = result.filter(m => m.status === statusFilter);
    }

    // Store Filter
    if (storeFilter !== 'ALL') {
      result = result.filter(m => m.currentStoreId === storeFilter);
    }

    // Diameter Filter
    if (diameterFilter !== 'ALL') {
      result = result.filter(m => m.diameterId === diameterFilter);
    }

    // Multi-column Sorting
    if (sorts.length > 0) {
      result.sort((a, b) => {
        for (const { field, direction } of sorts) {
          let valA = a[field];
          let valB = b[field];

          // Special field resolution
          if (field === 'store') {
            valA = stores.find((s: any) => s.id === a.currentStoreId)?.label || '';
            valB = stores.find((s: any) => s.id === b.currentStoreId)?.label || '';
          } else if (field === 'lastMovementDate') {
            valA = a.lastMovementDate?.toMillis() || 0;
            valB = b.lastMovementDate?.toMillis() || 0;
          }

          if (valA === valB) continue;

          if (valA < valB) return direction === 'asc' ? -1 : 1;
          if (valA > valB) return direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    return result;
  }, [meters, searchQuery, statusFilter, storeFilter, diameterFilter, sorts, stores]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, storeFilter, diameterFilter]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredAndSortedMeters.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedMeters = filteredAndSortedMeters.slice(startIndex, endIndex);

  const toggleSort = (field: string) => {
    setSorts(prev => {
      const existing = prev.find(s => s.field === field);
      if (!existing) {
        return [...prev, { field, direction: 'asc' }];
      }
      if (existing.direction === 'asc') {
        return prev.map(s => s.field === field ? { ...s, direction: 'desc' } : s);
      }
      return prev.filter(s => s.field !== field);
    });
  };

  const SortIndicator = ({ field }: { field: string }) => {
    const index = sorts.findIndex(s => s.field === field);
    if (index === -1) return null;
    const sort = sorts[index];
    
    return (
      <div className="flex items-center gap-1 ml-2 text-accent">
        {sort.direction === 'asc' ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
        <span className="text-[9px] font-bold bg-accent/20 px-1 rounded-sm">{index + 1}</span>
      </div>
    );
  };

  const handleExport = () => {
    const exportData = filteredAndSortedMeters.map(m => ({
      Identification: m.serialNumber,
      Marque: brands.find((b: any) => b.id === m.brandId)?.label || m.brandId,
      Diametre: m.diameterId,
      Statut: m.status?.replace('_', ' '),
      Emplacement: stores.find((s: any) => s.id === m.currentStoreId)?.label || 'Client / Sorti',
      Derniere_MAJ: m.lastMovementDate?.toDate().toLocaleString() || ''
    }));
    downloadCSV(exportData, `inventaire_${new Date().toISOString().split('T')[0]}.csv`);
  };

  return (
    <div className="p-0">
      <div className="p-6 border-b border-border-main bg-bg-card space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-4 flex-1">
            <div className="flex items-center gap-4 bg-bg-primary px-4 py-2 rounded-lg border border-border-main max-w-sm w-full">
              <Search size={18} className="text-text-dim" />
              <input 
                type="text" 
                placeholder="N° de série..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent border-none outline-none text-sm w-full text-text-primary" 
              />
            </div>

            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-bg-primary border border-border-main text-text-primary text-[10px] font-bold uppercase tracking-widest rounded-lg px-3 py-2 outline-none focus:border-accent"
            >
              <option value="ALL">Tous les statuts</option>
              <option value="EN_STOCK">En Stock</option>
              <option value="HORS_STOCK">Hors Stock</option>
              <option value="INSTALLE">Installé</option>
              <option value="VENDU">Vendu</option>
            </select>

            <select 
              value={storeFilter}
              onChange={(e) => setStoreFilter(e.target.value)}
              className="bg-bg-primary border border-border-main text-text-primary text-[10px] font-bold uppercase tracking-widest rounded-lg px-3 py-2 outline-none focus:border-accent"
            >
              <option value="ALL">Tous les magasins</option>
              {stores.map((s: any) => (
                <option key={s.id} value={s.id}>{s.label}</option>
              ))}
            </select>

            <select 
              value={diameterFilter}
              onChange={(e) => setDiameterFilter(e.target.value)}
              className="bg-bg-primary border border-border-main text-text-primary text-[10px] font-bold uppercase tracking-widest rounded-lg px-3 py-2 outline-none focus:border-accent"
            >
              <option value="ALL">Tous les diamètres</option>
              {diameters.map((d: any) => (
                <option key={d.id} value={d.id}>{d.value}</option>
              ))}
            </select>
          </div>

          <button 
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-bg-primary border border-border-main rounded-lg text-[10px] font-bold uppercase tracking-widest text-text-dim hover:text-text-primary hover:bg-bg-sidebar transition-all font-mono"
          >
            <Download size={14} />
            Export CSV
          </button>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-bg-card text-text-dim text-[10px] font-bold uppercase tracking-widest border-b border-main">
              <th className="p-5 cursor-pointer hover:text-text-primary" onClick={() => toggleSort('serialNumber')}>
                <div className="flex items-center">Identification <SortIndicator field="serialNumber" /></div>
              </th>
              <th className="p-5 cursor-pointer hover:text-text-primary" onClick={() => toggleSort('brandId')}>
                <div className="flex items-center">Marque <SortIndicator field="brandId" /></div>
              </th>
              <th className="p-5 cursor-pointer hover:text-text-primary" onClick={() => toggleSort('diameterId')}>
                <div className="flex items-center">Diamètre <SortIndicator field="diameterId" /></div>
              </th>
              <th className="p-5 cursor-pointer hover:text-text-primary" onClick={() => toggleSort('status')}>
                <div className="flex items-center">Statut Actuel <SortIndicator field="status" /></div>
              </th>
              <th className="p-5 cursor-pointer hover:text-text-primary" onClick={() => toggleSort('store')}>
                <div className="flex items-center">Emplacement <SortIndicator field="store" /></div>
              </th>
              <th className="p-5 cursor-pointer hover:text-text-primary" onClick={() => toggleSort('lastMovementDate')}>
                <div className="flex items-center">Dernière MaJ <SortIndicator field="lastMovementDate" /></div>
              </th>
            </tr>
          </thead>
          <tbody>
            {paginatedMeters.map((meter: any) => (
              <tr 
                key={meter.id} 
                onClick={() => onMeterClick(meter.id)}
                className="border-b border-border-main hover:bg-bg-primary transition-colors cursor-pointer"
              >
                <td className="p-5">
                  <p className="font-mono text-sm font-bold tracking-tight text-text-primary">{meter.serialNumber}</p>
                </td>
                <td className="p-5">
                  <span className="text-[10px] font-bold uppercase bg-white/5 px-2 py-1 rounded text-text-dim border border-white/5">
                    {brands.find((b: any) => b.id === meter.brandId)?.label || meter.brandId}
                  </span>
                </td>
                <td className="p-5 text-[13px] font-mono text-text-dim">{meter.diameterId}</td>
                <td className="p-5">
                  <span className={cn(
                    "px-2 py-1 rounded text-[9px] font-bold tracking-widest uppercase border",
                    meter.status === 'EN_STOCK' ? "bg-success/10 text-success border-success/20" : "bg-danger/10 text-danger border-danger/20"
                  )}>
                    {meter.status?.replace('_', ' ')}
                  </span>
                </td>
                <td className="p-5 text-[13px] text-text-primary">{stores.find((s: any) => s.id === meter.currentStoreId)?.label || 'Client / Sorti'}</td>
                <td className="p-5 text-[11px] font-mono text-text-dim">{meter.lastMovementDate?.toDate().toLocaleString() || '--'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="p-6 border-t border-border-main bg-bg-card flex items-center justify-between">
          <div className="text-[11px] text-text-dim">
            Page {currentPage}/{totalPages} — {startIndex + 1}-{Math.min(endIndex, filteredAndSortedMeters.length)} sur {filteredAndSortedMeters.length} compteurs
          </div>
          
          <div className="flex items-center gap-2">
            {/* Aller au début */}
            <button
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              className="px-3 py-2 text-[10px] font-bold uppercase tracking-widest border border-border-main rounded-lg disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/5 transition-all flex items-center gap-1"
              title="Première page"
            >
              <span className="text-[12px]">«</span>
              <span>Début</span>
            </button>

            {/* Page précédente */}
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-3 py-2 text-[10px] font-bold uppercase tracking-widest border border-border-main rounded-lg disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/5 transition-all"
            >
              ← Préc.
            </button>

            {/* Boutons de pages */}
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(7, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 7) {
                  pageNum = i + 1;
                } else if (currentPage <= 4) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 3) {
                  pageNum = totalPages - 6 + i;
                } else {
                  pageNum = currentPage - 3 + i;
                }

                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={cn(
                      "w-10 h-10 text-[11px] font-bold rounded-lg border transition-all",
                      currentPage === pageNum
                        ? "bg-accent text-white border-accent shadow-lg shadow-accent/20 scale-105"
                        : "border-border-main hover:bg-white/5 hover:border-accent/50"
                    )}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            {/* Page suivante */}
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-2 text-[10px] font-bold uppercase tracking-widest border border-border-main rounded-lg disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/5 transition-all"
            >
              Suiv. →
            </button>

            {/* Aller à la fin */}
            <button
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
              className="px-3 py-2 text-[10px] font-bold uppercase tracking-widest border border-border-main rounded-lg disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/5 transition-all flex items-center gap-1"
              title="Dernière page"
            >
              <span>Fin</span>
              <span className="text-[12px]">»</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function MeterDetailView({ meter, movements = [], stores = [], brands = [] }: any) {
  if (!meter) return null;

  const meterHistory = useMemo(() => {
    return movements.filter((mvt: any) => {
      // Check denormalized field we added earlier
      if (mvt.meterSerialNumbers && Array.isArray(mvt.meterSerialNumbers)) {
        return mvt.meterSerialNumbers.includes(meter.serialNumber);
      }
      return false;
    });
  }, [meter, movements]);

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 gap-8">
        <div className="space-y-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-text-dim">Informations Techniques</p>
          <div className="space-y-2">
            <div className="flex justify-between py-2 border-b border-border-main">
              <span className="text-xs text-text-dim">Marque</span>
              <span className="text-sm font-bold text-text-primary uppercase tracking-tight">
                {brands.find((b: any) => b.id === meter.brandId)?.label || meter.brandId || 'Inconnue'}
              </span>
            </div>
            <div className="flex justify-between py-2 border-b border-border-main">
              <span className="text-xs text-text-dim">Diamètre</span>
              <span className="text-sm font-mono text-accent">{meter.diameterId}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-border-main">
              <span className="text-xs text-text-dim">Statut Actuel</span>
              <span className="text-sm px-2 py-0.5 rounded bg-accent/5 text-accent font-bold uppercase text-[10px]">
                {meter.status?.replace('_', ' ')}
              </span>
            </div>
            <div className="flex justify-between py-2 border-b border-border-main">
              <span className="text-xs text-text-dim">Emplacement</span>
              <span className="text-sm text-text-primary italic font-serif">
                {stores.find((s: any) => s.id === meter.currentStoreId)?.label || 'Client / Sorti'}
              </span>
            </div>
          </div>
        </div>
        <div className="bg-white/2 rounded-xl p-6 border border-border-main flex flex-col justify-center items-center text-center">
          <Package className="text-accent mb-3 opacity-30" size={32} />
          <p className="text-[10px] font-bold uppercase tracking-widest text-text-dim">Numéro de Série</p>
          <p className="text-2xl font-bold tracking-tighter text-text-primary font-mono">{meter.serialNumber}</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-end">
          <p className="text-[10px] font-bold uppercase tracking-widest text-text-dim">Historique des Mouvements</p>
          <span className="text-[10px] text-accent font-mono uppercase tracking-tighter bg-accent/10 px-2 py-0.5 rounded">
            {meterHistory.length} Opérations
          </span>
        </div>
        <div className="border border-border-main rounded-xl overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-bg-sidebar">
              <tr className="text-[10px] font-bold uppercase tracking-widest text-text-dim border-b border-border-main">
                <th className="px-5 py-4">Date</th>
                <th className="px-5 py-4">Opération</th>
                <th className="px-5 py-4">Destination / Source</th>
                <th className="px-5 py-4">Réf Doc</th>
              </tr>
            </thead>
            <tbody>
              {meterHistory.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-10 text-center text-text-dim/40 italic text-xs">Aucun mouvement enregistré pour ce compteur.</td>
                </tr>
              ) : (
                meterHistory.map((mvt: any) => (
                  <tr key={mvt.id} className="border-b border-border-main hover:bg-white/2 transition-colors">
                    <td className="px-5 py-4 font-mono text-[10px] text-text-dim">{mvt.date?.toDate().toLocaleDateString()}</td>
                    <td className="px-5 py-4">
                      <span className="text-[11px] font-bold text-text-primary uppercase tracking-tight">{mvt.typeId}</span>
                    </td>
                    <td className="px-5 py-4 text-xs text-text-dim leading-tight">
                      <div>
                        <p className="text-text-primary">Arrivée: {stores.find((s: any) => s.id === mvt.destStoreId)?.label || 'Vente/Pose'}</p>
                        <p className="text-[9px] opacity-60">
                        Source: {
                          stores.find((s: any) => s.id === mvt.sourceStoreId)?.label || 
                          'Fournisseur'
                        }
                      </p>
                      </div>
                    </td>
                    <td className="px-5 py-4 font-mono text-[10px] text-text-dim">{mvt.fileNumber || mvt.deliveryNote || '--'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function AdminView() {
  const [activeSection, setActiveSection] = useState<'main' | 'suppliers' | 'locations' | 'stores'>('main');

  return (
    <div className="bg-bg-card min-h-[600px] flex flex-col">
      <div className="p-8 border-b border-border-main bg-white/2 flex justify-between items-center">
        <div>
          <h3 className="text-xl font-bold uppercase tracking-widest text-text-primary">
            {activeSection === 'main' && "Paramètres Système"}
            {activeSection === 'suppliers' && "Gestion des Fournisseurs"}
            {activeSection === 'locations' && "Gestion des Lieux (Agences/Antennes)"}
            {activeSection === 'stores' && "Gestion des Magasins"}
          </h3>
          {activeSection === 'main' && (
            <p className="text-[10px] text-text-dim uppercase tracking-widest mt-1">Structure et référentiels</p>
          )}
        </div>
        {activeSection !== 'main' && (
          <button 
            onClick={() => setActiveSection('main')}
            className="text-[10px] font-bold uppercase tracking-widest text-accent hover:underline flex items-center gap-2"
          >
            ← Retour
          </button>
        )}
      </div>

      <div className="flex-1 p-8">
        {activeSection === 'main' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AdminCard 
              label="Agences & Antennes" 
              desc="Hiérarchie de l'entreprise" 
              onClick={() => setActiveSection('locations')}
              icon={<Building2 size={20} />} 
              isAction
            />
            <AdminCard 
              label="Magasins" 
              desc="Points de stockage physiques" 
              onClick={() => setActiveSection('stores')}
              icon={<Warehouse size={20} />}
              isAction
            />
            <AdminCard 
              label="Fournisseurs" 
              desc="Répertoire des partenaires" 
              onClick={() => setActiveSection('suppliers')}
              icon={<Users size={20} />} 
              isAction
            />
            <AdminCard label="Référentiels" desc="Marques et Diamètres" />
            <AdminCard label="Alertes" desc="Configuration des seuils critiques" />
          </div>
        )}

        {activeSection === 'suppliers' && <SuppliersManager />}
        {activeSection === 'locations' && <LocationsManager />}
        {activeSection === 'stores' && <StoresManager />}
      </div>
    </div>
  );
}

function SuppliersManager() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'suppliers'), (snap) => {
      setSuppliers(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Supplier)));
    });
    return () => unsub();
  }, []);

  const handleDelete = async (id: string) => {
    const result = await Swal.fire({
      ...alertTheme,
      title: 'Confirmer la suppression',
      text: 'Voulez-vous vraiment supprimer ce fournisseur ?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Supprimer',
      cancelButtonText: 'Annuler'
    });

    if (result.isConfirmed) {
      try {
        const { deleteDoc, doc } = await import('firebase/firestore');
        await deleteDoc(doc(db, 'suppliers', id));
        Toast.fire({ icon: 'success', title: 'Fournisseur supprimé' });
      } catch (e) {
        Swal.fire({ ...alertTheme, icon: 'error', title: 'Erreur', text: 'Impossible de supprimer' });
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h4 className="text-sm font-bold uppercase tracking-widest text-text-dim">Tous les fournisseurs</h4>
        <button 
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2 bg-accent/10 text-accent px-4 py-2 rounded-lg border border-accent/20 hover:bg-accent/20 transition-all text-[10px] font-bold uppercase tracking-widest"
        >
          <Plus size={14} /> Ajouter un fournisseur
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {suppliers.map(s => (
          <div key={s.id} className="bg-bg-primary border border-border-main p-6 rounded-xl hover:border-accent/50 transition-all space-y-4">
            <div className="flex justify-between items-start">
              <div className="bg-accent/5 p-3 rounded-lg text-accent">
                <Users size={24} />
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => { setEditingSupplier(s); setShowAddForm(true); }}
                  className="p-2 hover:bg-white/5 rounded-lg text-text-dim hover:text-accent transition-all"
                >
                  <Settings size={14} />
                </button>
                <button 
                  onClick={() => handleDelete(s.id)}
                  className="p-2 hover:bg-white/5 rounded-lg text-text-dim hover:text-danger transition-all"
                >
                  <X size={14} />
                </button>
              </div>
            </div>
            <div>
              <h5 className="font-bold text-text-primary text-sm tracking-tight">{s.name}</h5>
              <p className="text-[10px] font-mono text-accent uppercase">{s.code}</p>
            </div>
            <div className="space-y-1">
              {s.email && <p className="text-[10px] text-text-dim flex items-center gap-2">📧 {s.email}</p>}
              {s.phone && <p className="text-[10px] text-text-dim flex items-center gap-2">📞 {s.phone}</p>}
            </div>
          </div>
        ))}
      </div>

      <AnimatePresence>
        {showAddForm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-bg-primary/80 backdrop-blur-md p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-bg-card border border-border-main rounded-2xl w-full max-w-md overflow-hidden shadow-2xl"
            >
              <div className="p-6 border-b border-border-main bg-white/2 flex justify-between items-center">
                <h3 className="font-bold uppercase tracking-widest text-xs text-text-primary">
                  {editingSupplier ? 'Modifier le fournisseur' : 'Nouveau Fournisseur'}
                </h3>
                <button onClick={() => { setShowAddForm(false); setEditingSupplier(null); }} className="text-text-dim hover:text-accent"><X size={18} /></button>
              </div>
              <SupplierForm 
                initial={editingSupplier} 
                onClose={() => { setShowAddForm(false); setEditingSupplier(null); }} 
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function SupplierForm({ initial, onClose }: { initial: Supplier | null, onClose: () => void }) {
  const [formData, setFormData] = useState({
    name: initial?.name || '',
    code: initial?.code || '',
    contact: initial?.contact || '',
    phone: initial?.phone || '',
    email: initial?.email || '',
    address: initial?.address || ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { setDoc, doc, collection, addDoc, updateDoc } = await import('firebase/firestore');
      
      if (initial) {
        await updateDoc(doc(db, 'suppliers', initial.id), formData);
        Toast.fire({ icon: 'success', title: 'Fournisseur mis à jour' });
      } else {
        await addDoc(collection(db, 'suppliers'), {
          ...formData,
          createdAt: new Date()
        });
        Toast.fire({ icon: 'success', title: 'Fournisseur ajouté' });
      }
      onClose();
    } catch (e) {
      Swal.fire({ ...alertTheme, icon: 'error', title: 'Erreur', text: 'Impossible d\'enregistrer' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-4">
      <FormGroup label="Nom du Fournisseur">
        <input 
          type="text" 
          required
          value={formData.name}
          onChange={e => setFormData({ ...formData, name: e.target.value })}
          className="w-full bg-bg-primary border border-border-main rounded-lg p-3 text-sm text-text-primary focus:border-accent outline-none"
        />
      </FormGroup>
      <div className="grid grid-cols-2 gap-4">
        <FormGroup label="Code">
          <input 
            type="text" 
            required
            placeholder="Ex: FRN-001"
            value={formData.code}
            onChange={e => setFormData({ ...formData, code: e.target.value })}
            className="w-full bg-bg-primary border border-border-main rounded-lg p-3 text-sm text-text-primary focus:border-accent outline-none"
          />
        </FormGroup>
        <FormGroup label="Téléphone">
          <input 
            type="text" 
            value={formData.phone}
            onChange={e => setFormData({ ...formData, phone: e.target.value })}
            className="w-full bg-bg-primary border border-border-main rounded-lg p-3 text-sm text-text-primary focus:border-accent outline-none"
          />
        </FormGroup>
      </div>
      <FormGroup label="Email">
        <input 
          type="email" 
          value={formData.email}
          onChange={e => setFormData({ ...formData, email: e.target.value })}
          className="w-full bg-bg-primary border border-border-main rounded-lg p-3 text-sm text-text-primary focus:border-accent outline-none"
        />
      </FormGroup>
      <FormGroup label="Contact interne">
        <input 
          type="text" 
          value={formData.contact}
          onChange={e => setFormData({ ...formData, contact: e.target.value })}
          className="w-full bg-bg-primary border border-border-main rounded-lg p-3 text-sm text-text-primary focus:border-accent outline-none"
        />
      </FormGroup>
      <FormGroup label="Adresse">
        <textarea 
          value={formData.address}
          onChange={e => setFormData({ ...formData, address: e.target.value })}
          className="w-full bg-bg-primary border border-border-main rounded-lg p-3 text-sm h-20 text-text-primary focus:border-accent outline-none resize-none"
        ></textarea>
      </FormGroup>

      <button 
        type="submit" 
        disabled={loading}
        className="w-full bg-accent text-bg-primary font-bold uppercase tracking-widest py-3 rounded-lg hover:opacity-90 disabled:opacity-50 transition-all shadow-lg mt-4"
      >
        {loading ? 'Traitement...' : 'Enregistrer'}
      </button>
    </form>
  );
}

function NewMovementForm({ onClose, stores, agencies, diameters, suppliers }: any) {
  const [direction, setDirection] = useState<'ENTREE' | 'SORTIE'>('ENTREE');
  const [type, setType] = useState('APPRO');
  const [sourceStoreId, setSourceStoreId] = useState('');
  const [destStoreId, setDestStoreId] = useState('');
  const [supplierId, setSupplierId] = useState('');
  const [approSource, setApproSource] = useState<'SUPPLIER' | 'STORE'>('SUPPLIER');
  const [deliveryNote, setDeliveryNote] = useState('');
  const [movementDate, setMovementDate] = useState(new Date().toISOString().split('T')[0]);
  const [serialNumber, setSerialNumber] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [diameterId, setDiameterId] = useState('');
  const [observation, setObservation] = useState('');
  const [loading, setLoading] = useState(false);

  // Mettre à jour le type par défaut quand la direction change
  useEffect(() => {
    if (direction === 'ENTREE') {
      setType('APPRO');
    } else {
      setType('REINTEGRATION');
    }
  }, [direction]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    setLoading(true);
    try {
      const { createMovement } = await import('./services/stockService');
      const { doc, getDoc, setDoc, collection, query, where, limit, getDocs } = await import('firebase/firestore');

      const meterIds: string[] = [];
      const baseSerial = serialNumber.trim();
      
      // Si aucun numéro de série fourni, générer des numéros automatiques
      if (!baseSerial) {
        for (let i = 0; i < quantity; i++) {
          const autoSerial = `${diameterId}_${Date.now()}_${i + 1}`;
          
          await setDoc(doc(db, 'meters', autoSerial), {
            serialNumber: autoSerial,
            diameterId,
            brandId: 'DEFAULT',
            status: 'EN_STOCK',
            currentStoreId: null
          });
          
          meterIds.push(autoSerial);
        }
      } else {
        // Utiliser le numéro de série fourni
        for (let i = 0; i < quantity; i++) {
          let currentSerial = baseSerial;
          
          if (i > 0) {
            // Increment logic for batch serials
            const match = baseSerial.match(/^(.*?)(\d+)$/);
            if (match) {
              const prefix = match[1];
              const numStr = match[2];
              const num = parseInt(numStr);
              const length = numStr.length;
              currentSerial = prefix + (num + i).toString().padStart(length, '0');
            } else {
              currentSerial = `${baseSerial}_${i + 1}`;
            }
          }

          const meterRef = doc(db, 'meters', currentSerial);
          const meterSnap = await getDoc(meterRef);

          // Si le compteur n'existe pas, le créer
          if (!meterSnap.exists()) {
            await setDoc(meterRef, {
              serialNumber: currentSerial,
              diameterId,
              brandId: 'DEFAULT',
              status: 'EN_STOCK',
              currentStoreId: null
            });
          }
          meterIds.push(currentSerial);
        }
      }

      // Préparer la provenance pour l'observation
      let provenanceText = '';
      let finalSourceStoreId = sourceStoreId;
      
      // Pour les approvisionnements depuis un magasin de l'unité (ENTRÉE)
      if (direction === 'ENTREE' && approSource === 'STORE' && sourceStoreId) {
        const sourceStore = stores.find((s: any) => s.id === sourceStoreId);
        if (sourceStore) {
          provenanceText = sourceStore.label;
          finalSourceStoreId = sourceStoreId;
        }
      }
      // Pour les SORTIES
      else if (direction === 'SORTIE' && sourceStoreId) {
        const sourceStore = stores.find((s: any) => s.id === sourceStoreId);
        if (sourceStore) {
          provenanceText = sourceStore.label;
        }
      }
      // Si la destination est une antenne, la source est automatiquement son agence parente
      else if (direction === 'ENTREE' && destStoreId) {
        const destStore = stores.find((s: any) => s.id === destStoreId);
        if (destStore && destStore.type === 'ANTENNE' && destStore.agencyId) {
          const parentAgency = stores.find((s: any) => s.id === destStore.agencyId);
          if (parentAgency) {
            finalSourceStoreId = parentAgency.id;
            provenanceText = parentAgency.label;
          }
        }
      }

      // Validation: vérifier la disponibilité du stock
      if (finalSourceStoreId && (direction === 'SORTIE' || (direction === 'ENTREE' && approSource === 'STORE'))) {
        // Pour les sorties ou entrée depuis magasin, vérifier le stock de la source
        const stockByDiameter: Record<string, number> = {};
        
        // Récupérer les compteurs disponibles dans le magasin source
        const metersQuery = query(
          collection(db, 'meters'),
          where('currentStoreId', '==', finalSourceStoreId),
          where('status', '==', 'EN_STOCK')
        );
        
        const metersSnapshot = await getDocs(metersQuery);
        
        // Compter par diamètre
        metersSnapshot.forEach((doc) => {
          const data = doc.data();
          const diam = data.diameterId;
          stockByDiameter[diam] = (stockByDiameter[diam] || 0) + 1;
        });

        // Vérifier si la quantité demandée est disponible pour le diamètre sélectionné
        const availableStock = stockByDiameter[diameterId] || 0;
        
        if (availableStock < quantity) {
          const sourceStore = stores.find((s: any) => s.id === finalSourceStoreId);
          Toast.fire({
            icon: 'error',
            title: 'Stock insuffisant',
            html: `
              <div class="text-left">
                <p><strong>${sourceStore?.label || 'Source'}</strong></p>
                <p>Diamètre: <strong>${diameters.find(d => d.id === diameterId)?.value || diameterId}</strong></p>
                <p>Stock disponible: <strong style="color: #EF4444;">${availableStock}</strong></p>
                <p>Quantité demandée: <strong style="color: #F59E0B;">${quantity}</strong></p>
              </div>
            `
          });
          setLoading(false);
          return;
        }
      }

      // Validation: vérifier que le N° de Bon est renseigné
      if (!deliveryNote.trim()) {
        Toast.fire({
          icon: 'warning',
          title: 'Champ obligatoire',
          text: 'Veuillez saisir le numéro de bon'
        });
        setLoading(false);
        return;
      }

      // Validation: vérifier que la date est renseignée
      if (!movementDate) {
        Toast.fire({
          icon: 'warning',
          title: 'Champ obligatoire',
          text: 'Veuillez saisir la date du mouvement'
        });
        setLoading(false);
        return;
      }

      await createMovement({
        typeId: direction === 'ENTREE' ? 'APPRO' : 'REINTEGRATION',
        sourceStoreId: finalSourceStoreId || undefined,
        destStoreId: direction === 'ENTREE' ? (destStoreId || undefined) : undefined,
        supplierId: direction === 'ENTREE' && approSource === 'SUPPLIER' ? (supplierId || undefined) : undefined,
        deliveryNote: deliveryNote.trim(),
        observation: provenanceText ? `[Provenance: ${provenanceText}] ${observation}` : observation,
        createdBy: 'Admin'
      }, meterIds);

      Toast.fire({
        icon: 'success',
        title: 'Mouvement enregistré avec succès'
      });
      onClose();
    } catch (error) {
      console.error(error);
      Swal.fire({
        ...alertTheme,
        icon: 'error',
        title: 'Erreur',
        text: "Erreur lors de la création du mouvement",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Direction Selection */}
      <div className="grid grid-cols-1 gap-6">
        <FormGroup label="Direction de l'opération">
          <div className="flex gap-4">
            <label className="flex-1 cursor-pointer">
              <input 
                type="radio" 
                name="direction" 
                value="ENTREE" 
                checked={direction === 'ENTREE'}
                onChange={(e) => setDirection(e.target.value as 'ENTREE' | 'SORTIE')}
                className="hidden"
              />
              <div className={cn(
                "p-4 rounded-lg border-2 transition-all",
                direction === 'ENTREE' 
                  ? "border-success bg-success/5" 
                  : "border-border-main bg-bg-primary hover:border-success/30"
              )}>
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-4 h-4 rounded-full border-2 flex items-center justify-center",
                    direction === 'ENTREE' ? "border-success" : "border-border-main"
                  )}>
                    {direction === 'ENTREE' && (
                      <div className="w-2 h-2 rounded-full bg-success"></div>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-text-primary">📥 Réception (Entrée)</p>
                    <p className="text-[10px] text-text-dim">Approvisionnement, Transfert reçu</p>
                  </div>
                </div>
              </div>
            </label>

            <label className="flex-1 cursor-pointer">
              <input 
                type="radio" 
                name="direction" 
                value="SORTIE" 
                checked={direction === 'SORTIE'}
                onChange={(e) => setDirection(e.target.value as 'ENTREE' | 'SORTIE')}
                className="hidden"
              />
              <div className={cn(
                "p-4 rounded-lg border-2 transition-all",
                direction === 'SORTIE' 
                  ? "border-danger bg-danger/5" 
                  : "border-border-main bg-bg-primary hover:border-danger/30"
              )}>
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-4 h-4 rounded-full border-2 flex items-center justify-center",
                    direction === 'SORTIE' ? "border-danger" : "border-border-main"
                  )}>
                    {direction === 'SORTIE' && (
                      <div className="w-2 h-2 rounded-full bg-danger"></div>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-text-primary">📤 Réintégration (Sortie)</p>
                    <p className="text-[10px] text-text-dim">Retour fournisseur, Vente, Branchement</p>
                  </div>
                </div>
              </div>
            </label>
          </div>
        </FormGroup>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <FormGroup label="Direction">
          <div className="flex items-center gap-2 p-3 bg-bg-primary border border-border-main rounded-lg">
            {direction === 'ENTREE' ? (
              <>
                <span className="text-success text-lg">📥</span>
                <span className="text-sm font-bold text-success">ENTRÉE (Réception)</span>
              </>
            ) : (
              <>
                <span className="text-danger text-lg">📤</span>
                <span className="text-sm font-bold text-danger">SORTIE (Réintégration)</span>
              </>
            )}
          </div>
        </FormGroup>
        
        <FormGroup label="Diamètre">
          <select 
            value={diameterId} 
            onChange={(e) => setDiameterId(e.target.value)}
            className="w-full bg-bg-primary border border-border-main rounded-lg p-3 text-sm text-text-primary focus:border-accent outline-none"
            required
          >
            <option value="">Sélectionner...</option>
            {diameters.map((d: any) => <option key={d.id} value={d.id}>{d.value}</option>)}
          </select>
        </FormGroup>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <FormGroup label="N° de Bon">
          <input 
            type="text" 
            value={deliveryNote}
            onChange={(e) => setDeliveryNote(e.target.value)}
            placeholder="Ex: BL-2024-001"
            className="w-full bg-bg-primary border border-border-main rounded-lg p-3 text-sm font-mono text-text-primary focus:border-accent outline-none"
            required
          />
        </FormGroup>

        <FormGroup label="Date du mouvement">
          <input 
            type="date" 
            value={movementDate}
            onChange={(e) => setMovementDate(e.target.value)}
            className="w-full bg-bg-primary border border-border-main rounded-lg p-3 text-sm text-text-primary focus:border-accent outline-none"
            required
          />
        </FormGroup>
      </div>

      {direction === 'ENTREE' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-6">
            <FormGroup label="Type d'approvisionnement">
              <div className="flex gap-4">
                <label className="flex-1 cursor-pointer">
                  <input 
                    type="radio" 
                    name="approSource" 
                    value="SUPPLIER" 
                    checked={approSource === 'SUPPLIER'}
                    onChange={(e) => setApproSource(e.target.value as 'SUPPLIER' | 'STORE')}
                    className="hidden"
                  />
                  <div className={cn(
                    "p-4 rounded-lg border-2 transition-all",
                    approSource === 'SUPPLIER' 
                      ? "border-accent bg-accent/5" 
                      : "border-border-main bg-bg-primary hover:border-accent/30"
                  )}>
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-4 h-4 rounded-full border-2 flex items-center justify-center",
                        approSource === 'SUPPLIER' ? "border-accent" : "border-border-main"
                      )}>
                        {approSource === 'SUPPLIER' && (
                          <div className="w-2 h-2 rounded-full bg-accent"></div>
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-text-primary">Fournisseur Externe</p>
                        <p className="text-[10px] text-text-dim">Approvisionnement depuis un fournisseur</p>
                      </div>
                    </div>
                  </div>
                </label>

                <label className="flex-1 cursor-pointer">
                  <input 
                    type="radio" 
                    name="approSource" 
                    value="STORE" 
                    checked={approSource === 'STORE'}
                    onChange={(e) => setApproSource(e.target.value as 'SUPPLIER' | 'STORE')}
                    className="hidden"
                  />
                  <div className={cn(
                    "p-4 rounded-lg border-2 transition-all",
                    approSource === 'STORE' 
                      ? "border-accent bg-accent/5" 
                      : "border-border-main bg-bg-primary hover:border-accent/30"
                  )}>
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-4 h-4 rounded-full border-2 flex items-center justify-center",
                        approSource === 'STORE' ? "border-accent" : "border-border-main"
                      )}>
                        {approSource === 'STORE' && (
                          <div className="w-2 h-2 rounded-full bg-accent"></div>
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-text-primary">Magasin de l'Unité</p>
                        <p className="text-[10px] text-text-dim">Transfert depuis magasin principal</p>
                      </div>
                    </div>
                  </div>
                </label>
              </div>
            </FormGroup>
          </div>

          {approSource === 'SUPPLIER' && (
            <div className="grid grid-cols-1 gap-6">
              <FormGroup label="Fournisseur">
                <select 
                  value={supplierId} 
                  onChange={(e) => setSupplierId(e.target.value)}
                  className="w-full bg-bg-primary border border-border-main rounded-lg p-3 text-sm text-text-primary focus:border-accent outline-none"
                  required
                >
                  <option value="">Sélectionner un fournisseur...</option>
                  {suppliers.map((s: any) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.code}){s.contact ? ` - ${s.contact}` : ''}
                    </option>
                  ))}
                </select>
                {suppliers.length === 0 && (
                  <p className="text-[10px] text-danger/70 mt-1">
                    ⚠️ Aucun fournisseur configuré. Veuillez ajouter un fournisseur dans l'administration.
                  </p>
                )}
              </FormGroup>
            </div>
          )}

          {approSource === 'STORE' && (
            <div className="grid grid-cols-1 gap-6">
              <FormGroup label="Magasin source (Unité principale)">
                <select 
                  value={sourceStoreId} 
                  onChange={(e) => setSourceStoreId(e.target.value)}
                  className="w-full bg-bg-primary border border-border-main rounded-lg p-3 text-sm text-text-primary focus:border-accent outline-none"
                  required
                >
                  <option value="">Sélectionner un magasin...</option>
                  {stores.filter((s: any) => s.type === 'UNITE' || s.type === 'AGENCE').map((s: any) => (
                    <option key={s.id} value={s.id}>
                      🏢 {s.label} ({s.code})
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-accent/70 mt-1">
                  ℹ️ Les compteurs seront débités de ce magasin et crédités à la destination
                </p>
              </FormGroup>
            </div>
          )}
        </div>
      )}

      {direction === 'SORTIE' && (
        <div className="grid grid-cols-1 gap-6">
          <FormGroup label="Magasin source (à débiter)">
            <select 
              value={sourceStoreId} 
              onChange={(e) => setSourceStoreId(e.target.value)}
              className="w-full bg-bg-primary border border-border-main rounded-lg p-3 text-sm text-text-primary focus:border-accent outline-none"
              required
            >
              <option value="">Sélectionner le magasin source...</option>
              {stores.filter((s: any) => s.type === 'AGENCE' || s.type === 'ANTENNE' || s.type === 'UNITE').map((s: any) => (
                <option key={s.id} value={s.id}>
                  🏢 {s.label} ({s.code})
                </option>
              ))}
            </select>
            <p className="text-[10px] text-accent/70 mt-1">
              ℹ️ Les compteurs seront débités de ce magasin
            </p>
          </FormGroup>
        </div>
      )}

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2">
          <FormGroup label="N° de Série (ou Début de série)">
            <input 
              type="text" 
              value={serialNumber}
              onChange={(e) => setSerialNumber(e.target.value)}
              placeholder="Identification du compteur (optionnel)"
              className="w-full bg-bg-primary border border-border-main rounded-lg p-3 text-sm font-mono text-text-primary focus:border-accent outline-none"
            />
          </FormGroup>
        </div>
        <div>
          <FormGroup label="Quantité">
            <input 
              type="number" 
              min="1"
              max="500"
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-full bg-bg-primary border border-border-main rounded-lg p-3 text-sm text-text-primary focus:border-accent outline-none"
              required
            />
          </FormGroup>
        </div>
      </div>

      {direction === 'ENTREE' && (
        <div className="grid grid-cols-1 gap-6">
          <FormGroup label="Destination">
            <select 
              value={destStoreId} 
              onChange={(e) => setDestStoreId(e.target.value)}
              className="w-full bg-bg-primary border border-border-main rounded-lg p-3 text-sm text-text-primary focus:border-accent outline-none"
              required
            >
              <option value="">Sélectionner une destination...</option>
              <optgroup label="Agences Commerciales">
                {stores.filter((s: any) => s.type === 'AGENCE').map((s: any) => (
                  <option key={s.id} value={s.id}>
                    🏢 {s.label} ({s.code})
                  </option>
                ))}
              </optgroup>
              <optgroup label="Antennes">
                {stores.filter((s: any) => s.type === 'ANTENNE').map((s: any) => (
                  <option key={s.id} value={s.id}>
                    📍 {s.label} ({s.code})
                  </option>
                ))}
              </optgroup>
            </select>
            {type === 'APPRO' && destStoreId && stores.find((s: any) => s.id === destStoreId)?.type === 'AGENCE' && (
              <p className="text-[10px] text-accent/70 mt-1">
                ℹ️ Approvisionnement depuis un fournisseur vers le magasin de l'agence
              </p>
            )}
            {type === 'APPRO' && destStoreId && stores.find((s: any) => s.id === destStoreId)?.type === 'ANTENNE' && (
              <p className="text-[10px] text-accent/70 mt-1">
                ℹ️ Transfert automatique depuis l'agence parente vers cette antenne
              </p>
            )}
            {direction === 'ENTREE' && destStoreId && (
              <p className="text-[10px] text-accent/70 mt-1">
                ℹ️ Transfert reçu dans cette destination
              </p>
            )}
          </FormGroup>
        </div>
      )}

      <FormGroup label="Note de mouvement">
        <textarea 
          value={observation}
          onChange={(e) => setObservation(e.target.value)}
          placeholder="Informations complémentaires..."
          className="w-full bg-bg-primary border border-border-main rounded-lg p-3 text-sm h-24 resize-none text-text-primary focus:border-accent outline-none"
        ></textarea>
      </FormGroup>

      <button 
        type="submit" 
        disabled={loading}
        className="w-full bg-accent text-bg-primary font-bold uppercase tracking-[0.2em] py-4 rounded-lg hover:opacity-90 disabled:opacity-50 transition-all shadow-lg"
      >
        {loading ? 'Finalisation...' : 'Enregistrer le mouvement'}
      </button>
    </form>
  );
}

function FormGroup({ label, children }: any) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] font-bold uppercase tracking-widest text-text-dim">{label}</label>
      {children}
    </div>
  );
}

function AdminCard({ label, desc, onClick, icon, isAction }: any) {
  return (
    <div 
      onClick={onClick}
      className={cn(
        "bg-bg-primary border border-border-main p-8 hover:border-accent group transition-all rounded-lg text-left relative overflow-hidden",
        isAction && "cursor-pointer"
      )}
    >
      {icon && <div className="text-accent mb-4 opacity-40 group-hover:opacity-100 transition-opacity">{icon}</div>}
      <h4 className="font-bold uppercase tracking-widest text-[11px] mb-2 text-text-primary group-hover:text-accent transition-colors">{label}</h4>
      <p className="text-xs text-text-dim font-serif italic">{desc}</p>
      {isAction && <div className="absolute bottom-4 right-4 text-accent opacity-0 group-hover:opacity-100 transition-all font-mono text-[10px]">GERER →</div>}
    </div>
  );
}

function LocationsManager() {
  const [activeTab, setActiveTab] = useState<'agencies' | 'antennes'>('agencies');
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [antennes, setAntennes] = useState<Branch[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  useEffect(() => {
    const unsubAgencies = onSnapshot(collection(db, 'agencies'), (snap) => {
      setAgencies(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Agency)));
    });
    const unsubAntennes = onSnapshot(collection(db, 'branches'), (snap) => {
      setAntennes(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Branch)));
    });
    return () => {
      unsubAgencies();
      unsubAntennes();
    };
  }, []);

  const handleDelete = async (id: string, collectionName: string) => {
    const result = await Swal.fire({
      ...alertTheme,
      title: 'Confirmer la suppression',
      text: 'Cette action est irréversible.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Supprimer',
      cancelButtonText: 'Annuler'
    });

    if (result.isConfirmed) {
      try {
        const { deleteDoc, doc } = await import('firebase/firestore');
        await deleteDoc(doc(db, collectionName, id));
        Toast.fire({ icon: 'success', title: 'Élément supprimé' });
      } catch (e) {
        Swal.fire({ ...alertTheme, icon: 'error', title: 'Erreur', text: 'Impossible de supprimer' });
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 border-b border-border-main">
        <button 
          onClick={() => setActiveTab('agencies')}
          className={cn(
            "pb-4 px-2 text-[10px] font-bold uppercase tracking-widest transition-all relative",
            activeTab === 'agencies' ? "text-accent" : "text-text-dim hover:text-text-primary"
          )}
        >
          Agences
          {activeTab === 'agencies' && <motion.div layoutId="locTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent" />}
        </button>
        <button 
          onClick={() => setActiveTab('antennes')}
          className={cn(
            "pb-4 px-2 text-[10px] font-bold uppercase tracking-widest transition-all relative",
            activeTab === 'antennes' ? "text-accent" : "text-text-dim hover:text-text-primary"
          )}
        >
          Antennes
          {activeTab === 'antennes' && <motion.div layoutId="locTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent" />}
        </button>
      </div>

      <div className="flex justify-between items-center">
        <h4 className="text-xs font-bold uppercase tracking-widest text-text-dim">
          Liste des {activeTab === 'agencies' ? 'Agences' : 'Antennes'}
        </h4>
        <button 
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2 bg-accent/10 text-accent px-4 py-2 rounded-lg border border-accent/20 hover:bg-accent/20 transition-all text-[10px] font-bold uppercase tracking-widest"
        >
          <Plus size={14} /> Ajouter
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {activeTab === 'agencies' && agencies.map(a => (
          <LocationCard 
            key={a.id} 
            title={a.label} 
            code={a.code} 
            subtitle={a.address || 'Adresse non renseignée'}
            onEdit={() => { setEditingItem(a); setShowAddForm(true); }}
            onDelete={() => handleDelete(a.id, 'agencies')}
            icon={<Building2 size={20} />}
          />
        ))}
        {activeTab === 'antennes' && antennes.map(b => (
          <LocationCard 
            key={b.id} 
            title={b.label} 
            code={b.code} 
            subtitle={
              <div className="flex flex-col gap-0.5">
                <span>Agence: {agencies.find(a => a.id === b.agencyId)?.label || 'N/A'}</span>
                <span className="italic text-accent/70 font-serif">Commune: {b.commune || 'Non renseignée'}</span>
              </div>
            }
            onEdit={() => { setEditingItem(b); setShowAddForm(true); }}
            onDelete={() => handleDelete(b.id, 'branches')}
            icon={<MapPin size={20} />}
          />
        ))}
      </div>

      <AnimatePresence>
        {showAddForm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-bg-primary/80 backdrop-blur-md p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-bg-card border border-border-main rounded-2xl w-full max-w-md overflow-hidden shadow-2xl"
            >
              <div className="p-6 border-b border-border-main bg-white/2 flex justify-between items-center">
                <h3 className="font-bold uppercase tracking-widest text-xs text-text-primary">
                  {editingItem ? 'Modifier' : 'Nouveau'} {activeTab === 'agencies' ? 'Agence' : 'Antenne'}
                </h3>
                <button onClick={() => { setShowAddForm(false); setEditingItem(null); }} className="text-text-dim hover:text-accent"><X size={18} /></button>
              </div>
              <LocationForm 
                type={activeTab}
                initial={editingItem} 
                onClose={() => { setShowAddForm(false); setEditingItem(null); }}
                agencies={agencies}
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function StoresManager() {
  const [stores, setStores] = useState<Store[]>([]);
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingStore, setEditingStore] = useState<Store | null>(null);

  useEffect(() => {
    const unsubStores = onSnapshot(collection(db, 'stores'), (snap) => {
      setStores(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Store)));
    });
    const unsubAgencies = onSnapshot(collection(db, 'agencies'), (snap) => {
      setAgencies(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Agency)));
    });
    return () => {
      unsubStores();
      unsubAgencies();
    };
  }, []);

  const handleDelete = async (id: string) => {
    const result = await Swal.fire({
      ...alertTheme,
      title: 'Confirmer la suppression',
      text: 'Voulez-vous vraiment supprimer ce magasin ?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Supprimer',
      cancelButtonText: 'Annuler'
    });

    if (result.isConfirmed) {
      try {
        const { deleteDoc, doc } = await import('firebase/firestore');
        await deleteDoc(doc(db, 'stores', id));
        Toast.fire({ icon: 'success', title: 'Magasin supprimé' });
      } catch (e) {
        Swal.fire({ ...alertTheme, icon: 'error', title: 'Erreur', text: 'Impossible de supprimer' });
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h4 className="text-sm font-bold uppercase tracking-widest text-text-dim">Tous les magasins</h4>
        <button 
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2 bg-accent/10 text-accent px-4 py-2 rounded-lg border border-accent/20 hover:bg-accent/20 transition-all text-[10px] font-bold uppercase tracking-widest"
        >
          <Plus size={14} /> Ajouter un magasin
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stores.map(s => (
          <div key={s.id} className="bg-bg-primary border border-border-main p-6 rounded-xl hover:border-accent/50 transition-all space-y-4">
            <div className="flex justify-between items-start">
              <div className="bg-accent/5 p-3 rounded-lg text-accent">
                <Warehouse size={24} />
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => { setEditingStore(s); setShowAddForm(true); }}
                  className="p-2 hover:bg-white/5 rounded-lg text-text-dim hover:text-accent transition-all"
                >
                  <Settings size={14} />
                </button>
                <button 
                  onClick={() => handleDelete(s.id)}
                  className="p-2 hover:bg-white/5 rounded-lg text-text-dim hover:text-danger transition-all"
                >
                  <X size={14} />
                </button>
              </div>
            </div>
            <div>
              <h5 className="font-bold text-text-primary text-sm tracking-tight">{s.label}</h5>
              <p className="text-[10px] font-mono text-accent uppercase">{s.code}</p>
              <div className="mt-3 space-y-1">
                <p className="text-[9px] text-text-dim uppercase tracking-widest">
                  Type: {s.type === 'AGENCE' ? 'Magasin Agence' : 'Magasin Antenne'}
                </p>
                {s.agencyId && (
                  <p className="text-[9px] text-accent/70 italic uppercase">
                    Rattaché à: {agencies.find(a => a.id === s.agencyId)?.label || 'Agence inconnue'}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <AnimatePresence>
        {showAddForm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-bg-primary/80 backdrop-blur-md p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-bg-card border border-border-main rounded-2xl w-full max-w-md overflow-hidden shadow-2xl"
            >
              <div className="p-6 border-b border-border-main bg-white/2 flex justify-between items-center">
                <h3 className="font-bold uppercase tracking-widest text-xs text-text-primary">
                  {editingStore ? 'Modifier le magasin' : 'Nouveau Magasin'}
                </h3>
                <button onClick={() => { setShowAddForm(false); setEditingStore(null); }} className="text-text-dim hover:text-accent"><X size={18} /></button>
              </div>
              <StoreForm 
                initial={editingStore} 
                agencies={agencies}
                onClose={() => { setShowAddForm(false); setEditingStore(null); }} 
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function StoreForm({ initial, agencies, onClose }: { initial: Store | null, agencies: Agency[], onClose: () => void }) {
  const [formData, setFormData] = useState({
    label: initial?.label || '',
    code: initial?.code || '',
    type: initial?.type || 'AGENCE',
    agencyId: initial?.agencyId || '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { setDoc, doc, collection, addDoc, updateDoc, serverTimestamp } = await import('firebase/firestore');
      
      const payload = {
        ...formData,
        agencyId: formData.type === 'AGENCE' ? formData.agencyId : null,
        updatedAt: serverTimestamp()
      };

      if (initial) {
        await updateDoc(doc(db, 'stores', initial.id), payload);
        Toast.fire({ icon: 'success', title: 'Magasin mis à jour' });
      } else {
        await addDoc(collection(db, 'stores'), {
          ...payload,
          createdAt: serverTimestamp()
        });
        Toast.fire({ icon: 'success', title: 'Magasin ajouté' });
      }
      onClose();
    } catch (e) {
      Swal.fire({ ...alertTheme, icon: 'error', title: 'Erreur', text: 'Impossible d\'enregistrer' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-4">
      <FormGroup label="Nom du Magasin">
        <input 
          type="text" 
          required
          value={formData.label}
          onChange={e => setFormData({ ...formData, label: e.target.value })}
          className="w-full bg-bg-primary border border-border-main rounded-lg p-3 text-sm text-text-primary focus:border-accent outline-none"
        />
      </FormGroup>
      <FormGroup label="Code Magasin">
        <input 
          type="text" 
          required
          value={formData.code}
          onChange={e => setFormData({ ...formData, code: e.target.value })}
          className="w-full bg-bg-primary border border-border-main rounded-lg p-3 text-sm text-text-primary focus:border-accent outline-none"
        />
      </FormGroup>
      <FormGroup label="Type de Magasin">
        <select 
          value={formData.type}
          onChange={e => setFormData({ ...formData, type: e.target.value as any })}
          className="w-full bg-bg-primary border border-border-main rounded-lg p-3 text-sm text-text-primary focus:border-accent outline-none"
        >
          <option value="AGENCE">Magasin Agence</option>
          <option value="ANTENNE">Magasin Antenne</option>
        </select>
      </FormGroup>
      
      {formData.type === 'AGENCE' && (
        <FormGroup label="Rattachement Agence">
          <select 
            value={formData.agencyId}
            onChange={e => setFormData({ ...formData, agencyId: e.target.value })}
            className="w-full bg-bg-primary border border-border-main rounded-lg p-3 text-sm text-text-primary focus:border-accent outline-none"
          >
            <option value="">Sélectionner une agence...</option>
            {agencies.map(a => <option key={a.id} value={a.id}>{a.label}</option>)}
          </select>
        </FormGroup>
      )}

      <button 
        type="submit" 
        disabled={loading}
        className="w-full bg-accent text-bg-primary font-bold uppercase tracking-widest py-3 rounded-lg hover:opacity-90 disabled:opacity-50 transition-all shadow-lg mt-4"
      >
        {loading ? 'Traitement...' : 'Enregistrer'}
      </button>
    </form>
  );
}

function LocationCard({ title, code, subtitle, icon, onEdit, onDelete }: any) {
  return (
    <div className="bg-bg-primary border border-border-main p-6 rounded-xl hover:border-accent/50 transition-all space-y-4">
      <div className="flex justify-between items-start">
        <div className="bg-accent/5 p-3 rounded-lg text-accent">
          {icon}
        </div>
        <div className="flex gap-2">
          <button onClick={onEdit} className="p-2 hover:bg-white/5 rounded-lg text-text-dim hover:text-accent transition-all">
            <Settings size={14} />
          </button>
          <button onClick={onDelete} className="p-2 hover:bg-white/5 rounded-lg text-text-dim hover:text-danger transition-all">
            <X size={14} />
          </button>
        </div>
      </div>
      <div>
        <h5 className="font-bold text-text-primary text-sm tracking-tight">{title}</h5>
        <p className="text-[10px] font-mono text-accent uppercase">{code}</p>
        {subtitle && <div className="text-[10px] text-text-dim mt-1">{subtitle}</div>}
      </div>
    </div>
  );
}

function LocationForm({ type, initial, onClose, agencies }: any) {
  const [formData, setFormData] = useState({
    label: initial?.label || '',
    code: initial?.code || '',
    agencyId: initial?.agencyId || '',
    commune: initial?.commune || '',
    address: initial?.address || ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { setDoc, doc, collection, addDoc, updateDoc, serverTimestamp } = await import('firebase/firestore');
      const collectionName = type === 'agencies' ? 'agencies' : 'branches';
      
      // Construire les données selon le type
      let dataToSave: any = {
        label: formData.label,
        code: formData.code,
        updatedAt: serverTimestamp()
      };

      // Ajouter les champs spécifiques selon le type
      if (type === 'agencies') {
        if (formData.address) dataToSave.address = formData.address;
      } else if (type === 'antennes') {
        dataToSave.agencyId = formData.agencyId;
        dataToSave.commune = formData.commune;
      }

      if (initial) {
        await updateDoc(doc(db, collectionName, initial.id), dataToSave);
        Toast.fire({ icon: 'success', title: 'Mis à jour avec succès' });
      } else {
        await addDoc(collection(db, collectionName), {
          ...dataToSave,
          createdAt: serverTimestamp()
        });
        Toast.fire({ icon: 'success', title: 'Ajouté avec succès' });
      }
      onClose();
    } catch (e) {
      console.error(e);
      Swal.fire({ ...alertTheme, icon: 'error', title: 'Erreur', text: 'Impossible d\'enregistrer' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-4">
      <FormGroup label="Libellé">
        <input 
          type="text" 
          required
          value={formData.label}
          onChange={e => setFormData({ ...formData, label: e.target.value })}
          className="w-full bg-bg-primary border border-border-main rounded-lg p-3 text-sm text-text-primary focus:border-accent outline-none"
        />
      </FormGroup>
      <FormGroup label="Code">
        <input 
          type="text" 
          required
          value={formData.code}
          onChange={e => setFormData({ ...formData, code: e.target.value })}
          className="w-full bg-bg-primary border border-border-main rounded-lg p-3 text-sm text-text-primary focus:border-accent outline-none"
        />
      </FormGroup>

      {type === 'antennes' && (
        <FormGroup label="Agence parente">
          <select 
            required
            value={formData.agencyId}
            onChange={e => setFormData({ ...formData, agencyId: e.target.value })}
            className="w-full bg-bg-primary border border-border-main rounded-lg p-3 text-sm text-text-primary focus:border-accent outline-none"
          >
            <option value="">Sélectionner une agence...</option>
            {agencies.map((a: any) => <option key={a.id} value={a.id}>{a.label}</option>)}
          </select>
        </FormGroup>
      )}

      {type === 'antennes' && (
        <FormGroup label="Commune">
          <input 
            type="text" 
            required
            value={formData.commune}
            onChange={e => setFormData({ ...formData, commune: e.target.value })}
            className="w-full bg-bg-primary border border-border-main rounded-lg p-3 text-sm text-text-primary focus:border-accent outline-none"
            placeholder="Nom de la commune"
          />
        </FormGroup>
      )}

      <FormGroup label="Adresse">
        <textarea 
          value={formData.address}
          onChange={e => setFormData({ ...formData, address: e.target.value })}
          className="w-full bg-bg-primary border border-border-main rounded-lg p-3 text-sm h-20 text-text-primary focus:border-accent outline-none resize-none"
        ></textarea>
      </FormGroup>

      <button 
        type="submit" 
        disabled={loading}
        className="w-full bg-accent text-bg-primary font-bold uppercase tracking-widest py-3 rounded-lg hover:opacity-90 disabled:opacity-50 transition-all shadow-lg mt-4"
      >
        {loading ? 'Traitement...' : 'Enregistrer'}
      </button>
    </form>
  );
}

