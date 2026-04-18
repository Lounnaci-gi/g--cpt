import React, { useState, useEffect } from 'react';
import { Database, Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { cn } from '../lib/utils';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

interface DBStatus {
  connected: boolean;
  name: string;
  server: string;
}

const DatabaseIndicator: React.FC = () => {
  const [status, setStatus] = useState<DBStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastCheck, setLastCheck] = useState<Date | null>(null);

  const checkConnection = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/health`);
      const data = await response.json();
      
      if (data.database) {
        setStatus(data.database);
      }
      
      setLastCheck(new Date());
    } catch (error) {
      setStatus({
        connected: false,
        name: 'H2OStockDB',
        server: 'localhost'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkConnection();
    
    // Vérifier toutes les 30 secondes
    const interval = setInterval(checkConnection, 30000);
    
    return () => clearInterval(interval);
  }, []);

  if (loading && !status) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 bg-water-100 rounded-lg">
        <RefreshCw className="w-4 h-4 text-water-400 animate-spin" />
        <span className="text-xs font-mono text-water-500">Connexion...</span>
      </div>
    );
  }

  if (!status) return null;

  return (
    <div className="flex items-center gap-3">
      <div className={cn(
        "flex items-center gap-2 px-3 py-2 rounded-lg border transition-all",
        status.connected 
          ? "bg-emerald-50 border-emerald-200" 
          : "bg-red-50 border-red-200"
      )}>
        {status.connected ? (
          <Wifi className="w-4 h-4 text-emerald-600" />
        ) : (
          <WifiOff className="w-4 h-4 text-red-600" />
        )}
        
        <Database className={cn(
          "w-4 h-4",
          status.connected ? "text-emerald-600" : "text-red-600"
        )} />
        
        <div className="flex flex-col">
          <span className={cn(
            "text-xs font-mono font-bold",
            status.connected ? "text-emerald-700" : "text-red-700"
          )}>
            {status.connected ? 'Connecté' : 'Déconnecté'}
          </span>
          <span className="text-[9px] font-mono text-water-500">
            {status.name} @ {status.server}
          </span>
        </div>
      </div>

      <button
        onClick={checkConnection}
        disabled={loading}
        className={cn(
          "p-2 rounded-lg border transition-all hover:scale-105",
          loading 
            ? "bg-water-100 border-water-200 cursor-not-allowed" 
            : "bg-white border-water-200 hover:bg-water-50"
        )}
        title="Vérifier la connexion"
      >
        <RefreshCw className={cn(
          "w-4 h-4",
          loading ? "animate-spin text-water-400" : "text-water-600"
        )} />
      </button>

      {lastCheck && (
        <span className="text-[9px] font-mono text-water-400">
          {lastCheck.toLocaleTimeString('fr-FR')}
        </span>
      )}
    </div>
  );
};

export default DatabaseIndicator;
