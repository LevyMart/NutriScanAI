import React from 'react';
import { Button } from '@/components/ui/button';
import { History } from 'lucide-react';

interface HeaderProps {
  onHistoryClick: () => void;
}

const HeaderComponent: React.FC<HeaderProps> = ({ onHistoryClick }) => {
  return (
    <header className="bg-surface px-4 py-3 flex items-center justify-between shadow-md">
      <div className="flex items-center">
        <span className="material-icons text-secondary mr-2">restaurant</span>
        <h1 className="text-xl font-medium text-primary-foreground">NutriScan</h1>
      </div>
      <div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onHistoryClick}
          className="rounded-full hover:bg-background/50 transition-colors"
        >
          <History className="h-5 w-5 text-muted-foreground" />
        </Button>
      </div>
    </header>
  );
};

export default HeaderComponent;
