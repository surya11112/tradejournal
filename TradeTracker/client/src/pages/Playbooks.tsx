import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Layout from '@/components/layout/Layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PlusIcon } from 'lucide-react';
import EmptyState from '@/components/dashboard/EmptyState';
import PlaybookEditor from '@/components/playbooks/PlaybookEditor';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Playbook } from '@shared/schema';

export default function Playbooks() {
  const [activeTab, setActiveTab] = React.useState('my');
  const [selectedPlaybook, setSelectedPlaybook] = React.useState<Playbook | null>(null);
  const [isEditing, setIsEditing] = React.useState(false);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { data: playbooks, isLoading } = useQuery<Playbook[]>({
    queryKey: ['/api/playbooks'],
  });
  
  const { mutate: createPlaybook, isPending } = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/playbooks', {
        name: 'New Playbook',
        description: 'Add your trading strategy rules and guidelines here',
        rules: []
      });
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/playbooks'] });
      setSelectedPlaybook(data);
      setIsEditing(true);
      toast({
        title: 'Playbook Created',
        description: 'Your new playbook has been created'
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to create playbook: ${error.message}`,
        variant: 'destructive'
      });
    }
  });
  
  const handleCreatePlaybook = () => {
    createPlaybook();
  };
  
  return (
    <Layout>
      <Card>
        <CardContent className="p-0">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="border-b border-border">
              <div className="flex items-center justify-between px-4 py-2">
                <TabsList>
                  <TabsTrigger value="my">My playbook</TabsTrigger>
                  <TabsTrigger value="shared">Shared playbook</TabsTrigger>
                  <TabsTrigger value="templates">Templates</TabsTrigger>
                </TabsList>
                
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm">
                    Date range
                  </Button>
                  <Button variant="outline" size="sm">
                    All accounts
                  </Button>
                </div>
              </div>
            </div>
            
            <TabsContent value="my" className="p-6">
              {isLoading ? (
                <div className="h-96 flex items-center justify-center">
                  <p>Loading playbooks...</p>
                </div>
              ) : playbooks && playbooks.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {playbooks.map(playbook => (
                    <Card 
                      key={playbook.id} 
                      className="cursor-pointer hover:border-primary transition-colors"
                      onClick={() => {
                        setSelectedPlaybook(playbook);
                        setIsEditing(false);
                      }}
                    >
                      <CardContent className="p-6">
                        <h3 className="text-lg font-medium mb-2">{playbook.name}</h3>
                        <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
                          {playbook.description}
                        </p>
                        <div className="flex justify-between items-center text-xs text-muted-foreground">
                          <span>Created: {new Date(playbook.createdAt).toLocaleDateString()}</span>
                          <span>{(playbook.rules as any[]).length || 0} rules</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="py-16">
                  <EmptyState
                    title="Build your trading playbook"
                    description="List your rules, track and optimize your playbook"
                    icon="notes"
                    action={
                      <Button onClick={handleCreatePlaybook} disabled={isPending}>
                        <PlusIcon className="h-4 w-4 mr-2" />
                        Create playbook
                      </Button>
                    }
                  />
                </div>
              )}
              
              {selectedPlaybook && (
                <PlaybookEditor 
                  playbook={selectedPlaybook}
                  isEditing={isEditing}
                  onEdit={() => setIsEditing(true)}
                  onClose={() => setSelectedPlaybook(null)}
                />
              )}
            </TabsContent>
            
            <TabsContent value="shared" className="p-6">
              <EmptyState
                title="No shared playbooks"
                description="Shared playbooks from other users will appear here"
                icon="notes"
              />
            </TabsContent>
            
            <TabsContent value="templates" className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="cursor-pointer hover:border-primary transition-colors">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-medium mb-2">Swing Trading Template</h3>
                    <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
                      A comprehensive template for swing trading strategies
                    </p>
                    <Button variant="outline" size="sm" className="w-full">
                      Use Template
                    </Button>
                  </CardContent>
                </Card>
                
                <Card className="cursor-pointer hover:border-primary transition-colors">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-medium mb-2">Day Trading Template</h3>
                    <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
                      Rules and guidelines for day trading strategies
                    </p>
                    <Button variant="outline" size="sm" className="w-full">
                      Use Template
                    </Button>
                  </CardContent>
                </Card>
                
                <Card className="cursor-pointer hover:border-primary transition-colors">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-medium mb-2">Position Trading Template</h3>
                    <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
                      Long-term position trading strategy template
                    </p>
                    <Button variant="outline" size="sm" className="w-full">
                      Use Template
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </Layout>
  );
}
