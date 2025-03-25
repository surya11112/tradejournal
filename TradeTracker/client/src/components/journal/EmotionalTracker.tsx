import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/hooks/use-toast';
import { JournalEntry } from '@shared/schema';
import { Brain, LineChart, AlertCircle, Activity, ArrowUp, ArrowDown } from 'lucide-react';

interface EmotionalTrackerProps {
  journalEntry?: JournalEntry;
  date: Date;
  onSave: (data: { mood: number; marketNotes: string }) => void;
}

type Emotion = {
  name: string;
  level: number;
};

export default function EmotionalTracker({ journalEntry, date, onSave }: EmotionalTrackerProps) {
  const { toast } = useToast();
  const [mood, setMood] = React.useState<number>(journalEntry?.mood || 5);
  const [marketNotes, setMarketNotes] = React.useState<string>(journalEntry?.marketNotes || '');
  const [emotions, setEmotions] = React.useState<Emotion[]>([
    { name: 'Fear', level: 3 },
    { name: 'Greed', level: 3 },
    { name: 'Excitement', level: 3 },
    { name: 'Confidence', level: 3 },
    { name: 'Uncertainty', level: 3 },
    { name: 'Pressure', level: 3 },
  ]);
  const [aiAnalysis, setAiAnalysis] = React.useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState('tracker');

  const handleSave = () => {
    onSave({ mood, marketNotes });
    toast({
      title: "Emotional State Saved",
      description: "Your emotional state has been recorded for this date",
    });
  };

  const updateEmotion = (index: number, level: number) => {
    const newEmotions = [...emotions];
    newEmotions[index].level = level;
    setEmotions(newEmotions);
  };

  const analyzeEmotions = () => {
    setIsAnalyzing(true);
    
    // In a real app, this would call an AI API
    setTimeout(() => {
      const emotionalStateText = mood > 7 
        ? "Your emotional state is highly positive, which is generally good but be cautious of overconfidence."
        : mood < 4
        ? "Your emotional state appears to be negative or stressed. Trading during heightened negative emotions may lead to impulsive decisions."
        : "Your emotional state is balanced and neutral, which is typically ideal for making objective trading decisions.";
        
      const emotionAnalysis = emotions.filter(e => e.level > 6).length > 1
        ? "You're experiencing elevated levels of multiple emotions simultaneously. This emotional complexity may make it challenging to maintain trading discipline."
        : emotions.filter(e => e.level > 7).map(e => e.name)[0] 
        ? `Your high level of ${emotions.filter(e => e.level > 7).map(e => e.name)[0]} could affect your trading decisions. Consider taking a step back before making important trades.`
        : "Your emotional levels are reasonably balanced, which should allow for more objective decision-making.";
        
      setAiAnalysis(`${emotionalStateText} ${emotionAnalysis} Based on your notes, I recommend taking time to reflect before making any significant trading decisions today.`);
      setIsAnalyzing(false);
      
      toast({
        title: "Emotional Analysis Complete",
        description: "AI has analyzed your emotional state",
      });
    }, 1500);
  };

  const getEmotionColor = (level: number) => {
    if (level <= 3) return "text-blue-500";
    if (level <= 6) return "text-green-500";
    if (level <= 8) return "text-amber-500";
    return "text-red-500";
  };

  const getMoodEmoji = () => {
    if (mood <= 2) return "😰";
    if (mood <= 4) return "😕";
    if (mood <= 6) return "😐";
    if (mood <= 8) return "🙂";
    return "😀";
  };

  const getMoodLabel = () => {
    if (mood <= 2) return "Very Stressed";
    if (mood <= 4) return "Somewhat Stressed";
    if (mood <= 6) return "Neutral";
    if (mood <= 8) return "Calm";
    return "Very Calm";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-primary" />
          Emotional & Psychological Tracker
        </CardTitle>
        <CardDescription>
          Track your emotional state and psychological factors affecting your trading
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="tracker" className="flex gap-1 items-center">
              <Activity className="h-4 w-4" />
              Mood Tracker
            </TabsTrigger>
            <TabsTrigger value="analysis" className="flex gap-1 items-center">
              <LineChart className="h-4 w-4" />
              Psychological Analysis
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="tracker" className="space-y-4">
            <div className="space-y-1">
              <div className="flex justify-between mb-1">
                <Label className="text-base">Overall Mood: {getMoodLabel()} {getMoodEmoji()}</Label>
                <span className="text-muted-foreground text-sm font-medium">{mood}/10</span>
              </div>
              <Slider
                value={[mood]}
                min={1}
                max={10}
                step={1}
                onValueChange={(value) => setMood(value[0])}
                className="py-4"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Stressed</span>
                <span>Calm</span>
              </div>
            </div>
            
            <div className="space-y-2 pt-4">
              <Label>Specific Emotions</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {emotions.map((emotion, index) => (
                  <div key={index} className="space-y-1">
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">{emotion.name}</span>
                      <span className={`text-xs font-medium ${getEmotionColor(emotion.level)}`}>
                        {emotion.level}/10
                      </span>
                    </div>
                    <Slider
                      value={[emotion.level]}
                      min={1}
                      max={10}
                      step={1}
                      onValueChange={(value) => updateEmotion(index, value[0])}
                    />
                  </div>
                ))}
              </div>
            </div>
            
            <div className="space-y-2 pt-4">
              <Label htmlFor="marketNotes">Market Notes & Psychological Factors</Label>
              <Textarea
                id="marketNotes"
                value={marketNotes}
                onChange={(e) => setMarketNotes(e.target.value)}
                placeholder="Note your thoughts on market conditions, your mindset today, and any potential psychological biases affecting your trading..."
                rows={4}
              />
            </div>
            
            <div className="flex justify-end space-x-2 pt-2">
              <Button variant="outline" onClick={() => analyzeEmotions()} disabled={isAnalyzing}>
                {isAnalyzing ? 'Analyzing...' : 'Analyze Emotions'}
              </Button>
              <Button onClick={handleSave}>Save</Button>
            </div>
          </TabsContent>
          
          <TabsContent value="analysis">
            {aiAnalysis ? (
              <div className="space-y-4">
                <div className="bg-muted p-4 rounded-lg">
                  <h3 className="font-medium flex items-center gap-2 mb-2">
                    <Brain className="h-4 w-4 text-primary" />
                    AI Emotional Analysis
                  </h3>
                  <p className="text-sm">{aiAnalysis}</p>
                </div>
                
                <div className="space-y-3">
                  <h3 className="font-medium flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-primary" />
                    Potential Trading Biases
                  </h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {emotions.find(e => e.name === 'Fear')?.level > 6 && (
                      <div className="p-3 border rounded-md flex items-start gap-2">
                        <ArrowDown className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
                        <div>
                          <p className="text-sm font-medium">Fear Bias</p>
                          <p className="text-xs text-muted-foreground">You may hesitate to enter trades or exit too early due to heightened fear.</p>
                        </div>
                      </div>
                    )}
                    
                    {emotions.find(e => e.name === 'Greed')?.level > 6 && (
                      <div className="p-3 border rounded-md flex items-start gap-2">
                        <ArrowUp className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                        <div>
                          <p className="text-sm font-medium">Greed Bias</p>
                          <p className="text-xs text-muted-foreground">You may risk too much or hold winning positions too long due to greed.</p>
                        </div>
                      </div>
                    )}
                    
                    {emotions.find(e => e.name === 'Uncertainty')?.level > 6 && (
                      <div className="p-3 border rounded-md flex items-start gap-2">
                        <ArrowDown className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                        <div>
                          <p className="text-sm font-medium">Analysis Paralysis</p>
                          <p className="text-xs text-muted-foreground">High uncertainty may lead to overthinking and missed opportunities.</p>
                        </div>
                      </div>
                    )}
                    
                    {emotions.find(e => e.name === 'Confidence')?.level > 7 && (
                      <div className="p-3 border rounded-md flex items-start gap-2">
                        <ArrowUp className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                        <div>
                          <p className="text-sm font-medium">Overconfidence Bias</p>
                          <p className="text-xs text-muted-foreground">Extremely high confidence may lead to overlooking risks.</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="space-y-3">
                  <h3 className="font-medium flex items-center gap-2">
                    <Activity className="h-4 w-4 text-primary" />
                    Recommendations
                  </h3>
                  <ul className="space-y-2 text-sm">
                    {mood <= 4 && (
                      <li className="flex items-start gap-2">
                        <div className="h-4 w-4 rounded-full bg-blue-500 mt-0.5 shrink-0"></div>
                        <span>Consider reducing your position sizes while feeling stressed.</span>
                      </li>
                    )}
                    {emotions.find(e => e.name === 'Fear')?.level > 7 && (
                      <li className="flex items-start gap-2">
                        <div className="h-4 w-4 rounded-full bg-blue-500 mt-0.5 shrink-0"></div>
                        <span>Review your trading plan to remind yourself of your edge and strategy.</span>
                      </li>
                    )}
                    {emotions.find(e => e.name === 'Greed')?.level > 7 && (
                      <li className="flex items-start gap-2">
                        <div className="h-4 w-4 rounded-full bg-blue-500 mt-0.5 shrink-0"></div>
                        <span>Stick to your predetermined risk management rules today.</span>
                      </li>
                    )}
                    <li className="flex items-start gap-2">
                      <div className="h-4 w-4 rounded-full bg-blue-500 mt-0.5 shrink-0"></div>
                      <span>Revisit this emotional assessment before and after trading sessions.</span>
                    </li>
                  </ul>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 space-y-3">
                <Brain className="h-12 w-12 text-muted-foreground/50" />
                <p className="text-sm text-center text-muted-foreground max-w-md">
                  Use the Mood Tracker tab to log your emotional state, then click "Analyze Emotions" to get personalized insights.
                </p>
                <Button variant="outline" onClick={() => setActiveTab('tracker')}>
                  Go to Mood Tracker
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}