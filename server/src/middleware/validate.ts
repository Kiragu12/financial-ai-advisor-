import type { RequestHandler } from 'express';
import type { ZodTypeAny } from 'zod';

/**
 * Request validation middleware.
 *
 * Pass Zod schemas for the parts of the request you want to check. Each schema
 * both *validates* and *coerces/transforms* (e.g. trims strings, lowercases
 * emails, applies defaults), and the cleaned values replace the originals so
 * controllers always receive trusted, well-typed data.
 *
 * On failure the ZodError is forwarded to the central error handler, which
 * renders it as a 400 with field-level details.
 *
 * Note: `req.query` is read-only under Express 5, so query validation is added
 * later (in-place merge) when a feature actually needs it.
 */
interface ValidationSchemas {
  body?: ZodTypeAny;
  params?: ZodTypeAny;
}

export function validate(schemas: ValidationSchemas): RequestHandler {
  return (req, _res, next) => {
    try {
      if (schemas.body) {
        req.body = schemas.body.parse(req.body);
      }
      if (schemas.params) {
        // params is a writable object; mutate in place to keep Express happy.
        Object.assign(req.params, schemas.params.parse(req.params));
      }
      next();
    } catch (err) {
      next(err);
    }
  };
}
