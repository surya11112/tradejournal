import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import EmptyState from '@/components/dashboard/EmptyState';
import BacktestingEngine from './BacktestingEngine';
import { PlayIcon, BarChart4 } from 'lucide-react';

interface BacktestingPanelProps {
  onCancel: () => void;
}

export default function BacktestingPanel({ onCancel }: BacktestingPanelProps) {
  const [showBacktestingEngine, setShowBacktestingEngine] = React.useState(false);
  
  return (
    <>
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center">
            <BarChart4 className="mr-2 h-5 w-5 text-primary" />
            Strategy Backtesting
          </CardTitle>
          <CardDescription>
            Test your trading strategies against historical market data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <EmptyState
            title="Backtest Your Trading Strategies"
            description="Test your trading strategies with historical data to see how they would have performed"
            icon="chart"
            action={
              <Button onClick={() => setShowBacktestingEngine(true)}>
                <PlayIcon className="h-4 w-4 mr-2" />
                Start Backtesting
              </Button>
            }
          />
        </CardContent>
      </Card>
      
      <Dialog open={showBacktestingEngine} onOpenChange={setShowBacktestingEngine}>
        <DialogContent className="max-w-6xl h-[90vh] p-0">
          <BacktestingEngine onClose={() => setShowBacktestingEngine(false)} />
        </DialogContent>
      </Dialog>
    </>
  );
}