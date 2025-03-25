import React from 'react';
import { useQuery } from '@tanstack/react-query';
import Layout from '@/components/layout/Layout';
import { Card } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import EmptyState from '@/components/dashboard/EmptyState';
import TradesTable from '@/components/trades/TradesTable';
import { Trade } from '@shared/schema';

export default function TradeReplayPage() {
  const [activeTab, setActiveTab] = React.useState('all');
  
  const { data: trades, isLoading, error } = useQuery<Trade[]>({
    queryKey: ['/api/trades'],
  });
  
  return (
    <Layout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Trade Replay</h1>
        <p className="text-muted-foreground">Analyze and replay your past trades</p>
      </div>
      
      <Card className="mb-6">
        <Tabs
          defaultValue="all"
          onValueChange={setActiveTab}
          className="w-full"
        >
          <div className="px-4 pt-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="all">All Trades</TabsTrigger>
              <TabsTrigger value="closed">Closed Trades</TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="all" className="p-4">
            {isLoading ? (
              <div className="py-8 text-center">Loading trades...</div>
            ) : error ? (
              <div className="py-8 text-center text-destructive">Failed to load trades</div>
            ) : trades && trades.length > 0 ? (
              <TradesTable trades={trades} />
            ) : (
              <EmptyState
                title="No trades recorded yet"
                description="Record trades to replay and analyze them"
                icon="trades"
              />
            )}
          </TabsContent>
          
          <TabsContent value="closed" className="p-4">
            {isLoading ? (
              <div className="py-8 text-center">Loading trades...</div>
            ) : trades && trades.filter(t => t.status === 'closed').length > 0 ? (
              <TradesTable trades={trades.filter(t => t.status === 'closed')} />
            ) : (
              <EmptyState
                title="No closed trades"
                description="Closed trades will appear here for replay"
                icon="trades"
              />
            )}
          </TabsContent>
        </Tabs>
      </Card>
      
      <div className="bg-background/60 p-6 rounded-lg border">
        <h2 className="text-xl font-semibold mb-4">How to Use Trade Replay</h2>
        <div className="space-y-4 text-muted-foreground">
          <p>
            1. Select any trade from the table above and click the "Replay trade" option in the menu.
          </p>
          <p>
            2. Use the playback controls to step through the trade execution.
          </p>
          <p>
            3. Analyze price movements, timing, and execution quality to improve future trades.
          </p>
        </div>
      </div>
    </Layout>
  );
} 