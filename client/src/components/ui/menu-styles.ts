/**
 * One look for every floating menu (select, dropdown menu, popover, combobox):
 * popover surface, hairline border, theme shadow, and a quick origin-aware open
 * (150ms ease-out from 95% scale, scaling from the trigger; 100ms close).
 */
export const menuSurface =
  "z-50 rounded-xl border border-line bg-popover p-1.5 text-popover-foreground shadow-[var(--shadow-pop)] outline-none";

export const menuMotion =
  "duration-150 ease-[var(--ease-out)] data-[state=closed]:duration-100 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0 data-[state=open]:zoom-in-95 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-1 data-[side=top]:slide-in-from-bottom-1 data-[side=left]:slide-in-from-right-1 data-[side=right]:slide-in-from-left-1";

export const menuItem =
  "relative flex min-h-9 cursor-default select-none items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-sm outline-none transition-colors duration-100 data-[highlighted]:bg-ink/[0.06] data-[highlighted]:text-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0";

export const menuLabel = "px-2.5 pb-1 pt-2 text-xs font-medium text-muted-foreground";
export const menuSeparator = "-mx-1.5 my-1.5 h-px bg-line";

/** Trigger that looks like the app's text fields. */
export const fieldTrigger =
  "flex h-11 w-full items-center justify-between gap-2 rounded-xl border border-line bg-raised px-3.5 text-left text-sm text-foreground outline-none transition-[border-color,box-shadow] duration-150 focus-visible:border-primary/60 focus-visible:shadow-[0_0_0_3px_color-mix(in_srgb,var(--primary)_15%,transparent)] data-[state=open]:border-primary/60 data-[placeholder]:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 [&>span]:truncate";
