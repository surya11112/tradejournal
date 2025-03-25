import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  PlusCircle, 
  Edit, 
  Trash2, 
  Check, 
  X, 
  ChevronDown, 
  ChevronUp, 
  Bookmark, 
  TrendingUp,
  BarChart3,
  ClipboardList,
  MoveVertical
} from 'lucide-react';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Playbook } from '@shared/schema';

interface StrategyPlaybookProps {
  playbooks: Playbook[];
  onAddPlaybook: (playbook: any) => void;
  onUpdatePlaybook: (id: number, playbook: any) => void;
  onDeletePlaybook: (id: number) => void;
}

interface PlaybookRule {
  id: string;
  title: string;
  description: string;
  type: 'entry' | 'exit' | 'management' | 'criteria';
}

export default function StrategyPlaybook({ 
  playbooks, 
  onAddPlaybook, 
  onUpdatePlaybook, 
  onDeletePlaybook 
}: StrategyPlaybookProps) {
  const { toast } = useToast();
  const [expandedPlaybook, setExpandedPlaybook] = React.useState<number | null>(null);
  const [editMode, setEditMode] = React.useState<number | null>(null);
  const [isAdding, setIsAdding] = React.useState(false);
  
  // Form state
  const [name, setName] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [rules, setRules] = React.useState<PlaybookRule[]>([]);
  const [symbols, setSymbols] = React.useState<string[]>([]);
  const [symbolInput, setSymbolInput] = React.useState('');
  const [performance, setPerformance] = React.useState<{
    winRate: number;
    profitFactor: number;
    expectancy: number;
  }>({
    winRate: 0,
    profitFactor: 0,
    expectancy: 0
  });
  
  const resetForm = () => {
    setName('');
    setDescription('');
    setRules([]);
    setSymbols([]);
    setPerformance({
      winRate: 0,
      profitFactor: 0,
      expectancy: 0
    });
  };
  
  const handleEdit = (playbook: Playbook) => {
    setEditMode(playbook.id);
    setName(playbook.name);
    setDescription(playbook.description || '');
    
    // Parse rules from JSON
    const parsedRules = typeof playbook.rules === 'string' 
      ? JSON.parse(playbook.rules as string) 
      : playbook.rules;
      
    setRules(parsedRules.rules || []);
    setSymbols(parsedRules.symbols || []);
    setPerformance({
      winRate: parsedRules.performance?.winRate || 0,
      profitFactor: parsedRules.performance?.profitFactor || 0,
      expectancy: parsedRules.performance?.expectancy || 0
    });
  };
  
  const handleSave = (id?: number) => {
    const playbookData = {
      name,
      description,
      rules: JSON.stringify({
        rules,
        symbols,
        performance
      })
    };
    
    if (id) {
      onUpdatePlaybook(id, playbookData);
      setEditMode(null);
      toast({
        title: "Playbook Updated",
        description: `"${name}" has been updated successfully`,
      });
    } else {
      onAddPlaybook(playbookData);
      setIsAdding(false);
      toast({
        title: "Playbook Created",
        description: `"${name}" has been added to your strategy library`,
      });
    }
    
    resetForm();
  };
  
  const handleCancel = () => {
    setIsAdding(false);
    setEditMode(null);
    resetForm();
  };
  
  const handleAddRule = (type: 'entry' | 'exit' | 'management' | 'criteria') => {
    const newRule: PlaybookRule = {
      id: Date.now().toString(),
      title: '',
      description: '',
      type
    };
    setRules([...rules, newRule]);
  };
  
  const handleRuleChange = (id: string, field: keyof PlaybookRule, value: string) => {
    setRules(rules.map(rule => rule.id === id ? { ...rule, [field]: value } : rule));
  };
  
  const handleRemoveRule = (id: string) => {
    setRules(rules.filter(rule => rule.id !== id));
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
  
  const renderForm = (isEdit = false, id?: number) => {
    return (
      <Card>
        <CardHeader>
          <CardTitle>
            {isEdit ? `Edit Strategy: ${name}` : 'Add New Strategy Playbook'}
          </CardTitle>
          <CardDescription>
            Document your trading strategy with specific rules and parameters
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Strategy Name</Label>
            <Input 
              id="name" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              placeholder="e.g. MACD Crossover Strategy" 
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea 
              id="description" 
              value={description} 
              onChange={(e) => setDescription(e.target.value)} 
              placeholder="Describe the overall concept of your strategy..." 
              rows={3}
            />
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label>Trading Rules</Label>
              <div className="flex gap-1">
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => handleAddRule('entry')}
                  className="h-7 px-2 text-xs"
                >
                  + Entry
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => handleAddRule('exit')}
                  className="h-7 px-2 text-xs"
                >
                  + Exit
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => handleAddRule('management')}
                  className="h-7 px-2 text-xs"
                >
                  + Management
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => handleAddRule('criteria')}
                  className="h-7 px-2 text-xs"
                >
                  + Criteria
                </Button>
              </div>
            </div>
            
            <div className="space-y-3 mt-3">
              {rules.length === 0 ? (
                <div className="text-center p-4 border border-dashed rounded-md">
                  <p className="text-sm text-muted-foreground">
                    Add rules to define your trading strategy
                  </p>
                </div>
              ) : (
                rules.map((rule, index) => (
                  <div key={rule.id} className="p-3 border rounded-md">
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center gap-2">
                        {getRuleTypeIcon(rule.type)}
                        <Badge variant="outline" className="text-xs">
                          {rule.type.charAt(0).toUpperCase() + rule.type.slice(1)}
                        </Badge>
                      </div>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={() => handleRemoveRule(rule.id)}
                        className="h-7 w-7 p-0"
                      >
                        <Trash2 className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    </div>
                    
                    <div className="space-y-2">
                      <Input 
                        value={rule.title} 
                        onChange={(e) => handleRuleChange(rule.id, 'title', e.target.value)}
                        placeholder="Rule title"
                        className="text-sm"
                      />
                      <Textarea 
                        value={rule.description} 
                        onChange={(e) => handleRuleChange(rule.id, 'description', e.target.value)}
                        placeholder="Add details about this rule..."
                        className="text-sm"
                        rows={2}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
          
          <div className="space-y-2">
            <Label>Applicable Symbols/Markets</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {symbols.map((symbol) => (
                <Badge key={symbol} variant="secondary" className="flex items-center gap-1">
                  {symbol}
                  <button type="button" onClick={() => handleRemoveSymbol(symbol)}>
                    <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                  </button>
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={symbolInput}
                onChange={(e) => setSymbolInput(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Add symbol (e.g. AAPL)"
                className="flex-1"
              />
              <Button type="button" variant="outline" onClick={handleAddSymbol}>
                Add
              </Button>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label>Strategy Performance</Label>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1">
                <Label className="text-xs">Win Rate (%)</Label>
                <Input 
                  type="number" 
                  min="0" 
                  max="100" 
                  value={performance.winRate} 
                  onChange={(e) => setPerformance({...performance, winRate: Number(e.target.value)})}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Profit Factor</Label>
                <Input 
                  type="number" 
                  min="0" 
                  step="0.01" 
                  value={performance.profitFactor} 
                  onChange={(e) => setPerformance({...performance, profitFactor: Number(e.target.value)})}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Expectancy (R)</Label>
                <Input 
                  type="number" 
                  step="0.01" 
                  value={performance.expectancy} 
                  onChange={(e) => setPerformance({...performance, expectancy: Number(e.target.value)})}
                />
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button 
            variant="outline" 
            onClick={handleCancel}
          >
            Cancel
          </Button>
          <Button 
            onClick={() => handleSave(id)}
            disabled={!name || rules.length === 0}
          >
            {isEdit ? 'Update Strategy' : 'Save Strategy'}
          </Button>
        </CardFooter>
      </Card>
    );
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Strategy Playbooks</h2>
        {!isAdding && (
          <Button onClick={() => setIsAdding(true)}>
            <PlusCircle className="h-4 w-4 mr-2" />
            Add Strategy
          </Button>
        )}
      </div>
      
      {isAdding && renderForm()}
      {editMode !== null && renderForm(true, editMode)}
      
      <div className="grid grid-cols-1 gap-4">
        {playbooks.length === 0 && !isAdding ? (
          <Card className="border-dashed">
            <CardContent className="pt-6 flex flex-col items-center justify-center">
              <Bookmark className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <p className="text-center text-muted-foreground mb-4">
                You don't have any strategy playbooks yet. Create your first trading strategy to get started.
              </p>
              <Button onClick={() => setIsAdding(true)}>
                <PlusCircle className="h-4 w-4 mr-2" />
                Add First Strategy
              </Button>
            </CardContent>
          </Card>
        ) : (
          playbooks.map((playbook) => (
            <Card key={playbook.id} className={expandedPlaybook === playbook.id ? 'border-primary' : ''}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle>{playbook.name}</CardTitle>
                  <div className="flex items-center gap-1">
                    {editMode !== playbook.id && (
                      <>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          onClick={() => handleEdit(playbook)}
                          className="h-8 w-8 p-0"
                        >
                          <Edit className="h-4 w-4 text-muted-foreground" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          onClick={() => {
                            onDeletePlaybook(playbook.id);
                            toast({
                              title: "Playbook Deleted",
                              description: `"${playbook.name}" has been deleted`,
                            });
                          }}
                          className="h-8 w-8 p-0"
                        >
                          <Trash2 className="h-4 w-4 text-muted-foreground" />
                        </Button>
                      </>
                    )}
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      onClick={() => setExpandedPlaybook(expandedPlaybook === playbook.id ? null : playbook.id)}
                      className="h-8 w-8 p-0"
                    >
                      {expandedPlaybook === playbook.id ? (
                        <ChevronUp className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                </div>
                {playbook.description && (
                  <CardDescription>{playbook.description}</CardDescription>
                )}
              </CardHeader>
              
              {expandedPlaybook === playbook.id && (
                <CardContent className="pt-0">
                  {(() => {
                    // Parse the rules from JSON
                    let parsedRules;
                    try {
                      parsedRules = typeof playbook.rules === 'string' 
                        ? JSON.parse(playbook.rules as string) 
                        : playbook.rules;
                    } catch (e) {
                      return <p className="text-red-500">Error parsing rules</p>;
                    }
                    
                    const rules = parsedRules.rules || [];
                    const symbols = parsedRules.symbols || [];
                    const performance = parsedRules.performance || {};
                    
                    return (
                      <div className="space-y-6">
                        <div>
                          <h4 className="text-sm font-medium mb-2">Trading Rules</h4>
                          <div className="space-y-2">
                            {rules.length === 0 ? (
                              <p className="text-sm text-muted-foreground">No rules defined</p>
                            ) : (
                              rules.map((rule: PlaybookRule) => (
                                <div key={rule.id} className="border rounded-md p-3">
                                  <div className="flex items-center gap-2 mb-1">
                                    {getRuleTypeIcon(rule.type)}
                                    <Badge variant="outline" className="text-xs">
                                      {rule.type.charAt(0).toUpperCase() + rule.type.slice(1)}
                                    </Badge>
                                  </div>
                                  <h4 className="font-medium">{rule.title}</h4>
                                  <p className="text-sm text-muted-foreground">{rule.description}</p>
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                        
                        {symbols.length > 0 && (
                          <div>
                            <h4 className="text-sm font-medium mb-2">Applicable Symbols</h4>
                            <div className="flex flex-wrap gap-1">
                              {symbols.map((symbol: string) => (
                                <Badge key={symbol} variant="secondary">{symbol}</Badge>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {(performance.winRate || performance.profitFactor || performance.expectancy) && (
                          <div>
                            <h4 className="text-sm font-medium mb-2">Performance Metrics</h4>
                            <div className="grid grid-cols-3 gap-4">
                              {performance.winRate > 0 && (
                                <div>
                                  <div className="text-xs text-muted-foreground">Win Rate</div>
                                  <div className="font-medium">{performance.winRate}%</div>
                                </div>
                              )}
                              {performance.profitFactor > 0 && (
                                <div>
                                  <div className="text-xs text-muted-foreground">Profit Factor</div>
                                  <div className="font-medium">{performance.profitFactor}</div>
                                </div>
                              )}
                              {performance.expectancy !== 0 && (
                                <div>
                                  <div className="text-xs text-muted-foreground">Expectancy</div>
                                  <div className="font-medium">{performance.expectancy}R</div>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </CardContent>
              )}
            </Card>
          ))
        )}
      </div>
    </div>
  );
}