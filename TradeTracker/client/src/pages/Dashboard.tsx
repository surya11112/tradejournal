import React from 'react';
import { useQuery } from '@tanstack/react-query';
import Layout from '@/components/layout/Layout';
import MetricCard from '@/components/dashboard/MetricCard';
import RecentTrades from '@/components/dashboard/RecentTrades';
import EmptyState from '@/components/dashboard/EmptyState';
import TradeInsights from '@/components/ai/TradeInsights';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AddTradeForm from '@/components/forms/AddTradeForm';
import { PlusIcon, TrendingUp, BookMarked, Activity, Zap, Brain, LineChart } from 'lucide-react';

export default function Dashboard() {
  const [addTradeOpen, setAddTradeOpen] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState("overview");
  
  const { data: stats, isLoading } = useQuery<any>({
    queryKey: ['/api/stats'],
  });
  
  const { data: trades = [] } = useQuery<any>({
    queryKey: ['/api/trades'],
  });
  
  const handleQuickTrade = () => {
    setAddTradeOpen(true);
  };
  
  return (
    <Layout showStartDay>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="flex justify-between items-center mb-4">
          <TabsList className="grid grid-cols-4">
            <TabsTrigger value="overview" className="flex items-center gap-1">
              <TrendingUp className="h-4 w-4" />
              <span className="hidden sm:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger value="performance" className="flex items-center gap-1">
              <Activity className="h-4 w-4" />
              <span className="hidden sm:inline">Performance</span>
            </TabsTrigger>
            <TabsTrigger value="insights" className="flex items-center gap-1">
              <Zap className="h-4 w-4" />
              <span className="hidden sm:inline">Insights</span>
            </TabsTrigger>
            <TabsTrigger value="setups" className="flex items-center gap-1">
              <BookMarked className="h-4 w-4" />
              <span className="hidden sm:inline">Setups</span>
            </TabsTrigger>
          </TabsList>
          
          <Button onClick={handleQuickTrade} className="h-9">
            <PlusIcon className="h-4 w-4 mr-1.5" /> Quick Trade
          </Button>
        </div>
        
        <TabsContent value="overview" className="mt-0">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
            <MetricCard
              title="Net P&L"
              value={isLoading ? null : stats?.totalPnL}
              type="currency"
              tooltipText="Net profit & loss across all closed trades in the selected time period"
              progressValue={isLoading ? 0 : stats?.totalPnL > 0 ? 50 : 0}
              progressColor={isLoading ? 'primary' : stats?.totalPnL > 0 ? 'success' : 'danger'}
            />
            
            <MetricCard
              title="Trade win %"
              value={isLoading ? null : stats?.winRate}
              type="percentage"
              tooltipText="Percentage of winning trades in the selected time period"
              progressValue={isLoading ? 0 : stats?.winRate || 0}
              progressColor={isLoading ? 'primary' : stats?.winRate > 50 ? 'success' : 'danger'}
            />
            
            <MetricCard
              title="Profit factor"
              value={isLoading ? null : stats?.profitFactor}
              type="ratio"
              tooltipText="Ratio of gross profit to gross loss. Higher is better, 1.0 is break even"
              progressValue={isLoading ? 0 : Math.min(100, stats?.profitFactor * 20 || 0)}
              progressColor={isLoading ? 'primary' : stats?.profitFactor > 1.5 ? 'success' : 'danger'}
            />
            
            <MetricCard
              title="Day win %"
              value={isLoading ? null : stats?.dayWinRate}
              type="percentage"
              tooltipText="Percentage of days with positive P&L"
              progressValue={isLoading ? 0 : stats?.dayWinRate || 0}
              progressColor={isLoading ? 'primary' : stats?.dayWinRate > 50 ? 'success' : 'danger'}
            />
            
            <MetricCard
              title="Avg win/loss trade"
              value={isLoading ? null : stats?.avgWinLossRatio}
              type="ratio"
              tooltipText="Ratio of average winning trade to average losing trade"
              progressValue={isLoading ? 50 : Math.min(100, stats?.avgWinLossRatio * 25 || 50)}
              isWinLossRatio={true}
            />
          </div>
          
          {/* Charts and Graphs */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Trading Score</CardTitle>
              </CardHeader>
              <CardContent>
                <EmptyState
                  title="No trading score yet"
                  description="Available once there is at least 1 trade"
                  icon="chart"
                />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Daily net cumulative P&L</CardTitle>
              </CardHeader>
              <CardContent>
                <EmptyState
                  title="No P&L data yet"
                  description="No daily net cumulative P&L to show here"
                  icon="chart"
                />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Net daily P&L</CardTitle>
              </CardHeader>
              <CardContent>
                <EmptyState
                  title="No daily P&L yet"
                  description="No net daily P&L to show here"
                  icon="cloud"
                />
              </CardContent>
            </Card>
          </div>
          
          {/* Recent Trades */}
          <RecentTrades />
        </TabsContent>
        
        <TabsContent value="performance" className="mt-0">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Win/Loss Ratio By Day</CardTitle>
              </CardHeader>
              <CardContent>
                <EmptyState
                  title="No performance data yet"
                  description="Start tracking trades to see your win/loss ratios by day"
                  icon="chart"
                  action={
                    <Button size="sm" onClick={handleQuickTrade}>
                      <PlusIcon className="h-4 w-4 mr-1" /> Add First Trade
                    </Button>
                  }
                />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Performance By Symbol</CardTitle>
              </CardHeader>
              <CardContent>
                <EmptyState
                  title="No symbol data yet"
                  description="Track your performance across different symbols"
                  icon="chart"
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="insights" className="mt-0">
          <div className="mb-6">
            <TradeInsights trades={trades} timeframe="30D" />
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6">
            <Card>
              <CardHeader className="pb-2 flex justify-between items-center">
                <CardTitle>Trade Ideas</CardTitle>
                <Button variant="link" size="sm" className="h-8 px-2">View all</Button>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center h-32 border border-dashed border-border rounded-md">
                  <div className="text-center">
                    <p className="text-muted-foreground mb-2">No trade ideas yet</p>
                    <Button size="sm">
                      <PlusIcon className="h-4 w-4 mr-1" /> Add idea
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2 flex justify-between items-center">
                <CardTitle>Watchlist</CardTitle>
                <Button variant="link" size="sm" className="h-8 px-2">Manage</Button>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center h-32 border border-dashed border-border rounded-md">
                  <div className="text-center">
                    <p className="text-muted-foreground mb-2">Your watchlist is empty</p>
                    <Button size="sm">
                      <PlusIcon className="h-4 w-4 mr-1" /> Add symbols
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="setups" className="mt-0">
          <div className="mb-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Trading Setups Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <EmptyState
                  title="No setups tracked yet"
                  description="Add setups to your trades to track which ones perform best"
                  icon="idea"
                  action={
                    <Button size="sm" onClick={handleQuickTrade}>
                      <PlusIcon className="h-4 w-4 mr-1" /> Add Trade With Setup
                    </Button>
                  }
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
      
      {/* Add Trade Dialog */}
      <Dialog open={addTradeOpen} onOpenChange={setAddTradeOpen}>
        <AddTradeForm onComplete={() => setAddTradeOpen(false)} />
      </Dialog>
    </Layout>
  );
}