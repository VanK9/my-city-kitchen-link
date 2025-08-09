import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, GripVertical } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface WidgetConfig {
  id: string;
  title: string;
  component: React.ComponentType<any>;
  icon: React.ComponentType<any>;
  size: 'small' | 'medium' | 'large';
  category: string;
  defaultVisible: boolean;
}

interface DashboardWidgetProps {
  widget: WidgetConfig;
  isVisible: boolean;
  onToggleVisibility: (widgetId: string) => void;
  onRemove?: (widgetId: string) => void;
  className?: string;
}

const DashboardWidget: React.FC<DashboardWidgetProps> = ({
  widget,
  isVisible,
  onToggleVisibility,
  onRemove,
  className
}) => {
  const { component: Component, icon: Icon, title, size } = widget;

  const sizeClasses = {
    small: 'col-span-1',
    medium: 'col-span-1 md:col-span-2',
    large: 'col-span-1 md:col-span-2 lg:col-span-3'
  };

  if (!isVisible) return null;

  return (
    <Card className={cn(
      'group relative transition-all duration-300 hover:shadow-warm border-2 hover:border-primary/20',
      sizeClasses[size],
      className
    )}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="flex items-center space-x-2">
          <Icon className="h-5 w-5 text-primary" />
          <CardTitle className="text-lg">{title}</CardTitle>
        </div>
        <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 cursor-grab active:cursor-grabbing"
          >
            <GripVertical className="h-4 w-4" />
          </Button>
          {onRemove && (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-muted-foreground hover:text-destructive"
              onClick={() => onRemove(widget.id)}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <Component />
      </CardContent>
    </Card>
  );
};

export default DashboardWidget;