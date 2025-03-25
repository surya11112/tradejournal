import React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription, 
  DialogFooter 
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UploadCloud, FileText, Database } from 'lucide-react';

interface ImportTradesFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ImportTradesForm({ open, onOpenChange }: ImportTradesFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const [importSource, setImportSource] = React.useState<string>('csv');
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  
  const { mutate: importTrades, isPending } = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await apiRequest('POST', '/api/trades/import', formData);
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/trades'] });
      toast({
        title: "Trades Imported",
        description: `Successfully imported ${data.count} trades`,
      });
      onOpenChange(false);
    },
    onError: (error) => {
      toast({
        title: "Import Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };
  
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };
  
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setSelectedFile(e.dataTransfer.files[0]);
    }
  };
  
  const handleImport = () => {
    if (!selectedFile && importSource === 'csv') {
      toast({
        title: "No File Selected",
        description: "Please select a CSV file to import",
        variant: "destructive",
      });
      return;
    }
    
    const formData = new FormData();
    
    if (selectedFile) {
      formData.append('file', selectedFile);
    }
    
    formData.append('source', importSource);
    
    importTrades(formData);
  };
  
  const handleBrowseClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Import Trades</DialogTitle>
          <DialogDescription>
            Import your trading history from a CSV file or your broker
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="csv" onValueChange={setImportSource} className="w-full">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="csv" className="flex items-center gap-1">
              <FileText className="h-4 w-4" />
              <span>CSV File</span>
            </TabsTrigger>
            <TabsTrigger value="broker" className="flex items-center gap-1">
              <Database className="h-4 w-4" />
              <span>Broker API</span>
            </TabsTrigger>
            <TabsTrigger value="manual" className="flex items-center gap-1">
              <UploadCloud className="h-4 w-4" />
              <span>Manual</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="csv">
            <div
              className="border-2 border-dashed border-muted rounded-md p-6 text-center cursor-pointer"
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={handleBrowseClick}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".csv"
                className="hidden"
              />
              
              <FileText className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
              
              {selectedFile ? (
                <>
                  <p className="text-sm text-muted-foreground mb-1">Selected file:</p>
                  <p className="text-sm font-medium mb-2">{selectedFile.name}</p>
                </>
              ) : (
                <>
                  <p className="text-sm text-muted-foreground mb-2">
                    Drag and drop your CSV file here
                  </p>
                  <p className="text-xs text-muted-foreground mb-3">
                    Supported formats: .csv
                  </p>
                </>
              )}
              
              <Button variant="outline" size="sm" type="button" className="mt-2">
                {selectedFile ? 'Change File' : 'Select File'}
              </Button>
            </div>
            
            <div className="text-xs text-muted-foreground mt-3">
              <p><strong>CSV Format:</strong> Your CSV should include symbol, direction, entry price, exit price, quantity, entry time, and exit time columns.</p>
            </div>
          </TabsContent>
          
          <TabsContent value="broker">
            <div className="space-y-4">
              <div>
                <Label htmlFor="broker" className="block mb-1">Select Broker</Label>
                <select id="broker" className="w-full p-2 border border-input rounded-md bg-background">
                  <option value="">Select your broker</option>
                  <option value="tradingview">TradingView</option>
                  <option value="mt4">MetaTrader 4</option>
                  <option value="mt5">MetaTrader 5</option>
                  <option value="thinkorswim">ThinkOrSwim</option>
                  <option value="ibkr">Interactive Brokers</option>
                </select>
              </div>
              
              <div>
                <Label htmlFor="apiKey" className="block mb-1">API Key</Label>
                <input 
                  id="apiKey" 
                  type="text" 
                  placeholder="Enter your API key" 
                  className="w-full p-2 border border-input rounded-md bg-background"
                />
              </div>
              
              <div>
                <Label htmlFor="secret" className="block mb-1">API Secret</Label>
                <input 
                  id="secret" 
                  type="password" 
                  placeholder="Enter your API secret" 
                  className="w-full p-2 border border-input rounded-md bg-background"
                />
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="manual">
            <div className="text-center py-4">
              <p className="text-muted-foreground mb-4">
                Import trades manually by entering them one by one.
              </p>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Add Individual Trade
              </Button>
            </div>
          </TabsContent>
        </Tabs>
        
        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleImport} 
            disabled={isPending || (importSource === 'csv' && !selectedFile)}
          >
            {isPending ? 'Importing...' : 'Import'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
