import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { formatCurrency, formatDateTime } from '@/lib/utils';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { ChevronUpIcon, ChevronDownIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import EmptyState from './EmptyState';
import type { Trade } from '@shared/schema';

export default function RecentTrades() {
  const { data: trades, isLoading, error } = useQuery<Trade[]>({
    queryKey: ['/api/trades'],
  });

  const recentTrades = React.useMemo(() => {
    if (!trades) return [];
    return trades.slice(0, 5);
  }, [trades]);

  return (
    <div className="bg-card rounded-lg p-4 shadow-md">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-md font-medium">Recent Trades</h3>
        <Button variant="link" size="sm" asChild>
          <Link href="/trades">View all</Link>
        </Button>
      </div>
      
      <div className="overflow-x-auto">
        {isLoading ? (
          <div className="py-8 text-center text-muted-foreground">Loading trades...</div>
        ) : error ? (
          <div className="py-8 text-center text-destructive">Failed to load trades</div>
        ) : recentTrades.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">Date</TableHead>
                <TableHead>Symbol</TableHead>
                <TableHead>Side</TableHead>
                <TableHead>Entry</TableHead>
                <TableHead>Exit</TableHead>
                <TableHead>Qty</TableHead>
                <TableHead>P&L</TableHead>
                <TableHead>Tags</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentTrades.map((trade) => (
                <TableRow key={trade.id}>
                  <TableCell className="font-mono text-xs">
                    {formatDateTime(trade.entryTime)}
                  </TableCell>
                  <TableCell className="font-medium">{trade.symbol}</TableCell>
                  <TableCell>
                    {trade.direction === 'long' ? (
                      <span className="flex items-center text-emerald-500">
                        <ChevronUpIcon className="h-4 w-4 mr-1" />
                        Long
                      </span>
                    ) : (
                      <span className="flex items-center text-red-500">
                        <ChevronDownIcon className="h-4 w-4 mr-1" />
                        Short
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="font-mono">
                    {formatCurrency(trade.entryPrice)}
                  </TableCell>
                  <TableCell className="font-mono">
                    {formatCurrency(trade.exitPrice)}
                  </TableCell>
                  <TableCell>{trade.quantity}</TableCell>
                  <TableCell className={`font-mono font-medium ${trade.pnl && trade.pnl > 0 ? 'text-emerald-500' : trade.pnl && trade.pnl < 0 ? 'text-red-500' : ''}`}>
                    {formatCurrency(trade.pnl)}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {trade.tags && trade.tags.map((tag, i) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <EmptyState 
            title="No trades to display"
            description="Add your first trade to get started."
            icon="trades"
          />
        )}
      </div>
    </div>
  );
}
