import {
  countWords,
  extractHeadings,
  formatBlogDate,
  getPublishWarnings,
  insertAtSelection,
  parsePageParam,
  parseTags,
  readingMinutes,
  singleParam,
  SLUG_PATTERN,
  slugify,
  tableOfContents,
  toBlogCategoryInput,
  toBlogPostInput,
  wasUpdatedLater,
} from '@/common/helpers/blog';

describe('slugify', () => {
  test('matches the backend: lowercase, no accents, single hyphens', () => {
    expect(slugify('  Héllo, Wörld!  Next.js 16 ')).toBe(
      'hello-world-next-js-16',
    );
    expect(slugify('abc def', 4)).toBe('abc');
    expect(slugify('!!!')).toBe('');
    expect(SLUG_PATTERN.test(slugify('React Server Components: A Guide'))).toBe(
      true,
    );
  });
});

describe('extractHeadings', () => {
  const markdown = [
    '# Intro', // 1
    'Some text.', // 2
    '', // 3
    '## Setup', // 4
    '```ts', // 5
    '## not a heading', // 6
    '```', // 7
    '## Setup', // 8
    '### Details `code` and **bold**', // 9
    '~~~', // 10
    '# also not a heading', // 11
    '~~~', // 12
    '## [Linked](https://example.com) heading ##', // 13
    '#NoSpace', // 14
    '##   ', // 15
  ].join('\n');

  const headings = extractHeadings(markdown);

  test('finds headings outside code blocks with their source lines', () => {
    expect(headings.map(({ depth, line }) => [depth, line])).toEqual([
      [1, 1],
      [2, 4],
      [2, 8],
      [3, 9],
      [2, 13],
    ]);
  });

  test('strips markdown from the text and keeps ids unique', () => {
    expect(headings.map(({ text, id }) => [text, id])).toEqual([
      ['Intro', 'intro'],
      ['Setup', 'setup'],
      ['Setup', 'setup-2'],
      ['Details code and bold', 'details-code-and-bold'],
      ['Linked heading', 'linked-heading'],
    ]);
  });

  test('the table of contents holds only top-level sections', () => {
    expect(tableOfContents(headings).map((heading) => heading.id)).toEqual([
      'intro',
      'setup',
      'setup-2',
      'linked-heading',
    ]);
  });

  test('keeps underscores inside words', () => {
    expect(extractHeadings('## Using snake_case_names')[0].text).toBe(
      'Using snake_case_names',
    );
  });
});

describe('reading time', () => {
  test('counts labels but not link or image addresses', () => {
    expect(
      countWords(
        '[read the docs](https://example.com/long/path) ![a cat](/c.png)',
      ),
    ).toBe(5);
  });

  test('rounds up at 200 words a minute, never below one', () => {
    expect(readingMinutes('word')).toBe(1);
    expect(readingMinutes('word '.repeat(201))).toBe(2);
  });
});

describe('dates', () => {
  test('are shown in India time', () => {
    // 20:00 UTC on Oct 2 is 01:30 on Oct 3 in India.
    expect(formatBlogDate('2026-10-02T20:00:00Z')).toBe('Oct 3, 2026');
  });

  test('an edit counts as an update only on a later day in India', () => {
    expect(
      wasUpdatedLater('2026-10-01T10:00:00Z', '2026-10-01T15:00:00Z'),
    ).toBe(false);
    expect(
      wasUpdatedLater('2026-10-01T10:00:00Z', '2026-10-01T19:00:00Z'),
    ).toBe(true);
    expect(wasUpdatedLater('2026-10-01T10:00:00Z', null)).toBe(false);
    expect(wasUpdatedLater(null, '2026-10-05T10:00:00Z')).toBe(false);
  });
});

describe('query parameters', () => {
  test('page numbers are positive whole numbers, 1 when absent', () => {
    expect(parsePageParam(undefined)).toBe(1);
    expect(parsePageParam('2')).toBe(2);
    ['0', '01', 'abc', '-1', '1.5', '10000'].forEach((value) =>
      expect(parsePageParam(value)).toBeNull(),
    );
    expect(parsePageParam(['2', '3'])).toBeNull();
  });

  test('single values are trimmed and capped', () => {
    expect(singleParam([' first ', 'second'])).toBe('first');
    expect(singleParam(undefined)).toBe('');
    expect(singleParam('x'.repeat(200), 10)).toHaveLength(10);
  });
});

describe('parseTags', () => {
  test('stores tags the way the backend does', () => {
    expect(parseTags('React, next js ,react,, ')).toEqual(['react', 'next-js']);
    expect(parseTags(['A', 'a', 'B c'])).toEqual(['a', 'b-c']);
  });

  test('keeps at most ten', () => {
    expect(
      parseTags(Array.from({ length: 12 }, (_, i) => `t${i}`)),
    ).toHaveLength(10);
  });
});

