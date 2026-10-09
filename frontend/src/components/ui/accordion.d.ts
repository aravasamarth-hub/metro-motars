import * as React from "react";
import * as AccordionPrimitive from "@radix-ui/react-accordion";

export const Accordion: typeof AccordionPrimitive.Root;
export const AccordionItem: typeof AccordionPrimitive.Item;
export const AccordionTrigger: React.ForwardRefExoticComponent<React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger> & React.RefAttributes<HTMLButtonElement>>;
export const AccordionContent: React.ForwardRefExoticComponent<React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Content> & React.RefAttributes<HTMLDivElement>>;
