import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Repeat, 
  Clock, 
  ArrowUp, 
  ArrowDown,
  ChevronsUp,
  ChevronsDown,
  Circle,
  AlertCircle,
  CheckCircle,
  Info
} from 'lucide-react';
import { Trade } from '@shared/schema';

interface TradeReplayProps {
  trade: Trade;
  onClose: () => void;
}

type ReplayStep = {
  time: string;
  price: number;
  volume: number;
  action: 'entry' | 'exit' | 'sl_adjust' | 'tp_adjust' | 'price_movement' | 'market_event';
  description: string;
  marketState?: 'neutral' | 'bullish' | 'bearish';
};

export default function TradeReplay({ trade, onClose }: TradeReplayProps) {
  try {
    const [isPlaying, setIsPlaying] = React.useState(false);
    const [currentStep, setCurrentStep] = React.useState(0);
    const [playbackSpeed, setPlaybackSpeed] = React.useState(1);
    const [activeTab, setActiveTab] = React.useState('price');
    
    // Helper function to create a default step when needed
    const createDefaultStep = (action: 'entry' | 'exit' | 'price_movement'): ReplayStep => {
      const price = getEntryPrice(trade) || 100;
      return {
        time: new Date().toLocaleTimeString(),
        price: price,
        volume: 1000,
        action: action,
        description: action === 'entry' 
          ? `Entered ${trade?.direction || 'long'} position${price > 0 ? ` at ${price.toFixed(2)}` : ''}`
          : action === 'exit'
          ? `Exited position${price > 0 ? ` at ${price.toFixed(2)}` : ''}`
          : `Price movement`,
        marketState: 'neutral'
      };
    };
    
    // In a real app, this would come from an API/database
    const replaySteps = React.useMemo(() => {
      try {
        // These are mockup steps for demonstration purposes
        // In a real app, this could be reconstructed from actual market data
        if (!trade || !trade.entryTime) {
          return [createDefaultStep("entry")];
        }
        
        const entryTime = new Date(trade.entryTime);
        const exitTime = trade.exitTime ? new Date(trade.exitTime) : new Date(entryTime.getTime() + 3600000); // 1 hour later if no exit time
        
        const steps: ReplayStep[] = [];
        
        // Ensure all price values are properly converted to numbers
        // Use default values in case entryPrice or exitPrice are null
        const entryPrice = getEntryPrice(trade);
        const exitPrice = getExitPrice(trade) || entryPrice * 1.05; // Default to 5% profit if no exit price
        
        if (entryPrice === 0) {
          return [createDefaultStep("entry")];
        }
        
        // Entry step
        steps.push({
          time: entryTime.toLocaleTimeString(),
          price: entryPrice,
          volume: 1000 + Math.round(Math.random() * 5000),
          action: 'entry',
          description: `Entered ${trade.direction} position at ${entryPrice.toFixed(2)}`,
          marketState: 'neutral'
        });
        
        // Price movements between entry and exit
        const numSteps = Math.floor(Math.random() * 6) + 4; // 4-10 steps
        const duration = (exitTime.getTime() - entryTime.getTime()) / (numSteps + 1);
        const priceRange = exitPrice - entryPrice;
        
        // Calculate intermediate steps with some randomness to simulate market movement
        for (let i = 1; i <= numSteps; i++) {
          const stepTime = new Date(entryTime.getTime() + duration * i);
          const progressRatio = i / (numSteps + 1);
          
          // Add some random noise to create realistic price movement
          const randomFactor = (Math.random() - 0.5) * 0.5;
          const price = entryPrice + (priceRange * progressRatio) + (priceRange * randomFactor);
          
          // Special events occasionally
          if (i === Math.floor(numSteps / 2)) {
            const isBullish = price > entryPrice;
            steps.push({
              time: stepTime.toLocaleTimeString(),
              price: parseFloat(price.toFixed(2)),
              volume: 2000 + Math.round(Math.random() * 8000),
              action: 'market_event',
              description: isBullish ? "Market momentum increasing" : "Market momentum weakening",
              marketState: isBullish ? 'bullish' : 'bearish'
            });
          } else if (i === 2 && trade.stopLoss) {
            steps.push({
              time: stepTime.toLocaleTimeString(),
              price: parseFloat(price.toFixed(2)),
              volume: 500 + Math.round(Math.random() * 3000),
              action: 'sl_adjust',
              description: "Adjusted stop loss based on market movement",
              marketState: price > entryPrice ? 'bullish' : 'bearish'
            });
          } else {
            steps.push({
              time: stepTime.toLocaleTimeString(),
              price: parseFloat(price.toFixed(2)),
              volume: 500 + Math.round(Math.random() * 3000),
              action: 'price_movement',
              description: `Price moved to ${price.toFixed(2)}`,
              marketState: price > steps[steps.length - 1].price ? 'bullish' : 'bearish'
            });
          }
        }
        
        // Exit step
        steps.push({
          time: exitTime.toLocaleTimeString(),
          price: exitPrice,
          volume: 1200 + Math.round(Math.random() * 6000),
          action: 'exit',
          description: `Exited position at ${exitPrice}`,
          marketState: exitPrice > entryPrice ? 'bullish' : 'bearish'
        });
        
        return steps;
      } catch (error) {
        console.error("Failed to generate replay steps:", error);
        return [createDefaultStep("entry")];
      }
    }, [trade]);
    
    React.useEffect(() => {
      let interval: NodeJS.Timeout | null = null;
      
      if (isPlaying && currentStep < replaySteps.length - 1) {
        interval = setInterval(() => {
          setCurrentStep(prev => {
            const nextStep = prev + 1;
            if (nextStep >= replaySteps.length) {
              setIsPlaying(false);
              return prev;
            }
            return nextStep;
          });
        }, 2000 / playbackSpeed);
      }
      
      return () => {
        if (interval) clearInterval(interval);
      };
    }, [isPlaying, currentStep, replaySteps, playbackSpeed]);
    
    const handlePlay = () => {
      if (currentStep >= replaySteps.length - 1) {
        setCurrentStep(0);
      }
      setIsPlaying(true);
    };
    
    const handlePause = () => {
      setIsPlaying(false);
    };
    
    const handleReset = () => {
      setIsPlaying(false);
      setCurrentStep(0);
    };
    
    const handleNext = () => {
      if (currentStep < replaySteps.length - 1) {
        setCurrentStep(prev => prev + 1);
      }
    };
    
    const handlePrevious = () => {
      if (currentStep > 0) {
        setCurrentStep(prev => prev - 1);
      }
    };
    
    const handleSliderChange = (value: number[]) => {
      setCurrentStep(value[0]);
      if (isPlaying) setIsPlaying(false);
    };
    
    const getActionIcon = (action: string) => {
      switch (action) {
        case 'entry':
          return <Circle className="text-emerald-500 fill-emerald-500" />;
        case 'exit':
          return <Circle className="text-red-500 fill-red-500" />;
        case 'sl_adjust':
          return <AlertCircle className="text-amber-500" />;
        case 'tp_adjust':
          return <CheckCircle className="text-blue-500" />;
        case 'market_event':
          return <Info className="text-purple-500" />;
        default:
          return null;
      }
    };
    
    const calculatePnL = () => {
      if (!replaySteps || !replaySteps.length) {
        return {
          value: "0.00",
          percent: "0.00",
          isPositive: false
        };
      }
      
      try {
        const entryPrice = replaySteps[0].price;
        // Ensure we don't go out of bounds
        const currentIndex = Math.min(currentStep, replaySteps.length - 1);
        const currentPrice = replaySteps[currentIndex].price;
        
        if (!entryPrice || entryPrice === 0) {
          return { value: "0.00", percent: "0.00", isPositive: false };
        }
        
        const pnl = trade.direction === 'long' 
          ? currentPrice - entryPrice 
          : entryPrice - currentPrice;
        
        const pnlPercent = (pnl / entryPrice) * 100;
        
        return {
          value: pnl.toFixed(2),
          percent: pnlPercent.toFixed(2),
          isPositive: pnl > 0
        };
      } catch (error) {
        console.error('Error calculating PnL:', error);
        return { value: "0.00", percent: "0.00", isPositive: false };
      }
    };
    
    const getPriceChangeIcon = () => {
      if (currentStep === 0) return null;
      
      const prevPrice = replaySteps[currentStep - 1].price;
      const currentPrice = replaySteps[currentStep].price;
      
      if (currentPrice > prevPrice) {
        return <ChevronsUp className="h-4 w-4 text-emerald-500" />;
      } else if (currentPrice < prevPrice) {
        return <ChevronsDown className="h-4 w-4 text-red-500" />;
      }
      return null;
    };
    
    const currentPnL = calculatePnL();
    const currentStep$ = replaySteps[currentStep];
    
    return (
      <div className="p-4 h-full flex flex-col">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Trade Replay</h2>
          <Button variant="outline" onClick={onClose}>Close</Button>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Trade Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Symbol</span>
                  <span className="font-medium">{trade.symbol}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Direction</span>
                  <Badge variant={trade.direction === 'long' ? 'default' : 'destructive'}>
                    {trade.direction === 'long' ? (
                      <ArrowUp className="h-3 w-3 mr-1" />
                    ) : (
                      <ArrowDown className="h-3 w-3 mr-1" />
                    )}
                    {trade.direction.toUpperCase()}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Entry Price</span>
                  <span className="font-medium">{trade.entryPrice}</span>
                </div>
                {trade.exitPrice && (
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Exit Price</span>
                    <span className="font-medium">{safeParse(trade.exitPrice).toFixed(2)}</span>
                  </div>
                )}
                {trade.stopLoss && (
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Stop Loss</span>
                    <span className="font-medium">{safeParse(trade.stopLoss).toFixed(2)}</span>
                  </div>
                )}
                {trade.takeProfit && (
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Take Profit</span>
                    <span className="font-medium">{safeParse(trade.takeProfit).toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Date</span>
                  <span className="font-medium">{new Date(trade.entryTime).toLocaleDateString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Current Step</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{currentStep$.time}</span>
                </div>
                <Badge variant="outline">
                  Step {currentStep + 1} of {replaySteps.length}
                </Badge>
              </div>
              
              <div className="flex items-center gap-2 mb-3">
                {getActionIcon(currentStep$.action)}
                <p className="text-sm">{currentStep$.description}</p>
              </div>
              
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Price</div>
                  <div className="flex items-center">
                    <span className="text-xl font-semibold">{currentStep$.price.toFixed(2)}</span>
                    {getPriceChangeIcon()}
                  </div>
                </div>
                
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Volume</div>
                  <div className="text-xl font-semibold">{safeParse(trade.quantity).toLocaleString()}</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">P&L Progression</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-3">
                <div className="text-xs text-muted-foreground mb-1">Unrealized P&L</div>
                <div className={`text-xl font-semibold ${currentPnL.isPositive ? 'text-emerald-500' : 'text-red-500'}`}>
                  ${currentPnL.value} ({currentPnL.percent}%)
                </div>
              </div>
              
              <div className="h-8 bg-muted rounded-md overflow-hidden">
                <div 
                  className={`h-full ${currentPnL.isPositive ? 'bg-emerald-500' : 'bg-red-500'}`}
                  style={{ width: `${Math.min(Math.abs(parseFloat(currentPnL.percent)) * 2, 100)}%` }}
                ></div>
              </div>
              
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>Entry</span>
                <span>Current P&L</span>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <Card className="flex-1 overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle>Trade Visualization</CardTitle>
            <CardDescription>Step-by-step replay of your trade execution</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
              <TabsList className="mb-4">
                <TabsTrigger value="price">Price Chart</TabsTrigger>
                <TabsTrigger value="execution">Execution Heatmap</TabsTrigger>
              </TabsList>
              
              <TabsContent value="price" className="mt-0 h-[300px] flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <p>Price chart visualization would be displayed here.</p>
                  <p className="text-sm">This would show the price action with entry/exit markers.</p>
                </div>
              </TabsContent>
              
              <TabsContent value="execution" className="mt-0 h-[300px] flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <p>Execution heatmap would be displayed here.</p>
                  <p className="text-sm">This would show a heatmap of volume/liquidity at different price levels.</p>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter className="flex flex-col border-t pt-6">
            <div className="w-full mb-6">
              <Slider
                value={[currentStep]}
                max={replaySteps.length - 1}
                min={0}
                step={1}
                onValueChange={handleSliderChange}
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>Entry</span>
                <span>Exit</span>
              </div>
            </div>
            
            <div className="flex justify-between items-center w-full">
              <div className="flex items-center gap-2">
                <select 
                  value={playbackSpeed}
                  onChange={(e) => setPlaybackSpeed(Number(e.target.value))}
                  className="text-xs p-1 border rounded"
                >
                  <option value={0.5}>0.5x</option>
                  <option value={1}>1x</option>
                  <option value={2}>2x</option>
                  <option value={4}>4x</option>
                </select>
                <span className="text-xs text-muted-foreground">Playback Speed</span>
              </div>
              
              <div className="flex items-center gap-1">
                <Button 
                  size="icon" 
                  variant="outline" 
                  onClick={handleReset}
                >
                  <Repeat className="h-4 w-4" />
                </Button>
                <Button 
                  size="icon" 
                  variant="outline" 
                  onClick={handlePrevious}
                  disabled={currentStep === 0}
                >
                  <SkipBack className="h-4 w-4" />
                </Button>
                
                {isPlaying ? (
                  <Button 
                    size="icon" 
                    onClick={handlePause}
                  >
                    <Pause className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button 
                    size="icon" 
                    onClick={handlePlay}
                    disabled={currentStep >= replaySteps.length - 1}
                  >
                    <Play className="h-4 w-4" />
                  </Button>
                )}
                
                <Button 
                  size="icon" 
                  variant="outline" 
                  onClick={handleNext}
                  disabled={currentStep >= replaySteps.length - 1}
                >
                  <SkipForward className="h-4 w-4" />
                </Button>
              </div>
              
              <div></div> {/* Empty div for flex spacing */}
            </div>
          </CardFooter>
        </Card>
      </div>
    );
  } catch (error) {
    console.error('Error in TradeReplay component:', error);
    return (
      <div className="p-4 h-full flex flex-col">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Trade Replay</h2>
          <Button variant="outline" onClick={onClose}>Close</Button>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Trade Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Symbol</span>
                  <span className="font-medium">{trade.symbol}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Direction</span>
                  <Badge variant={trade.direction === 'long' ? 'default' : 'destructive'}>
                    {trade.direction === 'long' ? (
                      <ArrowUp className="h-3 w-3 mr-1" />
                    ) : (
                      <ArrowDown className="h-3 w-3 mr-1" />
                    )}
                    {trade.direction.toUpperCase()}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Entry Price</span>
                  <span className="font-medium">{safeParse(trade.entryPrice).toFixed(2)}</span>
                </div>
                {trade.exitPrice && (
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Exit Price</span>
                    <span className="font-medium">{safeParse(trade.exitPrice).toFixed(2)}</span>
                  </div>
                )}
                {trade.stopLoss && (
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Stop Loss</span>
                    <span className="font-medium">{safeParse(trade.stopLoss).toFixed(2)}</span>
                  </div>
                )}
                {trade.takeProfit && (
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Take Profit</span>
                    <span className="font-medium">{safeParse(trade.takeProfit).toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Date</span>
                  <span className="font-medium">{new Date(trade.entryTime).toLocaleDateString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Current Step</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{new Date(trade.entryTime).toLocaleTimeString()}</span>
                </div>
                <Badge variant="outline">
                  Step 1 of 1
                </Badge>
              </div>
              
              <div className="flex items-center gap-2 mb-3">
                <Circle className="text-emerald-500 fill-emerald-500" />
                <p className="text-sm">{`Entered ${trade.direction} position at ${safeParse(trade.entryPrice).toFixed(2)}`}</p>
              </div>
              
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Price</div>
                  <div className="flex items-center">
                    <span className="text-xl font-semibold">{safeParse(trade.entryPrice).toFixed(2)}</span>
                  </div>
                </div>
                
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Volume</div>
                  <div className="text-xl font-semibold">{safeParse(trade.quantity).toLocaleString()}</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">P&L Progression</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-3">
                <div className="text-xs text-muted-foreground mb-1">Unrealized P&L</div>
                <div className={`text-xl font-semibold ${safeParse(trade.pnl) > 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                  ${trade.pnl || "0.00"}
                </div>
              </div>
              
              <div className="h-8 bg-muted rounded-md overflow-hidden">
                <div 
                  className={`h-full ${safeParse(trade.pnl) > 0 ? 'bg-emerald-500' : 'bg-red-500'}`}
                  style={{ width: '50%' }}
                ></div>
              </div>
              
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>Entry</span>
                <span>Current P&L</span>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <Card className="flex-1 overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle>Trade Visualization</CardTitle>
            <CardDescription>Step-by-step replay of your trade execution</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value="price" className="h-full">
              <TabsList className="mb-4">
                <TabsTrigger value="price">Price Chart</TabsTrigger>
              </TabsList>
              
              <TabsContent value="price" className="mt-0 h-[300px] flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <p>Price chart visualization would be displayed here.</p>
                  <p className="text-sm">This would show the price action with entry/exit markers.</p>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter className="flex flex-col border-t pt-6">
            <div className="w-full mb-6">
              <Slider
                value={[0]}
                max={1}
                min={0}
                step={0.01}
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>Entry</span>
                <span>Exit</span>
              </div>
            </div>
            
            <div className="flex justify-between items-center w-full">
              <div className="flex items-center gap-2">
                <select 
                  value={1}
                  onChange={(e) => {}}
                  className="text-xs p-1 border rounded"
                >
                  <option value={0.5}>0.5x</option>
                  <option value={1}>1x</option>
                  <option value={2}>2x</option>
                  <option value={4}>4x</option>
                </select>
                <span className="text-xs text-muted-foreground">Playback Speed</span>
              </div>
              
              <div className="flex items-center gap-1">
                <Button 
                  size="icon" 
                  variant="outline" 
                  onClick={() => {}}
                >
                  <Repeat className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardFooter>
        </Card>
      </div>
    );
  }
}

function getEntryPrice(trade: any): number {
  if (!trade) return 0;
  return safeParse(trade.entryPrice);
}

function getExitPrice(trade: any): number | null {
  if (!trade) return null;
  return trade.exitPrice === undefined || trade.exitPrice === null ? null : safeParse(trade.exitPrice);
}

function safeParse(value: any): number {
  if (value === null || value === undefined) return 0;
  if (typeof value === 'number') return value;
  try {
    const parsed = parseFloat(String(value));
    return isNaN(parsed) ? 0 : parsed;
  } catch (e) {
    return 0;
  }
}