describe('getPublishWarnings', () => {
  const clean = {
    title: 'Caching in Next.js',
    excerpt:
      'What changed in the caching model, why requests are no longer cached by default, and how to opt back in.',
    content:
      '## Why it changed\n\nText.\n\n![A diagram of the cache](https://example.com/a.png)',
    coverImageUrl: 'https://example.com/cover.png',
    coverImageAlt: 'A diagram',
    seoTitle: null,
    seoDescription: null,
  };

  test('a well-prepared post has none', () => {
    expect(getPublishWarnings(clean, ['Another post'])).toEqual([]);
  });

  test('flags each problem in plain words', () => {
    const warnings = getPublishWarnings(
      {
        ...clean,
        title: 'A very long title that will certainly be cut off by Google',
        excerpt: 'Too short.',
        content: 'No headings. ![](/a.png) ![ ](/b.png)',
        coverImageAlt: '',
      },
      ['a very long title that will certainly be cut off by google'],
    );

    expect(warnings).toEqual([
      expect.stringContaining('title tag is'),
      expect.stringContaining('description is 10 characters'),
      'The cover image has no alt text.',
      '2 images in the body have no alt text.',
      expect.stringContaining('no ## headings'),
      'Another post already uses this title.',
    ]);
  });

  test('an SEO title or description replaces the defaults it checks', () => {
    const warnings = getPublishWarnings(
      {
        ...clean,
        title: 'A very long title that will certainly be cut off by Google',
        seoTitle: 'Next.js caching',
        seoDescription: 'Short.',
      },
      [],
    );
    expect(warnings).toEqual([
      expect.stringContaining('description is 6 characters'),
    ]);
  });
});

describe('toBlogPostInput', () => {
  const body = {
    title: '  Caching  ',
    slug: 'caching',
    excerpt: ' Why it changed. ',
    content: '  ## Indented stays as written',
    coverImageUrl: '',
    coverImageAlt: '  ',
    categoryId: 'cat-1',
    tags: 'React, next js',
    seoTitle: '',
    seoDescription: null,
    canonicalUrl: ' https://dev.to/awad/caching ',
    status: 'published',
  };

  test('keeps exactly the fields the backend accepts, cleaned up', () => {
    expect(toBlogPostInput(body)).toEqual({
      title: 'Caching',
      slug: 'caching',
      excerpt: 'Why it changed.',
      content: '  ## Indented stays as written',
      coverImageUrl: null,
      coverImageAlt: null,
      categoryId: 'cat-1',
      tags: ['react', 'next-js'],
      seoTitle: null,
      seoDescription: null,
      canonicalUrl: 'https://dev.to/awad/caching',
    });
  });

  test('names the first missing required field', () => {
    expect(toBlogPostInput(null)).toBe('Missing post data');
    expect(toBlogPostInput({ ...body, title: ' ' })).toBe('Title is required');
    expect(toBlogPostInput({ ...body, slug: undefined })).toBe(
      'Slug is required',
    );
    expect(toBlogPostInput({ ...body, excerpt: '' })).toBe(
      'Excerpt is required',
    );
    expect(toBlogPostInput({ ...body, content: '   ' })).toBe(
      'The post body is empty',
    );
  });
});

describe('toBlogCategoryInput', () => {
  test('requires a name and empties optional fields to null', () => {
    expect(
      toBlogCategoryInput({ name: ' React ', slug: '', description: ' ' }),
    ).toEqual({ name: 'React', slug: null, description: null });
    expect(toBlogCategoryInput({ slug: 'react' })).toBe('Name is required');
  });
});

describe('insertAtSelection', () => {
  test('replaces the selection with the text', () => {
    expect(insertAtSelection('Hello world', 6, 11, 'there')).toEqual({
      value: 'Hello there',
      insertStart: 6,
      insertEnd: 11,
    });
  });

  test('gives a block its own paragraph, adding only missing blank lines', () => {
    const middle = insertAtSelection(
      'First line.Second line.',
      11,
      11,
      '![a](b)',
      {
        block: true,
      },
    );
    expect(middle.value).toBe('First line.\n\n![a](b)\n\nSecond line.');
    expect(middle.value.slice(middle.insertStart, middle.insertEnd)).toBe(
      '![a](b)',
    );

    expect(
      insertAtSelection('Intro\n\nOutro', 7, 7, 'X', { block: true }).value,
    ).toBe('Intro\n\nX\n\nOutro');
    expect(insertAtSelection('', 0, 0, 'X', { block: true }).value).toBe('X');
    expect(insertAtSelection('End', 3, 3, 'X', { block: true }).value).toBe(
      'End\n\nX',
    );
  });

  test('keeps positions inside the text', () => {
    expect(insertAtSelection('abc', 10, 20, 'X').value).toBe('abcX');
    expect(insertAtSelection('abc', -5, 1, 'X').value).toBe('Xbc');
  });
});
