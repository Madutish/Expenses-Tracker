import React from 'react';
import { getFactoryBadgeStyles } from '../../lib/utils';

interface FactoryBadgeProps {
  code: string;
  name?: string;
  color?: string;
  showName?: boolean;
  className?: string;
}

export const FactoryBadge: React.FC<FactoryBadgeProps> = ({
  code,
  name,
  color = 'blue',
  showName = false,
  className = '',
}) => {
  const badgeStyle = getFactoryBadgeStyles(color);

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-semibold tracking-wide border shadow-2xs ${badgeStyle} ${className}`}
      title={name || code}
    >
      <span className="font-mono font-bold">{code}</span>
      {showName && name && (
        <span className="text-[11px] font-normal opacity-90 truncate max-w-[150px]">
          - {name.replace(code, '').replace(/^[\s-]+/, '')}
        </span>
      )}
    </span>
  );
};
