import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isSameMonth, isSameDay, isToday } from 'date-fns';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface JournalCalendarProps {
  month: Date;
  onMonthChange: (date: Date) => void;
  selectedDate: Date;
  onSelect: (date: Date) => void;
  daysWithEntries: Date[];
}

export default function JournalCalendar({
  month,
  onMonthChange,
  selectedDate,
  onSelect,
  daysWithEntries
}: JournalCalendarProps) {
  const monthStart = startOfMonth(month);
  const monthEnd = endOfMonth(month);
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });
  
  // Determine days from previous month to show
  const startDay = getDay(monthStart);
  
  // Create a function to check if a date has an entry
  const hasEntry = (date: Date) => {
    return daysWithEntries.some(entryDate => 
      isSameDay(new Date(entryDate), date)
    );
  };
  
  // Navigation
  const nextMonth = () => onMonthChange(addMonths(month, 1));
  const prevMonth = () => onMonthChange(subMonths(month, 1));
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="icon"
          onClick={prevMonth}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h3 className="text-sm font-medium">
          {format(month, 'MMMM yyyy')}
        </h3>
        <Button
          variant="ghost"
          size="icon"
          onClick={nextMonth}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="grid grid-cols-7 text-center text-xs text-muted-foreground">
        <div>Su</div>
        <div>Mo</div>
        <div>Tu</div>
        <div>We</div>
        <div>Th</div>
        <div>Fr</div>
        <div>Sa</div>
      </div>
      
      <div className="grid grid-cols-7 gap-1">
        {/* Empty cells for days before the month starts */}
        {Array.from({ length: startDay }).map((_, index) => (
          <div key={`empty-start-${index}`} className="h-8" />
        ))}
        
        {/* Days of the month */}
        {monthDays.map((day) => {
          const isSelected = isSameDay(day, selectedDate);
          const isDayWithEntry = hasEntry(day);
          
          return (
            <Button
              key={day.toString()}
              variant="ghost"
              size="sm"
              className={cn(
                "h-8 w-full p-0 font-normal aria-selected:opacity-100",
                isToday(day) && "bg-muted text-foreground",
                isSelected && "bg-primary text-primary-foreground",
                !isSelected && isDayWithEntry && "bg-primary/20"
              )}
              onClick={() => onSelect(day)}
            >
              <time dateTime={format(day, 'yyyy-MM-dd')}>
                {format(day, 'd')}
              </time>
            </Button>
          );
        })}
      </div>
    </div>
  );
}
