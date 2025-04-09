import React from 'react';
import { Button } from '@/components/ui/button';
import { History, User, Settings } from 'lucide-react';

interface HeaderProps {
  onHistoryClick: () => void;
  onProfileClick?: () => void;
}

const HeaderComponent: React.FC<HeaderProps> = ({ onHistoryClick, onProfileClick }) => {
  return (
    <header className="bg-surface px-4 py-3 flex items-center justify-between shadow-md">
      <div className="flex items-center">
        <span className="material-icons text-primary mr-2">restaurant</span>
        <h1 className="text-xl font-bold text-primary-foreground">
          <span className="text-primary">FoodCam</span> AI
        </h1>
      </div>
      <div className="flex gap-1">
        <Button
          variant="ghost"
          size="icon"
          onClick={onProfileClick}
          className="rounded-full hover:bg-background/50 transition-colors"
          title="Perfil e Metas"
        >
          <User className="h-5 w-5 text-muted-foreground" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={onHistoryClick}
          className="rounded-full hover:bg-background/50 transition-colors"
          title="Histórico"
        >
          <History className="h-5 w-5 text-muted-foreground" />
        </Button>
      </div>
    </header>
  );
};

export default HeaderComponent;
