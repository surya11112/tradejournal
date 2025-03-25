import React from 'react';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { format } from 'date-fns';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import {
  CalendarIcon,
  EditIcon,
  SaveIcon,
  TrashIcon,
  SunIcon,
  CloudIcon
} from 'lucide-react';
import { JournalEntry as JournalEntryType } from '@shared/schema';

interface JournalEntryProps {
  entry?: JournalEntryType;
  selectedDate: Date;
}

export default function JournalEntry({ entry, selectedDate }: JournalEntryProps) {
  const [isEditing, setIsEditing] = React.useState(!entry);
  const [title, setTitle] = React.useState(entry?.title || '');
  const [content, setContent] = React.useState(entry?.content || '');
  const [marketNotes, setMarketNotes] = React.useState(entry?.marketNotes || '');
  const [mood, setMood] = React.useState(entry?.mood || 3);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  React.useEffect(() => {
    if (entry) {
      setTitle(entry.title);
      setContent(entry.content);
      setMarketNotes(entry.marketNotes || '');
      setMood(entry.mood || 3);
      setIsEditing(false);
    } else {
      setTitle('Daily Journal Entry');
      setContent('');
      setMarketNotes('');
      setMood(3);
      setIsEditing(true);
    }
  }, [entry]);
  
  const { mutate: saveJournalEntry, isPending } = useMutation({
    mutationFn: async () => {
      const payload = {
        id: entry?.id,
        date: selectedDate.toISOString(),
        title,
        content,
        marketNotes,
        mood,
        images: entry?.images || []
      };
      
      if (entry) {
        // Update existing entry
        const response = await apiRequest('PUT', `/api/journal/${entry.id}`, payload);
        return response.json();
      } else {
        // Create new entry
        const response = await apiRequest('POST', '/api/journal', payload);
        return response.json();
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/journal'] });
      queryClient.invalidateQueries({ 
        queryKey: [`/api/journal/date/${format(selectedDate, 'yyyy-MM-dd')}`] 
      });
      
      toast({
        title: entry ? 'Journal Updated' : 'Journal Created',
        description: entry 
          ? 'Your journal entry has been updated' 
          : 'Your journal entry has been created',
      });
      
      setIsEditing(false);
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to save journal entry: ${error.message}`,
        variant: 'destructive',
      });
    }
  });
  
  const { mutate: deleteJournalEntry } = useMutation({
    mutationFn: async () => {
      if (!entry) return;
      const response = await apiRequest('DELETE', `/api/journal/${entry.id}`, undefined);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/journal'] });
      
      toast({
        title: 'Journal Deleted',
        description: 'Your journal entry has been deleted',
      });
      
      setTitle('Daily Journal Entry');
      setContent('');
      setMarketNotes('');
      setMood(3);
      setIsEditing(true);
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to delete journal entry: ${error.message}`,
        variant: 'destructive',
      });
    }
  });
  
  const handleSave = () => {
    // Perform validation
    if (!title.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Title is required',
        variant: 'destructive',
      });
      return;
    }
    
    saveJournalEntry();
  };
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <CalendarIcon className="h-5 w-5 text-muted-foreground" />
          <h2 className="text-xl font-semibold">
            {format(selectedDate, 'EEEE, MMMM d, yyyy')}
          </h2>
        </div>
        
        <div className="flex space-x-2">
          {!isEditing ? (
            <>
              <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                <EditIcon className="h-4 w-4 mr-2" />
                Edit
              </Button>
              {entry && (
                <Button 
                  variant="destructive" 
                  size="sm"
                  onClick={() => deleteJournalEntry()}
                >
                  <TrashIcon className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              )}
            </>
          ) : (
            <Button onClick={handleSave} disabled={isPending}>
              <SaveIcon className="h-4 w-4 mr-2" />
              {isPending ? 'Saving...' : 'Save Entry'}
            </Button>
          )}
        </div>
      </div>
      
      {isEditing ? (
        <div className="space-y-4">
          <div>
            <Input 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Journal Title"
              className="text-lg font-medium"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="py-3">
                <CardTitle className="text-sm font-medium flex items-center">
                  <CloudIcon className="h-4 w-4 mr-2" />
                  Market Conditions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea 
                  value={marketNotes}
                  onChange={(e) => setMarketNotes(e.target.value)}
                  placeholder="Describe today's market conditions..."
                  rows={4}
                />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="py-3">
                <CardTitle className="text-sm font-medium flex items-center">
                  <SunIcon className="h-4 w-4 mr-2" />
                  Trading Mood
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">How do you feel about your trading today?</p>
                  <div className="flex justify-between">
                    {[1, 2, 3, 4, 5].map((value) => (
                      <Button
                        key={value}
                        type="button"
                        variant={mood === value ? "default" : "outline"}
                        className={`h-10 w-10 rounded-full p-0 ${mood === value ? "bg-primary" : ""}`}
                        onClick={() => setMood(value)}
                      >
                        {value}
                      </Button>
                    ))}
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground px-2">
                    <span>Poor</span>
                    <span>Excellent</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div>
            <h3 className="text-sm font-medium mb-2">Journal Entry</h3>
            <Textarea 
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write about your trading day, lessons learned, and thoughts..."
              rows={12}
            />
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <h1 className="text-2xl font-bold">{title}</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {marketNotes && (
              <Card>
                <CardHeader className="py-3">
                  <CardTitle className="text-sm font-medium flex items-center">
                    <CloudIcon className="h-4 w-4 mr-2" />
                    Market Conditions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="whitespace-pre-line">{marketNotes}</p>
                </CardContent>
              </Card>
            )}
            
            <Card>
              <CardHeader className="py-3">
                <CardTitle className="text-sm font-medium flex items-center">
                  <SunIcon className="h-4 w-4 mr-2" />
                  Trading Mood
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between">
                  {[1, 2, 3, 4, 5].map((value) => (
                    <div
                      key={value}
                      className={`h-10 w-10 rounded-full flex items-center justify-center ${
                        mood === value 
                          ? "bg-primary text-primary-foreground" 
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {value}
                    </div>
                  ))}
                </div>
                <div className="flex justify-between text-xs text-muted-foreground px-2 mt-2">
                  <span>Poor</span>
                  <span>Excellent</span>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="prose prose-invert max-w-none">
            <p className="whitespace-pre-line">{content}</p>
          </div>
        </div>
      )}
    </div>
  );
}
