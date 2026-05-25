import jwt from 'jsonwebtoken';

import { config } from '../config.js';
import { ApiError } from './error.js';

export function requireAdmin(req, _res, next) {
  const token = req.cookies?.[config.cookie.name];
  if (!token) {
    return next(new ApiError(401, 'Unauthorized'));
  }

  try {
    const payload = jwt.verify(token, config.jwtSecret);
    req.admin = { username: payload.sub };
    return next();
  } catch (_err) {
    return next(new ApiError(401, 'Unauthorized'));
  }
}
