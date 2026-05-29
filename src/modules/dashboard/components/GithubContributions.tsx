import useSWR from 'swr';

import Card from '@/common/components/elements/Card';
import { fetcher } from '@/services/fetcher';

const MONTH_NAMES = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];
const DAY_LABELS = ['', 'Mon', '', 'Wed', '', 'Fri', ''];

const FALLBACK_WEEKS = (() => {
  const weeks: { count: number; date: string }[][] = [];
  let seed = 42;
  const rand = () => {
    seed = (seed * 1664525 + 1013904223) & 0xffffffff;
    return (seed >>> 0) / 0xffffffff;
  };
  const start = new Date();
  start.setDate(start.getDate() - 364);
  start.setDate(start.getDate() - start.getDay());
  const cur = new Date(start);
  for (let w = 0; w < 53; w++) {
    const week: { count: number; date: string }[] = [];
    for (let d = 0; d < 7; d++) {
      const r = rand();
      let count = 0;
      if (r > 0.48) count = Math.floor(rand() * 3) + 1;
      if (r > 0.7) count = Math.floor(rand() * 4) + 4;
      if (r > 0.88) count = Math.floor(rand() * 4) + 8;
      week.push({ count, date: cur.toISOString().split('T')[0] });
      cur.setDate(cur.getDate() + 1);
    }
    weeks.push(week);
  }
  return weeks;
})();

const getColor = (count: number) => {
  if (count === 0) return 'bg-neutral-200 dark:bg-neutral-800';
  if (count <= 2) return 'bg-emerald-200 dark:bg-emerald-900';
  if (count <= 5) return 'bg-emerald-300 dark:bg-emerald-700';
  if (count <= 9) return 'bg-emerald-500';
  return 'bg-emerald-400';
};

interface MonthMeta {
  firstDay: string;
  name: string;
}

const getMonthLabels = (
  weeks: { count: number; date: string }[][],
  apiMonths?: MonthMeta[],
) => {
  const labels: { month: string; col: number }[] = [];
  let lastCol = -4;
  let lastYear = -1;

  const source: { name: string; firstDay: string }[] = apiMonths?.length
    ? apiMonths
    : MONTH_NAMES.map((m, i) => ({
        name: m,
        col: Math.round((i / 12) * weeks.length),
        firstDay: '',
      }));

  source.forEach((month, i) => {
    // find the first week column that contains days from this month
    const col = weeks.findIndex((week) =>
      week.some((day) => day.date.startsWith(month.firstDay.slice(0, 7))),
    );
    if (col === -1) return;

    const year = new Date(month.firstDay + 'T00:00:00').getFullYear();
    const yearChanged = year !== lastYear && lastYear !== -1;

    const isFirst = i === 0;
    if (isFirst || col - lastCol >= 5) {
      labels.push({
        month: yearChanged
          ? `${month.name} '${String(year).slice(2)}`
          : month.name,
        col,
      });
      lastCol = col;
      lastYear = year;
    }
  });

  return labels;
};

const GithubContributions = () => {
  const { data } = useSWR('/api/github?type=personal', fetcher);

  const calendar = data?.contributionsCollection?.contributionCalendar;

  const weeks: { count: number; date: string }[][] = calendar
    ? calendar.weeks.map((w: any) =>
        w.contributionDays.map((d: any) => ({
          count: d.contributionCount,
          date: d.date,
        })),
      )
    : FALLBACK_WEEKS;

  const total: number = calendar
    ? calendar.totalContributions
    : weeks.flat().reduce((s, d) => s + d.count, 0);

  const monthLabels = getMonthLabels(weeks, calendar?.months);

  return (
    <Card className='space-y-4 p-5'>
      <div className='flex items-center justify-between'>
        <span className='font-medium text-neutral-700 dark:text-neutral-300'>
          GitHub Contributions
        </span>
        <span className='text-sm text-neutral-500 dark:text-neutral-400'>
          {total.toLocaleString()} contributions this year
        </span>
      </div>

      <div className='overflow-x-auto pb-1'>
        <div className='min-w-max'>
          {/* Month labels derived from real dates */}
          <div className='mb-1 flex pl-8'>
            {weeks.map((_, w) => {
              const label = monthLabels.find((m) => m.col === w);
              return (
                <div
                  key={w}
                  className='relative w-[14px] shrink-0 overflow-visible whitespace-nowrap text-[10px] text-neutral-400'
                >
                  {label ? label.month : ''}
                </div>
              );
            })}
          </div>

          <div className='flex gap-0'>
            {/* Day labels */}
            <div className='mr-1 flex flex-col gap-[2px]'>
              {DAY_LABELS.map((day, i) => (
                <div
                  key={i}
                  className='h-[12px] text-[10px] leading-[12px] text-neutral-400 dark:text-neutral-500'
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Cells */}
            {weeks.map((week, w) => (
              <div key={w} className='flex flex-col gap-[2px]'>
                {week.map(({ count, date }, d) => (
                  <div
                    key={d}
                    title={`${count} contributions${date ? ` on ${date}` : ''}`}
                    className={`h-[12px] w-[12px] rounded-[2px] ${getColor(count)}`}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className='flex items-center gap-1 text-[11px] text-neutral-400'>
        <span>Less</span>
        {[
          'bg-neutral-200 dark:bg-neutral-800',
          'bg-emerald-200 dark:bg-emerald-900',
          'bg-emerald-300 dark:bg-emerald-700',
          'bg-emerald-500',
          'bg-emerald-400',
        ].map((c, i) => (
          <div key={i} className={`h-[12px] w-[12px] rounded-[2px] ${c}`} />
        ))}
        <span>More</span>
      </div>
    </Card>
  );
};

export default GithubContributions;
