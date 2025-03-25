import React from 'react';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { 
  CalendarDays, 
  CheckSquare, 
  Star, 
  Medal, 
  Award, 
  TrendingUp, 
  Target,
  Plus,
  Clock
} from 'lucide-react';

export default function ProgressTracker() {
  const [date, setDate] = React.useState<Date | undefined>(new Date());
  const [activeTab, setActiveTab] = React.useState("goals");
  
  // Sample data for goals/milestones - would come from API in real app
  const goals = [
    { 
      id: 1, 
      title: "Maintain 60% win rate", 
      progress: 75, 
      category: "performance", 
      dueDate: "2025-05-01",
      description: "Keep win rate consistently above 60% for Q1 2025"
    },
    { 
      id: 2, 
      title: "Complete 50 paper trades", 
      progress: 30, 
      category: "training", 
      dueDate: "2025-04-15",
      description: "Practice with 50 paper trades before switching to real money"
    },
    { 
      id: 3, 
      title: "Keep risk below 2% per trade", 
      progress: 100, 
      category: "risk", 
      dueDate: "2025-03-30",
      description: "Consistently maintain position sizing below 2% of account"
    },
    { 
      id: 4, 
      title: "Develop 3 automated strategies", 
      progress: 10, 
      category: "systems", 
      dueDate: "2025-06-30",
      description: "Create and backtest 3 automated trading strategies"
    },
  ];
  
  // Sample streaks data
  const streaks = {
    currentStreak: 7,
    longestStreak: 14,
    completedGoals: 12,
    totalTradesDone: 87,
    daysActive: 31
  };
  
  const habitTracking = [
    { name: "Trading Journal", completedDays: [1, 2, 3, 5, 8, 9, 10, 12, 15, 16, 19, 20, 22, 23, 25, 26, 29] },
    { name: "Market Research", completedDays: [1, 3, 5, 8, 10, 12, 15, 17, 19, 22, 24, 26, 29] },
    { name: "Review Previous Trades", completedDays: [2, 3, 9, 10, 16, 17, 23, 24, 25, 30] },
    { name: "Risk Management Check", completedDays: [1, 2, 3, 4, 5, 8, 9, 10, 11, 12, 15, 16, 17, 18, 19, 22, 23, 24, 25, 26, 29, 30] },
  ];
  
  // Function to get streak count from habitTracking
  const getCurrentMonthDayCount = () => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  };
  
  // Function to get color based on progress
  const getProgressColor = (progress: number) => {
    if (progress >= 100) return "bg-emerald-500";
    if (progress >= 70) return "bg-green-500";
    if (progress >= 40) return "bg-amber-500";
    return "bg-red-500";
  };
  
  // Function to get badge color based on category
  const getCategoryBadge = (category: string) => {
    switch (category) {
      case "performance":
        return "bg-blue-100 text-blue-700 hover:bg-blue-100";
      case "training":
        return "bg-purple-100 text-purple-700 hover:bg-purple-100";
      case "risk":
        return "bg-amber-100 text-amber-700 hover:bg-amber-100";
      case "systems":
        return "bg-teal-100 text-teal-700 hover:bg-teal-100";
      default:
        return "bg-gray-100 text-gray-700 hover:bg-gray-100";
    }
  };
  
  // Generate calendar points for the heat map
  const heatMapDays = React.useMemo(() => {
    const days: Date[] = [];
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    // Get all days that have any habit tracked
    const allCompletedDays = habitTracking.flatMap(h => h.completedDays);
    const uniqueDaysSet = new Set(allCompletedDays);
    const uniqueDays = Array.from(uniqueDaysSet);
    
    uniqueDays.forEach(day => {
      days.push(new Date(currentYear, currentMonth, day));
    });
    
    return days;
  }, [habitTracking]);
  
  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold tracking-tight">Progress Tracker</h1>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-2">
            <TabsTrigger value="goals">
              <Target className="h-4 w-4 mr-2" />
              Goals & Milestones
            </TabsTrigger>
            <TabsTrigger value="habits">
              <CheckSquare className="h-4 w-4 mr-2" />
              Habit Tracking
            </TabsTrigger>
          </TabsList>

          <TabsContent value="goals" className="space-y-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="col-span-1 md:col-span-3">
                <CardHeader className="pb-2">
                  <div className="flex justify-between">
                    <CardTitle>Current Goals</CardTitle>
                    <Button size="sm">
                      <Plus className="h-4 w-4 mr-1" /> Add Goal
                    </Button>
                  </div>
                  <CardDescription>
                    Track your trading goals and milestones
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {goals.map((goal) => (
                      <div key={goal.id} className="p-4 border rounded-lg">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium text-lg">{goal.title}</h3>
                            <p className="text-sm text-muted-foreground mb-2">{goal.description}</p>
                            <div className="flex items-center space-x-2 mb-3">
                              <Badge variant="outline" className={`${getCategoryBadge(goal.category)}`}>
                                {goal.category}
                              </Badge>
                              <div className="flex items-center text-xs text-muted-foreground">
                                <Clock className="h-3 w-3 mr-1" />
                                Due: {new Date(goal.dueDate).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                          <span className={`text-sm font-medium ${goal.progress >= 100 ? 'text-emerald-600' : 'text-amber-600'}`}>
                            {goal.progress}%
                          </span>
                        </div>
                        <Progress value={goal.progress} className={`h-2 ${getProgressColor(goal.progress)}`} />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Star className="h-5 w-5 text-yellow-500 mr-2" />
                    Streaks
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Current Streak</span>
                      <div className="flex items-center">
                        <span className="font-medium">{streaks.currentStreak}</span>
                        <span className="text-sm text-muted-foreground ml-1">days</span>
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Longest Streak</span>
                      <div className="flex items-center">
                        <span className="font-medium">{streaks.longestStreak}</span>
                        <span className="text-sm text-muted-foreground ml-1">days</span>
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Completed Goals</span>
                      <div className="flex items-center">
                        <span className="font-medium">{streaks.completedGoals}</span>
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Total Trades</span>
                      <div className="flex items-center">
                        <span className="font-medium">{streaks.totalTradesDone}</span>
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Days Active</span>
                      <div className="flex items-center">
                        <span className="font-medium">{streaks.daysActive}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t border-border">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Medal className="h-5 w-5 text-amber-500" />
                        <span className="font-medium">Achievements</span>
                      </div>
                      <span className="text-sm text-blue-600 hover:underline cursor-pointer">
                        View all
                      </span>
                    </div>
                    <div className="flex mt-2 space-x-2">
                      <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                        <TrendingUp className="h-6 w-6 text-blue-600" />
                      </div>
                      <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                        <Award className="h-6 w-6 text-green-600" />
                      </div>
                      <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
                        <Star className="h-6 w-6 text-purple-600" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="habits" className="space-y-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <Card className="col-span-1 md:col-span-3">
                <CardHeader className="pb-2">
                  <div className="flex justify-between">
                    <CardTitle>Daily Trading Habits</CardTitle>
                    <Button size="sm">
                      <Plus className="h-4 w-4 mr-1" /> Add Habit
                    </Button>
                  </div>
                  <CardDescription>
                    Track your consistent trading habits
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {habitTracking.map((habit, index) => {
                      const completionPercent = (habit.completedDays.length / getCurrentMonthDayCount()) * 100;
                      
                      return (
                        <div key={index} className="space-y-2">
                          <div className="flex justify-between items-center">
                            <div>
                              <h3 className="font-medium">{habit.name}</h3>
                              <p className="text-xs text-muted-foreground">
                                {habit.completedDays.length} days this month
                              </p>
                            </div>
                            <span className={`text-sm font-medium ${completionPercent > 70 ? 'text-emerald-600' : 'text-amber-600'}`}>
                              {Math.round(completionPercent)}%
                            </span>
                          </div>
                          
                          <div className="flex">
                            {Array.from({ length: getCurrentMonthDayCount() }, (_, i) => i + 1).map((day) => (
                              <div 
                                key={day} 
                                className={`h-4 w-4 mx-0.5 rounded-sm ${
                                  habit.completedDays.includes(day) 
                                    ? 'bg-primary' 
                                    : 'bg-muted border border-border'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
              
              <Card className="col-span-1 md:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <CalendarDays className="h-5 w-5 text-primary mr-2" />
                    Activity Calendar
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    className="rounded-md"
                    modifiers={{
                      completed: heatMapDays
                    }}
                    modifiersClassNames={{
                      completed: "bg-primary text-primary-foreground font-medium"
                    }}
                  />
                  
                  <div className="mt-4">
                    <div className="text-sm font-medium mb-2">Activity Legend</div>
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center">
                        <div className="h-3 w-3 bg-primary rounded-sm mr-1"></div>
                        <span className="text-xs">Activity Day</span>
                      </div>
                      <div className="flex items-center">
                        <div className="h-3 w-3 bg-muted border border-border rounded-sm mr-1"></div>
                        <span className="text-xs">No Activity</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}