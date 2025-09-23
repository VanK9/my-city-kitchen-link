import { useState, useEffect } from 'react';

export interface DashboardPreferences {
  visibleWidgets: string[];
  widgetOrder: string[];
}

export const useDashboardPreferences = () => {
  const [preferences, setPreferences] = useState<DashboardPreferences>({
    visibleWidgets: ['quick-daily-entry', 'work-schedule', 'quick-stats', 'community-feed'],
    widgetOrder: ['quick-daily-entry', 'work-schedule', 'quick-stats', 'community-feed']
  });

  // Load preferences from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('dashboard-preferences');
    if (saved) {
      try {
        setPreferences(JSON.parse(saved));
      } catch (error) {
        console.error('Failed to parse dashboard preferences:', error);
      }
    }
  }, []);

  // Save preferences to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('dashboard-preferences', JSON.stringify(preferences));
  }, [preferences]);

  const toggleWidgetVisibility = (widgetId: string) => {
    setPreferences(prev => ({
      ...prev,
      visibleWidgets: prev.visibleWidgets.includes(widgetId)
        ? prev.visibleWidgets.filter(id => id !== widgetId)
        : [...prev.visibleWidgets, widgetId]
    }));
  };

  const updateWidgetOrder = (newOrder: string[]) => {
    setPreferences(prev => ({
      ...prev,
      widgetOrder: newOrder
    }));
  };

  const resetToDefaults = () => {
    setPreferences({
      visibleWidgets: ['quick-daily-entry', 'work-schedule', 'quick-stats', 'community-feed'],
      widgetOrder: ['quick-daily-entry', 'work-schedule', 'quick-stats', 'community-feed']
    });
  };

  return {
    preferences,
    toggleWidgetVisibility,
    updateWidgetOrder,
    resetToDefaults
  };
};