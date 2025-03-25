import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  LineChart, 
  ArrowDownUp, 
  CalendarDays, 
  Settings, 
  PlayCircle, 
  BarChart2, 
  TrendingUp, 
  Sliders, 
  Save
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  ResponsiveContainer,
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart,
  Bar
} from 'recharts';

interface BacktestingEngineProps {
  onClose: () => void;
}

export default function BacktestingEngine({ onClose }: BacktestingEngineProps) {
  const { toast } = useToast();
  const [loading, setLoading] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState('setup');
  const [strategyName, setStrategyName] = React.useState('');
  const [symbol, setSymbol] = React.useState('');
  const [timeframe, setTimeframe] = React.useState('1d');
  const [startDate, setStartDate] = React.useState('2023-01-01');
  const [endDate, setEndDate] = React.useState('2023-12-31');
  
  const [backtestResults, setBacktestResults] = React.useState<any>(null);

  // Parameters for strategy rules
  const [entryCondition, setEntryCondition] = React.useState('macd_crossover');
  const [exitCondition, setExitCondition] = React.useState('fixed_profit');
  const [stopLossPercent, setStopLossPercent] = React.useState(2);
  const [takeProfitPercent, setTakeProfitPercent] = React.useState(5);
  const [initialCapital, setInitialCapital] = React.useState(10000);
  const [positionSizePercent, setPositionSizePercent] = React.useState(10);
  
  // This would come from a real API/backend in a production app
  const runBacktest = () => {
    if (!strategyName || !symbol || !timeframe || !startDate || !endDate) {
      toast({
        title: "Missing Parameters",
        description: "Please fill out all required fields",
        variant: "destructive"
      });
      return;
    }
    
    setLoading(true);
    
    // Simulate API call with timeout
    setTimeout(() => {
      // Generate mock backtest results
      const mockResults = generateMockResults();
      setBacktestResults(mockResults);
      setLoading(false);
      setActiveTab('results');
      
      toast({
        title: "Backtest Complete",
        description: `${strategyName} strategy tested on ${symbol} from ${startDate} to ${endDate}`,
      });
    }, 3000);
  };
  
  const saveStrategy = () => {
    toast({
      title: "Strategy Saved",
      description: `"${strategyName}" has been saved to your playbook`,
    });
  };
  
  const generateMockResults = () => {
    // Generate mock equity curve data
    const equityCurve = [];
    const tradeResults = [];
    const monthlySummary = [];
    
    let equity = initialCapital;
    const trades = Math.floor(Math.random() * 25) + 40; // 40-65 trades
    const winRate = Math.random() * 0.2 + 0.45; // 45-65% win rate
    
    // Equity curve data
    for (let i = 0; i < trades; i++) {
      const isWin = Math.random() < winRate;
      const changePercent = isWin 
        ? (Math.random() * takeProfitPercent)
        : -(Math.random() * stopLossPercent);
      
      const tradeSize = equity * (positionSizePercent / 100);
      const pnl = tradeSize * (changePercent / 100);
      equity += pnl;
      
      equityCurve.push({
        trade: i + 1,
        equity: Math.round(equity * 100) / 100,
        pnl: Math.round(pnl * 100) / 100
      });
      
      tradeResults.push({
        id: i + 1,
        date: new Date(Date.parse(startDate) + Math.random() * (Date.parse(endDate) - Date.parse(startDate))).toISOString().split('T')[0],
        symbol,
        type: isWin ? 'win' : 'loss',
        entryPrice: Math.round(Math.random() * 100 + 50),
        exitPrice: 0,
        pnl: Math.round(pnl * 100) / 100,
        pnlPercent: Math.round(changePercent * 100) / 100
      });
    }
    
    // Sort trades by date
    tradeResults.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    // Update exit prices based on entry and pnl percent
    tradeResults.forEach(trade => {
      trade.exitPrice = Math.round((trade.entryPrice * (1 + trade.pnlPercent / 100)) * 100) / 100;
    });
    
    // Generate monthly summary
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    months.forEach(month => {
      monthlySummary.push({
        month,
        profit: Math.round((Math.random() * 2000 - 800) * 100) / 100
      });
    });
    
    // Calculate statistics
    const winningTrades = tradeResults.filter(t => t.type === 'win').length;
    const losingTrades = tradeResults.filter(t => t.type === 'loss').length;
    const totalPnL = tradeResults.reduce((sum, trade) => sum + trade.pnl, 0);
    const avgWin = tradeResults.filter(t => t.type === 'win').reduce((sum, t) => sum + t.pnl, 0) / winningTrades || 0;
    const avgLoss = tradeResults.filter(t => t.type === 'loss').reduce((sum, t) => sum + t.pnl, 0) / losingTrades || 0;
    
    const stats = {
      totalTrades: trades,
      winningTrades,
      losingTrades,
      winRate: Math.round(winRate * 1000) / 10,
      profitFactor: Math.round((avgWin * winningTrades) / Math.abs(avgLoss * losingTrades) * 100) / 100,
      netProfit: Math.round(totalPnL * 100) / 100,
      netProfitPercent: Math.round((totalPnL / initialCapital) * 10000) / 100,
      maxDrawdown: Math.round(Math.random() * 20 * 100) / 100,
      sharpeRatio: Math.round(Math.random() * 1.5 * 100) / 100,
      averageWin: Math.round(avgWin * 100) / 100,
      averageLoss: Math.round(avgLoss * 100) / 100
    };
    
    return {
      equityCurve,
      tradeResults,
      monthlySummary,
      stats
    };
  };

  return (
    <div className="p-4 h-full overflow-y-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Strategy Backtesting Engine</h2>
        <Button variant="outline" onClick={onClose}>Close</Button>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 mb-6">
          <TabsTrigger value="setup" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Setup
          </TabsTrigger>
          <TabsTrigger value="strategy" className="flex items-center gap-2" disabled={!symbol}>
            <Sliders className="h-4 w-4" />
            Strategy
          </TabsTrigger>
          <TabsTrigger value="results" className="flex items-center gap-2" disabled={!backtestResults}>
            <BarChart2 className="h-4 w-4" />
            Results
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="setup" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LineChart className="h-5 w-5 text-primary" />
                Strategy & Market Setup
              </CardTitle>
              <CardDescription>
                Define the market and timeframe for your backtest
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="strategyName">Strategy Name</Label>
                <Input 
                  id="strategyName" 
                  placeholder="e.g. MACD Crossover Strategy" 
                  value={strategyName}
                  onChange={(e) => setStrategyName(e.target.value)}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="symbol">Symbol</Label>
                  <Input 
                    id="symbol" 
                    placeholder="e.g. AAPL, MSFT, SPY" 
                    value={symbol}
                    onChange={(e) => setSymbol(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="timeframe">Timeframe</Label>
                  <Select value={timeframe} onValueChange={setTimeframe}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select timeframe" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1m">1 Minute</SelectItem>
                      <SelectItem value="5m">5 Minutes</SelectItem>
                      <SelectItem value="15m">15 Minutes</SelectItem>
                      <SelectItem value="30m">30 Minutes</SelectItem>
                      <SelectItem value="1h">1 Hour</SelectItem>
                      <SelectItem value="4h">4 Hours</SelectItem>
                      <SelectItem value="1d">Daily</SelectItem>
                      <SelectItem value="1w">Weekly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input 
                    id="startDate" 
                    type="date" 
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date</Label>
                  <Input 
                    id="endDate" 
                    type="date" 
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="initialCapital">Initial Capital</Label>
                  <Input 
                    id="initialCapital" 
                    type="number" 
                    value={initialCapital}
                    onChange={(e) => setInitialCapital(Number(e.target.value))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="positionSize">Position Size (%)</Label>
                  <Input 
                    id="positionSize" 
                    type="number" 
                    min="1" 
                    max="100" 
                    value={positionSizePercent}
                    onChange={(e) => setPositionSizePercent(Number(e.target.value))}
                  />
                </div>
              </div>
              
              <div className="pt-4 flex justify-end">
                <Button 
                  onClick={() => setActiveTab('strategy')}
                  disabled={!strategyName || !symbol || !timeframe || !startDate || !endDate}
                >
                  Continue to Strategy Setup
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="strategy" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ArrowDownUp className="h-5 w-5 text-primary" />
                Entry & Exit Rules
              </CardTitle>
              <CardDescription>
                Define the entry and exit conditions for your strategy
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="entryCondition">Entry Condition</Label>
                <Select value={entryCondition} onValueChange={setEntryCondition}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select entry condition" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="macd_crossover">MACD Crossover</SelectItem>
                    <SelectItem value="rsi_oversold">RSI Oversold</SelectItem>
                    <SelectItem value="rsi_overbought">RSI Overbought</SelectItem>
                    <SelectItem value="ma_crossover">Moving Average Crossover</SelectItem>
                    <SelectItem value="breakout">Price Breakout</SelectItem>
                    <SelectItem value="bollinger_bands">Bollinger Bands</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="exitCondition">Exit Condition</Label>
                <Select value={exitCondition} onValueChange={setExitCondition}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select exit condition" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fixed_profit">Fixed Profit Target</SelectItem>
                    <SelectItem value="trailing_stop">Trailing Stop</SelectItem>
                    <SelectItem value="opposite_signal">Opposite Signal</SelectItem>
                    <SelectItem value="time_based">Time-Based Exit</SelectItem>
                    <SelectItem value="volatility_based">Volatility-Based Exit</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="stopLoss">Stop Loss (%)</Label>
                  <Input 
                    id="stopLoss" 
                    type="number" 
                    min="0.1" 
                    step="0.1" 
                    value={stopLossPercent}
                    onChange={(e) => setStopLossPercent(Number(e.target.value))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="takeProfit">Take Profit (%)</Label>
                  <Input 
                    id="takeProfit" 
                    type="number" 
                    min="0.1" 
                    step="0.1" 
                    value={takeProfitPercent}
                    onChange={(e) => setTakeProfitPercent(Number(e.target.value))}
                  />
                </div>
              </div>
              
              <div className="pt-4 flex justify-end space-x-2">
                <Button 
                  variant="outline"
                  onClick={() => setActiveTab('setup')}
                >
                  Back
                </Button>
                <Button 
                  onClick={runBacktest}
                  disabled={loading}
                >
                  {loading ? 'Running...' : 'Run Backtest'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="results" className="space-y-6">
          {backtestResults && (
            <>
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle className="flex items-center gap-2">
                      <BarChart2 className="h-5 w-5 text-primary" />
                      Performance Summary
                    </CardTitle>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={saveStrategy}
                      className="flex items-center gap-1"
                    >
                      <Save className="h-4 w-4" />
                      Save Strategy
                    </Button>
                  </div>
                  <CardDescription>
                    {strategyName} on {symbol} ({timeframe}) from {startDate} to {endDate}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    <div>
                      <div className="text-sm text-muted-foreground">Net Profit</div>
                      <div className={`text-lg font-semibold ${backtestResults.stats.netProfit >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                        ${backtestResults.stats.netProfit.toLocaleString()} ({backtestResults.stats.netProfitPercent}%)
                      </div>
                    </div>
                    
                    <div>
                      <div className="text-sm text-muted-foreground">Win Rate</div>
                      <div className="text-lg font-semibold">
                        {backtestResults.stats.winRate}%
                      </div>
                    </div>
                    
                    <div>
                      <div className="text-sm text-muted-foreground">Profit Factor</div>
                      <div className="text-lg font-semibold">
                        {backtestResults.stats.profitFactor}
                      </div>
                    </div>
                    
                    <div>
                      <div className="text-sm text-muted-foreground">Max Drawdown</div>
                      <div className="text-lg font-semibold text-amber-500">
                        {backtestResults.stats.maxDrawdown}%
                      </div>
                    </div>
                    
                    <div>
                      <div className="text-sm text-muted-foreground">Total Trades</div>
                      <div className="text-lg font-semibold">
                        {backtestResults.stats.totalTrades}
                      </div>
                    </div>
                    
                    <div>
                      <div className="text-sm text-muted-foreground">Sharpe Ratio</div>
                      <div className="text-lg font-semibold">
                        {backtestResults.stats.sharpeRatio}
                      </div>
                    </div>
                    
                    <div>
                      <div className="text-sm text-muted-foreground">Avg Win</div>
                      <div className="text-lg font-semibold text-emerald-500">
                        ${backtestResults.stats.averageWin}
                      </div>
                    </div>
                    
                    <div>
                      <div className="text-sm text-muted-foreground">Avg Loss</div>
                      <div className="text-lg font-semibold text-red-500">
                        ${backtestResults.stats.averageLoss}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    Equity Curve
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsLineChart
                        data={backtestResults.equityCurve}
                        margin={{ top: 5, right: 20, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="trade" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line 
                          type="monotone" 
                          dataKey="equity" 
                          stroke="#8884d8" 
                          activeDot={{ r: 8 }} 
                          name="Equity"
                        />
                      </RechartsLineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CalendarDays className="h-5 w-5 text-primary" />
                    Monthly Performance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={backtestResults.monthlySummary}
                        margin={{ top: 5, right: 20, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar 
                          dataKey="profit" 
                          name="Profit/Loss" 
                          fill={(data) => (data > 0 ? "#10b981" : "#ef4444")}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}