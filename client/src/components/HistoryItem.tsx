import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { HistoryItem as HistoryItemType } from '@/types';

interface HistoryItemProps {
  item: HistoryItemType;
}

const HistoryItem: React.FC<HistoryItemProps> = ({ item }) => {
  // Format the date as relative time (e.g., "2 hours ago")
  const getRelativeTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return formatDistanceToNow(date, { addSuffix: true, locale: ptBR });
    } catch {
      return 'Data desconhecida';
    }
  };

  // Get the main food name for the title (first food in the list)
  const mainFood = item.foods.length > 0 ? item.foods[0] : 'Refeição';

  return (
    <div className="bg-surface rounded-lg overflow-hidden flex">
      <div className="w-20 h-20 flex-shrink-0">
        <img 
          src={item.imageUrl} 
          className="w-full h-full object-cover" 
          alt={mainFood} 
          onError={(e) => {
            e.currentTarget.src = "https://via.placeholder.com/80?text=Sem+imagem";
          }}
        />
      </div>
      <div className="p-3 flex-1">
        <div className="flex justify-between items-start">
          <h3 className="text-sm font-medium text-primary-foreground">{mainFood}</h3>
          <span className="text-xs text-muted-foreground">{getRelativeTime(item.createdAt)}</span>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          {item.calories} kcal • {item.protein}g prot • {item.carbs}g carb
        </p>
      </div>
    </div>
  );
};

export default HistoryItem;
