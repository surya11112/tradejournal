import React from 'react';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { 
  BookOpen, 
  FileText, 
  Video, 
  Link as LinkIcon, 
  Search, 
  Plus, 
  ExternalLink,
  Play,
  Download,
  Star,
  StarHalf,
  Filter
} from 'lucide-react';

export default function ResourceCenter() {
  const [activeTab, setActiveTab] = React.useState("all");
  const [selectedResource, setSelectedResource] = React.useState<any>(null);
  const [searchTerm, setSearchTerm] = React.useState("");
  
  // Sample resource data - would come from API in a real app
  const resources = [
    {
      id: 1,
      title: "Price Action Mastery Guide",
      type: "ebook",
      category: "technical",
      description: "A comprehensive guide to mastering price action trading patterns and strategies",
      author: "Jane Smith",
      dateAdded: "2025-03-01",
      rating: 4.5,
      tags: ["price action", "patterns", "strategy"]
    },
    {
      id: 2,
      title: "Market Structure Analysis",
      type: "video",
      category: "technical",
      description: "Learn to identify market structure and key reversal levels",
      author: "Trading Academy",
      dateAdded: "2025-02-15",
      rating: 5,
      duration: "45 minutes",
      tags: ["market structure", "support/resistance", "reversals"]
    },
    {
      id: 3,
      title: "Risk Management for Traders",
      type: "document",
      category: "fundamentals",
      description: "Essential risk management principles every trader should follow",
      author: "John Doe",
      dateAdded: "2025-03-10",
      rating: 4,
      tags: ["risk management", "position sizing", "portfolio management"]
    },
    {
      id: 4,
      title: "TradingView Chart Setups",
      type: "link",
      category: "tools",
      description: "Collection of professional TradingView chart configurations and indicator settings",
      author: "Elite Traders Group",
      dateAdded: "2025-01-20",
      rating: 4.5,
      url: "https://example.com/chart-setups",
      tags: ["tradingview", "indicators", "charts"]
    },
    {
      id: 5,
      title: "Trading Psychology Masterclass",
      type: "video",
      category: "psychology",
      description: "Deep dive into managing emotions and developing a winning trading mindset",
      author: "Dr. Smith",
      dateAdded: "2025-02-28",
      rating: 5,
      duration: "90 minutes",
      tags: ["psychology", "mindset", "emotional control"]
    },
    {
      id: 6,
      title: "Fibonacci Trading Strategies",
      type: "document",
      category: "technical",
      description: "Advanced strategies using Fibonacci retracements and extensions",
      author: "Tech Trader",
      dateAdded: "2025-03-05",
      rating: 3.5,
      tags: ["fibonacci", "technical analysis", "strategy"]
    }
  ];
  
  // Filter resources based on active tab and search term
  const filteredResources = resources.filter(resource => {
    const matchesTab = activeTab === "all" || resource.type === activeTab || resource.category === activeTab;
    const matchesSearch = resource.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         resource.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         resource.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return matchesTab && matchesSearch;
  });
  
  const handleResourceClick = (resource: any) => {
    setSelectedResource(resource);
  };
  
  const getResourceIcon = (type: string) => {
    switch (type) {
      case "ebook":
        return <BookOpen className="h-5 w-5 text-blue-500" />;
      case "video":
        return <Video className="h-5 w-5 text-red-500" />;
      case "document":
        return <FileText className="h-5 w-5 text-amber-500" />;
      case "link":
        return <LinkIcon className="h-5 w-5 text-purple-500" />;
      default:
        return <FileText className="h-5 w-5 text-gray-500" />;
    }
  };
  
  const getCategoryBadge = (category: string) => {
    switch (category) {
      case "technical":
        return "bg-blue-100 text-blue-700 hover:bg-blue-100";
      case "fundamentals":
        return "bg-green-100 text-green-700 hover:bg-green-100";
      case "psychology":
        return "bg-purple-100 text-purple-700 hover:bg-purple-100";
      case "tools":
        return "bg-amber-100 text-amber-700 hover:bg-amber-100";
      default:
        return "bg-gray-100 text-gray-700 hover:bg-gray-100";
    }
  };
  
  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    
    return (
      <div className="flex">
        {[...Array(fullStars)].map((_, i) => (
          <Star key={`full-${i}`} className="h-4 w-4 fill-amber-400 text-amber-400" />
        ))}
        {hasHalfStar && <StarHalf className="h-4 w-4 fill-amber-400 text-amber-400" />}
        {[...Array(emptyStars)].map((_, i) => (
          <Star key={`empty-${i}`} className="h-4 w-4 text-muted-foreground" />
        ))}
      </div>
    );
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-2xl font-bold tracking-tight">Resource Center</h1>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                type="search" 
                placeholder="Search resources..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <Button>
              <Plus className="h-4 w-4 mr-1" /> Add Resource
            </Button>
          </div>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="flex justify-between items-center mb-2">
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="ebook">E-Books</TabsTrigger>
              <TabsTrigger value="video">Videos</TabsTrigger>
              <TabsTrigger value="document">Documents</TabsTrigger>
              <TabsTrigger value="link">Links</TabsTrigger>
            </TabsList>
            
            <Button variant="outline" size="sm" className="ml-auto">
              <Filter className="h-4 w-4 mr-1" /> Filters
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
            {filteredResources.length === 0 ? (
              <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
                <FileText className="h-12 w-12 text-muted-foreground/40 mb-4" />
                <h3 className="text-lg font-medium mb-1">No resources found</h3>
                <p className="text-muted-foreground max-w-md mb-4">
                  {searchTerm 
                    ? `No resources matching "${searchTerm}" were found. Try a different search term.` 
                    : "No resources found in this category. Add your first resource."}
                </p>
                <Button>
                  <Plus className="h-4 w-4 mr-1" /> Add Resource
                </Button>
              </div>
            ) : (
              filteredResources.map((resource) => (
                <Card key={resource.id} className="overflow-hidden">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex gap-2">
                        {getResourceIcon(resource.type)}
                        <div>
                          <CardTitle className="text-base font-semibold">
                            {resource.title}
                          </CardTitle>
                          <CardDescription className="text-xs mt-1">
                            by {resource.author}
                          </CardDescription>
                        </div>
                      </div>
                      <Badge variant="outline" className={getCategoryBadge(resource.category)}>
                        {resource.category}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pb-4">
                    <p className="text-sm text-muted-foreground mb-3">{resource.description}</p>
                    <div className="flex flex-wrap gap-1">
                      {resource.tags.map((tag, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between pt-2 border-t">
                    <div className="flex items-center gap-1">
                      {renderStars(resource.rating)}
                      <span className="text-xs text-muted-foreground ml-1">
                        {resource.rating.toFixed(1)}
                      </span>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => handleResourceClick(resource)}>
                      {resource.type === 'video' ? (
                        <>
                          <Play className="h-4 w-4 mr-1" /> Watch
                        </>
                      ) : resource.type === 'link' ? (
                        <>
                          <ExternalLink className="h-4 w-4 mr-1" /> Open
                        </>
                      ) : (
                        <>
                          <Download className="h-4 w-4 mr-1" /> Download
                        </>
                      )}
                    </Button>
                  </CardFooter>
                </Card>
              ))
            )}
          </div>
        </Tabs>
      </div>
      
      {/* Resource Detail Dialog */}
      <Dialog open={!!selectedResource} onOpenChange={(open) => !open && setSelectedResource(null)}>
        <DialogContent className="max-w-4xl">
          {selectedResource && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-2">
                  {getResourceIcon(selectedResource.type)}
                  <DialogTitle>{selectedResource.title}</DialogTitle>
                </div>
                <DialogDescription>
                  by {selectedResource.author} • Added on {new Date(selectedResource.dateAdded).toLocaleDateString()}
                </DialogDescription>
              </DialogHeader>
              
              <div className="py-2">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex gap-2">
                    <Badge variant="outline" className={getCategoryBadge(selectedResource.category)}>
                      {selectedResource.category}
                    </Badge>
                    <Badge variant="secondary">
                      {selectedResource.type}
                    </Badge>
                  </div>
                  <div className="flex items-center">
                    {renderStars(selectedResource.rating)}
                    <span className="text-sm ml-2">{selectedResource.rating.toFixed(1)}</span>
                  </div>
                </div>
                
                <p className="text-sm text-muted-foreground mb-6">
                  {selectedResource.description}
                </p>
                
                {selectedResource.type === 'video' && (
                  <div className="relative rounded-md bg-muted aspect-video flex items-center justify-center mb-4">
                    <Play className="h-12 w-12 text-primary/80" />
                    <div className="absolute bottom-2 right-2 bg-background/80 px-2 py-0.5 rounded text-xs">
                      {selectedResource.duration}
                    </div>
                  </div>
                )}
                
                <div className="flex flex-wrap gap-1 mb-6">
                  {selectedResource.tags.map((tag: string, index: number) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
                
                <div className="flex justify-end gap-2">
                  {selectedResource.type === 'link' ? (
                    <Button>
                      <ExternalLink className="h-4 w-4 mr-1" /> Open URL
                    </Button>
                  ) : (
                    <Button>
                      <Download className="h-4 w-4 mr-1" /> Download
                    </Button>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </Layout>
  );
}