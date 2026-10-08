import { useState } from "react";
import { Check, ChevronDown, UserPlus } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { fieldTrigger } from "@/components/ui/menu-styles";
import { cn } from "@/lib/utils";

/** Pick a client from the sheet, or type a new name. Searchable, same look as every other menu. */
export function ClientCombobox({
  id,
  value,
  onChange,
  options,
}: {
  id?: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const typed = query.trim();
  const exact = options.some((o) => o.toLowerCase() === typed.toLowerCase());

  const pick = (v: string) => {
    onChange(v);
    setOpen(false);
    setQuery("");
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button id={id} type="button" role="combobox" aria-expanded={open} className={cn(fieldTrigger, "group")} data-placeholder={value ? undefined : ""}>
          <span className={cn(!value && "text-muted-foreground")}>{value || "Choose or type a name"}</span>
          <ChevronDown className="size-4 shrink-0 text-muted-foreground transition-transform duration-200 ease-[var(--ease-out)] group-data-[state=open]:rotate-180" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" sideOffset={6} className="w-(--radix-popover-trigger-width) min-w-64 p-0">
        <Command className="rounded-xl bg-transparent">
          <CommandInput value={query} onValueChange={setQuery} placeholder="Search clients" className="h-11" />
          <CommandList className="max-h-64">
            <CommandEmpty>{typed ? null : "No clients on the sheet yet."}</CommandEmpty>
            {options.length > 0 && (
              <CommandGroup heading="From the sheet">
                {options.map((o) => (
                  <CommandItem key={o} value={o} onSelect={() => pick(o)}>
                    <span className="grid size-6 place-items-center rounded-md bg-raised font-display text-xs font-semibold">{o.charAt(0).toUpperCase()}</span>
                    <span className="flex-1 truncate">{o}</span>
                    {value === o && <Check className="text-primary" strokeWidth={2.5} />}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
            {typed && !exact && (
              <CommandGroup>
                <CommandItem value={`__new ${typed}`} onSelect={() => pick(typed)} forceMount>
                  <UserPlus className="text-muted-foreground" />
                  Use “{typed}”
                </CommandItem>
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
