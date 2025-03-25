import React from 'react';
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency, formatPercentage } from '@/lib/utils';

interface DataVisualizerProps {
  reportType: string;
  stats: any;
}

export default function DataVisualizer({ reportType, stats }: DataVisualizerProps) {
  // Empty or placeholder state for data visualization
  const noDataMessage = (
    <div className="h-64 flex items-center justify-center text-muted-foreground">
      <p>Not enough data to display this report.</p>
    </div>
  );
  
  // Mock data for demonstration 
  // In a real application, this would be populated by the stats from the API
  const mockPnlData = [
    { date: '2023-04-01', pnl: 125 },
    { date: '2023-04-02', pnl: -75 },
    { date: '2023-04-03', pnl: 250 },
    { date: '2023-04-04', pnl: 300 },
    { date: '2023-04-05', pnl: -150 },
    { date: '2023-04-06', pnl: 200 },
    { date: '2023-04-07', pnl: 350 },
  ];
  
  const mockWinLossData = [
    { name: 'Wins', value: stats.winningTrades || 0 },
    { name: 'Losses', value: stats.losingTrades || 0 }
  ];
  
  const mockSetupData = [
    { name: 'Breakout', wins: 8, losses: 2 },
    { name: 'Pullback', wins: 6, losses: 4 },
    { name: 'Reversal', wins: 4, losses: 6 },
    { name: 'Trend Following', wins: 7, losses: 3 },
  ];
  
  // Custom colors for charts
  const COLORS = ['#6e56cf', '#10b981', '#f59e0b', '#ef4444', '#a855f7'];
  
  // Render different types of reports based on the reportType prop
  switch (reportType) {
    case 'overview':
      return (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="text-lg font-medium">Total P&L</div>
                <div className={`text-3xl font-bold ${stats.totalPnL > 0 ? 'text-emerald-500' : stats.totalPnL < 0 ? 'text-red-500' : ''}`}>
                  {formatCurrency(stats.totalPnL || 0)}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="text-lg font-medium">Win Rate</div>
                <div className="text-3xl font-bold">
                  {formatPercentage(stats.winRate || 0)}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="text-lg font-medium">Profit Factor</div>
                <div className="text-3xl font-bold">
                  {stats.profitFactor?.toFixed(2) || '0.00'}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="text-lg font-medium">Total Trades</div>
                <div className="text-3xl font-bold">
                  {stats.totalTrades || 0}
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>P&L Over Time</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  {stats.totalTrades > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={mockPnlData}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis dataKey="date" />
                        <YAxis tickFormatter={(value) => `$${value}`} />
                        <Tooltip 
                          formatter={(value) => [`$${value}`, 'P&L']} 
                          contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151' }}
                        />
                        <Legend />
                        <Line 
                          type="monotone" 
                          dataKey="pnl" 
                          stroke="#6e56cf" 
                          activeDot={{ r: 8 }} 
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : noDataMessage}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Win/Loss Ratio</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  {stats.totalTrades > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={mockWinLossData}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                          {mockWinLossData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={index === 0 ? '#10b981' : '#ef4444'} />
                          ))}
                        </Pie>
                        <Tooltip 
                          formatter={(value) => [`${value}`, 'Trades']} 
                          contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151' }}
                        />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : noDataMessage}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      );
      
    case 'days':
      return (
        <div className="h-96">
          {stats.totalTrades > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={mockPnlData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="date" />
                <YAxis tickFormatter={(value) => `$${value}`} />
                <Tooltip 
                  formatter={(value) => [`$${value}`, 'P&L']} 
                  contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151' }}
                />
                <Legend />
                <Bar 
                  dataKey="pnl" 
                  name="P&L" 
                  fill="#6e56cf" 
                  barSize={20} 
                />
              </BarChart>
            </ResponsiveContainer>
          ) : noDataMessage}
        </div>
      );
      
    case 'setups':
      return (
        <div className="h-96">
          {stats.totalTrades > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={mockSetupData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151' }} />
                <Legend />
                <Bar dataKey="wins" name="Wins" fill="#10b981" />
                <Bar dataKey="losses" name="Losses" fill="#ef4444" />
              </BarChart>
            </ResponsiveContainer>
          ) : noDataMessage}
        </div>
      );
      
    case 'winsVsLosses':
      return (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="text-lg font-medium">Average Win</div>
                <div className="text-3xl font-bold text-emerald-500">
                  {formatCurrency(stats.avgWin || 0)}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="text-lg font-medium">Average Loss</div>
                <div className="text-3xl font-bold text-red-500">
                  {formatCurrency(Math.abs(stats.avgLoss || 0))}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="text-lg font-medium">Win/Loss Ratio</div>
                <div className="text-3xl font-bold">
                  {stats.avgWinLossRatio?.toFixed(2) || '0.00'}
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Largest Wins and Losses</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                {stats.totalTrades > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={[
                        { name: 'Largest Win', value: stats.largestWin || 0 },
                        { name: 'Largest Loss', value: stats.largestLoss || 0 }
                      ]}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="name" />
                      <YAxis tickFormatter={(value) => `$${value}`} />
                      <Tooltip 
                        formatter={(value) => [`$${value}`, 'Amount']} 
                        contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151' }}
                      />
                      <Bar 
                        dataKey="value" 
                        fill={(data) => data.name === 'Largest Win' ? '#10b981' : '#ef4444'} 
                      >
                        {[
                          { name: 'Largest Win', value: stats.largestWin || 0 },
                          { name: 'Largest Loss', value: stats.largestLoss || 0 }
                        ].map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={entry.name === 'Largest Win' ? '#10b981' : '#ef4444'} 
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : noDataMessage}
              </div>
            </CardContent>
          </Card>
        </div>
      );
      
    default:
      return noDataMessage;
  }
}
