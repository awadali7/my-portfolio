import { PROJECTS } from '@/common/constant/projects';
import { getProjectPageSeo, PAGE_SEO } from '@/common/constant/seo';
import { SITE_URL } from '@/common/constant/site';
import { absoluteUrl, buildSeo } from '@/common/libs/seo';

const ALL_PAGES = [
  ...Object.values(PAGE_SEO),
  ...PROJECTS.map(getProjectPageSeo),
];

const findDuplicates = (values: string[]) =>
  values.filter((value, index) => values.indexOf(value) !== index);

describe('page metadata', () => {
  test('every title is unique', () => {
    expect(findDuplicates(ALL_PAGES.map((page) => page.title))).toEqual([]);
  });

  test('every description is unique', () => {
    expect(findDuplicates(ALL_PAGES.map((page) => page.description))).toEqual(
      [],
    );
  });

  test('every path is unique', () => {
    expect(findDuplicates(ALL_PAGES.map((page) => page.path))).toEqual([]);
  });

  test('titles and descriptions do not target a local Indian audience', () => {
    ALL_PAGES.forEach(({ title, description }) => {
      expect(`${title} ${description}`).not.toMatch(/kerala|kochi/i);
    });
  });
});

describe('buildSeo', () => {
  test('resolves relative paths against the site url', () => {
    expect(absoluteUrl('/')).toBe(SITE_URL);
    expect(absoluteUrl('/about')).toBe(`${SITE_URL}/about`);
    expect(absoluteUrl('images/a.png')).toBe(`${SITE_URL}/images/a.png`);
    expect(absoluteUrl('https://example.com/a.png')).toBe(
      'https://example.com/a.png',
    );
  });

  test('sets a self-referencing canonical and absolute og tags', () => {
    const seo = buildSeo(PAGE_SEO.about);

    expect(seo.canonical).toBe(`${SITE_URL}/about`);
    expect(seo.openGraph?.url).toBe(`${SITE_URL}/about`);
    expect(seo.openGraph?.images?.[0].url).toMatch(/^https:\/\//);
    expect(seo.openGraph?.locale).toBeDefined();
  });

  test('omits the canonical on noindex pages', () => {
    const seo = buildSeo(PAGE_SEO.notFound);

    expect(seo.noindex).toBe(true);
    expect(seo.canonical).toBeUndefined();
  });
});
