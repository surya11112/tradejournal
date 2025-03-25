import React from 'react';
import { useQuery } from '@tanstack/react-query';
import Layout from '@/components/layout/Layout';
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ReportFilters from '@/components/reports/ReportFilters';
import DataVisualizer from '@/components/reports/DataVisualizer';
import EmptyState from '@/components/dashboard/EmptyState';

export default function Reports() {
  const [dateRange, setDateRange] = React.useState<{
    startDate: Date;
    endDate: Date;
  }>({
    startDate: new Date(new Date().setMonth(new Date().getMonth() - 1)),
    endDate: new Date()
  });
  
  const { data: stats, isLoading } = useQuery<any>({
    queryKey: [
      '/api/stats', 
      { 
        startDate: dateRange.startDate.toISOString(), 
        endDate: dateRange.endDate.toISOString() 
      }
    ],
  });
  
  const hasData = stats && stats.totalTrades > 0;
  
  return (
    <Layout>
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Filters Sidebar */}
        <div className="lg:col-span-1 space-y-4">
          <ReportFilters 
            dateRange={dateRange} 
            onDateRangeChange={setDateRange} 
          />
        </div>
        
        {/* Main Content */}
        <div className="lg:col-span-4">
          {isLoading ? (
            <div className="h-96 flex items-center justify-center">
              <p>Loading reports...</p>
            </div>
          ) : !hasData ? (
            <EmptyState
              title="No reports to show"
              description="Try adding more trades or selecting different filters."
              icon="chart"
            />
          ) : (
            <div className="space-y-6">
              <Tabs defaultValue="overview">
                <TabsList className="grid w-full grid-cols-7">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="date">Date & Time</TabsTrigger>
                  <TabsTrigger value="price">Price & Quantity</TabsTrigger>
                  <TabsTrigger value="risk">Risk</TabsTrigger>
                  <TabsTrigger value="tags">Tags</TabsTrigger>
                  <TabsTrigger value="wl">Wins vs Losses</TabsTrigger>
                  <TabsTrigger value="compare">Compare</TabsTrigger>
                </TabsList>
                
                <TabsContent value="overview">
                  <Card>
                    <CardContent className="pt-6">
                      <DataVisualizer
                        reportType="overview"
                        stats={stats}
                      />
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="date">
                  <Card>
                    <CardContent className="py-4">
                      <Accordion type="single" collapsible defaultValue="days">
                        <AccordionItem value="days">
                          <AccordionTrigger>Days</AccordionTrigger>
                          <AccordionContent>
                            <DataVisualizer
                              reportType="days"
                              stats={stats}
                            />
                          </AccordionContent>
                        </AccordionItem>
                        
                        <AccordionItem value="weeks">
                          <AccordionTrigger>Weeks</AccordionTrigger>
                          <AccordionContent>
                            <DataVisualizer
                              reportType="weeks"
                              stats={stats}
                            />
                          </AccordionContent>
                        </AccordionItem>
                        
                        <AccordionItem value="months">
                          <AccordionTrigger>Months</AccordionTrigger>
                          <AccordionContent>
                            <DataVisualizer
                              reportType="months"
                              stats={stats}
                            />
                          </AccordionContent>
                        </AccordionItem>
                        
                        <AccordionItem value="tradeTime">
                          <AccordionTrigger>Trade time</AccordionTrigger>
                          <AccordionContent>
                            <DataVisualizer
                              reportType="tradeTime"
                              stats={stats}
                            />
                          </AccordionContent>
                        </AccordionItem>
                        
                        <AccordionItem value="tradeDuration">
                          <AccordionTrigger>Trade duration</AccordionTrigger>
                          <AccordionContent>
                            <DataVisualizer
                              reportType="tradeDuration"
                              stats={stats}
                            />
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="price">
                  <Card>
                    <CardContent className="py-4">
                      <Accordion type="single" collapsible defaultValue="price">
                        <AccordionItem value="price">
                          <AccordionTrigger>Price</AccordionTrigger>
                          <AccordionContent>
                            <DataVisualizer
                              reportType="price"
                              stats={stats}
                            />
                          </AccordionContent>
                        </AccordionItem>
                        
                        <AccordionItem value="volume">
                          <AccordionTrigger>Volume</AccordionTrigger>
                          <AccordionContent>
                            <DataVisualizer
                              reportType="volume"
                              stats={stats}
                            />
                          </AccordionContent>
                        </AccordionItem>
                        
                        <AccordionItem value="instrument">
                          <AccordionTrigger>Instrument</AccordionTrigger>
                          <AccordionContent>
                            <DataVisualizer
                              reportType="instrument"
                              stats={stats}
                            />
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="risk">
                  <Card>
                    <CardContent className="py-4">
                      <Accordion type="single" collapsible defaultValue="rmultiple">
                        <AccordionItem value="rmultiple">
                          <AccordionTrigger>R:Multiple</AccordionTrigger>
                          <AccordionContent>
                            <DataVisualizer
                              reportType="rmultiple"
                              stats={stats}
                            />
                          </AccordionContent>
                        </AccordionItem>
                        
                        <AccordionItem value="positionSize">
                          <AccordionTrigger>Position size</AccordionTrigger>
                          <AccordionContent>
                            <DataVisualizer
                              reportType="positionSize"
                              stats={stats}
                            />
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="tags">
                  <Card>
                    <CardContent className="py-4">
                      <Accordion type="single" collapsible defaultValue="setups">
                        <AccordionItem value="setups">
                          <AccordionTrigger>Setups</AccordionTrigger>
                          <AccordionContent>
                            <DataVisualizer
                              reportType="setups"
                              stats={stats}
                            />
                          </AccordionContent>
                        </AccordionItem>
                        
                        <AccordionItem value="mistakes">
                          <AccordionTrigger>Mistakes</AccordionTrigger>
                          <AccordionContent>
                            <DataVisualizer
                              reportType="mistakes"
                              stats={stats}
                            />
                          </AccordionContent>
                        </AccordionItem>
                        
                        <AccordionItem value="customTags">
                          <AccordionTrigger>Custom Tags</AccordionTrigger>
                          <AccordionContent>
                            <DataVisualizer
                              reportType="customTags"
                              stats={stats}
                            />
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="wl">
                  <Card>
                    <CardContent className="pt-6">
                      <DataVisualizer
                        reportType="winsVsLosses"
                        stats={stats}
                      />
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="compare">
                  <Card>
                    <CardContent className="pt-6">
                      <DataVisualizer
                        reportType="compare"
                        stats={stats}
                      />
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
