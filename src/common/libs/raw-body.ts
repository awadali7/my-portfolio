export class BodyTooLargeError extends Error {
  constructor() {
    super('Request body is too large');
    this.name = 'BodyTooLargeError';
  }
}

/**
 * Reads a request body into memory, giving up as soon as it passes `limit`
 * bytes rather than buffering an oversized upload first.
 */
export const readRawBody = async (
  stream: AsyncIterable<Buffer | string>,
  limit: number,
): Promise<Buffer> => {
  const chunks: Buffer[] = [];
  let size = 0;
  for await (const chunk of stream) {
    const buffer = typeof chunk === 'string' ? Buffer.from(chunk) : chunk;
    size += buffer.length;
    if (size > limit) throw new BodyTooLargeError();
    chunks.push(buffer);
  }
  return Buffer.concat(chunks);
};
