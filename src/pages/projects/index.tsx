import { GetStaticProps, NextPage } from 'next';
import { NextSeo } from 'next-seo';
import { useState } from 'react';

import Container from '@/common/components/elements/Container';
import PageHeading from '@/common/components/elements/PageHeading';
import prisma from '@/common/libs/prisma';
import { ProjectItemProps } from '@/common/types/projects';
import Projects from '@/modules/projects';

const PAGE_TITLE = 'Projects';
const PAGE_DESCRIPTION =
  'Several projects that I have worked on, both private and open source.';

const ProjectsPage: any = () => {
  const projects: any = [
    {
      title: 'Project Alpha',
      slug: 'project-alpha',
      description: 'A comprehensive project management tool.',
      image: 'https://via.placeholder.com/150',
      stacks: ['React', 'Node.js', 'MongoDB'],
      is_featured: true,
    },
    {
      title: 'Project Beta',
      slug: 'project-beta',
      description: 'An AI-powered analytics platform.',
      image: 'https://via.placeholder.com/150',
      stacks: ['Python', 'TensorFlow', 'Keras'],
      is_featured: false,
    },
    {
      title: 'Project Gamma',
      slug: 'project-gamma',
      description: 'A social media engagement tool.',
      image: 'https://via.placeholder.com/150',
      stacks: ['Angular', 'Firebase', 'TypeScript'],
      is_featured: true,
    },
    {
      title: 'Project Delta',
      slug: 'project-delta',
      description: 'A blockchain-based voting system.',
      image: 'https://via.placeholder.com/150',
      stacks: ['Solidity', 'Ethereum', 'Web3.js'],
      is_featured: false,
    },
    {
      title: 'Project Epsilon',
      slug: 'project-epsilon',
      description: 'An e-commerce platform for small businesses.',
      image: 'https://via.placeholder.com/150',
      stacks: ['Vue.js', 'Django', 'PostgreSQL'],
      is_featured: true,
    },
    {
      title: 'Project Zeta',
      slug: 'project-zeta',
      description: 'A fitness tracking mobile app.',
      image: 'https://via.placeholder.com/150',
      stacks: ['React Native', 'Redux', 'Firebase'],
      is_featured: false,
    },
    {
      title: 'Project Eta',
      slug: 'project-eta',
      description: 'An online learning management system.',
      image: 'https://via.placeholder.com/150',
      stacks: ['Ruby on Rails', 'React', 'MySQL'],
      is_featured: true,
    },
    {
      title: 'Project Theta',
      slug: 'project-theta',
      description: 'A real-time chat application.',
      image: 'https://via.placeholder.com/150',
      stacks: ['Node.js', 'Socket.io', 'MongoDB'],
      is_featured: false,
    },
    {
      title: 'Project Iota',
      slug: 'project-iota',
      description: 'A travel itinerary planning tool.',
      image: 'https://via.placeholder.com/150',
      stacks: ['Flutter', 'Firebase', 'Google Maps API'],
      is_featured: true,
    },
    {
      title: 'Project Kappa',
      slug: 'project-kappa',
      description: 'A financial portfolio management system.',
      image: 'https://via.placeholder.com/150',
      stacks: ['Java', 'Spring Boot', 'Oracle'],
      is_featured: false,
    },
  ];

  const [visibleProjects, setVisibleProjects] = useState(6);

  const loadMore = () => setVisibleProjects((prev) => prev + 2);
  const hasMore = visibleProjects < projects.length;

  return (
    <>
      <NextSeo title={`${PAGE_TITLE} - Awad Ali`} />
      <Container data-aos='fade-up'>
        <PageHeading title={PAGE_TITLE} description={PAGE_DESCRIPTION} />
        <Projects
          projects={projects.slice(0, visibleProjects)}
          loadMore={loadMore}
          hasMore={hasMore}
        />
      </Container>
    </>
  );
};

export default ProjectsPage;

// export const getStaticProps: GetStaticProps = async () => {
//   const response = await prisma.projects.findMany({
//     orderBy: [
//       {
//         is_featured: 'desc',
//       },
//       {
//         updated_at: 'desc',
//       },
//     ],
//   });

//   return {
//     props: {
//       projects: JSON.parse(JSON.stringify(response)),
//     },
//     revalidate: 1,
//   };
// };
