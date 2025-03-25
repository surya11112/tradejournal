import React from 'react';
import { FileTextIcon, LineChartIcon, CloudIcon, LightbulbIcon, FileIcon } from 'lucide-react';

type EmptyStateIcon = 'trades' | 'chart' | 'cloud' | 'idea' | 'notes' | 'calendar';

interface EmptyStateProps {
  title: string;
  description?: string;
  icon: EmptyStateIcon;
  action?: React.ReactNode;
}

export default function EmptyState({ title, description, icon, action }: EmptyStateProps) {
  const getIcon = () => {
    switch (icon) {
      case 'trades':
        return <FileTextIcon className="h-12 w-12 text-muted-foreground/40" />;
      case 'chart':
        return <LineChartIcon className="h-12 w-12 text-muted-foreground/40" />;
      case 'cloud':
        return <CloudIcon className="h-12 w-12 text-muted-foreground/40" />;
      case 'idea':
        return <LightbulbIcon className="h-12 w-12 text-muted-foreground/40" />;
      case 'notes':
        return <FileIcon className="h-12 w-12 text-muted-foreground/40" />;
      case 'calendar':
        return (
          <svg 
            xmlns="http://www.w3.org/2000/svg"
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-12 w-12 text-muted-foreground/40"
          >
            <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
            <line x1="16" x2="16" y1="2" y2="6" />
            <line x1="8" x2="8" y1="2" y2="6" />
            <line x1="3" x2="21" y1="10" y2="10" />
          </svg>
        );
      default:
        return <FileTextIcon className="h-12 w-12 text-muted-foreground/40" />;
    }
  };

  return (
    <div className="flex flex-col items-center justify-center text-center py-12">
      <div className="mb-4">
        {getIcon()}
      </div>
      <h3 className="text-lg font-medium text-foreground mb-2">{title}</h3>
      {description && (
        <p className="text-muted-foreground text-sm max-w-sm mb-4">{description}</p>
      )}
      {action && action}
    </div>
  );
}
