import React from "react";
import * as LucideIcons from "lucide-react";
// import { cn } from "@/utils/cn";

export type IconName = keyof typeof LucideIcons;

export interface IconProps {
  name: IconName;
  size?: number;
  className?: string;
}

// export const Icon: React.FC<IconProps> = ({ name, size = 24, className }) => {
//   const LucideIcon = LucideIcons[name];
//   return <LucideIcon size={size} className={cn("", className)} />;
export const Icon: React.FC<IconProps> = () => {
  return <></>;
};
