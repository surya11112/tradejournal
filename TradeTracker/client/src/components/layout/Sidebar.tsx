import React from 'react';
import { Link, useLocation } from 'wouter';
import { cn } from '@/lib/utils';
import { 
  BarChart3,
  BookOpen, 
  Calendar, 
  ChevronLeft, 
  FolderClosed, 
  History, 
  LayoutDashboard,
  LineChart, 
  RefreshCw, 
  StickyNote, 
  Plus, 
  Bell,
  User,
  ArrowLeftRight,
  CheckSquare
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import AddTradeForm from '@/components/forms/AddTradeForm';

export default function Sidebar() {
  const [location] = useLocation();
  const [collapsed, setCollapsed] = React.useState(false);
  const [addTradeOpen, setAddTradeOpen] = React.useState(false);

  const navItems = [
    { path: '/', label: 'Dashboard', icon: <LayoutDashboard className="h-5 w-5" /> },
    { path: '/journal', label: 'Daily Journal', icon: <Calendar className="h-5 w-5" /> },
    { path: '/trades', label: 'Trades', icon: <ArrowLeftRight className="h-5 w-5" /> },
    { path: '/notebook', label: 'Notebook', icon: <StickyNote className="h-5 w-5" /> },
    { path: '/reports', label: 'Reports', icon: <BarChart3 className="h-5 w-5" /> },
    { path: '/playbooks', label: 'Playbooks', icon: <BookOpen className="h-5 w-5" /> },
    { path: '/backtesting', label: 'Backtesting', icon: <History className="h-5 w-5" /> },
    { 
      path: '/progress', 
      label: 'Progress Tracker', 
      icon: <CheckSquare className="h-5 w-5" />, 
      isNew: true 
    },
    { path: '/replay', label: 'Trade Replay', icon: <RefreshCw className="h-5 w-5" /> },
    { path: '/resources', label: 'Resource Center', icon: <FolderClosed className="h-5 w-5" /> },
  ];

  return (
    <>
      <div className={cn(
        "flex flex-col h-full bg-sidebar border-r border-border transition-all duration-300",
        collapsed ? "w-16" : "w-56"
      )}>
        {/* Logo */}
        <div className="flex items-center border-b border-border px-4 py-5">
          <div className="bg-primary rounded-md p-2 mr-2 flex-shrink-0">
            <LineChart className="h-4 w-4 text-white" />
          </div>
          {!collapsed && <h1 className="text-xl font-bold tracking-tight">TradePro</h1>}
          <button 
            className="ml-auto text-muted-foreground hover:text-white transition-colors"
            onClick={() => setCollapsed(!collapsed)}
          >
            <ChevronLeft className={cn(
              "h-5 w-5 transition-transform",
              collapsed && "rotate-180"
            )} />
          </button>
        </div>
        
        {/* Add Trade Button */}
        <div className="px-4 pt-4 pb-2">
          <Dialog open={addTradeOpen} onOpenChange={setAddTradeOpen}>
            <DialogTrigger asChild>
              <Button variant="default" className="w-full">
                {collapsed ? <Plus className="h-5 w-5" /> : (
                  <>
                    <Plus className="h-4 w-4 mr-2" /> Add Trade
                  </>
                )}
              </Button>
            </DialogTrigger>
            <AddTradeForm onComplete={() => setAddTradeOpen(false)} />
          </Dialog>
        </div>
        
        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-2">
          <ul className="px-2 space-y-1">
            {navItems.map((item) => (
              <li key={item.path}>
                <Link href={item.path} className={cn(
                  "sidebar-item",
                  location === item.path && "active",
                  "flex justify-between"
                )}>
                  <span className="flex items-center">
                    {item.icon}
                    {!collapsed && <span className="ml-2">{item.label}</span>}
                  </span>
                  {!collapsed && item.isNew && (
                    <span className="bg-amber-500/80 text-xs text-black font-medium px-1.5 py-0.5 rounded">
                      New
                    </span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        
        {/* Footer Icons */}
        <div className={cn(
          "p-4 border-t border-border",
          collapsed ? "flex justify-center" : "flex justify-around"
        )}>
          <button className="text-muted-foreground hover:text-white transition-colors">
            <Bell className="h-5 w-5" />
          </button>
          {!collapsed && (
            <button className="text-muted-foreground hover:text-white transition-colors">
              <User className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>
    </>
  );
}
