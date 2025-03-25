import React from 'react';
import { useLocation, useParams } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, formatDate } from '@/lib/utils';
import { ArrowUp, ArrowDown } from 'lucide-react';
import { Trade } from '@shared/schema';
import { Button } from '@/components/ui/button';

// Helper function to safely parse numeric values
function safeFormat(value: any, formatter: (val: number) => string = (n) => n.toString()): string {
  if (value === null || value === undefined) return "-";
  if (typeof value === 'number') return formatter(value);
  try {
    const parsed = parseFloat(String(value));
    return isNaN(parsed) ? "-" : formatter(parsed);
  } catch (e) {
    return "-";
  }
}

export default function RawTradeDetails() {
  const [_, setLocation] = useLocation();
  const params = useParams<{ id: string }>();
  const tradeId = parseInt(params.id || "0");
  
  const { data: trade, isLoading, error } = useQuery<Trade>({
    queryKey: [`/api/trades/${tradeId}`],
    enabled: !!tradeId,
  });
  
  if (isLoading) {
    return (
      <Layout>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Trade Details</h1>
        </div>
        <div className="py-8 text-center">Loading trade details...</div>
      </Layout>
    );
  }
  
  if (error || !trade) {
    return (
      <Layout>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Trade Details</h1>
        </div>
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-destructive mb-4">Failed to load trade details</p>
            <Button onClick={() => setLocation('/trades')}>Back to Trades</Button>
          </CardContent>
        </Card>
      </Layout>
    );
  }
  
  const pnl = trade.pnl ? parseFloat(trade.pnl.toString()) : 0;
  const pnlFormatted = safeFormat(pnl, formatCurrency);
  const isPnlPositive = pnl > 0;
  const isPnlNegative = pnl < 0;
  
  return (
    <Layout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Trade Details</h1>
        <Button variant="outline" onClick={() => setLocation('/trades')}>Back to Trades</Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Trade Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Symbol</span>
                <span className="font-medium">{trade.symbol}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-muted-foreground">Direction</span>
                <Badge variant={trade.direction === 'long' ? 'default' : 'destructive'}>
                  {trade.direction === 'long' ? (
                    <ArrowUp className="h-3 w-3 mr-1" />
                  ) : (
                    <ArrowDown className="h-3 w-3 mr-1" />
                  )}
                  {trade.direction.toUpperCase()}
                </Badge>
              </div>
              
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status</span>
                <Badge variant="outline">{trade.status.toUpperCase()}</Badge>
              </div>
              
              <div className="flex justify-between">
                <span className="text-muted-foreground">Entry Date</span>
                <span>{formatDate(trade.entryTime)}</span>
              </div>
              
              {trade.exitTime && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Exit Date</span>
                  <span>{formatDate(trade.exitTime)}</span>
                </div>
              )}
              
              <div className="flex justify-between">
                <span className="text-muted-foreground">Account</span>
                <span>{trade.account}</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Price &amp; Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Entry Price</span>
                <span className="font-medium">{safeFormat(trade.entryPrice, (n) => n.toFixed(2))}</span>
              </div>
              
              {trade.exitPrice && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Exit Price</span>
                  <span className="font-medium">{safeFormat(trade.exitPrice, (n) => n.toFixed(2))}</span>
                </div>
              )}
              
              <div className="flex justify-between">
                <span className="text-muted-foreground">Quantity</span>
                <span>{safeFormat(trade.quantity, (n) => n.toLocaleString())}</span>
              </div>
              
              {trade.stopLoss && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Stop Loss</span>
                  <span>{safeFormat(trade.stopLoss, (n) => n.toFixed(2))}</span>
                </div>
              )}
              
              {trade.takeProfit && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Take Profit</span>
                  <span>{safeFormat(trade.takeProfit, (n) => n.toFixed(2))}</span>
                </div>
              )}
              
              {trade.pnl !== null && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">P&L</span>
                  <span className={isPnlPositive ? "text-emerald-500" : isPnlNegative ? "text-red-500" : ""}>
                    {pnlFormatted}
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        
        {trade.notes && (
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap">{trade.notes}</p>
            </CardContent>
          </Card>
        )}
        
        {trade.images && trade.images.length > 0 && (
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Screenshots</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {trade.images.map((img, index) => (
                  <div key={index} className="border rounded-md overflow-hidden">
                    <img 
                      src={img} 
                      alt={`Trade screenshot ${index + 1}`} 
                      className="w-full h-auto"
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
} 