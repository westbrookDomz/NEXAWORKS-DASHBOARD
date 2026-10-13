import { ToastAction } from "@/components/ui/toast";
import { useToast } from "@/hooks/use-toast";

/**
 * Removals happen at once and offer Undo in the toast, instead of an "Are you sure?" dialog.
 * `title` names what happened, as in "Task deleted".
 */
export function useUndoToast() {
  const { toast, dismiss } = useToast();
  return (title: string, onUndo: () => void) => {
    const t = toast({
      title,
      action: (
        <ToastAction
          altText="Undo"
          onClick={() => {
            onUndo();
            dismiss(t.id);
          }}
        >
          Undo
        </ToastAction>
      ),
    });
  };
}
