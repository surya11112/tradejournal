import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  PlusCircle, 
  FileText, 
  Bookmark, 
  TrendingUp,
  BarChart3,
  ClipboardList,
  MoveVertical,
  X
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Playbook } from '@shared/schema';

interface PlaybookRuleType {
  id: string;
  title: string;
  description: string;
  type: 'entry' | 'exit' | 'management' | 'criteria';
}

interface PlaybookEditorProps {
  playbook: Playbook;
  isEditing: boolean;
  onEdit: () => void;
  onClose: () => void;
}

export default function PlaybookEditor({ 
  playbook, 
  isEditing, 
  onEdit, 
  onClose 
}: PlaybookEditorProps) {
  const { toast } = useToast();
  const [name, setName] = React.useState(playbook.name);
  const [description, setDescription] = React.useState(playbook.description || '');
  const [activeTab, setActiveTab] = React.useState('entry');
  
  // Parse rules from JSON
  const playbookData = React.useMemo(() => {
    try {
      const parsedData = typeof playbook.rules === 'string' 
        ? JSON.parse(playbook.rules as string) 
        : playbook.rules;
      
      return {
        rules: parsedData.rules || [],
        symbols: parsedData.symbols || [],
        performance: parsedData.performance || { winRate: 0, profitFactor: 0, expectancy: 0 }
      };
    } catch (e) {
      return {
        rules: [],
        symbols: [],
        performance: { winRate: 0, profitFactor: 0, expectancy: 0 }
      };
    }
  }, [playbook]);
  
  const [rules, setRules] = React.useState<PlaybookRuleType[]>(playbookData.rules);
  const [symbolInput, setSymbolInput] = React.useState('');
  const [symbols, setSymbols] = React.useState<string[]>(playbookData.symbols);
  
  const handleSaveRule = () => {
    const newRule: PlaybookRuleType = {
      id: Date.now().toString(),
      title: '',
      description: '',
      type: activeTab as 'entry' | 'exit' | 'management' | 'criteria'
    };
    
    setRules([...rules, newRule]);
    toast({
      title: "Rule Added",
      description: `New ${activeTab} rule added to the playbook`,
    });
  };
  
  const handleUpdateRule = (id: string, field: keyof PlaybookRuleType, value: string) => {
    setRules(rules.map(rule => 
      rule.id === id ? { ...rule, [field]: value } : rule
    ));
  };
  
  const handleRemoveRule = (id: string) => {
    setRules(rules.filter(rule => rule.id !== id));
    toast({
      title: "Rule Removed",
      description: "Rule has been removed from the playbook",
    });
  };
  
  const handleAddSymbol = () => {
    if (symbolInput.trim() && !symbols.includes(symbolInput.trim())) {
      setSymbols([...symbols, symbolInput.trim()]);
      setSymbolInput('');
    }
  };
  
  const handleRemoveSymbol = (symbol: string) => {
    setSymbols(symbols.filter(s => s !== symbol));
  };
  
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddSymbol();
    }
  };
  
  const getRuleTypeIcon = (type: string) => {
    switch (type) {
      case 'entry':
        return <TrendingUp className="h-4 w-4 text-emerald-500" />;
      case 'exit':
        return <BarChart3 className="h-4 w-4 text-red-500" />;
      case 'management':
        return <MoveVertical className="h-4 w-4 text-amber-500" />;
      case 'criteria':
        return <ClipboardList className="h-4 w-4 text-blue-500" />;
      default:
        return null;
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Bookmark className="h-5 w-5 text-primary" />
              {isEditing ? (
                <Input 
                  value={name} 
                  onChange={(e) => setName(e.target.value)}
                  className="h-7 mt-[-4px]"
                />
              ) : (
                playbook.name
              )}
            </CardTitle>
            <CardDescription>
              {isEditing ? (
                <Textarea 
                  value={description} 
                  onChange={(e) => setDescription(e.target.value)}
                  className="mt-2"
                  rows={2}
                />
              ) : (
                description || "No description provided"
              )}
            </CardDescription>
          </div>
          
          <div className="flex space-x-2">
            {isEditing ? (
              <Button size="sm" onClick={onClose}>Save</Button>
            ) : (
              <>
                <Button size="sm" variant="outline" onClick={onEdit}>Edit</Button>
                <Button size="sm" variant="outline" onClick={onClose}>Close</Button>
              </>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="entry" className="flex items-center gap-1">
              <TrendingUp className="h-4 w-4" />
              <span className="hidden sm:inline">Entry Rules</span>
            </TabsTrigger>
            <TabsTrigger value="exit" className="flex items-center gap-1">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Exit Rules</span>
            </TabsTrigger>
            <TabsTrigger value="management" className="flex items-center gap-1">
              <MoveVertical className="h-4 w-4" />
              <span className="hidden sm:inline">Management</span>
            </TabsTrigger>
            <TabsTrigger value="criteria" className="flex items-center gap-1">
              <ClipboardList className="h-4 w-4" />
              <span className="hidden sm:inline">Criteria</span>
            </TabsTrigger>
          </TabsList>
          
          {['entry', 'exit', 'management', 'criteria'].map((tabValue) => (
            <TabsContent key={tabValue} value={tabValue}>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">
                    {tabValue.charAt(0).toUpperCase() + tabValue.slice(1)} Rules
                  </h3>
                  
                  {isEditing && (
                    <Button 
                      size="sm" 
                      onClick={handleSaveRule}
                      className="flex items-center gap-1"
                    >
                      <PlusCircle className="h-4 w-4" />
                      Add Rule
                    </Button>
                  )}
                </div>
                
                <div className="space-y-3">
                  {rules.filter(rule => rule.type === tabValue).length === 0 ? (
                    <div className="text-center py-6 border-dashed border rounded-md">
                      <FileText className="h-10 w-10 mx-auto text-muted-foreground/40 mb-2" />
                      <p className="text-muted-foreground">
                        No {tabValue} rules defined yet
                      </p>
                      {isEditing && (
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="mt-2"
                          onClick={handleSaveRule}
                        >
                          <PlusCircle className="h-4 w-4 mr-1" />
                          Add {tabValue} rule
                        </Button>
                      )}
                    </div>
                  ) : (
                    rules
                      .filter(rule => rule.type === tabValue)
                      .map(rule => (
                        <div key={rule.id} className="p-4 border rounded-md">
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center gap-2">
                              {getRuleTypeIcon(rule.type)}
                              <Badge variant="outline">{rule.type}</Badge>
                            </div>
                            
                            {isEditing && (
                              <Button 
                                size="sm" 
                                variant="ghost"
                                onClick={() => handleRemoveRule(rule.id)}
                                className="h-7 w-7 p-0"
                              >
                                <X className="h-4 w-4 text-muted-foreground" />
                              </Button>
                            )}
                          </div>
                          
                          {isEditing ? (
                            <div className="space-y-3">
                              <div>
                                <Label htmlFor={`title-${rule.id}`} className="text-xs text-muted-foreground">
                                  Title
                                </Label>
                                <Input
                                  id={`title-${rule.id}`}
                                  value={rule.title}
                                  onChange={(e) => handleUpdateRule(rule.id, 'title', e.target.value)}
                                  placeholder="Enter rule title"
                                />
                              </div>
                              <div>
                                <Label htmlFor={`desc-${rule.id}`} className="text-xs text-muted-foreground">
                                  Description
                                </Label>
                                <Textarea
                                  id={`desc-${rule.id}`}
                                  value={rule.description}
                                  onChange={(e) => handleUpdateRule(rule.id, 'description', e.target.value)}
                                  placeholder="Enter rule description"
                                  rows={3}
                                />
                              </div>
                            </div>
                          ) : (
                            <>
                              <h4 className="font-medium mb-1">{rule.title || "Untitled Rule"}</h4>
                              <p className="text-sm text-muted-foreground">
                                {rule.description || "No description provided"}
                              </p>
                            </>
                          )}
                        </div>
                      ))
                  )}
                </div>
              </div>
            </TabsContent>
          ))}
        </Tabs>
        
        <div className="mt-6 pt-6 border-t">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-medium">Applicable Symbols</h3>
            
            {isEditing && (
              <div className="flex gap-2">
                <Input
                  value={symbolInput}
                  onChange={(e) => setSymbolInput(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Symbol (e.g. AAPL)"
                  className="w-32"
                />
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={handleAddSymbol}
                >
                  Add
                </Button>
              </div>
            )}
          </div>
          
          <div className="flex flex-wrap gap-2">
            {symbols.length === 0 ? (
              <p className="text-sm text-muted-foreground">No symbols added yet</p>
            ) : (
              symbols.map(symbol => (
                <Badge key={symbol} variant="secondary" className="flex items-center gap-1">
                  {symbol}
                  {isEditing && (
                    <button 
                      type="button" 
                      onClick={() => handleRemoveSymbol(symbol)}
                      className="ml-1"
                    >
                      <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                    </button>
                  )}
                </Badge>
              ))
            )}
          </div>
        </div>
        
        <div className="mt-6 pt-6 border-t">
          <h3 className="text-lg font-medium mb-3">Performance Metrics</h3>
          
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label className="text-xs text-muted-foreground">Win Rate</Label>
              <div className="flex items-end gap-1">
                <span className="text-xl font-medium">{playbookData.performance.winRate || 0}</span>
                <span className="text-sm text-muted-foreground mb-1">%</span>
              </div>
            </div>
            
            <div>
              <Label className="text-xs text-muted-foreground">Profit Factor</Label>
              <div className="text-xl font-medium">
                {playbookData.performance.profitFactor || 0}
              </div>
            </div>
            
            <div>
              <Label className="text-xs text-muted-foreground">Expectancy</Label>
              <div className="flex items-end gap-1">
                <span className="text-xl font-medium">{playbookData.performance.expectancy || 0}</span>
                <span className="text-sm text-muted-foreground mb-1">R</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
      
      {isEditing && (
        <CardFooter className="flex justify-end">
          <Button onClick={onClose}>Save Changes</Button>
        </CardFooter>
      )}
    </Card>
  );
}