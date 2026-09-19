import { NextSeo } from 'next-seo';
import { useState } from 'react';

import Container from '@/common/components/elements/Container';
import PageHeading from '@/common/components/elements/PageHeading';
import { PROJECTS } from '@/common/constant/projects';
import { PAGE_SEO } from '@/common/constant/seo';
import { buildSeo } from '@/common/libs/seo';
import Projects from '@/modules/projects';

const PAGE_TITLE = 'Projects';

const ProjectsPage = () => {
  const projects = PROJECTS;

  const [visibleProjects, setVisibleProjects] = useState(6);

  const loadMore = () => setVisibleProjects((prev) => prev + 2);
  const hasMore = visibleProjects < projects.length;

  return (
    <>
      <NextSeo {...buildSeo(PAGE_SEO.projects)} />
      <Container data-aos='fade-up'>
        <PageHeading
          title={PAGE_TITLE}
          description={PAGE_SEO.projects.description}
        />
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
