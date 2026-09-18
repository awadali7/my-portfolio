const Introduction = () => {
  return (
    <section className='bg-cover bg-no-repeat '>
      <div className='space-y-3'>
        <div className='flex gap-2  text-2xl font-medium lg:text-3xl'>
          <h1>Hi, I&apos;m Awad Ali</h1>{' '}
          <div className='ml-1 animate-waving-hand'>👋</div>
        </div>
        <div className='space-y-4'>
          <ul className='ml-5 flex list-disc flex-col gap-1 text-neutral-700 dark:text-neutral-400 lg:flex-row lg:gap-10'>
            <li>
              Based in Kochi, Kerala, India <span className='ml-1'>🇮🇳</span>
            </li>
            <li>Software Engineer at SFO Technologies</li>
          </ul>
        </div>
      </div>

      <p className='mt-6 leading-[1.8] text-neutral-800 dark:text-neutral-300 md:leading-loose'>
        Full stack software engineer and Next.js developer from Kerala with 4+
        years of experience, currently at SFO Technologies. I build fast,
        scalable web applications with Next.js, React, Node.js and .NET, with a
        passion for pixel-perfect user experiences and clean, maintainable code.
      </p>
    </section>
  );
};

export default Introduction;
