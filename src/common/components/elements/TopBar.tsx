import Image from './Image';

const TopBar = () => {
  return (
    <div className='hidden items-center justify-center gap-x-2 bg-cover bg-no-repeat p-2.5 text-sm shadow-lg backdrop-blur-2xl dark:border-b dark:border-neutral-800 dark:text-neutral-300 xl:flex'>
      <span>🚀</span>
      <span>Just launched my landing page website. check it out :</span>
      <a
        href='https://awad.com/?utm_source=awadali.com&utm_medium=referral&ref=awadali.com'
        target='_blank'
        className='ml-0.5 underline'
      >
        awad.com
      </a>
      <Image
        src='/images/dot_new_animated.svg'
        width={30}
        height={30}
        alt='new'
      />
    </div>
  );
};

export default TopBar;
