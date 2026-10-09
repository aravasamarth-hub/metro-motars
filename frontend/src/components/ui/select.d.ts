import * as React from "react";
import * as SelectPrimitive from "@radix-ui/react-select";

export const Select: typeof SelectPrimitive.Root;
export const SelectGroup: typeof SelectPrimitive.Group;
export const SelectValue: typeof SelectPrimitive.Value;
export const SelectTrigger: React.ForwardRefExoticComponent<React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger> & React.RefAttributes<HTMLButtonElement>>;
export const SelectContent: React.ForwardRefExoticComponent<React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content> & React.RefAttributes<HTMLDivElement>>;
export const SelectLabel: React.ForwardRefExoticComponent<React.ComponentPropsWithoutRef<typeof SelectPrimitive.Label> & React.RefAttributes<HTMLDivElement>>;
export const SelectItem: React.ForwardRefExoticComponent<React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item> & React.RefAttributes<HTMLDivElement>>;
export const SelectSeparator: React.ForwardRefExoticComponent<React.ComponentPropsWithoutRef<typeof SelectPrimitive.Separator> & React.RefAttributes<HTMLDivElement>>;
export const SelectScrollUpButton: React.ForwardRefExoticComponent<React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollUpButton> & React.RefAttributes<HTMLDivElement>>;
export const SelectScrollDownButton: React.ForwardRefExoticComponent<React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollDownButton> & React.RefAttributes<HTMLDivElement>>;
