import { useState, useEffect } from 'react';
import { Share2, Check, Loader2, ExternalLink } from 'lucide-react';
import { cn } from '../lib/utils';
import { Task } from '../types';

interface GoogleSheetsSyncProps {
  tasks: Task[];
}

export default function GoogleSheetsSync({ tasks }: GoogleSheetsSyncProps) {
  const [isSyncing, setIsSyncing] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [spreadsheetUrl, setSpreadsheetUrl] = useState<string | null>(null);

  useEffect(() => {
    checkAuthStatus();
    
    // Listen for OAuth success message
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'OAUTH_AUTH_SUCCESS') {
        setIsAuthenticated(true);
        handleSync();
      }
    };
    
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [tasks]);

  const checkAuthStatus = async () => {
    try {
      const res = await fetch('/api/auth/status');
      const data = await res.json();
      setIsAuthenticated(data.isAuthenticated);
    } catch (err) {
      console.error('Failed to check auth status');
    }
  };

  const handleSync = async () => {
    if (!isAuthenticated) {
      try {
        const res = await fetch('/api/auth/url');
        const { url } = await res.json();
        
        window.open(
          url,
          'google_auth',
          'width=600,height=700'
        );
        return;
      } catch (err) {
        console.error('Failed to get auth URL');
        return;
      }
    }

    setIsSyncing(true);
    setSpreadsheetUrl(null);
    
    try {
      const res = await fetch('/api/sync-sheets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tasks })
      });
      
      const data = await res.json();
      if (data.url) {
        setSpreadsheetUrl(data.url);
      }
    } catch (err) {
      console.error('Sync failed');
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={handleSync}
        disabled={isSyncing}
        className={cn(
          "flex items-center justify-center gap-2 py-2 px-4 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all",
          isSyncing 
            ? "bg-slate-800 text-slate-500 cursor-not-allowed" 
            : spreadsheetUrl 
              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30"
              : "bg-blue-500 text-white hover:bg-blue-600 shadow-lg shadow-blue-500/20"
        )}
      >
        {isSyncing ? (
          <>
            <Loader2 size={14} className="animate-spin" />
            Syncing...
          </>
        ) : spreadsheetUrl ? (
          <>
            <Check size={14} />
            Data Synced
          </>
        ) : (
          <>
            <Share2 size={14} />
            Sync to Google Sheets
          </>
        )}
      </button>
      
      {spreadsheetUrl && (
        <a 
          href={spreadsheetUrl} 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-1 text-[9px] text-emerald-400/70 hover:text-emerald-400 transition-colors uppercase font-bold tracking-tighter"
        >
          View Spreadsheet <ExternalLink size={10} />
        </a>
      )}
    </div>
  );
}
