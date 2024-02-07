import { AppRequest } from '../models';

/**
 * @param {AppRequest} request
 * @returns {string}
 */
export function getUserIdFromRequest(request: AppRequest): string {
  // console.log('request: ', request.headers);
  return request.user && request.user.id;
}
