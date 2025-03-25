import React from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CalendarIcon, CheckIcon, ChevronDownIcon, FilterIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { format, subDays, subMonths, startOfMonth, endOfMonth } from 'date-fns';

interface ReportFiltersProps {
  dateRange: {
    startDate: Date;
    endDate: Date;
  };
  onDateRangeChange: (dateRange: { startDate: Date; endDate: Date }) => void;
}

export default function ReportFilters({ dateRange, onDateRangeChange }: ReportFiltersProps) {
  const [selectedSymbols, setSelectedSymbols] = React.useState<string[]>([]);
  const [selectedSetups, setSelectedSetups] = React.useState<string[]>([]);
  const [selectedTags, setSelectedTags] = React.useState<string[]>([]);
  const [searchSymbol, setSearchSymbol] = React.useState('');
  
  // Preset date ranges
  const presetDateRanges = [
    {
      name: 'Today',
      range: {
        startDate: new Date(),
        endDate: new Date()
      }
    },
    {
      name: 'Yesterday',
      range: {
        startDate: subDays(new Date(), 1),
        endDate: subDays(new Date(), 1)
      }
    },
    {
      name: 'Last 7 days',
      range: {
        startDate: subDays(new Date(), 6),
        endDate: new Date()
      }
    },
    {
      name: 'Last 30 days',
      range: {
        startDate: subDays(new Date(), 29),
        endDate: new Date()
      }
    },
    {
      name: 'This month',
      range: {
        startDate: startOfMonth(new Date()),
        endDate: new Date()
      }
    },
    {
      name: 'Last month',
      range: {
        startDate: startOfMonth(subMonths(new Date(), 1)),
        endDate: endOfMonth(subMonths(new Date(), 1))
      }
    }
  ];
  
  const applyPresetDateRange = (preset: { startDate: Date; endDate: Date }) => {
    onDateRangeChange(preset);
  };
  
  const mockSymbols = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'META', 'NVDA'];
  const mockSetups = ['Breakout', 'Pullback', 'Reversal', 'Trend Following', 'Range', 'Support/Resistance'];
  const mockTags = ['Successful', 'Failed', 'High Volume', 'Low Volume', 'Pre-Market', 'After Hours', 'Earnings'];
  
  const filteredSymbols = searchSymbol 
    ? mockSymbols.filter(s => s.toLowerCase().includes(searchSymbol.toLowerCase())) 
    : mockSymbols;
  
  const toggleSymbol = (symbol: string) => {
    if (selectedSymbols.includes(symbol)) {
      setSelectedSymbols(selectedSymbols.filter(s => s !== symbol));
    } else {
      setSelectedSymbols([...selectedSymbols, symbol]);
    }
  };
  
  const toggleSetup = (setup: string) => {
    if (selectedSetups.includes(setup)) {
      setSelectedSetups(selectedSetups.filter(s => s !== setup));
    } else {
      setSelectedSetups([...selectedSetups, setup]);
    }
  };
  
  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };
  
  return (
    <Card className="p-4">
      <h3 className="text-lg font-medium mb-4 flex items-center">
        <FilterIcon className="h-4 w-4 mr-2" />
        Filters
      </h3>
      
      <div className="space-y-4">
        <div>
          <Label className="mb-2 block">Date Range</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-left font-normal"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {format(dateRange.startDate, 'MMM d, yyyy')} - {format(dateRange.endDate, 'MMM d, yyyy')}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <div className="p-3 border-b border-border">
                <div className="space-y-2">
                  {presetDateRanges.map((preset) => (
                    <Button
                      key={preset.name}
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start text-left"
                      onClick={() => applyPresetDateRange(preset.range)}
                    >
                      {preset.name}
                    </Button>
                  ))}
                </div>
              </div>
              <div className="p-3 border-b border-border">
                <div className="flex space-x-2">
                  <div>
                    <Label className="block text-xs mb-1">Start Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full justify-start text-left font-normal"
                        >
                          {format(dateRange.startDate, 'MMM d, yyyy')}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={dateRange.startDate}
                          onSelect={(date) => date && onDateRangeChange({ 
                            startDate: date, 
                            endDate: dateRange.endDate 
                          })}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div>
                    <Label className="block text-xs mb-1">End Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full justify-start text-left font-normal"
                        >
                          {format(dateRange.endDate, 'MMM d, yyyy')}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={dateRange.endDate}
                          onSelect={(date) => date && onDateRangeChange({ 
                            startDate: dateRange.startDate, 
                            endDate: date 
                          })}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
        
        <Accordion type="multiple" defaultValue={['date', 'symbol', 'setup']}>
          <AccordionItem value="symbol">
            <AccordionTrigger>Symbol</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2">
                <Input 
                  placeholder="Search symbols..." 
                  value={searchSymbol}
                  onChange={(e) => setSearchSymbol(e.target.value)}
                />
                <div className="max-h-40 overflow-y-auto space-y-1">
                  {filteredSymbols.map((symbol) => (
                    <div
                      key={symbol}
                      className={cn(
                        "flex items-center space-x-2 px-2 py-1 rounded cursor-pointer",
                        selectedSymbols.includes(symbol) ? "bg-primary/20" : "hover:bg-muted"
                      )}
                      onClick={() => toggleSymbol(symbol)}
                    >
                      <div className={cn(
                        "h-4 w-4 rounded-sm border flex items-center justify-center",
                        selectedSymbols.includes(symbol) 
                          ? "bg-primary border-primary" 
                          : "border-muted-foreground"
                      )}>
                        {selectedSymbols.includes(symbol) && (
                          <CheckIcon className="h-3 w-3 text-primary-foreground" />
                        )}
                      </div>
                      <span>{symbol}</span>
                    </div>
                  ))}
                </div>
                {selectedSymbols.length > 0 && (
                  <div className="mt-2">
                    <Label className="text-xs mb-1 block">Selected Symbols</Label>
                    <div className="flex flex-wrap gap-1">
                      {selectedSymbols.map((symbol) => (
                        <Badge 
                          key={symbol} 
                          variant="secondary"
                          className="cursor-pointer"
                          onClick={() => toggleSymbol(symbol)}
                        >
                          {symbol} &times;
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="setup">
            <AccordionTrigger>Setup</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2">
                <div className="max-h-40 overflow-y-auto space-y-1">
                  {mockSetups.map((setup) => (
                    <div
                      key={setup}
                      className={cn(
                        "flex items-center space-x-2 px-2 py-1 rounded cursor-pointer",
                        selectedSetups.includes(setup) ? "bg-primary/20" : "hover:bg-muted"
                      )}
                      onClick={() => toggleSetup(setup)}
                    >
                      <div className={cn(
                        "h-4 w-4 rounded-sm border flex items-center justify-center",
                        selectedSetups.includes(setup) 
                          ? "bg-primary border-primary" 
                          : "border-muted-foreground"
                      )}>
                        {selectedSetups.includes(setup) && (
                          <CheckIcon className="h-3 w-3 text-primary-foreground" />
                        )}
                      </div>
                      <span>{setup}</span>
                    </div>
                  ))}
                </div>
                {selectedSetups.length > 0 && (
                  <div className="mt-2">
                    <Label className="text-xs mb-1 block">Selected Setups</Label>
                    <div className="flex flex-wrap gap-1">
                      {selectedSetups.map((setup) => (
                        <Badge 
                          key={setup} 
                          variant="secondary"
                          className="cursor-pointer"
                          onClick={() => toggleSetup(setup)}
                        >
                          {setup} &times;
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="tags">
            <AccordionTrigger>Tags</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2">
                <div className="max-h-40 overflow-y-auto space-y-1">
                  {mockTags.map((tag) => (
                    <div
                      key={tag}
                      className={cn(
                        "flex items-center space-x-2 px-2 py-1 rounded cursor-pointer",
                        selectedTags.includes(tag) ? "bg-primary/20" : "hover:bg-muted"
                      )}
                      onClick={() => toggleTag(tag)}
                    >
                      <div className={cn(
                        "h-4 w-4 rounded-sm border flex items-center justify-center",
                        selectedTags.includes(tag) 
                          ? "bg-primary border-primary" 
                          : "border-muted-foreground"
                      )}>
                        {selectedTags.includes(tag) && (
                          <CheckIcon className="h-3 w-3 text-primary-foreground" />
                        )}
                      </div>
                      <span>{tag}</span>
                    </div>
                  ))}
                </div>
                {selectedTags.length > 0 && (
                  <div className="mt-2">
                    <Label className="text-xs mb-1 block">Selected Tags</Label>
                    <div className="flex flex-wrap gap-1">
                      {selectedTags.map((tag) => (
                        <Badge 
                          key={tag} 
                          variant="secondary"
                          className="cursor-pointer"
                          onClick={() => toggleTag(tag)}
                        >
                          {tag} &times;
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="direction">
            <AccordionTrigger>Direction</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2">
                <Select defaultValue="all">
                  <SelectTrigger>
                    <SelectValue placeholder="Select direction" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="long">Long</SelectItem>
                    <SelectItem value="short">Short</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="result">
            <AccordionTrigger>Result</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2">
                <Select defaultValue="all">
                  <SelectTrigger>
                    <SelectValue placeholder="Select result" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="win">Win</SelectItem>
                    <SelectItem value="loss">Loss</SelectItem>
                    <SelectItem value="breakeven">Breakeven</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
        
        <Button className="w-full">Apply Filters</Button>
        
        {(selectedSymbols.length > 0 || selectedSetups.length > 0 || selectedTags.length > 0) && (
          <Button variant="outline" className="w-full">
            Clear Filters
          </Button>
        )}
      </div>
    </Card>
  );
}
