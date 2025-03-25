import React from 'react';
import { InfoIcon } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import CircleProgress from './CircleProgress';
import { formatCurrency, formatPercentage } from '@/lib/utils';

interface MetricCardProps {
  title: string;
  value: number | null;
  type: 'currency' | 'percentage' | 'ratio' | 'custom';
  tooltipText: string;
  progressValue?: number;
  progressColor?: 'success' | 'danger' | 'warning' | 'primary';
  customFormat?: (value: number | null) => string;
  showProgress?: boolean;
  isWinLossRatio?: boolean;
}

export default function MetricCard({ 
  title, 
  value, 
  type, 
  tooltipText, 
  progressValue = 0,
  progressColor = 'primary',
  customFormat,
  showProgress = true,
  isWinLossRatio = false
}: MetricCardProps) {
  const formattedValue = React.useMemo(() => {
    if (value === null) return '--';
    if (customFormat) return customFormat(value);
    
    switch (type) {
      case 'currency':
        return formatCurrency(value);
      case 'percentage':
        return formatPercentage(value);
      case 'ratio':
        return value.toFixed(2);
      default:
        return `${value}`;
    }
  }, [value, type, customFormat]);

  const colorMap = {
    success: 'text-emerald-500',
    danger: 'text-red-500',
    warning: 'text-amber-500',
    primary: 'text-primary'
  };

  const strokeColorMap = {
    success: '#10b981', // emerald-500
    danger: '#ef4444',  // red-500
    warning: '#f59e0b', // amber-500
    primary: '#6e56cf'  // primary color
  };

  return (
    <div className="bg-card rounded-lg p-4 shadow-md">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button className="text-muted-foreground hover:text-foreground">
                <InfoIcon className="h-4 w-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <p className="max-w-xs">{tooltipText}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      
      <div className="flex items-center">
        <div className={`font-mono text-2xl font-medium mr-3 ${value !== null && value < 0 ? 'text-red-500' : ''}`}>
          {formattedValue}
        </div>
        
        {showProgress && !isWinLossRatio && (
          <CircleProgress 
            percentage={progressValue} 
            size={60} 
            strokeWidth={3} 
            circleColor={strokeColorMap[progressColor]} 
          />
        )}
        
        {isWinLossRatio && (
          <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-emerald-500 to-red-500" 
              style={{ width: `${Math.min(100, Math.max(0, progressValue))}%` }}
            ></div>
          </div>
        )}
      </div>
    </div>
  );
}
