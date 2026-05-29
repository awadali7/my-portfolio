import { BsSpotify as SpotifyIcon } from 'react-icons/bs';

import Card from '@/common/components/elements/Card';

const TOP_TRACKS = [
  { rank: 1, title: 'Blinding Lights', artist: 'The Weeknd', duration: '3:22' },
  { rank: 2, title: 'As It Was', artist: 'Harry Styles', duration: '2:37' },
  { rank: 3, title: 'Levitating', artist: 'Dua Lipa', duration: '3:23' },
  { rank: 4, title: 'Heat Waves', artist: 'Glass Animals', duration: '3:59' },
  {
    rank: 5,
    title: 'Stay',
    artist: 'The Kid LAROI & Justin Bieber',
    duration: '2:21',
  },
  {
    rank: 6,
    title: 'Watermelon Sugar',
    artist: 'Harry Styles',
    duration: '2:54',
  },
  { rank: 7, title: 'Good 4 U', artist: 'Olivia Rodrigo', duration: '2:58' },
  { rank: 8, title: 'Save Your Tears', artist: 'The Weeknd', duration: '3:35' },
  {
    rank: 9,
    title: 'Industry Baby',
    artist: 'Lil Nas X & Jack Harlow',
    duration: '3:32',
  },
  { rank: 10, title: 'Shivers', artist: 'Ed Sheeran', duration: '3:27' },
];

const SpotifyWidget = () => {
  return (
    <Card className='p-5'>
      <div className='mb-4 flex items-center gap-2'>
        <SpotifyIcon size={18} className='text-green-500' />
        <span className='font-medium text-neutral-700 dark:text-neutral-300'>
          Top Tracks
        </span>
      </div>
      <div className='space-y-3'>
        {TOP_TRACKS.map(({ rank, title, artist, duration }) => (
          <div
            key={rank}
            className='flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-800'
          >
            <span className='w-5 shrink-0 text-center text-sm text-neutral-400'>
              {rank}
            </span>
            <div className='min-w-0 flex-1'>
              <p className='truncate text-sm font-medium text-neutral-700 dark:text-neutral-300'>
                {title}
              </p>
              <p className='truncate text-xs text-neutral-400'>{artist}</p>
            </div>
            <span className='shrink-0 text-xs text-neutral-400'>
              {duration}
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default SpotifyWidget;
