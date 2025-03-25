import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { format, parse, startOfMonth, endOfMonth, eachDayOfInterval, addDays } from 'date-fns';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import EmptyState from '@/components/dashboard/EmptyState';
import { Calendar } from '@/components/ui/calendar';
import { ImportIcon, PlusIcon, PlayCircleIcon } from 'lucide-react';
import JournalEntry from '@/components/journal/JournalEntry';
import JournalCalendar from '@/components/journal/JournalCalendar';
import ImportTradesForm from '@/components/forms/ImportTradesForm';
import { JournalEntry as JournalEntryType } from '@shared/schema';

export default function DailyJournal() {
  const [selectedDate, setSelectedDate] = React.useState<Date>(new Date());
  const [importDialogOpen, setImportDialogOpen] = React.useState(false);
  const [month, setMonth] = React.useState<Date>(new Date());
  
  const { data: journalEntries, isLoading } = useQuery<JournalEntryType[]>({
    queryKey: ['/api/journal'],
  });
  
  const { data: journalEntryForSelectedDate } = useQuery<JournalEntryType[]>({
    queryKey: [`/api/journal/date/${format(selectedDate, 'yyyy-MM-dd')}`],
    enabled: Boolean(selectedDate),
  });
  
  const hasEntryForSelectedDate = React.useMemo(() => {
    if (!journalEntryForSelectedDate) return false;
    return journalEntryForSelectedDate.length > 0;
  }, [journalEntryForSelectedDate]);
  
  // Get days with entries for calendar highlighting
  const daysWithEntries = React.useMemo(() => {
    if (!journalEntries) return [];
    return journalEntries.map(entry => new Date(entry.date));
  }, [journalEntries]);
  
  return (
    <Layout>
      <div className="flex justify-end mb-4 space-x-2">
        <Button variant="outline" onClick={() => setImportDialogOpen(true)}>
          <ImportIcon className="h-4 w-4 mr-2" />
          Import trades
        </Button>
        <Button variant="outline">
          <PlayCircleIcon className="h-4 w-4 mr-2" />
          Start my day
        </Button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main journal area */}
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="p-6">
              {isLoading ? (
                <div className="flex justify-center items-center h-64">
                  <p>Loading journal entries...</p>
                </div>
              ) : hasEntryForSelectedDate ? (
                <JournalEntry entry={journalEntryForSelectedDate[0]} selectedDate={selectedDate} />
              ) : (
                <div className="py-8">
                  <EmptyState
                    title="No trade details to show here"
                    description="Record your trades and thoughts for this trading day"
                    icon="calendar"
                    action={
                      <Button className="mt-4" size="sm" onClick={() => {}}>
                        <PlusIcon className="h-4 w-4 mr-2" />
                        Import trades
                      </Button>
                    }
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        {/* Calendar sidebar */}
        <div>
          <Card>
            <CardContent className="p-4">
              <div className="space-y-4">
                <Tabs defaultValue="calendar">
                  <TabsList className="w-full">
                    <TabsTrigger value="calendar" className="flex-1">Calendar</TabsTrigger>
                    <TabsTrigger value="list" className="flex-1">List</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="calendar">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <h3 className="text-lg font-medium">
                          {format(month, 'MMMM yyyy')}
                        </h3>
                      </div>
                      <JournalCalendar
                        month={month}
                        onMonthChange={setMonth}
                        selectedDate={selectedDate}
                        onSelect={setSelectedDate}
                        daysWithEntries={daysWithEntries}
                      />
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="list">
                    <div className="space-y-2">
                      {journalEntries && journalEntries.length > 0 ? (
                        journalEntries.map((entry) => (
                          <div 
                            key={entry.id} 
                            className="p-2 rounded hover:bg-muted cursor-pointer"
                            onClick={() => setSelectedDate(new Date(entry.date))}
                          >
                            <div className="font-medium">
                              {format(new Date(entry.date), 'MMM d, yyyy')}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {entry.title}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8 text-muted-foreground">
                          No journal entries yet
                        </div>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <ImportTradesForm open={importDialogOpen} onOpenChange={setImportDialogOpen} />
    </Layout>
  );
}
