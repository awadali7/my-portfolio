import { Readable } from 'stream';

import { BodyTooLargeError, readRawBody } from '@/common/libs/raw-body';

describe('readRawBody', () => {
  test('joins the chunks of a body under the limit', async () => {
    const body = await readRawBody(
      Readable.from([Buffer.from('ab'), 'cd', Buffer.from('ef')]),
      10,
    );
    expect(body.toString()).toBe('abcdef');
  });

  test('stops as soon as the body passes the limit', async () => {
    let pulled = 0;
    async function* chunks() {
      for (let i = 0; i < 100; i += 1) {
        pulled += 1;
        yield Buffer.alloc(10);
      }
    }
    await expect(readRawBody(chunks(), 25)).rejects.toBeInstanceOf(
      BodyTooLargeError,
    );
    expect(pulled).toBe(3);
  });
});
