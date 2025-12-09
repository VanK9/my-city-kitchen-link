import { Home, CalendarDays, ChefHat, User, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";

interface BottomNavigationProps {
  currentSection: string;
  onSectionChange: (section: string) => void;
}

const navItems = [
  { id: "home", label: "Αρχική", icon: Home },
  { id: "work", label: "Εργασία", icon: CalendarDays },
  { id: "recipes", label: "Συνταγές", icon: ChefHat },
  { id: "tutorials", label: "Tutorials", icon: BookOpen },
  { id: "profile", label: "Προφίλ", icon: User },
];

export function BottomNavigation({ currentSection, onSectionChange }: BottomNavigationProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border safe-area-bottom">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto">
        {navItems.map((item) => {
          const isActive = currentSection === item.id;
          const Icon = item.icon;
          
          return (
            <button
              key={item.id}
              onClick={() => onSectionChange(item.id)}
              className={cn(
                "flex flex-col items-center justify-center flex-1 h-full py-2 px-1 transition-colors",
                "active:bg-muted/50 touch-manipulation",
                isActive 
                  ? "text-primary" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className={cn(
                "h-6 w-6 mb-1 transition-transform",
                isActive && "scale-110"
              )} />
              <span className={cn(
                "text-xs font-medium truncate",
                isActive && "font-semibold"
              )}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
