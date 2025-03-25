import React from 'react';
import { cn } from '@/lib/utils';
import { FolderIcon } from 'lucide-react';

interface FolderListProps {
  folders: string[];
  selectedFolder: string;
  onSelectFolder: (folder: string) => void;
}

export default function FolderList({ 
  folders, 
  selectedFolder, 
  onSelectFolder 
}: FolderListProps) {
  return (
    <div>
      {folders.map((folder) => (
        <div
          key={folder}
          className={cn(
            "px-4 py-1.5 flex items-center space-x-2 cursor-pointer",
            "hover:bg-muted rounded-md transition-colors",
            selectedFolder === folder && "bg-secondary"
          )}
          onClick={() => onSelectFolder(folder)}
        >
          <FolderIcon className={cn(
            "h-4 w-4",
            folder === "All notes" && "text-blue-500",
            folder === "Trade Notes" && "text-emerald-500",
            folder === "Daily Journal" && "text-amber-500",
            folder === "Sessions Recap" && "text-purple-500",
            folder === "My notes" && "text-sky-500"
          )} />
          <span className="text-sm">{folder}</span>
        </div>
      ))}
    </div>
  );
}
