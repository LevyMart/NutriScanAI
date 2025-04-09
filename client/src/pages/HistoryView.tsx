import React from 'react';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { getAnalysisHistory } from '@/lib/api';
import HistoryItem from '@/components/HistoryItem';
import { Skeleton } from '@/components/ui/skeleton';

interface HistoryViewProps {
  onClose: () => void;
}

const HistoryView: React.FC<HistoryViewProps> = ({ onClose }) => {
  const { data: historyItems, isLoading, error } = useQuery({
    queryKey: ['/api/analysis-history'],
  });

  return (
    <div className="animate-in fade-in">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-medium text-primary-foreground">Histórico de Análises</h2>
        <Button 
          variant="ghost"
          size="icon"
          className="rounded-full hover:bg-surface transition-colors"
          onClick={onClose}
        >
          <X className="h-5 w-5 text-muted-foreground" />
        </Button>
      </div>
      
      {isLoading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20 w-full rounded-lg" />
          ))}
        </div>
      )}
      
      {error && (
        <div className="py-8 flex flex-col items-center justify-center">
          <span className="material-icons text-4xl text-destructive mb-2">error</span>
          <p className="text-muted-foreground text-sm">Erro ao carregar o histórico</p>
          <Button variant="outline" size="sm" className="mt-2" onClick={() => window.location.reload()}>
            Tentar novamente
          </Button>
        </div>
      )}
      
      {!isLoading && !error && historyItems && historyItems.length > 0 && (
        <div className="space-y-3">
          {historyItems.map((item) => (
            <HistoryItem key={item.id} item={item} />
          ))}
        </div>
      )}
      
      {!isLoading && !error && (!historyItems || historyItems.length === 0) && (
        <div className="py-8 flex flex-col items-center justify-center">
          <span className="material-icons text-4xl text-muted-foreground mb-2">history</span>
          <p className="text-muted-foreground text-sm">Nenhuma análise encontrada</p>
          <p className="text-muted-foreground text-xs mt-1">Suas análises salvas aparecerão aqui</p>
        </div>
      )}
    </div>
  );
};

export default HistoryView;
