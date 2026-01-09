
import { FolderKanban } from "lucide-react";

export default function Placeholder({ title }: { title: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8">
      <div className="bg-primary/10 p-6 rounded-full mb-6">
        <FolderKanban className="w-16 h-16 text-primary animate-pulse" />
      </div>
      <h2 className="text-3xl font-bold mb-3">{title}</h2>
      <p className="text-muted-foreground max-w-md">
        This page is currently under construction. Check back soon for updates!
      </p>
    </div>
  );
}
