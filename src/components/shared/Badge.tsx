import type { Category } from '../../types';
import { CATEGORY_META } from '../../lib/categoryMeta';

interface Props {
  category: Category;
  size?: 'sm' | 'md';
}

export function Badge({ category, size = 'sm' }: Props) {
  const meta = CATEGORY_META[category];
  const padding = size === 'sm' ? '2px 8px' : '3px 10px';
  const fontSize = size === 'sm' ? '11px' : '12px';

  return (
    <span
      style={{
        background: meta.color,
        color: meta.textColor,
        padding,
        fontSize,
        fontWeight: 600,
        borderRadius: '9999px',
        letterSpacing: '0.02em',
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        whiteSpace: 'nowrap',
      }}
    >
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: '50%',
          background: meta.dot,
          flexShrink: 0,
        }}
      />
      {meta.label}
    </span>
  );
}
