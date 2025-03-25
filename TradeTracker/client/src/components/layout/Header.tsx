import React from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { CalendarIcon, FilterIcon, WalletIcon, PlayCircleIcon, ChevronDownIcon } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { format, subDays, startOfMonth, endOfMonth, addDays } from 'date-fns';

export default function Header() {
  const [location] = useLocation();
  const [date, setDate] = React.useState<Date | undefined>(new Date());
  const [currentDateRange, setCurrentDateRange] = React.useState("Last 30 days");
  const [currentAccount, setCurrentAccount] = React.useState("All accounts");

  const pageTitles: Record<string, string> = {
    "/": "Dashboard",
    "/journal": "Daily Journal",
    "/trades": "Trades",
    "/notebook": "Notebook",
    "/reports": "Reports",
    "/playbooks": "Playbooks",
    "/backtesting": "Backtesting Sessions",
    "/progress": "Progress Tracker",
    "/replay": "Trade Replay",
    "/resources": "Resource Center"
  };

  const dateRanges = [
    { label: "Today", value: "Today" },
    { label: "Yesterday", value: "Yesterday" },
    { label: "Last 7 days", value: "Last 7 days" },
    { label: "Last 30 days", value: "Last 30 days" },
    { label: "This month", value: "This month" },
    { label: "Last month", value: "Last month" },
    { label: "Custom range", value: "Custom range" },
  ];

  const accounts = [
    "All accounts",
    "Main Account",
    "Practice Account",
    "Live Account"
  ];

  const handleDateRangeSelect = (value: string) => {
    setCurrentDateRange(value);
    // Logic to set actual date range would go here
  };

  const handleAccountSelect = (value: string) => {
    setCurrentAccount(value);
  };

  return (
    <header className="bg-background border-b border-border px-6 py-3 sticky top-0 z-10">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">{pageTitles[location] || "Page"}</h1>
        
        <div className="flex space-x-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-9">
                <FilterIcon className="h-4 w-4 mr-1.5" />
                Filters
                <ChevronDownIcon className="h-3.5 w-3.5 ml-1.5 opacity-70" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>Symbol</DropdownMenuItem>
              <DropdownMenuItem>Direction</DropdownMenuItem>
              <DropdownMenuItem>Outcome</DropdownMenuItem>
              <DropdownMenuItem>Strategy</DropdownMenuItem>
              <DropdownMenuItem>Tags</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="h-9">
                <CalendarIcon className="h-4 w-4 mr-1.5" />
                {currentDateRange}
                <ChevronDownIcon className="h-3.5 w-3.5 ml-1.5 opacity-70" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <div className="p-2 border-b border-border">
                {dateRanges.map((range) => (
                  <Button
                    key={range.value}
                    variant={currentDateRange === range.value ? "default" : "ghost"}
                    size="sm"
                    className="w-full justify-start text-left mb-1"
                    onClick={() => handleDateRangeSelect(range.value)}
                  >
                    {range.label}
                  </Button>
                ))}
              </div>
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                className="border-0"
              />
            </PopoverContent>
          </Popover>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-9">
                <WalletIcon className="h-4 w-4 mr-1.5" />
                {currentAccount}
                <ChevronDownIcon className="h-3.5 w-3.5 ml-1.5 opacity-70" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {accounts.map((account) => (
                <DropdownMenuItem 
                  key={account}
                  onClick={() => handleAccountSelect(account)}
                >
                  {account}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      {/* Quick Actions */}
      {(location === "/" || location === "/reports" || location === "/backtesting") && (
        <div className="bg-accent/50 px-4 py-2 mt-2 rounded flex items-center justify-between">
          <span className="text-sm">Welcome to your personal trading journal! Track your trades and improve your results.</span>
          <Button variant="secondary" size="sm" className="ml-2">
            <PlayCircleIcon className="h-4 w-4 mr-1.5" />
            Quick analysis
          </Button>
        </div>
      )}
    </header>
  );
}
