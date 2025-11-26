import { useState, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UploadCloud, FileSpreadsheet, Check, X, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

export default function FileUpload() {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.name.endsWith('.xlsx') || droppedFile.name.endsWith('.csv') || droppedFile.name.endsWith('.xls')) {
        handleFile(droppedFile);
      } else {
        alert("Please upload an Excel file (.xlsx, .xls, .csv)");
      }
    }
  }, []);

  const handleFile = (file: File) => {
    setIsUploading(true);
    // Simulate upload/processing delay
    setTimeout(() => {
      setFile(file);
      setIsUploading(false);
    }, 1500);
  };

  const resetFile = () => {
    setFile(null);
  };

  return (
    <Card className="glass-panel border-border/50 mb-8 overflow-hidden relative">
      <CardContent className="p-0">
        {!file ? (
          <div 
            className={cn(
              "flex flex-col items-center justify-center h-48 border-2 border-dashed transition-all duration-300 ease-in-out cursor-pointer",
              isDragging 
                ? "border-primary bg-primary/5 scale-[0.99]" 
                : "border-border/50 hover:border-primary/50 hover:bg-white/5"
            )}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => {
                // In a real app, this would trigger a file input click
                // For prototype, we'll just simulate a file being selected after a click
                const mockFile = new File([""], "financials_q4_2024.xlsx", { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
                handleFile(mockFile);
            }}
          >
            <div className="relative mb-4">
              <div className={cn("p-4 rounded-full bg-secondary transition-transform duration-500", isUploading && "animate-spin")}>
                 {isUploading ? <RefreshCw className="w-8 h-8 text-primary" /> : <UploadCloud className="w-8 h-8 text-muted-foreground" />}
              </div>
            </div>
            <h3 className="text-lg font-semibold mb-1">
              {isUploading ? "Processing Data..." : "Connect Excel Sheet"}
            </h3>
            <p className="text-sm text-muted-foreground max-w-xs text-center">
              {isUploading ? "Parsing rows and columns..." : "Drag & drop your financial spreadsheet here to visualize your data."}
            </p>
          </div>
        ) : (
          <div className="flex items-center justify-between p-6 bg-primary/5 border border-primary/20">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/20 rounded-lg text-primary">
                <FileSpreadsheet className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-medium text-foreground">Connected: {file.name}</h3>
                <p className="text-xs text-primary/80 flex items-center gap-1">
                  <Check className="w-3 h-3" />
                  Data synced successfully • 124 rows imported
                </p>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={resetFile}
              className="hover:bg-destructive/10 hover:text-destructive transition-colors"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
