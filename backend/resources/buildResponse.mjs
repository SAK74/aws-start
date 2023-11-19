export const buildResp = (status, body, headers = {}) => ({
  statusCode: status,
  headers,
  body: JSON.stringify(body),
});
