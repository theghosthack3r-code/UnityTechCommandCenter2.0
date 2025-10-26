import React from 'react';
import { icons } from 'lucide-react';

const toPascalCase = (str: string) =>
  str.replace(/(^\w|-\w)/g, (text) => text.replace(/-/, "").toUpperCase());

// FIX: Omit 'name' from SVGProps to avoid type conflict with our custom 'name' prop.
interface IconProps extends Omit<React.SVGProps<SVGSVGElement>, 'name'> {
  name: keyof typeof icons;
  className?: string;
}

export const Icon: React.FC<IconProps> = ({ name, className = 'w-5 h-5', ...props }) => {
  // FIX: Cast `name` to string to handle cases where its type is inferred as `string | number | symbol`.
  const LucideIcon = icons[toPascalCase(String(name)) as keyof typeof icons];

  if (!LucideIcon) {
    // Fallback icon or null
    return null;
  }

  return <LucideIcon className={className} {...props} />;
};
