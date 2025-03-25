import React from 'react';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { EditIcon, SaveIcon, TagIcon, XIcon, PlusIcon } from 'lucide-react';
import { Note } from '@shared/schema';

interface NoteEditorProps {
  note: Note;
  isEditing: boolean;
  onEdit: () => void;
}

export default function NoteEditor({ note, isEditing, onEdit }: NoteEditorProps) {
  const [title, setTitle] = React.useState(note.title);
  const [content, setContent] = React.useState(note.content);
  const [folder, setFolder] = React.useState(note.folder);
  const [tags, setTags] = React.useState<string[]>(note.tags || []);
  const [tagInput, setTagInput] = React.useState('');
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  React.useEffect(() => {
    setTitle(note.title);
    setContent(note.content);
    setFolder(note.folder);
    setTags(note.tags || []);
  }, [note]);
  
  const { mutate: updateNote, isPending } = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('PUT', `/api/notes/${note.id}`, {
        title,
        content,
        folder,
        tags
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notes'] });
      
      toast({
        title: 'Note Updated',
        description: 'Your note has been saved successfully'
      });
      
      onEdit(); // Exit edit mode
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to update note: ${error.message}`,
        variant: 'destructive'
      });
    }
  });
  
  const { mutate: deleteNote } = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('DELETE', `/api/notes/${note.id}`, undefined);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notes'] });
      
      toast({
        title: 'Note Deleted',
        description: 'Your note has been deleted'
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to delete note: ${error.message}`,
        variant: 'destructive'
      });
    }
  });
  
  const handleSave = () => {
    if (!title.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Note title cannot be empty',
        variant: 'destructive'
      });
      return;
    }
    
    updateNote();
  };
  
  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };
  
  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };
  
  if (isEditing) {
    return (
      <div className="p-4 space-y-4">
        <div className="flex justify-between items-center">
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Note title"
            className="text-lg font-medium"
          />
          <Button variant="outline" size="sm" onClick={handleSave} disabled={isPending}>
            <SaveIcon className="h-4 w-4 mr-2" />
            {isPending ? 'Saving...' : 'Save'}
          </Button>
        </div>
        
        <div>
          <div className="flex items-center mb-2">
            <TagIcon className="h-4 w-4 mr-2 text-muted-foreground" />
            <span className="text-sm font-medium">Tags</span>
          </div>
          <div className="flex flex-wrap gap-2 mb-2">
            {tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                {tag}
                <button type="button" onClick={() => removeTag(tag)}>
                  <XIcon className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                </button>
              </Badge>
            ))}
            <div className="flex">
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Add tag..."
                className="h-8 w-auto min-w-[100px]"
              />
              <Button 
                type="button" 
                size="sm" 
                variant="ghost" 
                onClick={addTag}
                className="h-8 px-2"
              >
                <PlusIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
        
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write your note content here..."
          className="min-h-[300px]"
        />
      </div>
    );
  }
  
  return (
    <div className="p-4 space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">{title}</h2>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" onClick={onEdit}>
            <EditIcon className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button variant="destructive" size="sm" onClick={() => deleteNote()}>
            <XIcon className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>
      
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <Badge key={tag} variant="secondary">
              {tag}
            </Badge>
          ))}
        </div>
      )}
      
      <div className="text-sm text-muted-foreground">
        {`Last updated: ${new Date(note.updatedAt).toLocaleString()}`}
      </div>
      
      <div className="prose prose-invert max-w-none">
        <p className="whitespace-pre-line">{content}</p>
      </div>
    </div>
  );
}
