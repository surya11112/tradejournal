import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Layout from '@/components/layout/Layout';
import { 
  Card, 
  CardContent, 
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SearchIcon, PlusIcon, FilterIcon } from 'lucide-react';
import FolderList from '@/components/notebook/FolderList';
import NoteEditor from '@/components/notebook/NoteEditor';
import EmptyState from '@/components/dashboard/EmptyState';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Note } from '@shared/schema';

export default function Notebook() {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedFolder, setSelectedFolder] = React.useState('All notes');
  const [selectedNote, setSelectedNote] = React.useState<Note | null>(null);
  const [isEditing, setIsEditing] = React.useState(false);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { data: notes, isLoading } = useQuery<Note[]>({
    queryKey: ['/api/notes'],
  });
  
  const filteredNotes = React.useMemo(() => {
    if (!notes) return [];
    
    let filtered = notes;
    
    // Filter by folder
    if (selectedFolder !== 'All notes') {
      filtered = filtered.filter(note => note.folder === selectedFolder);
    }
    
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(note => 
        note.title.toLowerCase().includes(query) || 
        note.content.toLowerCase().includes(query) ||
        note.tags?.some(tag => tag.toLowerCase().includes(query))
      );
    }
    
    return filtered;
  }, [notes, selectedFolder, searchQuery]);
  
  const folders = React.useMemo(() => {
    if (!notes) return ['All notes'];
    
    const folderSet = new Set(['All notes']);
    notes.forEach(note => {
      if (note.folder) {
        folderSet.add(note.folder);
      }
    });
    
    return Array.from(folderSet);
  }, [notes]);
  
  const { mutate: createNote } = useMutation({
    mutationFn: async (newNote: { title: string; content: string; folder: string }) => {
      const response = await apiRequest('POST', '/api/notes', {
        ...newNote,
        tags: []
      });
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/notes'] });
      setSelectedNote(data);
      setIsEditing(true);
      toast({
        title: 'Note Created',
        description: 'Your note has been created'
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to create note: ${error.message}`,
        variant: 'destructive'
      });
    }
  });
  
  const handleCreateNote = () => {
    createNote({
      title: 'New Note',
      content: '',
      folder: selectedFolder === 'All notes' ? 'My notes' : selectedFolder
    });
  };
  
  return (
    <Layout>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 h-[calc(100vh-12.5rem)]">
        {/* Sidebar */}
        <div className="md:col-span-1">
          <Card className="h-full">
            <CardHeader className="pb-2">
              <Input 
                placeholder="Search notes" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
                icon={<SearchIcon className="h-4 w-4 text-muted-foreground" />}
              />
            </CardHeader>
            <CardContent className="p-0 h-[calc(100%-4rem)] overflow-y-auto">
              <div className="p-4">
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={handleCreateNote}
                >
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Add folder
                </Button>
              </div>
              
              <div>
                <h3 className="px-4 mb-1 text-sm font-medium text-muted-foreground">Folders</h3>
                <FolderList 
                  folders={folders}
                  selectedFolder={selectedFolder}
                  onSelectFolder={setSelectedFolder}
                />
              </div>
              
              <div className="mt-4">
                <h3 className="px-4 mb-1 text-sm font-medium text-muted-foreground">Tags</h3>
                <div className="px-4 py-1">
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start text-muted-foreground text-sm"
                    size="sm"
                  >
                    Recently deleted
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Note List */}
        <div className="md:col-span-3 flex flex-col h-full">
          <Card className="h-full flex flex-col">
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle>{selectedFolder}</CardTitle>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" onClick={handleCreateNote}>
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Create Note
                </Button>
                <Button variant="ghost" size="sm">
                  <FilterIcon className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="flex-1 overflow-hidden">
              {isLoading ? (
                <div className="h-full flex items-center justify-center">
                  <p>Loading notes...</p>
                </div>
              ) : filteredNotes.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full">
                  {/* Notes list */}
                  <div className="border-r border-border pr-4 h-full overflow-y-auto">
                    {filteredNotes.map(note => (
                      <div 
                        key={note.id}
                        className={`p-3 cursor-pointer rounded-md mb-2 ${selectedNote?.id === note.id ? 'bg-secondary' : 'hover:bg-secondary/50'}`}
                        onClick={() => {
                          setSelectedNote(note);
                          setIsEditing(false);
                        }}
                      >
                        <h3 className="font-medium mb-1">{note.title}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {note.content}
                        </p>
                      </div>
                    ))}
                  </div>
                  
                  {/* Note editor */}
                  <div className="h-full overflow-y-auto">
                    {selectedNote ? (
                      <NoteEditor 
                        note={selectedNote} 
                        isEditing={isEditing} 
                        onEdit={() => setIsEditing(true)}
                      />
                    ) : (
                      <div className="h-full flex items-center justify-center">
                        <p className="text-muted-foreground">Select a note to view</p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <EmptyState
                  title="No notes to show here"
                  description="Create your first note to get started"
                  icon="notes"
                  action={
                    <Button onClick={handleCreateNote}>
                      <PlusIcon className="h-4 w-4 mr-2" />
                      Create Note
                    </Button>
                  }
                />
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
