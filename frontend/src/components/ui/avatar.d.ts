import * as React from "react";
import * as AvatarPrimitive from "@radix-ui/react-avatar";

export const Avatar: React.ForwardRefExoticComponent<React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root> & React.RefAttributes<HTMLSpanElement>>;
export const AvatarImage: React.ForwardRefExoticComponent<React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Image> & React.RefAttributes<HTMLImageElement>>;
export const AvatarFallback: React.ForwardRefExoticComponent<React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback> & React.RefAttributes<HTMLSpanElement>>;
