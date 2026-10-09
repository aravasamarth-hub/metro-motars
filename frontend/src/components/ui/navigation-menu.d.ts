import * as React from "react";
import * as NavigationMenuPrimitive from "@radix-ui/react-navigation-menu";

export const NavigationMenu: React.ForwardRefExoticComponent<React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Root> & React.RefAttributes<HTMLElement>>;
export const NavigationMenuList: React.ForwardRefExoticComponent<React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.List> & React.RefAttributes<HTMLUListElement>>;
export const NavigationMenuItem: typeof NavigationMenuPrimitive.Item;
export const NavigationMenuContent: React.ForwardRefExoticComponent<React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Content> & React.RefAttributes<HTMLDivElement>>;
export const NavigationMenuTrigger: React.ForwardRefExoticComponent<React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Trigger> & React.RefAttributes<HTMLButtonElement>>;
export const NavigationMenuLink: typeof NavigationMenuPrimitive.Link;
export const NavigationMenuIndicator: React.ForwardRefExoticComponent<React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Indicator> & React.RefAttributes<HTMLDivElement>>;
export const NavigationMenuViewport: React.ForwardRefExoticComponent<React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Viewport> & React.RefAttributes<HTMLDivElement>>;
export const navigationMenuTriggerStyle: (props?: any) => string;
