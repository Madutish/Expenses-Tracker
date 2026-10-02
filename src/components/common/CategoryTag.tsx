import React from 'react';
import { getCategoryBadgeStyles } from '../../lib/utils';

interface CategoryTagProps {
  name: string;
  color?: string;
  className?: string;
}

export const CategoryTag: React.FC<CategoryTagProps> = ({
  name,
  color = 'slate',
  className = '',
}) => {
  const badgeStyle = getCategoryBadgeStyles(color);

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${badgeStyle} ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 opacity-70"></span>
      {name}
    </span>
  );
};
