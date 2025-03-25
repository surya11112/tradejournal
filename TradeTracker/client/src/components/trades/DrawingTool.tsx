import React, { useRef, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { 
  Pen, 
  Highlighter, 
  ArrowRight, 
  Text as TextIcon, 
  CircleOff, 
  Undo2, 
  Redo2, 
  Save, 
  Download, 
  Plus, 
  Minus 
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Toggle } from '@/components/ui/toggle';
import { Input } from '@/components/ui/input';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

interface DrawingToolProps {
  imageUrl: string;
  onSave: (dataUrl: string) => void;
  onCancel?: () => void;
}

type DrawingMode = 'pen' | 'highlighter' | 'line' | 'text' | 'eraser';
type DrawingAction = {
  mode: DrawingMode;
  paths?: Array<{
    points: Array<{ x: number; y: number }>;
    color: string;
    width: number;
    opacity: number;
  }>;
  text?: {
    content: string;
    x: number;
    y: number;
    color: string;
    fontSize: number;
  };
};

export default function DrawingTool({ imageUrl, onSave, onCancel }: DrawingToolProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // Use a state instead of a ref for the image to avoid TS read-only issues
  const [loadedImage, setLoadedImage] = useState<HTMLImageElement | null>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  useEffect(() => {
    // Make sure loadedImage dependency is used in the effect
    if (loadedImage) {
      redrawCanvas();
    }
  }, [loadedImage]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPath, setCurrentPath] = useState<Array<{ x: number; y: number }>>([]);
  const [mode, setMode] = useState<DrawingMode>('pen');
  const [color, setColor] = useState('#ff0000'); // Red
  const [brushWidth, setBrushWidth] = useState(3);
  const [opacity, setOpacity] = useState(1);
  const [actions, setActions] = useState<DrawingAction[]>([]);
  const [undoneActions, setUndoneActions] = useState<DrawingAction[]>([]);
  const [textInput, setTextInput] = useState('');
  const [addingText, setAddingText] = useState(false);
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
  const [imageLoaded, setImageLoaded] = useState(false);
  
  // Available colors
  const colors = [
    '#ff0000', // Red
    '#00ff00', // Green
    '#0000ff', // Blue
    '#ffff00', // Yellow
    '#ff00ff', // Magenta
    '#00ffff', // Cyan
    '#000000', // Black
    '#ffffff', // White
  ];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // Set up the canvas
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    contextRef.current = ctx;
    
    // Load the image to get its dimensions
    const image = new Image();
    image.src = imageUrl;
    image.onload = () => {
      // Store image in state
      setLoadedImage(image);
      
      // Set canvas dimensions to match image
      canvas.width = image.width;
      canvas.height = image.height;
      
      // Draw the original image on the canvas
      ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
      setImageLoaded(true);
    };
  }, [imageUrl]);

  // Redraw the canvas with all actions
  const redrawCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = contextRef.current;
    
    if (!canvas || !ctx || !loadedImage) return;
    
    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw the original image
    ctx.drawImage(loadedImage, 0, 0, canvas.width, canvas.height);
    
    // Draw all saved actions
    actions.forEach((action) => {
      if (action.mode === 'text' && action.text) {
        // Draw text
        ctx.fillStyle = action.text.color;
        ctx.font = `${action.text.fontSize}px sans-serif`;
        ctx.fillText(action.text.content, action.text.x, action.text.y);
      } else if (action.paths) {
        // Draw paths (pen, highlighter, line, eraser)
        action.paths.forEach((path) => {
          ctx.beginPath();
          
          // Set styles based on the tool
          if (action.mode === 'highlighter') {
            ctx.globalAlpha = 0.3;
            ctx.lineWidth = path.width * 2;
          } else if (action.mode === 'eraser') {
            ctx.globalCompositeOperation = 'destination-out';
            ctx.lineWidth = path.width * 2;
          } else {
            ctx.globalAlpha = path.opacity;
            ctx.lineWidth = path.width;
          }
          
          ctx.strokeStyle = path.color;
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';
          
          // Draw the path
          if (path.points.length === 1) {
            // Draw a dot for single points
            const point = path.points[0];
            ctx.arc(point.x, point.y, path.width / 2, 0, Math.PI * 2);
            ctx.fill();
          } else if (action.mode === 'line' && path.points.length >= 2) {
            // Draw a straight line
            const startPoint = path.points[0];
            const endPoint = path.points[path.points.length - 1];
            ctx.moveTo(startPoint.x, startPoint.y);
            ctx.lineTo(endPoint.x, endPoint.y);
          } else {
            // Draw a freehand path
            path.points.forEach((point, index) => {
              if (index === 0) {
                ctx.moveTo(point.x, point.y);
              } else {
                ctx.lineTo(point.x, point.y);
              }
            });
          }
          
          ctx.stroke();
          
          // Reset composite operation and opacity
          ctx.globalCompositeOperation = 'source-over';
          ctx.globalAlpha = 1;
        });
      }
    });
  };

  useEffect(() => {
    if (imageLoaded) {
      redrawCanvas();
    }
  }, [actions, imageLoaded]);

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (addingText) {
      addTextAtPosition(e);
      return;
    }
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (canvas.width / rect.width);
    const y = (e.clientY - rect.top) * (canvas.height / rect.height);
    
    setIsDrawing(true);
    setCurrentPath([{ x, y }]);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (canvas.width / rect.width);
    const y = (e.clientY - rect.top) * (canvas.height / rect.height);
    
    setCursorPosition({ x, y });
    
    if (!isDrawing) return;
    
    setCurrentPath((prev) => [...prev, { x, y }]);
    
    // Live preview for drawing
    const ctx = contextRef.current;
    if (!ctx) return;
    
    if (mode === 'line' && currentPath.length > 0) {
      // Preview line during draw
      redrawCanvas(); // Redraw everything first
      
      const startPoint = currentPath[0];
      
      ctx.beginPath();
      ctx.strokeStyle = color;
      ctx.lineWidth = brushWidth;
      ctx.globalAlpha = opacity;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      
      ctx.moveTo(startPoint.x, startPoint.y);
      ctx.lineTo(x, y);
      ctx.stroke();
      
      ctx.globalAlpha = 1;
    } else if (mode !== 'line') {
      // For other tools, draw directly
      ctx.beginPath();
      
      if (mode === 'highlighter') {
        ctx.globalAlpha = 0.3;
        ctx.lineWidth = brushWidth * 2;
      } else if (mode === 'eraser') {
        ctx.globalCompositeOperation = 'destination-out';
        ctx.lineWidth = brushWidth * 2;
      } else {
        ctx.globalAlpha = opacity;
        ctx.lineWidth = brushWidth;
      }
      
      ctx.strokeStyle = color;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      
      const prevPoint = currentPath[currentPath.length - 2] || currentPath[0];
      ctx.moveTo(prevPoint.x, prevPoint.y);
      ctx.lineTo(x, y);
      ctx.stroke();
      
      // Reset composite operation and opacity
      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = 1;
    }
  };

  const handleMouseUp = () => {
    if (!isDrawing) return;
    
    setIsDrawing(false);
    
    // Save the current path
    if (currentPath.length > 0) {
      const newAction: DrawingAction = {
        mode,
        paths: [{
          points: currentPath,
          color,
          width: brushWidth,
          opacity: mode === 'highlighter' ? 0.3 : opacity
        }]
      };
      
      setActions([...actions, newAction]);
      setUndoneActions([]); // Clear undone actions when new action is added
      setCurrentPath([]);
    }
  };

  const handleMouseLeave = () => {
    if (isDrawing) {
      handleMouseUp();
    }
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (addingText) {
      const touch = e.touches[0];
      const canvas = canvasRef.current;
      if (!canvas || !touch) return;
      
      const rect = canvas.getBoundingClientRect();
      const x = (touch.clientX - rect.left) * (canvas.width / rect.width);
      const y = (touch.clientY - rect.top) * (canvas.height / rect.height);
      
      setCursorPosition({ x, y });
      return;
    }
    
    e.preventDefault(); // Prevent scrolling
    const touch = e.touches[0];
    const canvas = canvasRef.current;
    if (!canvas || !touch) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = (touch.clientX - rect.left) * (canvas.width / rect.width);
    const y = (touch.clientY - rect.top) * (canvas.height / rect.height);
    
    setIsDrawing(true);
    setCurrentPath([{ x, y }]);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault(); // Prevent scrolling
    if (!isDrawing) return;
    
    const touch = e.touches[0];
    const canvas = canvasRef.current;
    if (!canvas || !touch) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = (touch.clientX - rect.left) * (canvas.width / rect.width);
    const y = (touch.clientY - rect.top) * (canvas.height / rect.height);
    
    setCurrentPath((prev) => [...prev, { x, y }]);
    
    // Live preview for drawing
    const ctx = contextRef.current;
    if (!ctx) return;
    
    if (mode === 'line' && currentPath.length > 0) {
      // Preview line during draw
      redrawCanvas(); // Redraw everything first
      
      const startPoint = currentPath[0];
      
      ctx.beginPath();
      ctx.strokeStyle = color;
      ctx.lineWidth = brushWidth;
      ctx.globalAlpha = opacity;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      
      ctx.moveTo(startPoint.x, startPoint.y);
      ctx.lineTo(x, y);
      ctx.stroke();
      
      ctx.globalAlpha = 1;
    } else if (mode !== 'line') {
      // For other tools, draw directly
      ctx.beginPath();
      
      if (mode === 'highlighter') {
        ctx.globalAlpha = 0.3;
        ctx.lineWidth = brushWidth * 2;
      } else if (mode === 'eraser') {
        ctx.globalCompositeOperation = 'destination-out';
        ctx.lineWidth = brushWidth * 2;
      } else {
        ctx.globalAlpha = opacity;
        ctx.lineWidth = brushWidth;
      }
      
      ctx.strokeStyle = color;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      
      const prevPoint = currentPath[currentPath.length - 2] || currentPath[0];
      ctx.moveTo(prevPoint.x, prevPoint.y);
      ctx.lineTo(x, y);
      ctx.stroke();
      
      // Reset composite operation and opacity
      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = 1;
    }
  };

  const handleTouchEnd = () => {
    handleMouseUp();
  };

  const handleUndo = () => {
    if (actions.length === 0) return;
    
    const newActions = [...actions];
    const actionToUndo = newActions.pop();
    
    if (actionToUndo) {
      setActions(newActions);
      setUndoneActions([...undoneActions, actionToUndo]);
    }
  };

  const handleRedo = () => {
    if (undoneActions.length === 0) return;
    
    const newUndoneActions = [...undoneActions];
    const actionToRedo = newUndoneActions.pop();
    
    if (actionToRedo) {
      setActions([...actions, actionToRedo]);
      setUndoneActions(newUndoneActions);
    }
  };

  const handleModeChange = (newMode: DrawingMode) => {
    if (newMode === 'text') {
      setAddingText(true);
    } else {
      setAddingText(false);
    }
    setMode(newMode);
  };

  const addTextAtPosition = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!textInput.trim()) {
      setAddingText(false);
      return;
    }
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (canvas.width / rect.width);
    const y = (e.clientY - rect.top) * (canvas.height / rect.height);
    
    const newTextAction: DrawingAction = {
      mode: 'text',
      text: {
        content: textInput,
        x,
        y,
        color,
        fontSize: brushWidth * 5 // Scale up for text
      }
    };
    
    setActions([...actions, newTextAction]);
    setUndoneActions([]);
    setTextInput('');
    setAddingText(false);
  };

  const handleSave = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const dataUrl = canvas.toDataURL('image/png');
    onSave(dataUrl);
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const dataUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = 'annotated-trade.png';
    link.href = dataUrl;
    link.click();
  };

  const increaseBrushSize = () => {
    setBrushWidth(Math.min(brushWidth + 1, 30));
  };

  const decreaseBrushSize = () => {
    setBrushWidth(Math.max(brushWidth - 1, 1));
  };

  return (
    <div className="flex flex-col h-full">
      <div className="border-b p-3 flex flex-col space-y-3">
        <div className="flex justify-between items-center">
          <div className="text-lg font-medium">Annotate Image</div>
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleUndo} 
              disabled={actions.length === 0}
            >
              <Undo2 className="h-4 w-4 mr-1" /> Undo
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRedo} 
              disabled={undoneActions.length === 0}
            >
              <Redo2 className="h-4 w-4 mr-1" /> Redo
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleDownload}
            >
              <Download className="h-4 w-4 mr-1" /> Download
            </Button>
            <Button 
              variant="default" 
              size="sm" 
              onClick={handleSave}
            >
              <Save className="h-4 w-4 mr-1" /> Save
            </Button>
            {onCancel && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={onCancel}
              >
                Cancel
              </Button>
            )}
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2 items-center">
          <ToggleGroup type="single" value={mode} onValueChange={(value) => value && handleModeChange(value as DrawingMode)}>
            <ToggleGroupItem value="pen" aria-label="Pen">
              <Pen className="h-4 w-4" />
            </ToggleGroupItem>
            <ToggleGroupItem value="highlighter" aria-label="Highlighter">
              <Highlighter className="h-4 w-4" />
            </ToggleGroupItem>
            <ToggleGroupItem value="line" aria-label="Line">
              <ArrowRight className="h-4 w-4" />
            </ToggleGroupItem>
            <ToggleGroupItem value="text" aria-label="Text">
              <TextIcon className="h-4 w-4" />
            </ToggleGroupItem>
            <ToggleGroupItem value="eraser" aria-label="Eraser">
              <CircleOff className="h-4 w-4" />
            </ToggleGroupItem>
          </ToggleGroup>
          
          <div className="h-6 border-r mx-1"></div>
          
          <div className="flex items-center space-x-1">
            <Button variant="outline" size="icon" onClick={decreaseBrushSize} className="h-8 w-8">
              <Minus className="h-3 w-3" />
            </Button>
            <Badge variant="outline">{brushWidth}px</Badge>
            <Button variant="outline" size="icon" onClick={increaseBrushSize} className="h-8 w-8">
              <Plus className="h-3 w-3" />
            </Button>
          </div>
          
          <div className="h-6 border-r mx-1"></div>
          
          <div className="flex space-x-1">
            {colors.map((c) => (
              <Toggle
                key={c}
                pressed={color === c}
                onPressedChange={() => setColor(c)}
                className="h-8 w-8 p-0 rounded-full"
                style={{ backgroundColor: c, border: c === '#ffffff' ? '1px solid #d1d5db' : 'none' }}
              />
            ))}
          </div>
          
          {mode === 'text' && (
            <div className="flex-1 flex items-center space-x-2">
              <div className="h-6 border-r"></div>
              <Input
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder="Enter text..."
                className="h-8 w-48"
              />
              <Badge variant="outline">
                {addingText ? 'Click on image to place text' : ''}
              </Badge>
            </div>
          )}
        </div>
      </div>
      
      <div className="flex-1 overflow-auto p-3 flex justify-center">
        <div className="relative max-w-full max-h-full">
          <canvas
            ref={canvasRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseLeave}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            style={{ 
              cursor: addingText ? 'text' : mode === 'eraser' ? 'crosshair' : 'crosshair',
              maxWidth: '100%',
              maxHeight: '100%',
              objectFit: 'contain'
            }}
            className="border shadow-sm"
          />
        </div>
      </div>
    </div>
  );
}