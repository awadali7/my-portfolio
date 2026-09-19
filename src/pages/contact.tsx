import { NextPage } from 'next';
import { NextSeo } from 'next-seo';

import Container from '@/common/components/elements/Container';
import PageHeading from '@/common/components/elements/PageHeading';
import { PAGE_SEO } from '@/common/constant/seo';
import { buildSeo } from '@/common/libs/seo';
import Contact from '@/modules/contact';

const PAGE_TITLE = 'Contact';

const ContactPage: NextPage = () => {
  return (
    <>
      <NextSeo {...buildSeo(PAGE_SEO.contact)} />
      <Container data-aos='fade-up'>
        <PageHeading
          title={PAGE_TITLE}
          description={PAGE_SEO.contact.description}
        />
        <Contact />
      </Container>
    </>
  );
};

export default ContactPage;
