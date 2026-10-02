import { useId } from 'react';

import cn from '@/common/libs/cn';

type CardPatternProps = {
  className?: string;
};

/**
 * Decorative grid that fades out from the card's top-right corner.
 *
 * Adapted from the shadcn-flavoured original: that version used `primary`/
 * `muted` theme tokens this project doesn't define, and `mix-blend-multiply`,
 * which darkens toward invisible on a dark card. Here the strokes are plain
 * white/black at low alpha so the same shape reads on both themes.
 *
 * The pattern id comes from useId() — a hard-coded id would collide once more
 * than one card is on screen, and every card would then paint the first one's
 * pattern.
 */
const CardPattern = ({ className }: CardPatternProps) => {
  const patternId = useId();

  return (
    <div
      aria-hidden='true'
      className={cn(
        'pointer-events-none absolute right-0 top-0 h-32 w-48 overflow-hidden',
        // Fades the whole thing out towards the bottom-left so it never
        // competes with the card's actual content.
        '[mask-image:radial-gradient(farthest-side_at_top_right,white,transparent)]',
        '[-webkit-mask-image:radial-gradient(farthest-side_at_top_right,white,transparent)]',
        className,
      )}
    >
      <svg
        className='absolute inset-0 h-full w-full stroke-neutral-900/[0.08] dark:stroke-white/[0.14]'
        fill='none'
      >
        <defs>
          <pattern
            id={patternId}
            width={20}
            height={20}
            patternUnits='userSpaceOnUse'
            x='-12'
            y='4'
          >
            <path d='M.5 20V.5H20' fill='none' />
          </pattern>
        </defs>
        <rect
          width='100%'
          height='100%'
          strokeWidth={0}
          fill={`url(#${patternId})`}
        />
        {/* A few filled cells break up the grid so it reads as texture rather
            than graph paper. */}
        <svg x='-12' y='4' className='overflow-visible'>
          <rect
            className='fill-neutral-900/[0.06] dark:fill-white/[0.10]'
            strokeWidth={0}
            width={21}
            height={21}
            x={100}
            y={20}
          />
          <rect
            className='fill-neutral-900/[0.06] dark:fill-white/[0.10]'
            strokeWidth={0}
            width={21}
            height={21}
            x={140}
            y={60}
          />
          <rect
            className='fill-neutral-900/[0.06] dark:fill-white/[0.10]'
            strokeWidth={0}
            width={21}
            height={21}
            x={160}
            y={20}
          />
          <rect
            className='fill-neutral-900/[0.06] dark:fill-white/[0.10]'
            strokeWidth={0}
            width={21}
            height={21}
            x={120}
            y={100}
          />
        </svg>
      </svg>
    </div>
  );
};

export default CardPattern;
