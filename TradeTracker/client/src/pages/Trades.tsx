import React from 'react';
import { useQuery } from '@tanstack/react-query';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent
} from '@/components/ui/tabs';
import { ImportIcon, PlusIcon } from 'lucide-react';
import AddTradeForm from '@/components/forms/AddTradeForm';
import ImportTradesForm from '@/components/forms/ImportTradesForm';
import TradesTable from '@/components/trades/TradesTable';
import EmptyState from '@/components/dashboard/EmptyState';
import { Trade } from '@shared/schema';

export default function Trades() {
  const [addTradeDialogOpen, setAddTradeDialogOpen] = React.useState(false);
  const [importDialogOpen, setImportDialogOpen] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState('all');
  
  const { data: trades, isLoading, error } = useQuery<Trade[]>({
    queryKey: ['/api/trades'],
  });
  
  const openTrades = React.useMemo(() => {
    if (!trades) return [];
    return trades.filter(trade => trade.status === 'open');
  }, [trades]);
  
  const closedTrades = React.useMemo(() => {
    if (!trades) return [];
    return trades.filter(trade => trade.status === 'closed');
  }, [trades]);
  
  const currentTrades = React.useMemo(() => {
    switch (activeTab) {
      case 'open':
        return openTrades;
      case 'closed':
        return closedTrades;
      default:
        return trades || [];
    }
  }, [activeTab, trades, openTrades, closedTrades]);
  
  return (
    <Layout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Trades</h1>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={() => setImportDialogOpen(true)}
          >
            <ImportIcon className="h-4 w-4 mr-2" />
            Import
          </Button>
          <Button onClick={() => setAddTradeDialogOpen(true)}>
            <PlusIcon className="h-4 w-4 mr-2" />
            Add Trade
          </Button>
        </div>
      </div>
      
      <Card className="mb-6">
        <Tabs
          defaultValue="all"
          onValueChange={setActiveTab}
          className="w-full"
        >
          <div className="px-4 pt-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="all">All Trades</TabsTrigger>
              <TabsTrigger value="open">Open Positions</TabsTrigger>
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
                description="Add your first trade to get started"
                icon="trades"
                action={
                  <Button className="mt-4" onClick={() => setAddTradeDialogOpen(true)}>
                    <PlusIcon className="h-4 w-4 mr-2" />
                    Add Trade
                  </Button>
                }
              />
            )}
          </TabsContent>
          
          <TabsContent value="open" className="p-4">
            {isLoading ? (
              <div className="py-8 text-center">Loading trades...</div>
            ) : openTrades.length > 0 ? (
              <TradesTable trades={openTrades} />
            ) : (
              <EmptyState
                title="No open positions"
                description="Open positions will appear here"
                icon="trades"
              />
            )}
          </TabsContent>
          
          <TabsContent value="closed" className="p-4">
            {isLoading ? (
              <div className="py-8 text-center">Loading trades...</div>
            ) : closedTrades.length > 0 ? (
              <TradesTable trades={closedTrades} />
            ) : (
              <EmptyState
                title="No closed trades"
                description="Closed trades will appear here"
                icon="trades"
              />
            )}
          </TabsContent>
        </Tabs>
      </Card>
      
      {/* Add Trade Dialog */}
      <Dialog open={addTradeDialogOpen} onOpenChange={setAddTradeDialogOpen}>
        <AddTradeForm onComplete={() => setAddTradeDialogOpen(false)} />
      </Dialog>
      
      {/* Import Trades Dialog */}
      <ImportTradesForm open={importDialogOpen} onOpenChange={setImportDialogOpen} />
    </Layout>
  );
}
