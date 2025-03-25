import React from 'react';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { PlayIcon, InfoIcon } from 'lucide-react';
import EmptyState from '@/components/dashboard/EmptyState';
import BacktestingPanel from '@/components/backtesting/BacktestingPanel';

export default function Backtesting() {
  const [isCreating, setIsCreating] = React.useState(false);
  
  return (
    <Layout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Backtesting sessions</h1>
        <Button onClick={() => setIsCreating(true)}>
          Create Session
        </Button>
      </div>
      
      {isCreating ? (
        <BacktestingPanel onCancel={() => setIsCreating(false)} />
      ) : (
        <div className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <div className="bg-card rounded-lg p-6">
                <div className="bg-[#121A2A] rounded-lg p-12 relative overflow-hidden">
                  {/* Background gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/70 z-0"></div>
                  
                  {/* Chart Watermark in Background */}
                  <div className="absolute inset-0 opacity-20 z-0">
                    <svg viewBox="0 0 100 40" className="w-full h-full" preserveAspectRatio="none">
                      <path d="M0,35 L10,30 L20,33 L30,28 L40,29 L50,20 L60,25 L70,15 L80,18 L90,10 L100,15" 
                        stroke="currentColor" fill="none" strokeWidth="0.5" />
                    </svg>
                  </div>
                  
                  <div className="flex flex-col items-center justify-center relative z-10 text-center">
                    <div className="bg-primary/20 w-16 h-16 flex items-center justify-center rounded-full mb-6 border-2 border-primary">
                      <PlayIcon className="h-8 w-8 text-primary" />
                    </div>
                    <h2 className="text-2xl font-bold mb-3">Start Backtesting Now</h2>
                    <p className="text-muted-foreground max-w-md mb-6">
                      Test your trading strategies with historical data to validate performance before real trading
                    </p>
                    <Button className="mb-4" onClick={() => setIsCreating(true)}>
                      Create backtesting session
                    </Button>
                    <Button variant="outline" size="sm">
                      <InfoIcon className="h-4 w-4 mr-2" />
                      Watch tutorial video
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <div>
            <h2 className="text-2xl font-bold mb-4">The Ultimate Tool to Test Your Strategies</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="text-primary mb-4">
                    <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2" />
                      <path d="M8 12L11 15L16 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium mb-2">Validate Your Strategies</h3>
                  <p className="text-muted-foreground">
                    Test your trading strategies using historical data to see how they would have performed
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="text-primary mb-4">
                    <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M21 21L16.65 16.65M19 11C19 15.4183 15.4183 19 11 19C6.58172 19 3 15.4183 3 11C3 6.58172 6.58172 3 11 3C15.4183 3 19 6.58172 19 11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M11 8V14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M8 11H14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium mb-2">Identify What Works</h3>
                  <p className="text-muted-foreground">
                    Discover which setups and strategies yield the best results over different market conditions
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="text-primary mb-4">
                    <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 3V21M12 3L7 8M12 3L17 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M3 12H21M3 12L8 7M3 12L8 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium mb-2">Optimize Parameters</h3>
                  <p className="text-muted-foreground">
                    Fine-tune your entry/exit rules, position sizing, and risk management for better results
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
