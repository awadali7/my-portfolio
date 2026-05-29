import { GetStaticPaths, GetStaticProps, NextPage } from 'next';
import { NextSeo } from 'next-seo';

import BackButton from '@/common/components/elements/BackButton';
import Container from '@/common/components/elements/Container';
import PageHeading from '@/common/components/elements/PageHeading';
import { PROJECTS } from '@/common/constant/projects';
import { ProjectItemProps } from '@/common/types/projects';
import ProjectDetail from '@/modules/projects/components/ProjectDetail';

interface ProjectsDetailPageProps {
  project: ProjectItemProps;
}

const ProjectsDetailPage: NextPage<ProjectsDetailPageProps> = ({ project }) => {
  const canonicalUrl = `https://awad.id/projects/${project?.slug}`;

  return (
    <>
      <NextSeo
        title={`${project?.title} - Projects · Awad Ali`}
        description={project?.description}
        canonical={canonicalUrl}
        openGraph={{
          type: 'article',
          article: {
            publishedTime: project?.updated_at.toString(),
            modifiedTime: project?.updated_at.toString(),
            authors: ['Awad Ali'],
          },
          url: canonicalUrl,
          images: [{ url: project?.image }],
          siteName: 'Awad Ali',
        }}
      />
      <Container data-aos='fade-up'>
        <BackButton url='/projects' />
        <PageHeading
          title={project?.title}
          description={project?.description}
        />
        <ProjectDetail {...project} />
      </Container>
    </>
  );
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const project = PROJECTS.find((p) => p.slug === String(params?.slug));

  if (!project) {
    return { redirect: { destination: '/404', permanent: false } };
  }

  return {
    props: {
      project: JSON.parse(JSON.stringify(project)),
    },
  };
};

export const getStaticPaths: GetStaticPaths = async () => {
  const paths = PROJECTS.map((project) => ({
    params: { slug: project.slug },
  }));

  return { paths, fallback: false };
};

export default ProjectsDetailPage;
