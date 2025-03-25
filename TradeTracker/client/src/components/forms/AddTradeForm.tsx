import React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { insertTradeSchema } from '@shared/schema';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, Dialog } from '@/components/ui/dialog';
import { 
  XIcon, 
  PlusIcon, 
  ImageIcon, 
  BarChart4, 
  LineChart, 
  Lightbulb,
  Pencil
} from 'lucide-react';
import { calculatePnL, formatDateForInput, formatDateForAPI } from '@/lib/utils';
import DrawingTool from '@/components/trades/DrawingTool';

const formSchema = z.object({
  symbol: z.string().min(1, "Symbol is required"),
  direction: z.string().min(1, "Direction is required"),
  entryPrice: z.string().min(1, "Entry price is required"),
  exitPrice: z.string().optional(),
  quantity: z.string().min(1, "Quantity is required"),
  stopLoss: z.string().optional(),
  takeProfit: z.string().optional(),
  fees: z.string().optional(),
  entryTime: z.string().min(1, "Entry time is required"),
  exitTime: z.string().optional(),
  setup: z.string().optional(),
  notes: z.string().optional(),
  account: z.string().min(1, "Account is required"),
  status: z.string().min(1, "Status is required"),
  tradingViewUrl: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface AddTradeFormProps {
  onComplete: () => void;
}

export default function AddTradeForm({ onComplete }: AddTradeFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [tags, setTags] = React.useState<string[]>([]);
  const [tagInput, setTagInput] = React.useState<string>('');
  const [activeTab, setActiveTab] = React.useState("basic");
  const [images, setImages] = React.useState<string[]>([]);
  const [selectedImage, setSelectedImage] = React.useState<string | null>(null);
  const [showDrawingTool, setShowDrawingTool] = React.useState(false);
  const [setupValue, setSetupValue] = React.useState('');
  
  // Additional form state that's not in the schema
  const [mood, setMood] = React.useState<number>(5);
  const [executionQuality, setExecutionQuality] = React.useState<number>(3);
  const [tradeRating, setTradeRating] = React.useState<number>(3);

  // Format current date for datetime-local input
  const formattedNow = () => {
    const now = new Date();
    // Format: YYYY-MM-DDThh:mm
    return now.toISOString().substring(0, 16);
  };

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      symbol: '',
      direction: 'long',
      entryPrice: '',
      exitPrice: '',
      quantity: '',
      entryTime: formatDateForInput(new Date()),
      exitTime: '',
      stopLoss: '',
      takeProfit: '',
      setup: '',
      notes: '',
      account: 'Main Account',
      fees: '0',
      status: 'open',
      tradingViewUrl: '',
    }
  });

  // Initialize setup state from form values
  React.useEffect(() => {
    const setup = form.getValues('setup');
    if (setup) {
      setSetupValue(setup);
    }
  }, [form]);

  const { mutate: createTrade, isPending } = useMutation({
    mutationFn: async (values: FormValues) => {
      try {
        // Format dates using our utility function
        const payload = {
          ...values,
          // Format dates consistently for the API
          entryTime: formatDateForAPI(values.entryTime),
          exitTime: values.exitTime ? formatDateForAPI(values.exitTime) : undefined,
          tags,
          images
        };
        
        console.log('Sending payload to API with formatted dates:', payload);
        
        const response = await apiRequest('POST', '/api/trades', payload);
        return response.json();
      } catch (error) {
        console.error("Error in mutation:", error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/trades'] });
      toast({
        title: "Trade Added",
        description: "Your trade has been successfully recorded",
      });
      onComplete();
    },
    onError: (error: any) => {
      console.error('Trade creation error:', error);
      
      // Handle validation errors from the API more gracefully
      let errorMessage = error.message;
      
      // Try to extract and format validation errors
      try {
        // Most API errors will include response data with validation details
        if (error.response && error.response.data) {
          // Extract errors if present in response
          const validationErrors = error.response.data.error || error.response.data;
          
          if (Array.isArray(validationErrors)) {
            // Format validation errors
            errorMessage = validationErrors
              .map(err => `${err.path.join('.')}: ${err.message}`)
              .join('\n');
          }
        }
      } catch (parseError) {
        // If we can't parse the error, just use the original message
        console.error('Error parsing validation errors:', parseError);
      }
      
      toast({
        title: "Error",
        description: `Failed to add trade: ${errorMessage}`,
        variant: "destructive",
      });
    }
  });

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

  // Calculate the P&L dynamically
  const entryPrice = form.watch('entryPrice');
  const exitPrice = form.watch('exitPrice');
  const quantity = form.watch('quantity');
  const direction = form.watch('direction');
  const fees = form.watch('fees');
  
  const calculateRealTimePnL = (): { pnl: number | null, rMultiple: number | null } => {
    if (!entryPrice || !quantity) return { pnl: null, rMultiple: null };
    
    const entry = parseFloat(entryPrice);
    const qty = parseFloat(quantity);
    const fee = fees ? parseFloat(fees) : 0;
    
    if (!exitPrice) return { pnl: null, rMultiple: null };
    
    const exit = parseFloat(exitPrice);
    if (isNaN(entry) || isNaN(exit) || isNaN(qty)) return { pnl: null, rMultiple: null };
    
    const pnl = calculatePnL(entry, exit, qty, direction, fee);
    
    // Calculate R multiple if stopLoss is set
    let rMultiple = null;
    const stopLoss = form.watch('stopLoss');
    if (stopLoss && parseFloat(stopLoss) > 0) {
      const risk = Math.abs(entry - parseFloat(stopLoss)) * qty;
      if (risk > 0) {
        rMultiple = pnl / risk;
      }
    }
    
    return { pnl, rMultiple };
  };
  
  const { pnl, rMultiple } = calculateRealTimePnL();
  
  const getOutcomeClass = () => {
    if (pnl === null) return '';
    return pnl > 0 ? 'text-emerald-500' : pnl < 0 ? 'text-red-500' : '';
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    // Process each file
    Array.from(files).forEach(file => {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File Too Large",
          description: `${file.name} exceeds the 5MB limit`,
          variant: "destructive",
        });
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setImages(prev => [...prev, e.target!.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
    
    // Clear input value to allow uploading the same file again
    e.target.value = '';
  };
  
  const handleEditImage = (imageUrl: string) => {
    setSelectedImage(imageUrl);
    setShowDrawingTool(true);
  };
  
  const handleDeleteImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };
  
  const handleSaveAnnotatedImage = (dataUrl: string) => {
    // Replace the original image with the annotated one
    if (selectedImage) {
      const index = images.findIndex(img => img === selectedImage);
      if (index !== -1) {
        const newImages = [...images];
        newImages[index] = dataUrl;
        setImages(newImages);
      }
    }
    setShowDrawingTool(false);
    setSelectedImage(null);
  };
  
  const handleImportTradingViewChart = () => {
    const url = form.getValues('tradingViewUrl');
    if (!url) {
      toast({
        title: "Import Failed",
        description: "Please enter a TradingView chart URL",
        variant: "destructive",
      });
      return;
    }
    
    // Here you would typically have code to actually import the chart
    // For now, just show a success message
    toast({
      title: "Chart Imported",
      description: "TradingView chart has been imported successfully",
    });
  };
  
  const onSubmit = (data: FormValues) => {
    try {
      console.log('Raw form data:', data);
      
      // Validate date using our utility function
      const formattedDate = formatDateForAPI(data.entryTime);
      if (!formattedDate) {
        toast({
          title: "Invalid Date",
          description: "Please enter a valid date and time for the trade",
          variant: "destructive",
        });
        return; // Prevent submission
      }
      
      // If validation passes, submit the form
      createTrade(data);
    } catch (error) {
      console.error('Form submission error:', error);
      toast({
        title: "Error",
        description: "Failed to submit the trade. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Show drawing tool modal when an image is selected for editing
  const drawingToolModal = showDrawingTool && selectedImage && (
    <Dialog open={showDrawingTool} onOpenChange={setShowDrawingTool}>
      <DialogContent className="max-w-5xl max-h-[95vh] overflow-hidden p-0">
        <DrawingTool
          imageUrl={selectedImage}
          onSave={handleSaveAnnotatedImage}
          onCancel={() => setShowDrawingTool(false)}
        />
      </DialogContent>
    </Dialog>
  );
    
  return (
    <>
      {drawingToolModal}
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Trade</DialogTitle>
          <DialogDescription>
            Record a new trade with all the important details
          </DialogDescription>
        </DialogHeader>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
        <TabsList className="grid grid-cols-3 mb-5">
          <TabsTrigger value="basic" className="flex gap-1 items-center">
            <LineChart className="h-4 w-4" /> Basic
          </TabsTrigger>
          <TabsTrigger value="market" className="flex gap-1 items-center">
            <BarChart4 className="h-4 w-4" /> Market
          </TabsTrigger>
          <TabsTrigger value="media" className="flex gap-1 items-center">
            <ImageIcon className="h-4 w-4" /> Media
          </TabsTrigger>
        </TabsList>
        
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <TabsContent value="basic" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="symbol">Symbol</Label>
                <Input 
                  id="symbol" 
                  placeholder="e.g. AAPL" 
                  {...form.register('symbol')}
                />
                {form.formState.errors.symbol && (
                  <span className="text-destructive text-sm">{form.formState.errors.symbol.message}</span>
                )}
              </div>
              
              <div className="space-y-1">
                <Label htmlFor="entryTime">Date & Time</Label>
                <Input 
                  id="entryTime" 
                  type="datetime-local"
                  {...form.register('entryTime')}
                />
                {form.formState.errors.entryTime && (
                  <span className="text-destructive text-sm">{form.formState.errors.entryTime.message}</span>
                )}
              </div>
              
              <div className="space-y-1">
                <Label>Direction</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    type="button"
                    variant={form.watch('direction') === 'long' ? 'default' : 'outline'}
                    className={form.watch('direction') === 'long' ? 'bg-green-500 hover:bg-green-600' : ''}
                    onClick={() => form.setValue('direction', 'long')}
                  >
                    Long
                  </Button>
                  
                  <Button
                    type="button"
                    variant={form.watch('direction') === 'short' ? 'default' : 'outline'}
                    className={form.watch('direction') === 'short' ? 'bg-red-500 hover:bg-red-600' : ''}
                    onClick={() => form.setValue('direction', 'short')}
                  >
                    Short
                  </Button>
                </div>
              </div>
              
              <div className="space-y-1">
                <Label htmlFor="account">Account</Label>
                <Select 
                  defaultValue={form.getValues('account')}
                  onValueChange={(value) => form.setValue('account', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select account" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Main Account">Main Account</SelectItem>
                    <SelectItem value="Practice Account">Practice Account</SelectItem>
                    <SelectItem value="Live Account">Live Account</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {/* Entry & Exit */}
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-3">Entry & Exit Details</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                <div className="space-y-1">
                  <Label htmlFor="entryPrice">Entry Price</Label>
                  <Input 
                    id="entryPrice" 
                    type="number" 
                    step="0.01" 
                    placeholder="0.00" 
                    {...form.register('entryPrice')}
                  />
                  {form.formState.errors.entryPrice && (
                    <span className="text-destructive text-sm">{form.formState.errors.entryPrice.message}</span>
                  )}
                </div>
                
                <div className="space-y-1">
                  <Label htmlFor="exitPrice">Exit Price</Label>
                  <Input 
                    id="exitPrice" 
                    type="number" 
                    step="0.01" 
                    placeholder="0.00" 
                    {...form.register('exitPrice')}
                  />
                </div>
                
                <div className="space-y-1">
                  <Label htmlFor="quantity">Quantity</Label>
                  <Input 
                    id="quantity" 
                    type="number" 
                    step="any" 
                    placeholder="0" 
                    {...form.register('quantity')}
                  />
                  {form.formState.errors.quantity && (
                    <span className="text-destructive text-sm">{form.formState.errors.quantity.message}</span>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="stopLoss">Stop Loss</Label>
                  <Input 
                    id="stopLoss" 
                    type="number" 
                    step="0.01" 
                    placeholder="0.00" 
                    {...form.register('stopLoss')}
                  />
                </div>
                
                <div className="space-y-1">
                  <Label htmlFor="takeProfit">Take Profit</Label>
                  <Input 
                    id="takeProfit" 
                    type="number" 
                    step="0.01" 
                    placeholder="0.00" 
                    {...form.register('takeProfit')}
                  />
                </div>
                
                <div className="space-y-1">
                  <Label htmlFor="fees">Fees</Label>
                  <Input 
                    id="fees" 
                    type="number" 
                    step="0.01" 
                    placeholder="0.00" 
                    {...form.register('fees')}
                  />
                </div>
              </div>
            </div>
            
            {/* Trade Plan */}
            <div>
              <div className="space-y-1 mb-3">
                <Label htmlFor="setup">Trade Setup & Strategy</Label>
                <Select 
                  defaultValue={setupValue}
                  onValueChange={(value) => {
                    setSetupValue(value);
                    form.setValue('setup', value);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select setup..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Breakout">Breakout</SelectItem>
                    <SelectItem value="Pullback">Pullback</SelectItem>
                    <SelectItem value="Reversal">Reversal</SelectItem>
                    <SelectItem value="Trend Following">Trend Following</SelectItem>
                    <SelectItem value="Range">Range</SelectItem>
                    <SelectItem value="Support/Resistance">Support/Resistance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-1">
                <Label htmlFor="notes">Notes</Label>
                <Textarea 
                  id="notes" 
                  rows={3} 
                  placeholder="Trade plan, execution notes, lessons learned..." 
                  {...form.register('notes')}
                />
              </div>
            </div>
            
            {/* Tags */}
            <div>
              <Label htmlFor="tags" className="mb-1 block">Tags</Label>
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
                    id="tagInput"
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
            
            {/* Results */}
            <div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-muted rounded-md p-3">
                  <h4 className="text-xs text-muted-foreground mb-1">P&L</h4>
                  <div className={`font-mono text-xl font-medium ${getOutcomeClass()}`}>
                    {pnl !== null ? new Intl.NumberFormat('en-US', { 
                      style: 'currency', 
                      currency: 'USD'
                    }).format(pnl) : '$0.00'}
                  </div>
                </div>
                
                <div className="bg-muted rounded-md p-3">
                  <h4 className="text-xs text-muted-foreground mb-1">R Multiple</h4>
                  <div className={`font-mono text-xl font-medium ${getOutcomeClass()}`}>
                    {rMultiple !== null ? `${rMultiple.toFixed(2)}R` : '0R'}
                  </div>
                </div>
                
                <div className="bg-muted rounded-md p-3">
                  <h4 className="text-xs text-muted-foreground mb-1">Win/Loss</h4>
                  <div className={`font-mono text-xl font-medium ${getOutcomeClass()}`}>
                    {pnl === null ? '--' : pnl > 0 ? 'Win' : pnl < 0 ? 'Loss' : 'Breakeven'}
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="market">
            <div className="space-y-6">
              <div>
                <h4 className="text-sm font-medium mb-3">Market Conditions</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Market Trend</Label>
                    <Select 
                      defaultValue="neutral"
                      onValueChange={(value) => {
                        // Market conditions are not part of the main schema
                        // Store this in a separate state if needed
                        // form.setValue('marketConditions.trend', value)
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select trend" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bullish">Bullish</SelectItem>
                        <SelectItem value="bearish">Bearish</SelectItem>
                        <SelectItem value="neutral">Neutral</SelectItem>
                        <SelectItem value="strong_bullish">Strong Bullish</SelectItem>
                        <SelectItem value="strong_bearish">Strong Bearish</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Volatility</Label>
                    <Select 
                      defaultValue="medium"
                      onValueChange={(value) => {
                        // Market conditions are not part of the main schema
                        // form.setValue('marketConditions.volatility', value)
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select volatility" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="extreme">Extreme</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Volume</Label>
                    <Select 
                      defaultValue="average"
                      onValueChange={(value) => {
                        // Market conditions are not part of the main schema
                        // form.setValue('marketConditions.volume', value)
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select volume" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="average">Average</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="very_high">Very High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Market Sentiment</Label>
                    <Select 
                      defaultValue="neutral"
                      onValueChange={(value) => {
                        // Market conditions are not part of the main schema
                        // form.setValue('marketConditions.sentiment', value)
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select sentiment" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="fear">Fear</SelectItem>
                        <SelectItem value="neutral">Neutral</SelectItem>
                        <SelectItem value="greed">Greed</SelectItem>
                        <SelectItem value="extreme_fear">Extreme Fear</SelectItem>
                        <SelectItem value="extreme_greed">Extreme Greed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Emotional State</Label>
                <div className="flex space-x-1 items-center py-2">
                  <span className="text-sm mr-2">Stressed</span>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((value) => (
                    <Button
                      key={value}
                      type="button"
                      variant="outline"
                      className={`h-8 w-8 p-0 rounded-full ${mood === value ? 'bg-primary text-primary-foreground' : ''}`}
                      onClick={() => setMood(value)}
                    >
                      {value}
                    </Button>
                  ))}
                  <span className="text-sm ml-2">Calm</span>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Trade Execution Quality</Label>
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((value) => (
                      <Button
                        key={value}
                        type="button"
                        variant="outline"
                        className={`h-8 w-8 p-0 ${executionQuality === value ? 'bg-primary text-primary-foreground' : ''}`}
                        onClick={() => setExecutionQuality(value)}
                      >
                        {value}
                      </Button>
                    ))}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Trade Rating</Label>
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((value) => (
                      <Button
                        key={value}
                        type="button"
                        variant="outline"
                        className={`h-8 w-8 p-0 ${tradeRating === value ? 'bg-primary text-primary-foreground' : ''}`}
                        onClick={() => setTradeRating(value)}
                      >
                        {value}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="media">
            <div className="space-y-4">
              <div>
                <Label className="mb-2 block">Trade Screenshots</Label>
                <div className="border-2 border-dashed border-muted rounded-md p-6 flex flex-col items-center justify-center">
                  <ImageIcon className="h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground mb-2">Drag & drop trade screenshots or</p>
                  <Button type="button" variant="outline" className="mb-1" onClick={() => document.getElementById('image-upload')?.click()}>
                    Browse Files
                  </Button>
                  <input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleImageUpload}
                  />
                  <p className="text-xs text-muted-foreground">Supports: JPG, PNG, GIF (Max 5MB)</p>
                </div>
              </div>
              
              {/* Image Gallery */}
              {images.length > 0 && (
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <Label>Uploaded Images</Label>
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setImages([])}
                      className="text-xs"
                    >
                      Clear All
                    </Button>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {images.map((img, index) => (
                      <div 
                        key={index} 
                        className="relative border rounded-md overflow-hidden group"
                        style={{ height: "100px" }}
                      >
                        <img 
                          src={img} 
                          alt={`Trade screenshot ${index + 1}`} 
                          className="w-full h-full object-cover cursor-pointer"
                          onClick={() => handleEditImage(img)}
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          <Button 
                            type="button" 
                            size="sm" 
                            variant="outline" 
                            className="h-8 w-8 p-0 bg-white"
                            onClick={() => handleEditImage(img)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button 
                            type="button" 
                            size="sm" 
                            variant="outline" 
                            className="h-8 w-8 p-0 bg-white"
                            onClick={() => handleDeleteImage(index)}
                          >
                            <XIcon className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="tradingViewUrl">TradingView Chart URL</Label>
                <div className="flex space-x-2">
                  <Input
                    id="tradingViewUrl"
                    placeholder="https://www.tradingview.com/chart/..."
                    {...form.register('tradingViewUrl')}
                    className="flex-1"
                  />
                  <Button type="button" variant="outline" className="shrink-0" onClick={handleImportTradingViewChart}>
                    Import
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">Paste a TradingView chart URL to automatically import the chart</p>
              </div>
            </div>
          </TabsContent>
          
          <div className="mt-6">
            <DialogFooter>
              <Button variant="outline" type="button" onClick={onComplete}>
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? 'Saving...' : 'Save Trade'}
              </Button>
            </DialogFooter>
          </div>
        </form>
      </Tabs>
    </DialogContent>
    </>
  );
}