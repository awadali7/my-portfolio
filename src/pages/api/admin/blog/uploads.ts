import { BLOG_IMAGE_MAX_BYTES } from '@/common/helpers/blog';
import { methodNotAllowed, withAdmin } from '@/common/libs/admin-api';
import { BodyTooLargeError, readRawBody } from '@/common/libs/raw-body';
import { uploadBlogImage } from '@/services/blog';

/** The multipart body is passed through untouched, so Next must not parse it. */
export const config = { api: { bodyParser: false } };

/** The image limit plus room for the multipart headers around it. */
const MAX_REQUEST_BYTES = BLOG_IMAGE_MAX_BYTES + 64 * 1024;

export default withAdmin(async (req, res, token) => {
  if (req.method !== 'POST') return methodNotAllowed(res, ['POST']);

  const contentType = req.headers['content-type'] ?? '';
  if (!contentType.startsWith('multipart/form-data')) {
    return res
      .status(400)
      .json({ message: 'Send the image as multipart form data' });
  }

  let body: Buffer;
  try {
    body = await readRawBody(req, MAX_REQUEST_BYTES);
  } catch (error) {
    if (error instanceof BodyTooLargeError) {
      return res
        .status(413)
        .json({ message: 'That image is too large. Keep it under 4 MB.' });
    }
    throw error;
  }

  return res.status(201).json(await uploadBlogImage(token, body, contentType));
});
