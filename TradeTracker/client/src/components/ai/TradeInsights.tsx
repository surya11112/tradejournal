import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Lightbulb, BarChart3, TrendingUp, LineChart, Brain, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Trade } from '@shared/schema';

interface TradeInsightsProps {
  trades: Trade[];
  timeframe: string;
}

export default function TradeInsights({ trades, timeframe }: TradeInsightsProps) {
  const { toast } = useToast();
  const [insightsLoading, setInsightsLoading] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState('patterns');
  const [insights, setInsights] = React.useState<{
    patterns: string[];
    improvements: string[];
    warnings: string[];
    strengths: string[];
  }>({
    patterns: [],
    improvements: [],
    warnings: [],
    strengths: []
  });

  // In a real application, this would call an actual AI API
  const generateInsights = () => {
    setInsightsLoading(true);
    
    // Simulate an API call with a timeout
    setTimeout(() => {
      // Sample AI generated insights based on the trades data
      const sampleInsights = {
        patterns: [
          "You perform significantly better with stocks in the technology sector, with a 68% win rate compared to 42% in other sectors.",
          "Your morning trades (9:30-11:00 AM) have a 63% win rate, compared to 47% in the afternoon.",
          "Trades held for 15-30 minutes have your highest profit factor (2.3) compared to other durations.",
          "Your average loss when trading during high market volatility increases by 42%."
        ],
        improvements: [
          "Consider reducing position size during afternoon trading sessions, which show lower win rates.",
          "Your breakout strategy could benefit from stricter volume confirmation criteria.",
          "Based on your previous trades, waiting for a pullback after initial breakout leads to 38% higher win rate.",
          "Consider implementing a time-based stop loss for trades that don't reach profit target within 1 hour."
        ],
        warnings: [
          "Potential revenge trading pattern detected after losses - 72% of trades taken within 10 minutes of a loss are also losses.",
          "Position sizes have increased by 35% after winning streaks, potentially exposing you to higher risk.",
          "Your stop loss adherence decreases by 40% during volatile market conditions.",
          "Gap-up stocks have resulted in a 35% lower win rate compared to your overall average."
        ],
        strengths: [
          "Excellent discipline in taking profits on trend following setups (average 1.8R).",
          "Consistent execution on reversal patterns with 72% win rate.",
          "Strong performance when reducing position size after losses (win rate increases by 26%).",
          "Effective use of partial profit taking, improving overall profitability by 28%."
        ]
      };
      
      setInsights(sampleInsights);
      setInsightsLoading(false);
      
      toast({
        title: "AI Insights Generated",
        description: "Trading patterns and opportunities have been analyzed based on your historical data.",
      });
    }, 2000);
  };

  if (trades.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            AI Trading Insights
          </CardTitle>
          <CardDescription>
            Advanced pattern recognition and performance analysis using AI
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center space-y-4 py-8">
          <Lightbulb className="h-12 w-12 text-muted-foreground/50" />
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-4">
              No trade data available for AI analysis. Add some trades to get personalized insights.
            </p>
            <Button disabled>Generate Insights</Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            AI Trading Insights
          </CardTitle>
          {insights.patterns.length === 0 && (
            <Button 
              onClick={generateInsights} 
              disabled={insightsLoading}
              size="sm"
            >
              {insightsLoading ? 'Analyzing...' : 'Generate Insights'}
            </Button>
          )}
        </div>
        <CardDescription>
          Advanced pattern recognition and performance analysis using AI
        </CardDescription>
      </CardHeader>
      <CardContent>
        {insights.patterns.length === 0 ? (
          <div className="flex flex-col items-center justify-center space-y-4 py-8">
            <Lightbulb className="h-12 w-12 text-muted-foreground/50" />
            <p className="text-sm text-center text-muted-foreground max-w-md mx-auto">
              AI analysis can detect patterns in your trading, identify weaknesses, and suggest improvements based on your historical performance.
            </p>
          </div>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-4 mb-4">
              <TabsTrigger value="patterns">
                <TrendingUp className="h-4 w-4 mr-1" />
                <span className="hidden sm:inline">Patterns</span>
              </TabsTrigger>
              <TabsTrigger value="improvements">
                <LineChart className="h-4 w-4 mr-1" />
                <span className="hidden sm:inline">Improvements</span>
              </TabsTrigger>
              <TabsTrigger value="warnings">
                <AlertTriangle className="h-4 w-4 mr-1" />
                <span className="hidden sm:inline">Warnings</span>
              </TabsTrigger>
              <TabsTrigger value="strengths">
                <BarChart3 className="h-4 w-4 mr-1" />
                <span className="hidden sm:inline">Strengths</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="patterns" className="mt-0">
              <div className="space-y-4">
                {insights.patterns.map((pattern, index) => (
                  <div key={index} className="p-3 border rounded-md border-border flex items-start gap-3">
                    <TrendingUp className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                    <p className="text-sm">{pattern}</p>
                  </div>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="improvements" className="mt-0">
              <div className="space-y-4">
                {insights.improvements.map((improvement, index) => (
                  <div key={index} className="p-3 border rounded-md border-border flex items-start gap-3">
                    <LineChart className="h-5 w-5 text-emerald-500 mt-0.5 shrink-0" />
                    <p className="text-sm">{improvement}</p>
                  </div>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="warnings" className="mt-0">
              <div className="space-y-4">
                {insights.warnings.map((warning, index) => (
                  <div key={index} className="p-3 border rounded-md border-border flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5 shrink-0" />
                    <p className="text-sm">{warning}</p>
                  </div>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="strengths" className="mt-0">
              <div className="space-y-4">
                {insights.strengths.map((strength, index) => (
                  <div key={index} className="p-3 border rounded-md border-border flex items-start gap-3">
                    <BarChart3 className="h-5 w-5 text-blue-500 mt-0.5 shrink-0" />
                    <p className="text-sm">{strength}</p>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        )}
        
        {insights.patterns.length > 0 && (
          <div className="mt-4 pt-4 border-t border-border">
            <div className="flex justify-between items-center">
              <div className="flex gap-2">
                <Badge variant="outline">
                  {timeframe} Data
                </Badge>
                <Badge variant="outline">
                  {trades.length} Trades
                </Badge>
              </div>
              <Button 
                variant="outline"
                size="sm"
                onClick={generateInsights}
                disabled={insightsLoading}
              >
                Refresh Analysis
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}