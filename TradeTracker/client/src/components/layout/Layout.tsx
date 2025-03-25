import React, { ReactNode } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import { Button } from '@/components/ui/button';
import { PlayCircle } from 'lucide-react';

interface LayoutProps {
  children: ReactNode;
  showStartDay?: boolean;
}

export default function Layout({ children, showStartDay = false }: LayoutProps) {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <Header />
        
        <main className="flex-1 overflow-auto p-6">
          {showStartDay && (
            <div className="flex justify-end mb-4">
              <Button variant="outline" className="flex items-center">
                <PlayCircle className="h-4 w-4 mr-2" />
                Start my day
              </Button>
            </div>
          )}
          
          {children}
        </main>
      </div>
    </div>
  );
}
