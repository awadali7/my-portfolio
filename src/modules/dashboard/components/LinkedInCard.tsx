import Link from 'next/link';
import { BsLinkedin as LinkedInIcon } from 'react-icons/bs';
import { HiLocationMarker as LocationIcon } from 'react-icons/hi';
import { MdWork as WorkIcon } from 'react-icons/md';

import Card from '@/common/components/elements/Card';

const STATS = [
  { label: 'Followers', value: '500+' },
  { label: 'Connections', value: '500+' },
  { label: 'Years Exp.', value: '4+' },
];

const LinkedInCard = () => {
  return (
    <Card className='p-5'>
      <div className='mb-4 flex items-center justify-between'>
        <div className='flex items-center gap-2'>
          <LinkedInIcon size={18} className='text-blue-500' />
          <span className='font-medium text-neutral-700 dark:text-neutral-300'>
            LinkedIn
          </span>
        </div>
        <Link
          href='https://www.linkedin.com/in/awad-ali7/'
          target='_blank'
          className='rounded-full bg-blue-500 px-3 py-1 text-xs font-medium text-white transition-colors hover:bg-blue-600'
        >
          View Profile
        </Link>
      </div>

      {/* Profile info */}
      <div className='space-y-3'>
        <div>
          <div className='flex items-center gap-1.5'>
            <span className='font-medium text-neutral-700 dark:text-neutral-200'>
              Awad Ali
            </span>
            <span className='text-xs text-neutral-400'>He/Him</span>
          </div>
          <p className='mt-1 text-[13px] leading-relaxed text-neutral-500 dark:text-neutral-400'>
            Senior Full Stack Engineer · Next.js · Node.js · Django · .NET
          </p>
        </div>

        <div className='flex items-center gap-1.5 text-[13px] text-neutral-500 dark:text-neutral-400'>
          <LocationIcon size={14} className='shrink-0' />
          <span>Dubai, United Arab Emirates</span>
        </div>

        {/* Open to Work badge */}
        <div className='flex items-center gap-2 rounded-lg bg-green-50 px-3 py-2 dark:bg-green-900/20'>
          <WorkIcon size={14} className='text-green-600 dark:text-green-400' />
          <span className='text-[13px] font-medium text-green-700 dark:text-green-400'>
            Open to Work · Available Immediately
          </span>
        </div>

        {/* Stats */}
        <div className='grid grid-cols-3 gap-2 pt-1'>
          {STATS.map(({ label, value }) => (
            <div
              key={label}
              className='rounded-lg bg-neutral-100 p-2.5 text-center dark:bg-neutral-800'
            >
              <p className='text-sm font-semibold text-neutral-700 dark:text-neutral-200'>
                {value}
              </p>
              <p className='text-[11px] text-neutral-400'>{label}</p>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};

export default LinkedInCard;
