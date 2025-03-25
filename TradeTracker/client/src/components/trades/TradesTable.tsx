import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { formatCurrency, formatDate, formatPercentage, calculatePnL } from '@/lib/utils';
import { 
  ArrowUpCircle, 
  ArrowDownCircle, 
  MoreHorizontal, 
  Eye, 
  Edit, 
  Copy, 
  Trash2, 
  PlayCircle,
  ExternalLink
} from 'lucide-react';
import { useLocation } from 'wouter';
import { Trade } from '@shared/schema';
import TradeReplay from './TradeReplay';

interface TradesTableProps {
  trades: Trade[];
}

export default function TradesTable({ trades }: TradesTableProps) {
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [selectedTrade, setSelectedTrade] = React.useState<Trade | null>(null);
  const [showTradeReplay, setShowTradeReplay] = React.useState(false);
  
  const handleReplayTrade = (trade: Trade) => {
    setSelectedTrade(trade);
    setShowTradeReplay(true);
  };
  
  const handleCloseReplay = () => {
    setShowTradeReplay(false);
  };
  
  const handleCopyTrade = (trade: Trade) => {
    // Logic for copying trade would go here in a real app
    toast({
      title: "Trade Copied",
      description: `${trade.symbol} trade has been copied to clipboard`,
    });
  };
  
  const handleDeleteTrade = (tradeId: number) => {
    // Delete logic would go here in a real app
    toast({
      title: "Trade Deleted",
      description: "Trade has been successfully deleted",
      variant: "destructive",
    });
  };
  
  const handleViewDetails = (tradeId: number) => {
    navigate(`/trade/${tradeId}`);
  };
  
  const getPnL = (trade: Trade): number => {
    if (trade.status === 'closed' && trade.exitPrice) {
      const entryPrice = parseFloat(trade.entryPrice.toString());
      const exitPrice = parseFloat(trade.exitPrice.toString());
      const quantity = parseFloat(trade.quantity.toString());
      const fees = trade.fees ? parseFloat(trade.fees.toString()) : 0;
      
      return calculatePnL(entryPrice, exitPrice, quantity, trade.direction, fees);
    }
    
    return 0;
  };
  
  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'open':
        return "bg-blue-50 text-blue-700 border-blue-200";
      case 'closed':
        return "bg-gray-50 text-gray-600 border-gray-200";
      default:
        return "bg-gray-50 text-gray-600 border-gray-200";
    }
  };
  
  const getCellStyle = (value: number) => {
    return value > 0 ? "text-emerald-600" : value < 0 ? "text-red-600" : "";
  };

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Symbol</TableHead>
              <TableHead>Direction</TableHead>
              <TableHead>Entry Price</TableHead>
              <TableHead>Exit Price</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">P&L</TableHead>
              <TableHead className="text-right">Return %</TableHead>
              <TableHead className="w-[80px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {trades.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="h-24 text-center">
                  No trades recorded yet.
                </TableCell>
              </TableRow>
            ) : (
              trades.map((trade) => {
                const pnl = getPnL(trade);
                const entryPrice = parseFloat(trade.entryPrice.toString());
                const exitPrice = trade.exitPrice ? parseFloat(trade.exitPrice.toString()) : 0;
                const pnlPercent = trade.status === 'closed' 
                  ? ((trade.direction === 'long' ? exitPrice - entryPrice : entryPrice - exitPrice) / entryPrice) * 100
                  : 0;
                  
                return (
                  <TableRow key={trade.id}>
                    <TableCell className="font-medium">
                      {trade.symbol}
                    </TableCell>
                    <TableCell>
                      <Badge variant={trade.direction === 'long' ? 'default' : 'destructive'} className="w-16 justify-center">
                        {trade.direction === 'long' ? (
                          <ArrowUpCircle className="h-3.5 w-3.5 mr-1" />
                        ) : (
                          <ArrowDownCircle className="h-3.5 w-3.5 mr-1" />
                        )}
                        {trade.direction}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {trade.entryPrice}
                    </TableCell>
                    <TableCell>
                      {trade.exitPrice || "-"}
                    </TableCell>
                    <TableCell>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusStyle(trade.status)}`}>
                        {trade.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      {formatDate(trade.entryTime)}
                    </TableCell>
                    <TableCell className={`text-right font-medium ${getCellStyle(pnl)}`}>
                      {formatCurrency(pnl)}
                    </TableCell>
                    <TableCell className={`text-right font-medium ${getCellStyle(pnlPercent)}`}>
                      {formatPercentage(pnlPercent)}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem className="cursor-pointer" onClick={() => handleViewDetails(trade.id)}>
                            <Eye className="h-4 w-4 mr-2" />
                            View details
                          </DropdownMenuItem>
                          <DropdownMenuItem className="cursor-pointer" onClick={() => {}}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit trade
                          </DropdownMenuItem>
                          <DropdownMenuItem className="cursor-pointer" onClick={() => handleReplayTrade(trade)}>
                            <PlayCircle className="h-4 w-4 mr-2" />
                            Replay trade
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="cursor-pointer" onClick={() => handleCopyTrade(trade)}>
                            <Copy className="h-4 w-4 mr-2" />
                            Duplicate
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="cursor-pointer text-red-600" 
                            onClick={() => handleDeleteTrade(trade.id)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
      
      <Dialog open={showTradeReplay} onOpenChange={setShowTradeReplay}>
        <DialogContent className="max-w-6xl max-h-[90vh] p-0 overflow-auto">
          {selectedTrade && (
            <>
              <TradeReplay trade={selectedTrade} onClose={handleCloseReplay} />
              <div className="bg-muted p-2 border-t flex justify-end">
                <Button
                  size="sm"
                  variant="outline"
                  className="flex items-center gap-1"
                  onClick={() => handleViewDetails(selectedTrade.id)}
                >
                  <ExternalLink className="h-3 w-3" />
                  View Raw Details
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}