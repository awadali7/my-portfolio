import { BsClockHistory as ClockIcon } from 'react-icons/bs';
import { SiWakatime as WakatimeIcon } from 'react-icons/si';

import Card from '@/common/components/elements/Card';

const STATS = {
  totalAllTime: '892 hrs 34 mins',
  weeklyTotal: '38 hrs 22 mins',
  dailyAverage: '5 hrs 29 mins',
  bestDay: { date: 'Nov 15, 2024', time: '9 hrs 45 mins' },
  languages: [
    { name: 'TypeScript', percent: 45.2, color: 'bg-blue-400' },
    { name: 'JavaScript', percent: 28.3, color: 'bg-yellow-400' },
    { name: 'Python', percent: 15.1, color: 'bg-green-400' },
    { name: 'CSS', percent: 7.4, color: 'bg-sky-400' },
    { name: 'Other', percent: 4.0, color: 'bg-neutral-400' },
  ],
  editors: [
    { name: 'VS Code', percent: 96.5 },
    { name: 'Vim', percent: 3.5 },
  ],
};

const WakatimeStats = () => {
  return (
    <Card className='space-y-5 p-5'>
      <div className='flex items-center gap-2'>
        <WakatimeIcon size={18} className='text-teal-400' />
        <span className='font-medium text-neutral-700 dark:text-neutral-300'>
          Wakatime Stats
        </span>
      </div>

      {/* Summary */}
      <div className='grid grid-cols-2 gap-3'>
        {[
          { label: 'All-Time', value: STATS.totalAllTime },
          { label: 'This Week', value: STATS.weeklyTotal },
          { label: 'Daily Avg', value: STATS.dailyAverage },
          { label: 'Best Day', value: STATS.bestDay.time },
        ].map(({ label, value }) => (
          <div
            key={label}
            className='rounded-lg bg-neutral-100 p-3 dark:bg-neutral-800'
          >
            <p className='text-[11px] text-neutral-500 dark:text-neutral-400'>
              {label}
            </p>
            <p className='mt-0.5 text-sm font-medium text-neutral-700 dark:text-neutral-300'>
              {value}
            </p>
          </div>
        ))}
      </div>

      {/* Languages */}
      <div className='space-y-2'>
        <p className='text-[13px] text-neutral-500 dark:text-neutral-400'>
          Top Languages
        </p>
        {STATS.languages.map(({ name, percent, color }) => (
          <div key={name} className='space-y-1'>
            <div className='flex justify-between text-[13px]'>
              <span className='text-neutral-600 dark:text-neutral-300'>
                {name}
              </span>
              <span className='text-neutral-400'>{percent}%</span>
            </div>
            <div className='h-1.5 w-full overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-700'>
              <div
                className={`h-full rounded-full ${color}`}
                style={{ width: `${percent}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Editor */}
      <div className='flex items-center gap-2 text-[13px] text-neutral-400'>
        <ClockIcon size={14} />
        <span>
          Primary editor:{' '}
          <span className='text-neutral-600 dark:text-neutral-300'>
            {STATS.editors[0].name}
          </span>{' '}
          ({STATS.editors[0].percent}%)
        </span>
      </div>
    </Card>
  );
};

export default WakatimeStats;
