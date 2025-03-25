import { Trade, JournalEntry, Note, Playbook } from "@shared/schema";

export type TradingTimeframe = "1D" | "1W" | "1M" | "3M" | "6M" | "1Y" | "YTD" | "ALL";

export interface DateRangeFilter {
  startDate: Date;
  endDate: Date;
}

export interface TradingStats {
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  winRate: number;
  dayWinRate: number;
  totalPnL: number;
  avgWin: number;
  avgLoss: number;
  profitFactor: number;
  largestWin: number;
  largestLoss: number;
  avgWinLossRatio: number;
}

export interface TradeWithDetails extends Trade {
  rMultiple?: number;
  durationInMinutes?: number;
}

export interface DailyJournalEntry extends JournalEntry {
  trades?: Trade[];
}

export interface TradeAnalysis {
  bySymbol: { [symbol: string]: TradingStats };
  bySetup: { [setup: string]: TradingStats };
  byTimeOfDay: { [hour: string]: TradingStats };
  byDayOfWeek: { [day: string]: TradingStats };
}

export interface Tag {
  id: string;
  label: string;
  color?: string;
}

export interface FilterOptions {
  symbols: string[];
  setups: string[];
  accounts: string[];
  tags: Tag[];
  dateRange: DateRangeFilter;
}

export interface SidebarNavItem {
  title: string;
  href: string;
  icon: React.ReactNode;
  isNew?: boolean;
}

export type NotificationType = "success" | "error" | "warning" | "info";

export interface TradeForm {
  symbol: string;
  direction: "long" | "short";
  entryPrice: string;
  exitPrice?: string;
  quantity: string;
  entryTime: string;
  exitTime?: string;
  stopLoss?: string;
  takeProfit?: string;
  setup?: string;
  notes?: string;
  tags?: string[];
  account: string;
  fees?: string;
  status: "open" | "closed";
}

export interface ImportTradeOptions {
  source: "csv" | "broker" | "manual";
  account: string;
  file?: File;
}

export interface PlaybookRule {
  id: string;
  title: string;
  description: string;
  type: "entry" | "exit" | "management" | "criteria";
}
