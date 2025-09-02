import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, GripVertical } from 'lucide-react';

interface DashboardWidgetProps {
  id: string;
  title: string;
  children: React.ReactNode;
  onRemove?: (id: string) => void;
  isDragging?: boolean;
}

const DashboardWidget: React.FC<DashboardWidgetProps> = ({
  id,
  title,
  children,
  onRemove,
  isDragging = false
}) => {
  return (
    <div className={`relative group ${isDragging ? 'opacity-50' : ''}`}>
      <div className="absolute -left-2 top-4 opacity-0 group-hover:opacity-100 transition-opacity cursor-move">
        <GripVertical className="h-5 w-5 text-muted-foreground" />
      </div>
      {onRemove && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute -right-2 -top-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity z-10"
          onClick={() => onRemove(id)}
        >
          <X className="h-4 w-4" />
        </Button>
      )}
      {children}
    </div>
  );
};

export default DashboardWidget;